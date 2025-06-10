/**
 * @fileoverview dashboardStore.ts - Store centralizado de Zustand para el estado del dashboard.
 *
 * @description
 * Este store actúa como la ÚNICA FUENTE DE VERDAD para todos los datos y operaciones
 * relacionados con el dashboard de RokaMenu. Reemplaza la arquitectura anterior de hooks anidados
 * (`useDashboardState`, `use...Management`) para resolver problemas de rendimiento (bucles infinitos)
 * y simplificar la gestión del estado.
 *
 * @state Contiene los datos crudos del dashboard: client, categories, sections, products, y estados de UI como isLoading.
 * @actions Contiene todas las funciones para modificar el estado, incluyendo las llamadas a la API para operaciones CRUD.
 * 
 * @dependencies
 * - `zustand`: La librería de gestión de estado.
 * - `types`: Las definiciones de tipos de TypeScript para las entidades del dominio.
 *
 * @usage
 * En cualquier componente, se puede acceder al estado y a las acciones así:
 * `const { categories, fetchCategories } = useDashboardStore();`
 * Esto proporciona un acceso directo y reactivo sin necesidad de prop drilling.
 */

import { create } from 'zustand';
import { Category, Section, Product, Client } from '../types';
import { toast } from 'react-hot-toast';

// --- TIPOS DE ESTADO Y ACCIONES ---

interface DashboardState {
    client: Client | null;
    categories: Category[];
    sections: Record<string, Section[]>;
    products: Record<string, Product[]>;
    isLoading: boolean;
    initialDataLoaded: boolean;
    isUpdatingVisibility: Record<string, number | null>; // ej: { category: 1, section: null }
    error: string | null;

    // --- Estado de UI para VISTA MÓVIL ---
    activeView: 'categories' | 'sections' | 'products';
    activeCategoryId: number | null;
    activeSectionId: number | null;
    history: { view: 'categories' | 'sections' | 'products'; id: number | null }[];

    // --- Estado de UI para VISTA DE ESCRITORIO ---
    selectedCategory: Category | null;
    selectedSection: Section | null;
    expandedCategories: Record<number, boolean>;
    isReorderModeActive: boolean;
}

interface DashboardActions {
    fetchClientData: (clientId: number) => Promise<void>;
    fetchCategories: (clientId: number) => Promise<void>;
    fetchSectionsByCategory: (categoryId: number) => Promise<void>;
    fetchProductsBySection: (sectionId: number) => Promise<void>;

    toggleCategoryVisibility: (categoryId: number, currentStatus: number) => Promise<void>;
    toggleSectionVisibility: (sectionId: number, categoryId: number, currentStatus: number) => Promise<void>;
    toggleProductVisibility: (productId: number, sectionId: number, currentStatus: number) => Promise<void>;

    // Acciones de Navegación
    handleCategorySelect: (category: Category) => void;
    handleSectionSelect: (section: Section) => void;
    handleBack: () => void;

    // --- Acciones para VISTA DE ESCRITORIO ---
    setSelectedCategory: (category: Category | null) => void;
    setSelectedSection: (section: Section | null) => void;
    toggleCategoryExpansion: (categoryId: number) => void;
    toggleReorderMode: () => void;

    // Aquí irán las demás acciones CRUD (create, update, delete)
}

// --- ESTADO INICIAL ---

const initialState: DashboardState = {
    client: null,
    categories: [],
    sections: {},
    products: {},
    isLoading: false,
    initialDataLoaded: false,
    isUpdatingVisibility: {},
    error: null,
    activeView: 'categories',
    activeCategoryId: null,
    activeSectionId: null,
    history: [],

    // --- Estado de UI para VISTA DE ESCRITORIO ---
    selectedCategory: null,
    selectedSection: null,
    expandedCategories: {},
    isReorderModeActive: false,
};

// --- CREACIÓN DEL STORE ---

export const useDashboardStore = create<DashboardState & DashboardActions>((set, get) => ({
    ...initialState,

    // --- ACCIONES ---

    fetchClientData: async (clientId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`/api/client?id=${clientId}`);
            if (!response.ok) throw new Error('Error al cargar los datos del cliente');
            const clientData = await response.json();
            set({ client: clientData, isLoading: false });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isLoading: false });
            toast.error('Error al cargar los datos del cliente.');
        }
    },

    fetchCategories: async (clientId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`/api/categories?client_id=${clientId}`);
            if (!response.ok) throw new Error('Error al cargar las categorías');
            const categoriesData = await response.json();
            set({ categories: categoriesData, isLoading: false, initialDataLoaded: true });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isLoading: false });
            toast.error('Error al cargar las categorías.');
        }
    },

    fetchSectionsByCategory: async (categoryId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`/api/sections?category_id=${categoryId}`);
            if (!response.ok) throw new Error('Error al cargar las secciones');
            const sectionsData = await response.json();
            set(state => ({
                sections: {
                    ...state.sections,
                    [categoryId]: sectionsData,
                },
                isLoading: false,
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isLoading: false });
            toast.error('Error al cargar las secciones.');
        }
    },

    fetchProductsBySection: async (sectionId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`/api/products?section_id=${sectionId}`);
            if (!response.ok) throw new Error('Error al cargar los productos');
            const productsData = await response.json();
            set(state => ({
                products: {
                    ...state.products,
                    [sectionId]: productsData,
                },
                isLoading: false
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isLoading: false });
            toast.error('Error al cargar los productos.');
        }
    },

    toggleCategoryVisibility: async (categoryId, currentStatus) => {
        set({ isUpdatingVisibility: { ...get().isUpdatingVisibility, category: categoryId } });
        const originalCategories = get().categories;

        // Actualización optimista
        set(state => ({
            categories: state.categories.map(c =>
                c.category_id === categoryId ? { ...c, status: currentStatus === 1 ? 0 : 1 } : c
            ),
        }));

        try {
            const response = await fetch(`/api/categories/${categoryId}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: currentStatus === 1 ? 0 : 1 }),
            });
            if (!response.ok) throw new Error('Error en el servidor');

            // La API devuelve la categoría actualizada, la usamos para sincronizar el estado final
            const updatedCategory = await response.json();
            set(state => ({
                categories: state.categories.map(c =>
                    c.category_id === categoryId ? updatedCategory : c
                ),
            }));
            // Recargar todas las categorías para reordenar por visibilidad
            await get().fetchCategories(updatedCategory.client_id);
            toast.success('Visibilidad actualizada');

        } catch (error) {
            toast.error('No se pudo actualizar la visibilidad.');
            // Revertir en caso de error
            set({ categories: originalCategories });
        } finally {
            set({ isUpdatingVisibility: { ...get().isUpdatingVisibility, category: null } });
        }
    },

    toggleSectionVisibility: async (sectionId, categoryId, currentStatus) => {
        set({ isUpdatingVisibility: { ...get().isUpdatingVisibility, section: sectionId } });
        const originalSections = get().sections[categoryId];

        // Actualización optimista
        set(state => ({
            sections: {
                ...state.sections,
                [categoryId]: state.sections[categoryId].map(s =>
                    s.section_id === sectionId ? { ...s, status: currentStatus === 1 ? 0 : 1 } : s
                ),
            }
        }));

        try {
            const response = await fetch(`/api/sections/${sectionId}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: currentStatus === 1 ? 0 : 1 }),
            });
            if (!response.ok) throw new Error('Error en el servidor');
            // Tras el éxito, recargamos las secciones de la categoría para obtener los contadores y el orden correctos.
            await get().fetchSectionsByCategory(categoryId);
            toast.success('Visibilidad actualizada');
        } catch (error) {
            toast.error('No se pudo actualizar la visibilidad.');
            set(state => ({
                sections: { ...state.sections, [categoryId]: originalSections }
            }));
        } finally {
            set({ isUpdatingVisibility: { ...get().isUpdatingVisibility, section: null } });
        }
    },

    toggleProductVisibility: async (productId, sectionId, currentStatus) => {
        set({ isUpdatingVisibility: { ...get().isUpdatingVisibility, product: productId } });
        const originalProducts = get().products[sectionId];

        // Actualización optimista
        set(state => ({
            products: {
                ...state.products,
                [sectionId]: state.products[sectionId].map(p =>
                    p.product_id === productId ? { ...p, status: currentStatus === 1 ? 0 : 1 } : p
                ),
            }
        }));

        try {
            const response = await fetch(`/api/products/${productId}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: currentStatus === 1 ? 0 : 1 }),
            });
            if (!response.ok) throw new Error('Error en el servidor');
            // Recargamos los productos de la sección para que los contadores de la sección (padre) puedan actualizarse
            await get().fetchProductsBySection(sectionId);

            // Y también las secciones de la categoría para que los contadores de la categoría (abuelo) se actualicen.
            // Buscamos la clave (categoryId) en el objeto de secciones que contiene la sección actual.
            const categoryIdKey = Object.keys(get().sections).find(key =>
                get().sections[key]?.some(s => s.section_id === sectionId)
            );

            if (categoryIdKey) {
                await get().fetchSectionsByCategory(Number(categoryIdKey));
            }

            toast.success('Visibilidad actualizada');
        } catch (error) {
            toast.error('No se pudo actualizar la visibilidad.');
            set(state => ({
                products: { ...state.products, [sectionId]: originalProducts }
            }));
        } finally {
            set({ isUpdatingVisibility: { ...get().isUpdatingVisibility, product: null } });
        }
    },

    // --- ACCIONES DE NAVEGACIÓN (VISTA MÓVIL) ---

    handleCategorySelect: (category) => {
        set(state => ({
            history: [...state.history, { view: state.activeView, id: state.activeCategoryId }],
            activeCategoryId: category.category_id,
            activeView: 'sections',
        }));
        get().fetchSectionsByCategory(category.category_id);
    },

    handleSectionSelect: (section: Section) => {
        set({
            activeView: 'products',
            activeSectionId: section.section_id,
            history: [...get().history, { view: 'sections', id: get().activeCategoryId }],
        });
        // Si no hay productos para esta sección, los busca
        if (!get().products[section.section_id]) {
            get().fetchProductsBySection(section.section_id);
        }
    },

    handleBack: () => {
        set(state => {
            const history = [...state.history];
            const previousState = history.pop();
            if (previousState) {
                if (previousState.view === 'categories') {
                    return {
                        history,
                        activeView: previousState.view,
                        activeCategoryId: null,
                        activeSectionId: null,
                    };
                } else if (previousState.view === 'sections') {
                    return {
                        history,
                        activeView: previousState.view,
                        activeSectionId: null,
                    };
                }
            }
            // Si no hay historial o es un caso no manejado, volvemos al inicio.
            return {
                history: [],
                activeView: 'categories',
                activeCategoryId: null,
                activeSectionId: null
            };
        });
    },

    // --- ACCIONES DE UI (VISTA ESCRITORIO) ---

    setSelectedCategory: (category) => set({ selectedCategory: category, selectedSection: null }), // Al cambiar de categoría, reseteamos la sección

    setSelectedSection: (section) => set({ selectedSection: section }),

    toggleCategoryExpansion: (categoryId) => {
        set(state => ({
            expandedCategories: {
                ...state.expandedCategories,
                [categoryId]: !state.expandedCategories[categoryId],
            }
        }));
    },

    toggleReorderMode: () => set(state => ({ isReorderModeActive: !state.isReorderModeActive })),

})); 
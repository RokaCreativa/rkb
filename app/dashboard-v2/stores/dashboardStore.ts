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
    isUpdating: boolean; // Estado general para operaciones CRUD (create, update, delete)
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

    // Alias para compatibilidad con DashboardView.tsx - delega a fetchProductsBySection
    fetchProducts: (sectionId: number) => Promise<void>;

    toggleCategoryVisibility: (categoryId: number, currentStatus: number) => Promise<void>;
    toggleSectionVisibility: (sectionId: number, categoryId: number, currentStatus: number) => Promise<void>;
    toggleProductVisibility: (productId: number, sectionId: number, currentStatus: number) => Promise<void>;

    // --- Operaciones CRUD ---
    deleteCategory: (categoryId: number) => Promise<void>;
    deleteSection: (sectionId: number) => Promise<void>;
    deleteProduct: (productId: number) => Promise<void>;

    createCategory: (categoryData: Partial<Category>) => Promise<void>;
    createSection: (sectionData: Partial<Section>) => Promise<void>;
    createProduct: (productData: Partial<Product>) => Promise<void>;

    updateCategory: (categoryId: number, categoryData: Partial<Category>) => Promise<void>;
    updateSection: (sectionId: number, sectionData: Partial<Section>) => Promise<void>;
    updateProduct?: (productId: number, productData: Partial<Product>) => Promise<void>; // Opcional por ahora

    // Acciones de Navegación
    handleCategorySelect: (category: Category) => void;
    handleSectionSelect: (section: Section) => void;
    handleBack: () => void;

    // --- Acciones para VISTA DE ESCRITORIO ---
    setSelectedCategory: (category: Category | null) => void;
    setSelectedSection: (section: Section | null) => void;
    toggleCategoryExpansion: (categoryId: number) => void;
    toggleReorderMode: () => void;
}

// --- ESTADO INICIAL ---

const initialState: DashboardState = {
    client: null,
    categories: [],
    sections: {},
    products: {},
    isLoading: false,
    initialDataLoaded: false,
    isUpdating: false,
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
                body: JSON.stringify({ status: currentStatus === 1 ? false : true }),
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
                body: JSON.stringify({ status: currentStatus === 1 ? false : true }),
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
                body: JSON.stringify({ status: currentStatus === 1 ? false : true }),
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

    // --- OPERACIONES CRUD ---

    /**
     * fetchProducts - Alias para mantener compatibilidad con DashboardView.tsx
     * Internamente delega a fetchProductsBySection ya que los productos siempre se buscan por sección
     */
    fetchProducts: async (sectionId) => {
        await get().fetchProductsBySection(sectionId);
    },

    /**
     * deleteCategory - Elimina una categoría del sistema
     * Refresca automáticamente la lista de categorías tras la eliminación para mantener el estado sincronizado
     */
    deleteCategory: async (categoryId) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Error al eliminar la categoría');

            // Eliminar del estado local optimísticamente
            set(state => ({
                categories: state.categories.filter(c => c.category_id !== categoryId),
                isUpdating: false
            }));

            // Recargar categorías para sincronizar con el servidor y recalcular contadores
            const clientId = get().client?.client_id;
            if (clientId) await get().fetchCategories(clientId);

            toast.success('Categoría eliminada exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isUpdating: false });
            toast.error('No se pudo eliminar la categoría.');
        }
    },

    /**
     * deleteSection - Elimina una sección del sistema  
     * Mantiene la sincronización con categorías padre para actualizar contadores
     */
    deleteSection: async (sectionId) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await fetch(`/api/sections/${sectionId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Error al eliminar la sección');

            // Encontrar la categoría que contiene esta sección para actualizarla después
            let categoryId: number | null = null;
            Object.entries(get().sections).forEach(([catId, sections]) => {
                if (sections.some(s => s.section_id === sectionId)) {
                    categoryId = Number(catId);
                }
            });

            // Eliminar del estado local
            set(state => ({
                sections: Object.fromEntries(
                    Object.entries(state.sections).map(([catId, sections]) => [
                        catId,
                        sections.filter(s => s.section_id !== sectionId)
                    ])
                ),
                isUpdating: false
            }));

            // Recargar las secciones de la categoría para sincronizar contadores
            if (categoryId) await get().fetchSectionsByCategory(categoryId);

            toast.success('Sección eliminada exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isUpdating: false });
            toast.error('No se pudo eliminar la sección.');
        }
    },

    /**
     * deleteProduct - Elimina un producto del sistema
     * Sincroniza con secciones padre y categorías abuelo para mantener contadores actualizados
     */
    deleteProduct: async (productId) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Error al eliminar el producto');

            // Encontrar la sección que contiene este producto
            let sectionId: number | null = null;
            Object.entries(get().products).forEach(([secId, products]) => {
                if (products.some(p => p.product_id === productId)) {
                    sectionId = Number(secId);
                }
            });

            // Eliminar del estado local
            set(state => ({
                products: Object.fromEntries(
                    Object.entries(state.products).map(([secId, products]) => [
                        secId,
                        products.filter(p => p.product_id !== productId)
                    ])
                ),
                isUpdating: false
            }));

            // Recargar productos de la sección para sincronizar
            if (sectionId) {
                await get().fetchProductsBySection(sectionId);

                // También recargar las secciones para actualizar contadores de la categoría padre
                const categoryIdKey = Object.keys(get().sections).find(key =>
                    get().sections[key]?.some(s => s.section_id === sectionId)
                );
                if (categoryIdKey) {
                    await get().fetchSectionsByCategory(Number(categoryIdKey));
                }
            }

            toast.success('Producto eliminado exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isUpdating: false });
            toast.error('No se pudo eliminar el producto.');
        }
    },

    /**
     * createCategory - Crea una nueva categoría
     * Refresca la lista para mostrar la nueva categoría en su posición correcta
     */
    createCategory: async (categoryData) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData),
            });
            if (!response.ok) throw new Error('Error al crear la categoría');

            const newCategory = await response.json();

            // Añadir al estado local
            set(state => ({
                categories: [...state.categories, newCategory],
                isUpdating: false
            }));

            // Recargar para obtener el orden correcto del servidor
            const clientId = get().client?.client_id;
            if (clientId) await get().fetchCategories(clientId);

            toast.success('Categoría creada exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isUpdating: false });
            toast.error('No se pudo crear la categoría.');
        }
    },

    /**
     * createSection - Crea una nueva sección en una categoría específica
     * Sincroniza con la categoría padre para mantener contadores actualizados
     */
    createSection: async (sectionData) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await fetch('/api/sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sectionData),
            });
            if (!response.ok) throw new Error('Error al crear la sección');

            const newSection = await response.json();
            const categoryId = newSection.category_id;

            // Añadir al estado local
            set(state => ({
                sections: {
                    ...state.sections,
                    [categoryId]: [...(state.sections[categoryId] || []), newSection],
                },
                isUpdating: false
            }));

            // Recargar las secciones de la categoría para sincronizar
            await get().fetchSectionsByCategory(categoryId);

            toast.success('Sección creada exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isUpdating: false });
            toast.error('No se pudo crear la sección.');
        }
    },

    /**
     * createProduct - Crea un nuevo producto en una sección específica
     * Mantiene sincronización a través de toda la jerarquía (producto -> sección -> categoría)
     */
    createProduct: async (productData) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });
            if (!response.ok) throw new Error('Error al crear el producto');

            const newProduct = await response.json();
            const sectionId = newProduct.section_id;

            // Añadir al estado local
            set(state => ({
                products: {
                    ...state.products,
                    [sectionId]: [...(state.products[sectionId] || []), newProduct],
                },
                isUpdating: false
            }));

            // Recargar productos de la sección
            await get().fetchProductsBySection(sectionId);

            // También recargar secciones para actualizar contadores de la categoría
            const categoryIdKey = Object.keys(get().sections).find(key =>
                get().sections[key]?.some(s => s.section_id === sectionId)
            );
            if (categoryIdKey) {
                await get().fetchSectionsByCategory(Number(categoryIdKey));
            }

            toast.success('Producto creado exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isUpdating: false });
            toast.error('No se pudo crear el producto.');
        }
    },

    /**
     * updateCategory - Actualiza los datos de una categoría existente
     * Refresca para mantener coherencia con el servidor
     */
    updateCategory: async (categoryId, categoryData) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData),
            });
            if (!response.ok) throw new Error('Error al actualizar la categoría');

            const updatedCategory = await response.json();

            // Actualizar en el estado local
            set(state => ({
                categories: state.categories.map(c =>
                    c.category_id === categoryId ? updatedCategory : c
                ),
                isUpdating: false
            }));

            toast.success('Categoría actualizada exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isUpdating: false });
            toast.error('No se pudo actualizar la categoría.');
        }
    },

    /**
     * updateSection - Actualiza los datos de una sección existente  
     * Mantiene sincronización con la categoría padre
     */
    updateSection: async (sectionId, sectionData) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await fetch(`/api/sections/${sectionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sectionData),
            });
            if (!response.ok) throw new Error('Error al actualizar la sección');

            const updatedSection = await response.json();
            const categoryId = updatedSection.category_id;

            // Actualizar en el estado local
            set(state => ({
                sections: {
                    ...state.sections,
                    [categoryId]: state.sections[categoryId]?.map(s =>
                        s.section_id === sectionId ? updatedSection : s
                    ) || [],
                },
                isUpdating: false
            }));

            toast.success('Sección actualizada exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isUpdating: false });
            toast.error('No se pudo actualizar la sección.');
        }
    },

})); 
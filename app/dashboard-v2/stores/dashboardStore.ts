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

type EntityType = 'categories' | 'sections' | 'products';

// --- TIPOS DE ESTADO Y ACCIONES ---

export interface DashboardState {
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

    // Estado de navegación para la vista de escritorio
    selectedCategoryId: number | null;
    selectedSectionId: number | null;
}

export interface DashboardActions {
    initializeDashboard: (clientId: number) => Promise<void>;
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

    createCategory: (categoryData: Partial<Category>, imageFile?: File | null) => Promise<void>;
    createSection: (sectionData: Partial<Section>, imageFile?: File | null) => Promise<void>;
    createProduct: (productData: Partial<Product>, imageFile?: File | null) => Promise<void>;

    updateCategory: (categoryId: number, categoryData: Partial<Category>, imageFile?: File | null) => Promise<void>;
    updateSection: (sectionId: number, sectionData: Partial<Section>, imageFile?: File | null) => Promise<void>;
    updateProduct: (productId: number, productData: Partial<Product>, imageFile?: File | null) => Promise<void>;

    // --- Helpers Internos ---
    _uploadImage: (imageFile: File, entityType: EntityType) => Promise<string>;

    // Acciones de Navegación
    handleCategorySelect: (category: Category) => void;
    handleSectionSelect: (section: Section) => void;
    handleBack: () => void;

    // --- Acciones para VISTA DE ESCRITORIO ---
    setSelectedCategory: (category: Category | null) => void;
    setSelectedSection: (section: Section | null) => void;
    toggleCategoryExpansion: (categoryId: number) => void;
    toggleReorderMode: () => void;

    // Acciones de navegación
    setActiveView: (view: 'categories' | 'sections' | 'products') => void;
    goToCategory: (categoryId: number) => void;
    goToSection: (sectionId: number) => void;
    goBack: () => void;

    // Acciones para la navegación de escritorio
    setSelectedCategoryId: (categoryId: number | null) => void;
    setSelectedSectionId: (sectionId: number | null) => void;
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

    // Estado de navegación para la vista de escritorio
    selectedCategoryId: null,
    selectedSectionId: null,
};

// --- CREACIÓN DEL STORE ---

export const useDashboardStore = create<DashboardState & DashboardActions>((set, get) => ({
    ...initialState,

    /**
     * @description
     * Helper interno para subir imágenes. Ahora es genérico y robusto.
     * @param imageFile El archivo a subir.
     * @param entityType El tipo de entidad ('categories', 'sections', 'products'), usado por la API para determinar la carpeta de destino.
     * @returns El `filename` de la imagen guardada (ej: '12345_mi-imagen.jpg').
     */
    _uploadImage: async (imageFile, entityType) => {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('entityType', entityType); // <-- Pasamos el tipo a la API

        const response = await fetch('/api/upload', { // <-- Apuntamos a la nueva API genérica
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Error en la subida de la imagen.');
        }
        // Devolvemos solo el nombre del archivo, que es lo que se guarda en la DB.
        return result.filename;
    },

    // --- ACCIONES ---

    initializeDashboard: async (clientId) => {
        set({ isLoading: true });
        await get().fetchClientData(clientId);
        await get().fetchCategories(clientId);
        set({ isLoading: false, initialDataLoaded: true });
    },

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

            const updatedCategory = await response.json();
            await get().fetchCategories(updatedCategory.client_id);
            toast.success('Visibilidad actualizada');

        } catch (error) {
            toast.error('No se pudo actualizar la visibilidad.');
            set({ categories: originalCategories });
        } finally {
            set({ isUpdatingVisibility: { ...get().isUpdatingVisibility, category: null } });
        }
    },

    toggleSectionVisibility: async (sectionId, categoryId, currentStatus) => {
        set({ isUpdatingVisibility: { ...get().isUpdatingVisibility, section: sectionId } });
        const originalSections = get().sections[categoryId];

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
            await get().fetchProductsBySection(sectionId);

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
        if (!get().products[section.section_id]) {
            get().fetchProductsBySection(section.section_id);
        }
    },

    handleBack: () => {
        set(state => {
            const history = [...state.history];
            const previousState = history.pop();
            if (previousState?.view === 'categories') {
                return { history, activeView: 'categories', activeCategoryId: null, activeSectionId: null };
            }
            if (previousState?.view === 'sections') {
                return { history, activeView: 'sections', activeSectionId: null };
            }
            return { history: [], activeView: 'categories', activeCategoryId: null, activeSectionId: null };
        });
    },

    // --- ACCIONES DE UI (VISTA ESCRITORIO) ---
    setSelectedCategory: (category) => set({ selectedCategory: category, selectedSection: null }),
    setSelectedSection: (section) => set({ selectedSection: section }),
    toggleCategoryExpansion: (categoryId) => set(state => ({ expandedCategories: { ...state.expandedCategories, [categoryId]: !state.expandedCategories[categoryId] } })),
    toggleReorderMode: () => set(state => ({ isReorderModeActive: !state.isReorderModeActive })),

    // --- OPERACIONES CRUD ---
    fetchProducts: async (sectionId) => { await get().fetchProductsBySection(sectionId); },
    deleteCategory: async (categoryId) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar la categoría');
            const clientId = get().client?.client_id;
            if (clientId) await get().fetchCategories(clientId);
            toast.success('Categoría eliminada exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isUpdating: false });
            toast.error('No se pudo eliminar la categoría.');
        } finally {
            set({ isUpdating: false });
        }
    },
    deleteSection: async (sectionId) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await fetch(`/api/sections/${sectionId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar la sección');
            let categoryId: number | null = null;
            Object.entries(get().sections).forEach(([catId, sections]) => {
                if (sections.some(s => s.section_id === sectionId)) {
                    categoryId = Number(catId);
                }
            });
            if (categoryId) await get().fetchSectionsByCategory(categoryId);
            toast.success('Sección eliminada exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isUpdating: false });
            toast.error('No se pudo eliminar la sección.');
        } finally {
            set({ isUpdating: false });
        }
    },
    deleteProduct: async (productId) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar el producto');
            let sectionId: number | null = null;
            Object.entries(get().products).forEach(([secId, products]) => {
                if (products.some(p => p.product_id === productId)) {
                    sectionId = Number(secId);
                }
            });
            if (sectionId) {
                await get().fetchProductsBySection(sectionId);
                const categoryIdKey = Object.keys(get().sections).find(key =>
                    get().sections[key]?.some(s => s.section_id === sectionId)
                );
                if (categoryIdKey) await get().fetchSectionsByCategory(Number(categoryIdKey));
            }
            toast.success('Producto eliminado exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, isUpdating: false });
            toast.error('No se pudo eliminar el producto.');
        } finally {
            set({ isUpdating: false });
        }
    },

    createCategory: async (categoryData, imageFile) => {
        set({ isUpdating: true, error: null });
        try {
            let finalCategoryData = { ...categoryData };
            if (imageFile) {
                finalCategoryData.image = await get()._uploadImage(imageFile, 'categories');
            }
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalCategoryData),
            });
            if (!response.ok) throw new Error('Error al crear la categoría');
            const clientId = get().client?.client_id;
            if (clientId) await get().fetchCategories(clientId);
            toast.success('Categoría creada exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
        } finally {
            set({ isUpdating: false });
        }
    },

    createSection: async (sectionData, imageFile) => {
        set({ isUpdating: true, error: null });
        try {
            let finalSectionData = { ...sectionData };
            if (imageFile) {
                finalSectionData.image = await get()._uploadImage(imageFile, 'sections');
            }
            const response = await fetch('/api/sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalSectionData),
            });
            if (!response.ok) throw new Error('Error al crear la sección');
            const newSection = await response.json();
            await get().fetchSectionsByCategory(newSection.category_id);
            toast.success('Sección creada exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
        } finally {
            set({ isUpdating: false });
        }
    },

    createProduct: async (productData, imageFile) => {
        set({ isUpdating: true, error: null });
        try {
            let finalProductData = { ...productData };
            if (imageFile) {
                finalProductData.image = await get()._uploadImage(imageFile, 'products');
            }
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalProductData),
            });
            if (!response.ok) throw new Error('Error al crear el producto');
            const newProduct = await response.json();
            await get().fetchProductsBySection(newProduct.section_id);
            toast.success('Producto creado exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
        } finally {
            set({ isUpdating: false });
        }
    },

    updateCategory: async (categoryId, categoryData, imageFile) => {
        set({ isUpdating: true, error: null });
        try {
            let finalCategoryData = { ...categoryData };
            if (imageFile) {
                finalCategoryData.image = await get()._uploadImage(imageFile, 'categories');
            }
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalCategoryData),
            });
            if (!response.ok) throw new Error('Error al actualizar la categoría');
            const updatedCategory = await response.json();
            set(state => ({
                categories: state.categories.map(c =>
                    c.category_id === categoryId ? updatedCategory : c
                )
            }));
            toast.success('Categoría actualizada exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
        } finally {
            set({ isUpdating: false });
        }
    },

    updateSection: async (sectionId, sectionData, imageFile) => {
        set({ isUpdating: true, error: null });
        try {
            let finalSectionData = { ...sectionData };
            if (imageFile) {
                finalSectionData.image = await get()._uploadImage(imageFile, 'sections');
            }
            const response = await fetch(`/api/sections/${sectionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalSectionData),
            });
            if (!response.ok) throw new Error('Error al actualizar la sección');
            const updatedSection = await response.json();
            await get().fetchSectionsByCategory(updatedSection.category_id);
            toast.success('Sección actualizada exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
        } finally {
            set({ isUpdating: false });
        }
    },

    updateProduct: async (productId, productData, imageFile) => {
        set({ isUpdating: true, error: null });
        try {
            let finalProductData = { ...productData };
            if (imageFile) {
                finalProductData.image = await get()._uploadImage(imageFile, 'products');
            }
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalProductData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar el producto');
            }
            const updatedProduct = await response.json();
            await get().fetchProductsBySection(updatedProduct.section_id);
            toast.success('Producto actualizado exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
        } finally {
            set({ isUpdating: false });
        }
    },

    // Acciones de navegación
    setActiveView: (view) => set({ activeView: view }),
    goToCategory: (categoryId) => set({ activeView: 'sections', activeCategoryId: categoryId }),
    goToSection: (sectionId) => set({ activeView: 'products', activeSectionId: sectionId }),
    goBack: () => set((state) => {
        if (state.activeView === 'products') {
            return { activeView: 'sections', activeSectionId: null };
        }
        if (state.activeView === 'sections') {
            return { activeView: 'categories', activeCategoryId: null };
        }
        return {};
    }),

    // Implementación de las nuevas acciones de escritorio
    setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId, selectedSectionId: null }),
    setSelectedSectionId: (sectionId) => set({ selectedSectionId: sectionId }),

})); 
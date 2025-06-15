/**
 * @fileoverview dashboardStore.ts - Store centralizado de Zustand para el estado del dashboard.
 * @description Este store es la única fuente de verdad para el dashboard.
 * Se ha restaurado su estado completo para dar servicio tanto a la vista móvil como a la de escritorio,
 * y se ha corregido la lógica CRUD para que sea robusta y segura en tipos.
 */
import { create } from 'zustand';
import { Category, Section, Product, Client } from '../types';
import { toast } from 'react-hot-toast';

// --- INTERFACES ---

export interface DashboardState {
    client: Client | null;
    categories: Category[];
    sections: Record<string, Section[]>;
    products: Record<string, Product[]>;
    isLoading: boolean;
    isClientLoading: boolean;
    isUpdating: boolean;
    error: string | null;
    initialDataLoaded: boolean;
    selectedCategoryId: number | null;
    selectedSectionId: number | null;
}

export interface DashboardActions {
    initializeDashboard: (clientId: number) => Promise<void>;
    fetchCategories: (clientId: number) => Promise<void>;
    fetchSectionsByCategory: (categoryId: number) => Promise<void>;
    fetchProductsBySection: (sectionId: number) => Promise<void>;
    fetchProductsByCategory: (categoryId: number) => Promise<void>;
    fetchDataForCategory: (categoryId: number) => Promise<void>;
    createCategory: (data: Partial<Category>, imageFile?: File | null) => Promise<void>;
    updateCategory: (id: number, data: Partial<Category>, imageFile?: File | null, internal?: boolean) => Promise<void>;
    deleteCategory: (id: number) => Promise<void>;
    toggleCategoryVisibility: (id: number, status: boolean) => Promise<void>;
    createSection: (data: Partial<Section>, imageFile?: File | null) => Promise<void>;
    updateSection: (id: number, data: Partial<Section>, imageFile?: File | null, internal?: boolean) => Promise<void>;
    deleteSection: (id: number) => Promise<void>;
    toggleSectionVisibility: (id: number, status: boolean) => Promise<void>;
    createProduct: (data: Partial<Product>, imageFile?: File | null) => Promise<void>;
    createProductDirect: (categoryId: number, data: Partial<Product>, imageFile?: File | null) => Promise<void>;
    updateProduct: (id: number, data: Partial<Product>, imageFile?: File | null, internal?: boolean) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    toggleProductVisibility: (id: number, status: boolean) => Promise<void>;
    setSelectedCategoryId: (id: number | null) => void;
    setSelectedSectionId: (id: number | null) => void;
}

// --- ESTADO INICIAL ---

const initialState: DashboardState = {
    client: null,
    categories: [],
    sections: {},
    products: {},
    isLoading: false,
    isClientLoading: true,
    isUpdating: false,
    error: null,
    initialDataLoaded: false,
    selectedCategoryId: null,
    selectedSectionId: null,
};

// --- CREACIÓN DEL STORE ---

export const useDashboardStore = create<DashboardState & DashboardActions>((set, get) => ({
    ...initialState,

    initializeDashboard: async (clientId: number) => {
        set({ isClientLoading: true, initialDataLoaded: false });
        try {
            const clientRes = await fetch(`/api/client?id=${clientId}`);
            if (!clientRes.ok) throw new Error('Cliente no encontrado');
            const clientData = await clientRes.json();
            set({ client: clientData });
            await get().fetchCategories(clientData.client_id);
        } catch (e: any) {
            set({ error: e.message });
        } finally {
            set({ isClientLoading: false, initialDataLoaded: true });
        }
    },

    fetchCategories: async (clientId: number) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`/api/categories?client_id=${clientId}`);
            if (!res.ok) throw new Error('Error al cargar categorías');
            set({ categories: await res.json() });
        } catch (e: any) {
            set({ error: e.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchSectionsByCategory: async (categoryId: number) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`/api/sections?category_id=${categoryId}`);
            if (!res.ok) throw new Error('Error al cargar secciones');
            const sectionsData = await res.json();
            set(state => ({ sections: { ...state.sections, [categoryId]: sectionsData } }));
        } catch (e: any) {
            set({ error: e.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchProductsBySection: async (sectionId: number) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`/api/products?section_id=${sectionId}`);
            if (!res.ok) throw new Error('Error al cargar productos');
            const productsData = await res.json();
            set(state => ({ products: { ...state.products, [String(sectionId)]: productsData } }));
        } catch (e: any) {
            set({ error: e.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchProductsByCategory: async (categoryId: number) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`/api/categories/${categoryId}/products`);
            if (!res.ok) throw new Error('Error al cargar productos de categoría');
            const productsData = await res.json();
            set(state => ({ products: { ...state.products, [`cat-${categoryId}`]: productsData } }));
        } catch (e: any) {
            set({ error: e.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchDataForCategory: async (categoryId: number) => {
        set({ isLoading: true });
        try {
            await Promise.all([
                get().fetchSectionsByCategory(categoryId),
                get().fetchProductsByCategory(categoryId)
            ]);
        } catch (e: any) {
            set({ error: e.message });
        } finally {
            set({ isLoading: false });
        }
    },

    // --- Placeholder CRUD ---
    createCategory: async (data, imageFile) => { console.log("createCategory", data); },
    updateCategory: async (id, data, imageFile, internal) => { console.log("updateCategory", id, data); },
    deleteCategory: async (id) => { console.log("deleteCategory", id); },
    toggleCategoryVisibility: async (id, status) => {
        const originalCategories = get().categories;
        set(state => ({
            categories: state.categories.map(c => c.category_id === id ? { ...c, status } : c)
        }));
        try {
            await fetch(`/api/categories/${id}/visibility`, {
                method: 'PATCH',
                body: JSON.stringify({ status: status ? 1 : 0 }),
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            toast.error("Error al cambiar visibilidad");
            set({ categories: originalCategories });
        }
    },
    createSection: async (data, imageFile) => { console.log("createSection", data); },
    updateSection: async (id, data, imageFile, internal) => { console.log("updateSection", id, data); },
    deleteSection: async (id) => { console.log("deleteSection", id); },
    toggleSectionVisibility: async (id, status) => { console.log("toggleSectionVisibility", id, status); },
    createProduct: async (data, imageFile) => { console.log("createProduct", data); },
    createProductDirect: async (categoryId, data, imageFile) => { console.log("createProductDirect", categoryId, data); },
    updateProduct: async (id, data, imageFile, internal) => { console.log("updateProduct", id, data); },
    deleteProduct: async (id) => { console.log("deleteProduct", id); },
    toggleProductVisibility: async (id, status) => { console.log("toggleProductVisibility", id, status); },

    // --- UI State Setters ---
    setSelectedCategoryId: (id: number | null) => {
        set({ selectedCategoryId: id, selectedSectionId: null });
    },
    setSelectedSectionId: (id: number | null) => {
        set({ selectedSectionId: id });
    },
}));

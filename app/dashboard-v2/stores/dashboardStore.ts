/**
 * @fileoverview dashboardStore.ts - Store centralizado de Zustand para el estado del dashboard.
 * @description Este store es la única fuente de verdad para el dashboard.
 * Se ha restaurado su estado completo para dar servicio tanto a la vista móvil como a la de escritorio,
 * y se ha corregido la lógica CRUD para que sea robusta y segura en tipos.
 */
import { create } from 'zustand';
import React from 'react';
import { Category, Section, Product, Client } from '../types';
import { toast } from 'react-hot-toast';
import { getCategoryDisplayMode, isCategorySimpleMode } from '../utils/categoryUtils';

// 🎯 IMPORTAR TIPOS DE PERMISOS
// PORQUÉ: Necesarios para validaciones en las operaciones CRUD
import { Permission } from '../types/domain/permissions';

// --- INTERFACES ---

export interface DashboardState {
    client: Client | null;
    categories: Category[];
    sections: Record<string, Section[]>; // key: categoryId
    products: Record<string, Product[]>; // key: sectionId

    // Estados de carga y error
    isLoading: boolean;
    isClientLoading: boolean;
    isUpdating: boolean;
    error: string | null;
    initialDataLoaded: boolean;

    // Estado de UI para VISTA MÓVIL
    activeView: 'categories' | 'sections' | 'products';
    activeCategoryId: number | null;
    activeSectionId: number | null;
    history: { view: 'categories' | 'sections' | 'products'; id: number | null }[];

    // Estado de UI para VISTA DE ESCRITORIO
    selectedCategoryId: number | null;
    selectedSectionId: number | null;

    // 🎯 FASE 8: ESTADO DE PERMISOS
    // PORQUÉ: Cache de validaciones para evitar recálculos
    permissionCache: Record<string, boolean>;
}

export interface DashboardActions {
    initializeDashboard: (clientId: number) => Promise<void>;
    fetchCategories: (clientId: number) => Promise<void>;
    fetchSectionsByCategory: (categoryId: number) => Promise<void>;
    fetchProductsBySection: (sectionId: number) => Promise<void>;
    fetchProductsByCategory: (categoryId: number) => Promise<void>;
    fetchDataForCategory: (categoryId: number) => Promise<void>;
    
    // 🎯 OPERACIONES CRUD CON VALIDACIONES
    // PORQUÉ: Todas las operaciones ahora validan permisos antes de ejecutar
    createCategory: (data: Partial<Category>, imageFile?: File | null, skipPermissionCheck?: boolean) => Promise<void>;
    updateCategory: (id: number, data: Partial<Category>, imageFile?: File | null, skipPermissionCheck?: boolean) => Promise<void>;
    deleteCategory: (id: number, skipPermissionCheck?: boolean) => Promise<void>;
    toggleCategoryVisibility: (id: number, status: number, skipPermissionCheck?: boolean) => Promise<void>;
    createSection: (data: Partial<Section>, imageFile?: File | null, skipPermissionCheck?: boolean) => Promise<void>;
    updateSection: (id: number, data: Partial<Section>, imageFile?: File | null, skipPermissionCheck?: boolean) => Promise<void>;
    deleteSection: (id: number, skipPermissionCheck?: boolean) => Promise<void>;
    toggleSectionVisibility: (id: number, status: number, skipPermissionCheck?: boolean) => Promise<void>;
    createProduct: (data: Partial<Product>, imageFile?: File | null, skipPermissionCheck?: boolean) => Promise<void>;
    createProductDirect: (categoryId: number, data: Partial<Product>, imageFile?: File | null, skipPermissionCheck?: boolean) => Promise<void>;
    updateProduct: (id: number, data: Partial<Product>, imageFile?: File | null, skipPermissionCheck?: boolean) => Promise<void>;
    deleteProduct: (id: number, skipPermissionCheck?: boolean) => Promise<void>;
    toggleProductVisibility: (id: number, status: number, skipPermissionCheck?: boolean) => Promise<void>;
    
    setSelectedCategoryId: (id: number | null) => void;
    setSelectedSectionId: (id: number | null) => void;
    handleCategorySelect: (id: number) => void;
    handleSectionSelect: (id: number) => void;
    handleBack: () => void;

    // 🎯 FUNCIONES DE VALIDACIÓN INTERNA
    // PORQUÉ: Validaciones centralizadas que pueden usar los componentes
    validatePermission: (permission: Permission) => boolean;
    clearPermissionCache: () => void;
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
    activeView: 'categories',
    activeCategoryId: null,
    activeSectionId: null,
    history: [],
    selectedCategoryId: null,
    selectedSectionId: null,
    permissionCache: {},
};

// 🎯 FUNCIÓN HELPER PARA VALIDAR PERMISOS
// PORQUÉ: Centraliza la lógica de validación de permisos
// CONEXIÓN: Todas las operaciones CRUD → esta función → validación
const validatePermissionInternal = (permission: Permission): boolean => {
    // 🧭 MIGA DE PAN: Por ahora todos los permisos son true (admin)
    // FUTURO: Integrar con sistema de sesión real
    // CONEXIÓN: usePermissions() hook → esta lógica → validaciones UI
    return true; // TODO: Implementar validación real con sesión
};

// --- CREACIÓN DEL STORE ---

export const useDashboardStore = create<DashboardState & DashboardActions>((set, get) => ({
    ...initialState,

    // Función simple que no causa loops
    validatePermission: () => {
        return true; // TODO: Implementar validación real
    },

    clearPermissionCache: () => {
        set({ permissionCache: {} });
    },

    initializeDashboard: async (clientId) => {
        set({ isClientLoading: true, initialDataLoaded: false });
        try {
            const clientRes = await fetch(`/api/client?id=${clientId}`);
            if (!clientRes.ok) throw new Error('Cliente no encontrado');
            set({ client: await clientRes.json() });
            await get().fetchCategories(clientId);
        } catch (e) {
            set({ error: e instanceof Error ? e.message : 'Error' });
        } finally {
            set({ isClientLoading: false, initialDataLoaded: true });
        }
    },

    fetchCategories: async (clientId) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`/api/categories?client_id=${clientId}`);
            if (!res.ok) throw new Error('Error al cargar categorías');
            set({ categories: await res.json() });
        } catch (e) {
            set({ error: e instanceof Error ? e.message : 'Error' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchSectionsByCategory: async (categoryId) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`/api/sections?category_id=${categoryId}`);
            if (!res.ok) throw new Error('Error al cargar secciones');
            const sectionsData = await res.json();
            set(state => ({ sections: { ...state.sections, [categoryId]: sectionsData } }));
        } catch (e) {
            set({ error: e instanceof Error ? e.message : 'Error' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchProductsBySection: async (sectionId) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`/api/products?section_id=${sectionId}`);
            if (!res.ok) throw new Error('Error al cargar productos');
            const productsData = await res.json();
            set(state => ({ products: { ...state.products, [sectionId]: productsData } }));
        } catch (e) {
            set({ error: e instanceof Error ? e.message : 'Error' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchProductsByCategory: async (categoryId) => {
        // 🧭 MIGA DE PAN CONTEXTUAL: T31 - FUNCIÓN CLAVE PARA PRODUCTOS HÍBRIDOS
        // PORQUÉ MODIFICADA: Ahora carga productos HÍBRIDOS (tradicionales + directos) de una categoría
        // PROBLEMA RESUELTO: Antes solo cargaba productos de categorías "simples", ahora soporta T31
        // ARQUITECTURA: Usa API híbrida que combina productos de secciones + productos directos
        // CONEXIONES CRÍTICAS:
        // - /api/categories/[id]/products/route.ts: API modificada que obtiene productos híbridos
        // - createProductDirect() línea 620: Recarga usando esta función tras crear producto directo
        // - CategoryGridView.tsx: Renderizará productos directos + secciones usando esta data
        // - useCategoryProducts() línea 862: Hook que consume esta data para UI
        //
        // 🎯 T31: FLUJO HÍBRIDO
        // 1. API consulta productos tradicionales (via secciones) + productos directos (via category_id)
        // 2. Elimina duplicados y ordena por display_order
        // 3. Retorna array unificado para mostrar en UI
        //
        // 💡 Diferencia clave con fetchProductsBySection:
        // - fetchProductsBySection: usa section_id (jerarquía completa tradicional)
        // - fetchProductsByCategory: usa category_id (jerarquía híbrida T31)
        console.log('🎯 T31: Cargando productos híbridos para categoría:', categoryId);
        set({ isLoading: true });
        try {
            // T31: Usar API híbrida que obtiene productos tradicionales + directos
            // CONEXIÓN: /api/categories/[id]/products/route.ts líneas 15-45
            const res = await fetch(`/api/categories/${categoryId}/products`);
            if (!res.ok) throw new Error('Error al cargar productos híbridos');
            const productsData = await res.json();
            
            console.log('🎯 T31: Productos híbridos recibidos:', productsData.length, productsData);
            
            // T31: Key especial para productos híbridos de categoría (diferente de secciones)
            // PORQUÉ: Permite distinguir productos de categoría vs productos de sección en el store
            // CONEXIÓN: useCategoryProducts() línea 862 usa esta key para acceder a los datos
            set(state => ({ products: { ...state.products, [`cat-${categoryId}`]: productsData } }));
            
            console.log('🎯 T31: Productos almacenados en store con key:', `cat-${categoryId}`);
        } catch (e) {
            console.error('🎯 T31: Error al cargar productos híbridos:', e);
            set({ error: e instanceof Error ? e.message : 'Error' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchDataForCategory: async (categoryId) => {
        // 🧭 MIGA DE PAN: Esta es la función MAESTRA de auto-detección inteligente T31 (CORREGIDA)
        // PROBLEMA RESUELTO: Antes solo cargaba productos en modo "simple", ahora SIEMPRE carga híbridos
        // PORQUÉ CAMBIO: T31 requiere jerarquía híbrida - secciones Y productos directos simultáneamente
        // 
        // 🔍 FLUJO T31 CORREGIDO:
        // 1. Carga las secciones de la categoría (para mostrar en UI)
        // 2. Carga SIEMPRE los productos híbridos (tradicionales + directos)
        // 3. La UI decide qué mostrar usando MixedContentView
        //
        // 🎯 Se conecta con:
        // - DashboardViewWrapper.tsx → MixedContentView para mostrar contenido híbrido
        // - useMixedContentForCategory() para filtrar y mostrar correctamente
        set({ isLoading: true });
        try {
            // Paso 1: Cargar secciones (siempre necesario para UI híbrida)
            await get().fetchSectionsByCategory(categoryId);
            
            // Paso 2: Cargar SIEMPRE productos híbridos para T31
            // PORQUÉ: Incluso categorías con secciones pueden tener productos directos
            // CONEXIÓN: MixedContentView necesita ambos tipos de datos para renderizar
            await get().fetchProductsByCategory(categoryId);
            
        } catch (e) {
            set({ error: e instanceof Error ? e.message : 'Error en carga híbrida T31' });
        } finally {
            set({ isLoading: false });
        }
    },

    // 🎯 OPERACIONES CRUD CON VALIDACIONES

    createCategory: async (data, imageFile = null, skipPermissionCheck = false) => {
        // 🔒 VALIDACIÓN DE PERMISOS
        // PORQUÉ: Evita operaciones no autorizadas antes de enviar a servidor
        if (!skipPermissionCheck && !get().validatePermission('categories.create')) {
            toast.error('No tienes permisos para crear categorías');
            return;
        }

        set({ isUpdating: true });
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            });
            if (imageFile) formData.append('image', imageFile);

            const res = await fetch('/api/categories', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al crear categoría');
            }

            const newCategory = await res.json();
            set(state => ({
                categories: [...state.categories, newCategory].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            }));

            toast.success('Categoría creada exitosamente');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw e;
        } finally {
            set({ isUpdating: false });
        }
    },

    updateCategory: async (id, data, imageFile = null, skipPermissionCheck = false) => {
        // 🔒 VALIDACIÓN DE PERMISOS
        if (!skipPermissionCheck && !get().validatePermission('categories.edit')) {
            toast.error('No tienes permisos para editar categorías');
            return;
        }

        set({ isUpdating: true });
        
        // 🎯 OPTIMISTIC UPDATE CON ROLLBACK
        // PORQUÉ: UX inmediata con capacidad de revertir si falla
        const previousCategories = get().categories;
        const optimisticCategories = previousCategories.map(cat =>
            cat.category_id === id ? { ...cat, ...data } : cat
        );
        set({ categories: optimisticCategories });

        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            });
            if (imageFile) formData.append('image', imageFile);

            const res = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al actualizar categoría');
            }

            const updatedCategory = await res.json();
            set(state => ({
                categories: state.categories.map(cat =>
                    cat.category_id === id ? updatedCategory : cat
                )
            }));

            toast.success('Categoría actualizada exitosamente');
        } catch (e) {
            // 🔄 ROLLBACK EN CASO DE ERROR
            // PORQUÉ: Restaura el estado anterior si la operación falla
            set({ categories: previousCategories });
            
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw e;
        } finally {
            set({ isUpdating: false });
        }
    },

    deleteCategory: async (id, skipPermissionCheck = false) => {
        // 🔒 VALIDACIÓN DE PERMISOS
        if (!skipPermissionCheck && !get().validatePermission('categories.delete')) {
            toast.error('No tienes permisos para eliminar categorías');
            return;
        }

        set({ isUpdating: true });
        
        // 🎯 OPTIMISTIC UPDATE CON ROLLBACK COMPLETO
        // PORQUÉ: Elimina de UI inmediatamente pero puede revertir
        const previousState = {
            categories: get().categories,
            sections: get().sections,
            products: get().products,
            selectedCategoryId: get().selectedCategoryId,
            selectedSectionId: get().selectedSectionId
        };

        // Eliminar categoría y limpiar datos relacionados
        const updatedCategories = previousState.categories.filter(cat => cat.category_id !== id);
        const updatedSections = { ...previousState.sections };
        const updatedProducts = { ...previousState.products };
        delete updatedSections[id];
        delete updatedProducts[`cat-${id}`];

        // Reset de selección si se elimina la categoría activa
        const newSelectedCategoryId = previousState.selectedCategoryId === id ? null : previousState.selectedCategoryId;
        const newSelectedSectionId = previousState.selectedCategoryId === id ? null : previousState.selectedSectionId;

        set({
            categories: updatedCategories,
            sections: updatedSections,
            products: updatedProducts,
            selectedCategoryId: newSelectedCategoryId,
            selectedSectionId: newSelectedSectionId
        });

        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al eliminar categoría');
            }

            toast.success('Categoría eliminada exitosamente');
        } catch (e) {
            // 🔄 ROLLBACK COMPLETO
            // PORQUÉ: Restaura todo el estado anterior incluyendo selecciones
            set(previousState);
            
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw e;
        } finally {
            set({ isUpdating: false });
        }
    },

    toggleCategoryVisibility: async (id, status, skipPermissionCheck = false) => {
        // 🔒 VALIDACIÓN DE PERMISOS
        if (!skipPermissionCheck && !get().validatePermission('categories.visibility')) {
            toast.error('No tienes permisos para cambiar la visibilidad');
            return;
        }

        await get().updateCategory(id, { status: status === 1 }, null, true);
    },

    // 🎯 OPERACIONES DE SECCIONES CON VALIDACIONES
    // PORQUÉ: Misma lógica de validaciones aplicada a secciones

    createSection: async (data, imageFile = null, skipPermissionCheck = false) => {
        if (!skipPermissionCheck && !get().validatePermission('sections.create')) {
            toast.error('No tienes permisos para crear secciones');
            return;
        }

        set({ isUpdating: true });
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            });
            if (imageFile) formData.append('image', imageFile);

            const res = await fetch('/api/sections', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al crear sección');
            }

            const newSection = await res.json();
            const categoryId = newSection.category_id;
            
            set(state => ({
                sections: {
                    ...state.sections,
                    [categoryId]: [...(state.sections[categoryId] || []), newSection]
                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                }
            }));

            toast.success('Sección creada exitosamente');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw e;
        } finally {
            set({ isUpdating: false });
        }
    },

    updateSection: async (id, data, imageFile = null, skipPermissionCheck = false) => {
        if (!skipPermissionCheck && !get().validatePermission('sections.edit')) {
            toast.error('No tienes permisos para editar secciones');
            return;
        }

        set({ isUpdating: true });
        
        // Optimistic update con rollback
        const previousSections = get().sections;
        let targetCategoryId: number | null = null;
        
        const optimisticSections = { ...previousSections };
        for (const [categoryId, sections] of Object.entries(previousSections)) {
            const sectionIndex = sections.findIndex(s => s.section_id === id);
            if (sectionIndex !== -1) {
                targetCategoryId = parseInt(categoryId);
                optimisticSections[categoryId] = sections.map(section =>
                    section.section_id === id ? { ...section, ...data } : section
                );
                break;
            }
        }
        
        set({ sections: optimisticSections });

        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            });
            if (imageFile) formData.append('image', imageFile);

            const res = await fetch(`/api/sections/${id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al actualizar sección');
            }

            const updatedSection = await res.json();
            const categoryId = updatedSection.category_id;
            
            set(state => ({
                sections: {
                    ...state.sections,
                    [categoryId]: state.sections[categoryId]?.map(section =>
                        section.section_id === id ? updatedSection : section
                    ) || []
                }
            }));

            toast.success('Sección actualizada exitosamente');
        } catch (e) {
            // Rollback
            set({ sections: previousSections });
            
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw e;
        } finally {
            set({ isUpdating: false });
        }
    },

    deleteSection: async (id, skipPermissionCheck = false) => {
        if (!skipPermissionCheck && !get().validatePermission('sections.delete')) {
            toast.error('No tienes permisos para eliminar secciones');
            return;
        }

        set({ isUpdating: true });
        
        // Optimistic update con rollback completo
        const previousState = {
            sections: get().sections,
            products: get().products,
            selectedSectionId: get().selectedSectionId
        };

        // Encontrar y eliminar la sección
        const updatedSections = { ...previousState.sections };
        let targetCategoryId: number | null = null;
        
        for (const [categoryId, sections] of Object.entries(updatedSections)) {
            const sectionIndex = sections.findIndex(s => s.section_id === id);
            if (sectionIndex !== -1) {
                targetCategoryId = parseInt(categoryId);
                updatedSections[categoryId] = sections.filter(s => s.section_id !== id);
                break;
            }
        }

        // Limpiar productos de la sección eliminada
        const updatedProducts = { ...previousState.products };
        delete updatedProducts[id];

        // Reset selección si se elimina la sección activa
        const newSelectedSectionId = previousState.selectedSectionId === id ? null : previousState.selectedSectionId;

        set({
            sections: updatedSections,
            products: updatedProducts,
            selectedSectionId: newSelectedSectionId
        });

        try {
            const res = await fetch(`/api/sections/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al eliminar sección');
            }

            toast.success('Sección eliminada exitosamente');
        } catch (e) {
            // Rollback completo
            set(previousState);
            
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw e;
        } finally {
            set({ isUpdating: false });
        }
    },

    toggleSectionVisibility: async (id, status, skipPermissionCheck = false) => {
        if (!skipPermissionCheck && !get().validatePermission('sections.visibility')) {
            toast.error('No tienes permisos para cambiar la visibilidad');
            return;
        }

        await get().updateSection(id, { status: status === 1 }, null, true);
    },

    // 🎯 OPERACIONES DE PRODUCTOS CON VALIDACIONES
    // PORQUÉ: Validaciones de permisos aplicadas a todas las operaciones de productos

    createProduct: async (data, imageFile = null, skipPermissionCheck = false) => {
        if (!skipPermissionCheck && !get().validatePermission('products.create')) {
            toast.error('No tienes permisos para crear productos');
            return;
        }

        set({ isUpdating: true });
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            });
            if (imageFile) formData.append('image', imageFile);

            const res = await fetch('/api/products', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al crear producto');
            }

            const newProduct = await res.json();
            const sectionId = newProduct.section_id;
            
            if (sectionId) {
                set(state => ({
                    products: {
                        ...state.products,
                        [sectionId]: [...(state.products[sectionId] || []), newProduct]
                            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                    }
                }));
            }

            toast.success('Producto creado exitosamente');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw e;
        } finally {
            set({ isUpdating: false });
        }
    },

    createProductDirect: async (categoryId, data, imageFile = null, skipPermissionCheck = false) => {
        // 🎯 T31: CREAR PRODUCTO DIRECTO EN CATEGORÍA
        // PORQUÉ: Permite crear productos sin sección intermedia
        // VALIDACIÓN: Misma lógica de permisos que createProduct
        console.log('🎯 T31: Iniciando creación de producto directo:', { categoryId, data });
        
        if (!skipPermissionCheck && !get().validatePermission('products.create')) {
            toast.error('No tienes permisos para crear productos');
            return;
        }

        set({ isUpdating: true });
        try {
            const productData = { ...data, category_id: categoryId, section_id: null };
            console.log('🎯 T31: Datos del producto a enviar:', productData);
            
            const formData = new FormData();
            
            Object.entries(productData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            });
            if (imageFile) formData.append('image', imageFile);

            console.log('🎯 T31: Enviando request a /api/products...');
            const res = await fetch('/api/products', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('🎯 T31: Error en respuesta API:', errorData);
                throw new Error(errorData.error || 'Error al crear producto directo');
            }

            const newProduct = await res.json();
            console.log('🎯 T31: Producto creado exitosamente:', newProduct);

            // Recargar productos híbridos de la categoría
            console.log('🎯 T31: Recargando productos de categoría:', categoryId);
            await get().fetchProductsByCategory(categoryId);

            toast.success('Producto creado exitosamente en categoría');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
            console.error('🎯 T31: Error completo:', e);
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw e;
        } finally {
            set({ isUpdating: false });
        }
    },

    updateProduct: async (id, data, imageFile = null, skipPermissionCheck = false) => {
        if (!skipPermissionCheck && !get().validatePermission('products.edit')) {
            toast.error('No tienes permisos para editar productos');
            return;
        }

        set({ isUpdating: true });
        
        // Optimistic update con rollback
        const previousProducts = get().products;
        let targetKey: string | null = null;
        
        const optimisticProducts = { ...previousProducts };
        for (const [key, products] of Object.entries(previousProducts)) {
            const productIndex = products.findIndex(p => p.product_id === id);
            if (productIndex !== -1) {
                targetKey = key;
                optimisticProducts[key] = products.map(product =>
                    product.product_id === id ? { ...product, ...data } : product
                );
                break;
            }
        }
        
        set({ products: optimisticProducts });

        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            });
            if (imageFile) formData.append('image', imageFile);

            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al actualizar producto');
            }

            const updatedProduct = await res.json();
            
            // Determinar la key correcta para actualizar
            const newSectionId = updatedProduct.section_id;
            const newCategoryId = updatedProduct.category_id;
            const newKey = newSectionId ? newSectionId.toString() : `cat-${newCategoryId}`;
            
            // Si cambió de ubicación, recargar ambas ubicaciones
            if (targetKey && targetKey !== newKey) {
                // Recargar ubicación anterior y nueva
                if (targetKey.startsWith('cat-')) {
                    const oldCategoryId = parseInt(targetKey.replace('cat-', ''));
                    await get().fetchProductsByCategory(oldCategoryId);
                } else {
                    await get().fetchProductsBySection(parseInt(targetKey));
                }
                
                if (newKey.startsWith('cat-')) {
                    await get().fetchProductsByCategory(newCategoryId);
                } else {
                    await get().fetchProductsBySection(newSectionId);
                }
            } else {
                // Actualización en la misma ubicación
                set(state => ({
                    products: {
                        ...state.products,
                        [newKey]: state.products[newKey]?.map(product =>
                            product.product_id === id ? updatedProduct : product
                        ) || []
                    }
                }));
            }

            toast.success('Producto actualizado exitosamente');
        } catch (e) {
            // Rollback
            set({ products: previousProducts });
            
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw e;
        } finally {
            set({ isUpdating: false });
        }
    },

    deleteProduct: async (id, skipPermissionCheck = false) => {
        if (!skipPermissionCheck && !get().validatePermission('products.delete')) {
            toast.error('No tienes permisos para eliminar productos');
            return;
        }

        set({ isUpdating: true });
        
        // Optimistic update con rollback
        const previousProducts = get().products;
        let targetKey: string | null = null;
        
        const updatedProducts = { ...previousProducts };
        for (const [key, products] of Object.entries(updatedProducts)) {
            const productIndex = products.findIndex(p => p.product_id === id);
            if (productIndex !== -1) {
                targetKey = key;
                updatedProducts[key] = products.filter(p => p.product_id !== id);
                break;
            }
        }
        
        set({ products: updatedProducts });

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al eliminar producto');
            }

            toast.success('Producto eliminado exitosamente');
        } catch (e) {
            // Rollback
            set({ products: previousProducts });
            
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw e;
        } finally {
            set({ isUpdating: false });
        }
    },

    toggleProductVisibility: async (id, status, skipPermissionCheck = false) => {
        if (!skipPermissionCheck && !get().validatePermission('products.visibility')) {
            toast.error('No tienes permisos para cambiar la visibilidad');
            return;
        }

        await get().updateProduct(id, { status: status === 1 }, null, true);
    },

    // 🎯 FUNCIONES DE NAVEGACIÓN (sin cambios)
    setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
    setSelectedSectionId: (id) => set({ selectedSectionId: id }),

    handleCategorySelect: (id) => {
        // 🧭 MIGA DE PAN: Función de navegación inteligente para móvil
        // PORQUÉ: Maneja la navegación entre vistas en móvil con historial
        // CONEXIÓN: MobileView.tsx → esta función → cambio de vista
        // FLUJO: categories → sections (si hay) → products
        set(state => ({
            activeCategoryId: id,
            activeView: 'sections',
            history: [...state.history, { view: 'categories', id: null }]
        }));
    },

    handleSectionSelect: (id) => {
        // 🧭 MIGA DE PAN: Navegación a productos desde sección
        // PORQUÉ: Cambia a vista de productos y carga los datos
        // CONEXIÓN: SectionGridView → esta función → ProductGridView
        set(state => ({
            activeSectionId: id,
            activeView: 'products',
            history: [...state.history, { view: 'sections', id: state.activeCategoryId }]
        }));
    },

    handleBack: () => {
        // 🧭 MIGA DE PAN: Navegación hacia atrás con historial
        // PORQUÉ: Permite volver a la vista anterior manteniendo el contexto
        // CONEXIÓN: Botón back → esta función → vista anterior
        set(state => {
            const newHistory = [...state.history];
            const previousView = newHistory.pop();
            
            if (!previousView) {
                return { activeView: 'categories', activeCategoryId: null, activeSectionId: null };
            }
            
            return {
                activeView: previousView.view,
                activeCategoryId: previousView.view === 'categories' ? null : state.activeCategoryId,
                activeSectionId: previousView.view === 'sections' ? null : state.activeSectionId,
                history: newHistory
            };
        });
    },
}));

// --- HOOKS DERIVADOS CORREGIDOS ---

export const useCategoryDisplayMode = (categoryId: number | null) => {
    return useDashboardStore(
        (state) => {
            if (!categoryId) return 'sections';
            const sections = state.sections[categoryId] || [];
            return getCategoryDisplayMode(sections);
        },
        // Función de igualdad simple para strings
        (a, b) => a === b
    );
};

export const useCategoryProducts = (categoryId: number | null, sectionId?: number | null) => {
    return useDashboardStore(
        (state) => {
            if (sectionId) {
                return state.products[sectionId] || [];
            } else if (categoryId) {
                return state.products[`cat-${categoryId}`] || [];
            }
            return [];
        },
        // Comparación superficial de arrays
        (a, b) => {
            if (a.length !== b.length) return false;
            return a.every((item, index) => item.product_id === b[index]?.product_id);
        }
    );
};

// 🚨 HOOK SIMPLIFICADO PARA EVITAR BUCLES INFINITOS
export const useCategoryWithCounts = (categoryId: number | null) => {
    // Enfoque ultra-simple: solo obtener datos básicos sin cálculos complejos
    const categories = useDashboardStore(state => state.categories);
    const sections = useDashboardStore(state => state.sections);
    const products = useDashboardStore(state => state.products);
    
    // Usar useMemo para cachear el resultado y evitar recálculos
    return React.useMemo(() => {
        if (!categoryId) return null;
        
        const category = categories.find(c => c.category_id === categoryId);
        if (!category) return null;
        
        const categorySections = sections[categoryId] || [];
        const categoryProducts = products[`cat-${categoryId}`] || [];
        
        return {
            category_id: category.category_id,
            name: category.name,
            status: category.status,
            image: category.image,
            display_order: category.display_order,
            client_id: category.client_id,
            sectionsCount: categorySections.length,
            visibleSectionsCount: categorySections.filter(s => s.status).length,
            productsCount: categoryProducts.length,
            visibleProductsCount: categoryProducts.filter(p => p.status).length,
        };
    }, [categoryId, categories, sections, products]);
};

// 🧭 MIGA DE PAN CONTEXTUAL: Selector para Lista Mixta T31 (FASE 1.2) - CORREGIDO BUCLE INFINITO
// PORQUÉ CRÍTICO: Implementa la jerarquía híbrida mostrando secciones y productos directos juntos
// PROBLEMA RESUELTO: Sin este selector, no podemos renderizar contenido mixto en una sola vista
// CONEXIÓN: DashboardViewWrapper → useMixedContentForCategory → MixedContentView
// PATRÓN v0.dev: Selector memoizado que combina diferentes tipos de datos con discriminated union
// 🚨 CORRECCIÓN: Eliminada función de comparación compleja que causaba bucles infinitos
export const useMixedContentForCategory = (categoryId: number | null) => {
    const sections = useDashboardStore(state => state.sections);
    const products = useDashboardStore(state => state.products);
    
    // 🧭 MIGA DE PAN: useMemo para evitar recálculos y bucles infinitos
    // PORQUÉ: React.useMemo es más estable que selector personalizado de Zustand
    // PROBLEMA RESUELTO: Función de comparación compleja causaba re-renders infinitos
    return React.useMemo(() => {
        if (!categoryId) return [];
        
        // Obtener secciones de la categoría
        const categorySections = (sections[categoryId] || [])
            .map(section => ({ ...section, itemType: 'section' as const }))
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        
        // Obtener productos directos de la categoría (SOLO los que tienen category_id y NO section_id)
        // 🧭 MIGA DE PAN: FILTRO CRÍTICO - Solo productos directos, no tradicionales
        // PROBLEMA RESUELTO: API devuelve todos los productos, pero UI debe mostrar solo directos
        // CONEXIÓN: products[cat-X] contiene híbridos, pero MixedContentView necesita solo directos
        // Obtener productos directos de la categoría (SOLO los que tienen category_id y NO section_id)
        // 🧭 MIGA DE PAN: FILTRO CRÍTICO - Solo productos directos, no tradicionales
        // PROBLEMA RESUELTO: API devuelve todos los productos, pero UI debe mostrar solo directos
        // CONEXIÓN: products[cat-X] contiene híbridos, pero MixedContentView necesita solo directos
        const directProducts = (products[`cat-${categoryId}`] || [])
            .filter(product => product.category_id === categoryId && product.section_id === null)
            .map(product => ({ ...product, itemType: 'product' as const }))
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        
        // 🧭 MIGA DE PAN: Ordenamiento estratégico - secciones primero, productos después
        // PORQUÉ: UX más intuitiva - estructura jerárquica antes que elementos directos
        // PATRÓN v0.dev: Spread operator para combinar arrays manteniendo inmutabilidad
        return [...categorySections, ...directProducts];
    }, [categoryId, sections, products]);
};

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
}

export interface DashboardActions {
    initializeDashboard: (clientId: number) => Promise<void>;
    fetchCategories: (clientId: number) => Promise<void>;
    fetchSectionsByCategory: (categoryId: number) => Promise<void>;
    fetchProductsBySection: (sectionId: number) => Promise<void>;
    fetchProductsByCategory: (categoryId: number) => Promise<void>;
    fetchDataForCategory: (categoryId: number) => Promise<void>;
    createCategory: (data: Partial<Category>, imageFile?: File | null) => Promise<void>;
    updateCategory: (id: number, data: Partial<Category>, imageFile?: File | null) => Promise<void>;
    deleteCategory: (id: number) => Promise<void>;
    toggleCategoryVisibility: (id: number, status: number) => Promise<void>;
    createSection: (data: Partial<Section>, imageFile?: File | null) => Promise<void>;
    updateSection: (id: number, data: Partial<Section>, imageFile?: File | null) => Promise<void>;
    deleteSection: (id: number) => Promise<void>;
    toggleSectionVisibility: (id: number, status: number) => Promise<void>;
    createProduct: (data: Partial<Product>, imageFile?: File | null) => Promise<void>;
    // 🎯 T31: Nueva función para crear productos directos en categorías
    createProductDirect: (categoryId: number, data: Partial<Product>, imageFile?: File | null) => Promise<void>;
    updateProduct: (id: number, data: Partial<Product>, imageFile?: File | null) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    toggleProductVisibility: (id: number, status: number) => Promise<void>;
    setSelectedCategoryId: (id: number | null) => void;
    setSelectedSectionId: (id: number | null) => void;
    handleCategorySelect: (id: number) => void;
    handleSectionSelect: (id: number) => void;
    handleBack: () => void;
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
};

// --- CREACIÓN DEL STORE ---

export const useDashboardStore = create<DashboardState & DashboardActions>((set, get) => ({
    ...initialState,

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
        set({ isLoading: true });
        try {
            // T31: Usar API híbrida que obtiene productos tradicionales + directos
            // CONEXIÓN: /api/categories/[id]/products/route.ts líneas 15-45
            const res = await fetch(`/api/categories/${categoryId}/products`);
            if (!res.ok) throw new Error('Error al cargar productos híbridos');
            const productsData = await res.json();
            
            // T31: Key especial para productos híbridos de categoría (diferente de secciones)
            // PORQUÉ: Permite distinguir productos de categoría vs productos de sección en el store
            // CONEXIÓN: useCategoryProducts() línea 862 usa esta key para acceder a los datos
            set(state => ({ products: { ...state.products, [`cat-${categoryId}`]: productsData } }));
        } catch (e) {
            set({ error: e instanceof Error ? e.message : 'Error' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchDataForCategory: async (categoryId) => {
        // 🧭 MIGA DE PAN: Esta es la función MAESTRA de auto-detección inteligente (T32.1)
        // Decide automáticamente si una categoría debe usar jerarquía simple o completa:
        // 
        // 🔍 FLUJO DE AUTO-DETECCIÓN:
        // 1. Carga las secciones de la categoría
        // 2. Usa getCategoryDisplayMode() para determinar el modo
        // 3. Si es "simple" → carga productos directos (fetchProductsByCategory)
        // 4. Si es "sections" → mantiene secciones para navegación posterior
        //
        // 🎯 Se conecta con:
        // - DashboardView.tsx para renderizar UI adaptada al modo detectado
        // - MobileView.tsx para adaptar la navegación móvil
        // - CategoryGridView.tsx para mostrar productos o secciones según el modo
        set({ isLoading: true });
        try {
            // Paso 1: Siempre cargar secciones primero para auto-detectar
            await get().fetchSectionsByCategory(categoryId);

            // Paso 2: Obtener las secciones cargadas y determinar el modo
            const sections = get().sections[categoryId] || [];
            const displayMode = getCategoryDisplayMode(sections);

            // Paso 3: Si es modo simple, cargar productos directos automáticamente  
            if (displayMode === 'simple') {
                await get().fetchProductsByCategory(categoryId);
            }

            // Si es modo "sections", las secciones ya están cargadas para navegación posterior

        } catch (e) {
            set({ error: e instanceof Error ? e.message : 'Error al cargar datos de categoría' });
        } finally {
            set({ isLoading: false });
        }
    },

    createCategory: async (data, imageFile) => {
        const toastId = 'crud-category';
        set({ isUpdating: true });
        toast.loading('Creando categoría...', { id: toastId });
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null) formData.append(key, String(value));
            });
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const res = await fetch('/api/categories', { method: 'POST', body: formData });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error);
            }

            const responseData = await res.json();
            toast.success('Categoría creada', { id: toastId });

            const clientId = get().client?.id;
            if (clientId) await get().fetchCategories(clientId);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error', { id: toastId });
        } finally {
            set({ isUpdating: false });
        }
    },

    updateCategory: async (id, data, imageFile) => {
        // 🧭 MIGA DE PAN: Esta función actualiza categorías existentes siguiendo el mismo patrón
        // que createCategory, pero usando PUT y un endpoint específico por ID.
        // Se conecta con EditCategoryModal.tsx y CategoryForm.tsx para la edición desde ambas vistas.
        const toastId = `update-category-${id}`;
        set({ isUpdating: true });
        toast.loading('Actualizando categoría...', { id: toastId });
        try {
            const formData = new FormData();
            formData.append('category_id', String(id));
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && key !== 'category_id') {
                    formData.append(key, String(value));
                }
            });
            if (imageFile) formData.append('image', imageFile);

            const res = await fetch('/api/categories', { method: 'PUT', body: formData });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error);
            }

            toast.success('Categoría actualizada', { id: toastId });

            // Recargar categorías para reflejar cambios en ambas vistas (móvil y escritorio)
            const clientId = get().client?.id;
            if (clientId) await get().fetchCategories(clientId);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error', { id: toastId });
        } finally {
            set({ isUpdating: false });
        }
    },

    deleteCategory: async (id) => {
        /**
         * 🧭 MIGA DE PAN CONTEXTUAL: Eliminación de categoría con edge cases críticos (FASE 4)
         * 
         * PORQUÉ CRÍTICO: Implementa patrón v0.dev de optimistic update + rollback completo
         * PROBLEMA RESUELTO: Antes no manejaba eliminación en cascada ni rollback en caso de error
         * 
         * EDGE CASES MANEJADOS:
         * 1. Eliminación en cascada: Limpia secciones y productos hijos automáticamente
         * 2. Reseteo de selecciones: Evita estados inconsistentes en UI
         * 3. Rollback completo: Restaura estado previo si falla la operación
         * 4. Navegación coherente: Redirige a vista segura tras eliminación
         * 
         * CONEXIONES CRÍTICAS:
         * - DeleteConfirmationModal.tsx: Modal que invoca esta función
         * - CategoryGridView.tsx: Botón de eliminar que abre el modal
         * - DashboardView.tsx: Se actualiza automáticamente tras eliminación
         * - MobileView.tsx: Navegación se resetea si elimina categoría activa
         * 
         * PATRÓN v0.dev: Optimistic update → API call → Rollback si falla
         * ARQUITECTURA: Mantiene consistencia de estado en todo momento
         */
        const toastId = `delete-category-${id}`;
        set({ isUpdating: true });
        toast.loading('Eliminando categoría...', { id: toastId });
        
        // 🧭 MIGA DE PAN: Guardar estado completo para rollback (EDGE CASE CRÍTICO)
        // PORQUÉ NECESARIO: Si falla la eliminación, debemos restaurar TODO el estado previo
        // CONEXIÓN: Este snapshot se usa en el catch para rollback completo
        const prevState = {
            categories: [...get().categories],
            sections: { ...get().sections },
            products: { ...get().products },
            selectedCategoryId: get().selectedCategoryId,
            selectedSectionId: get().selectedSectionId,
            activeCategoryId: get().activeCategoryId,
            activeSectionId: get().activeSectionId,
            activeView: get().activeView,
            history: [...get().history]
        };
        
        try {
            // 🧭 MIGA DE PAN: OPTIMISTIC UPDATE - Actualizar UI inmediatamente
            // PATRÓN v0.dev: Usuario ve cambios instantáneos, rollback si falla
            set(state => {
                // Eliminar categoría del array
                const newCategories = state.categories.filter(cat => cat.category_id !== id);
                
                // 🎯 EDGE CASE: Eliminación en cascada de secciones hijas
                // PORQUÉ CRÍTICO: Evita secciones huérfanas en el estado
                const newSections = { ...state.sections };
                delete newSections[id]; // Eliminar todas las secciones de esta categoría
                
                // 🎯 EDGE CASE: Eliminación en cascada de productos hijos
                // PROBLEMA RESUELTO: Productos directos (cat-${id}) y productos de secciones
                const newProducts = { ...state.products };
                delete newProducts[`cat-${id}`]; // Eliminar productos directos
                
                // Eliminar productos de secciones que pertenecían a esta categoría
                const sectionsToDelete = prevState.sections[id] || [];
                sectionsToDelete.forEach(section => {
                    delete newProducts[section.section_id];
                });
                
                // 🎯 EDGE CASE: Reseteo inteligente de selecciones
                // CONEXIÓN: Evita que DashboardView muestre contenido de categoría eliminada
                let newSelectedCategoryId = state.selectedCategoryId;
                let newSelectedSectionId = state.selectedSectionId;
                let newActiveCategoryId = state.activeCategoryId;
                let newActiveSectionId = state.activeSectionId;
                let newActiveView = state.activeView;
                let newHistory = state.history;
                
                // Resetear selecciones de escritorio si se eliminó la categoría activa
                if (state.selectedCategoryId === id) {
                    newSelectedCategoryId = null;
                    newSelectedSectionId = null;
                }
                
                // 🎯 EDGE CASE: Navegación móvil coherente tras eliminación
                // PROBLEMA RESUELTO: Usuario queda en vista vacía si elimina categoría activa
                if (state.activeCategoryId === id) {
                    newActiveView = 'categories';
                    newActiveCategoryId = null;
                    newActiveSectionId = null;
                    newHistory = []; // Limpiar historial para evitar navegación a categoría eliminada
                }
                
                return {
                    ...state,
                    categories: newCategories,
                    sections: newSections,
                    products: newProducts,
                    selectedCategoryId: newSelectedCategoryId,
                    selectedSectionId: newSelectedSectionId,
                    activeCategoryId: newActiveCategoryId,
                    activeSectionId: newActiveSectionId,
                    activeView: newActiveView,
                    history: newHistory
                };
            });

            // 🧭 MIGA DE PAN: Llamada a API tras optimistic update
            // CONEXIÓN: /api/categories/[id]/route.ts maneja eliminación en cascada en servidor
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al eliminar categoría');
            }

            toast.success('Categoría eliminada', { id: toastId });

            // 🧭 MIGA DE PAN: Recargar datos para sincronizar con servidor
            // PORQUÉ NECESARIO: Asegurar que contadores y relaciones estén actualizados
            const clientId = get().client?.id;
            if (clientId) await get().fetchCategories(clientId);
            
        } catch (e) {
            // 🎯 EDGE CASE CRÍTICO: Rollback completo del estado
            // PATRÓN v0.dev: Restaurar estado exacto previo a la operación fallida
            // CONEXIÓN: prevState capturado al inicio se restaura completamente
            set(prevState);
            toast.error(e instanceof Error ? e.message : 'Error', { id: toastId });
        } finally {
            set({ isUpdating: false });
        }
    },

    toggleCategoryVisibility: async (id, status) => {
        // 🧭 MIGA DE PAN: Esta función alterna la visibilidad de categorías usando el endpoint PATCH.
        // Se conecta con CategoryGridView.tsx y CategoryList.tsx para el botón "ojo" en ambas vistas.
        const toastId = `toggle-category-${id}`;
        set({ isUpdating: true });
        toast.loading('Actualizando visibilidad...', { id: toastId });
        try {
            const newStatus = status === 1 ? false : true;
            const res = await fetch(`/api/categories/${id}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al actualizar visibilidad');
            }

            toast.success('Visibilidad actualizada', { id: toastId });

            // Recargar categorías para reflejar cambios
            const clientId = get().client?.id;
            if (clientId) await get().fetchCategories(clientId);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error desconocido', { id: toastId });
        } finally {
            set({ isUpdating: false });
        }
    },

    createSection: async (data, imageFile) => {
        // 🧭 MIGA DE PAN: Esta función crea secciones siguiendo el patrón exitoso de createCategory.
        // Se conecta con EditSectionModal.tsx y SectionForm.tsx desde ambas vistas.
        const toastId = 'crud-section';
        set({ isUpdating: true });
        toast.loading('Creando sección...', { id: toastId });

        console.log('🎯 createSection - Datos recibidos:', { data, hasImageFile: !!imageFile });

        try {
            const formData = new FormData();

            console.log('🎯 createSection - Procesando campos de data...');
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null) {
                    console.log(`🎯 createSection - FormData: ${key} = ${value}`);
                    formData.append(key, String(value));
                }
            });

            if (imageFile) {
                console.log('🎯 createSection - Añadiendo imagen:', imageFile.name);
                formData.append('image', imageFile);
            }

            console.log('🎯 createSection - Enviando request a /api/sections');
            const res = await fetch('/api/sections', { method: 'POST', body: formData });

            console.log('🎯 createSection - Response status:', res.status);

            if (!res.ok) {
                const errorData = await res.json();
                console.error('🎯 createSection - Error response:', errorData);
                throw new Error(errorData.error || errorData.message || 'Error al crear sección');
            }

            const responseData = await res.json();
            console.log('🎯 createSection - Success response:', responseData);

            toast.success('Sección creada', { id: toastId });

            // Recargar secciones de la categoría activa/seleccionada
            const { activeCategoryId, selectedCategoryId } = get();
            const targetCategoryId = activeCategoryId || selectedCategoryId;
            console.log('🎯 createSection - Recargando secciones para categoría:', targetCategoryId);

            if (targetCategoryId) await get().fetchSectionsByCategory(targetCategoryId);
        } catch (e) {
            console.error('🎯 createSection - Error completo:', e);
            toast.error(e instanceof Error ? e.message : 'Error', { id: toastId });
        } finally {
            set({ isUpdating: false });
        }
    },

    updateSection: async (id, data, imageFile) => {
        // 🧭 MIGA DE PAN: Actualiza secciones existentes usando PUT en el endpoint de secciones.
        // Se conecta con EditSectionModal.tsx para la edición desde ambas vistas.
        // IMPORTANTE: El endpoint PUT de secciones espera el campo 'id' (no 'section_id')
        const toastId = `update-section-${id}`;
        set({ isUpdating: true });
        toast.loading('Actualizando sección...', { id: toastId });
        try {
            const formData = new FormData();
            formData.append('id', String(id));
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && key !== 'id') {
                    formData.append(key, String(value));
                }
            });
            if (imageFile) formData.append('image', imageFile);

            const res = await fetch('/api/sections', { method: 'PUT', body: formData });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error);
            }

            toast.success('Sección actualizada', { id: toastId });

            // Recargar secciones de la categoría activa
            const { activeCategoryId, selectedCategoryId } = get();
            const targetCategoryId = activeCategoryId || selectedCategoryId;
            if (targetCategoryId) await get().fetchSectionsByCategory(targetCategoryId);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error', { id: toastId });
        } finally {
            set({ isUpdating: false });
        }
    },

    deleteSection: async (id) => {
        /**
         * 🧭 MIGA DE PAN CONTEXTUAL: Eliminación de sección con edge cases críticos (FASE 4)
         * 
         * PORQUÉ CRÍTICO: Implementa patrón v0.dev con eliminación en cascada de productos hijos
         * PROBLEMA RESUELTO: Antes no limpiaba productos huérfanos ni manejaba rollback
         * 
         * EDGE CASES MANEJADOS:
         * 1. Eliminación en cascada: Limpia productos hijos automáticamente
         * 2. Reseteo de selecciones: Evita mostrar contenido de sección eliminada
         * 3. Rollback completo: Restaura estado si falla la operación
         * 4. Navegación coherente: Redirige a vista de secciones tras eliminación
         * 
         * CONEXIONES CRÍTICAS:
         * - DeleteConfirmationModal.tsx: Modal que invoca esta función
         * - SectionGridView.tsx: Botón de eliminar que abre el modal
         * - DashboardView.tsx: Columna de productos se oculta tras eliminación
         * - MobileView.tsx: Navegación se resetea si elimina sección activa
         * 
         * PATRÓN v0.dev: Optimistic update → API call → Rollback si falla
         */
        const toastId = `delete-section-${id}`;
        set({ isUpdating: true });
        toast.loading('Eliminando sección...', { id: toastId });
        
        // 🧭 MIGA DE PAN: Snapshot completo para rollback (EDGE CASE CRÍTICO)
        const prevState = {
            sections: { ...get().sections },
            products: { ...get().products },
            selectedSectionId: get().selectedSectionId,
            activeSectionId: get().activeSectionId,
            activeView: get().activeView,
            history: [...get().history]
        };
        
        try {
            // 🧭 MIGA DE PAN: OPTIMISTIC UPDATE con eliminación en cascada
            set(state => {
                const newSections = { ...state.sections };
                const newProducts = { ...state.products };
                
                // 🎯 EDGE CASE: Eliminar sección de todas las categorías
                // PORQUÉ NECESARIO: sections es un Record<categoryId, Section[]>
                Object.keys(newSections).forEach(categoryId => {
                    newSections[categoryId] = newSections[categoryId].filter(
                        section => section.section_id !== id
                    );
                });
                
                // 🎯 EDGE CASE: Eliminación en cascada de productos hijos
                // PROBLEMA RESUELTO: Productos quedan huérfanos si no se eliminan
                delete newProducts[id]; // Eliminar todos los productos de esta sección
                
                // 🎯 EDGE CASE: Reseteo inteligente de selecciones
                let newSelectedSectionId = state.selectedSectionId;
                let newActiveSectionId = state.activeSectionId;
                let newActiveView = state.activeView;
                let newHistory = state.history;
                
                // Resetear selecciones de escritorio
                if (state.selectedSectionId === id) {
                    newSelectedSectionId = null;
                }
                
                // 🎯 EDGE CASE: Navegación móvil coherente tras eliminación
                if (state.activeSectionId === id) {
                    newActiveView = 'sections';
                    newActiveSectionId = null;
                    // Mantener historial para permitir navegación hacia atrás
                }
                
                return {
                    ...state,
                    sections: newSections,
                    products: newProducts,
                    selectedSectionId: newSelectedSectionId,
                    activeSectionId: newActiveSectionId,
                    activeView: newActiveView,
                    history: newHistory
                };
            });

            // 🧭 MIGA DE PAN: Llamada a API tras optimistic update
            const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al eliminar sección');
            }

            toast.success('Sección eliminada', { id: toastId });

            // 🧭 MIGA DE PAN: Recargar datos para sincronizar contadores
            const { activeCategoryId, selectedCategoryId } = get();
            const targetCategoryId = activeCategoryId || selectedCategoryId;
            if (targetCategoryId) await get().fetchSectionsByCategory(targetCategoryId);
            
        } catch (e) {
            // 🎯 EDGE CASE CRÍTICO: Rollback completo del estado
            set(prevState);
            toast.error(e instanceof Error ? e.message : 'Error', { id: toastId });
        } finally {
            set({ isUpdating: false });
        }
    },

    toggleSectionVisibility: async (id, status) => {
        // 🧭 MIGA DE PAN: Esta función alterna la visibilidad de secciones usando el endpoint PATCH.
        // Se conecta con SectionGridView.tsx y SectionList.tsx para el botón "ojo" en ambas vistas.
        const toastId = `toggle-section-${id}`;
        set({ isUpdating: true });
        toast.loading('Actualizando visibilidad...', { id: toastId });
        try {
            const newStatus = status === 1 ? false : true;
            const res = await fetch(`/api/sections/${id}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al actualizar visibilidad');
            }
            toast.success('Visibilidad actualizada', { id: toastId });

            // 🧭 MIGA DE PAN CONTEXTUAL: CRÍTICO - Actualizar tanto secciones como categorías
            // PROBLEMA RESUELTO: Los contadores de visibilidad en categorías no se actualizaban
            // PORQUÉ NECESARIO: Las categorías muestran "X/Y secciones visibles" y necesitan refrescarse
            // CONEXIÓN: CategoryList.tsx línea ~52 muestra visible_sections_count/sections_count
            const { activeCategoryId, selectedCategoryId, client } = get();
            const targetCategoryId = selectedCategoryId || activeCategoryId;

            if (targetCategoryId) {
                // Recargar secciones de la categoría para actualizar la lista
                await get().fetchSectionsByCategory(targetCategoryId);
            }

            // CRÍTICO: Recargar categorías para actualizar contadores de visibilidad
            if (client?.id) {
                await get().fetchCategories(client.id);
            }
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error desconocido', { id: toastId });
        } finally {
            set({ isUpdating: false });
        }
    },

    createProduct: async (data, imageFile) => {
        // 🧭 MIGA DE PAN: Esta función crea productos siguiendo el patrón exitoso de createCategory.
        // Se conecta con EditProductModal.tsx y ProductForm.tsx desde ambas vistas.
        // IMPORTANTE: El endpoint POST requiere un campo 'sections' con array JSON de IDs.
        const toastId = 'crud-product';
        set({ isUpdating: true });
        toast.loading('Creando producto...', { id: toastId });
        try {
            const formData = new FormData();

            // El endpoint requiere array 'sections' en lugar de section_id individual
            const { activeSectionId, selectedSectionId } = get();
            const targetSectionId = data.section_id || activeSectionId || selectedSectionId;

            // Añadir todos los campos excepto section_id
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && key !== 'section_id') {
                    formData.append(key, String(value));
                }
            });

            // Añadir array de secciones como requiere el endpoint
            if (targetSectionId) {
                formData.append('sections', JSON.stringify([targetSectionId]));
            }

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const res = await fetch('/api/products', { method: 'POST', body: formData });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error);
            }

            const responseData = await res.json();
            toast.success('Producto creado', { id: toastId });

            // Recargar productos de la sección activa/seleccionada
            if (targetSectionId) await get().fetchProductsBySection(targetSectionId);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error', { id: toastId });
        } finally {
            set({ isUpdating: false });
        }
    },

    // 🎯 T31: NUEVA FUNCIÓN - Crear producto directo en categoría
    // PORQUÉ: Implementa la propuesta de "relaciones opcionales" de Gemini
    // CONEXIÓN: CategoryGridView → FAB "Añadir Producto" → esta función → API modificada
    // FLUJO: Producto se crea directamente en categoría sin sección intermedia
    // 🧭 MIGA DE PAN CONTEXTUAL: T31 - FUNCIÓN CLAVE PARA PRODUCTOS DIRECTOS EN CATEGORÍAS
    // PORQUÉ EXISTE: Permite crear productos directamente en categorías sin secciones intermedias
    // PROBLEMA RESUELTO: Categorías simples como "BEBIDAS" no necesitan estructura "Refrescos > Coca Cola"
    // ARQUITECTURA: Implementa jerarquía flexible Category → Product (vs tradicional Category → Section → Product)
    // CONEXIONES CRÍTICAS:
    // - CategoryGridView.tsx: FAB contextual llamará esta función cuando detecte categoría simple
    // - /api/products/route.ts líneas 328-340: API modificada detecta category_id sin sections
    // - prisma/schema.prisma líneas 60-63: Nueva relación direct_products en categories
    // - fetchProductsByCategory() línea 280: Recarga productos híbridos tras creación
    // CASOS DE USO: Categorías simples como "BEBIDAS" → "Coca Cola" (sin sección)
    createProductDirect: async (categoryId: number, data: Partial<Product>, imageFile?: File | null) => {
        const toastId = 'crud-product-direct';
        set({ isUpdating: true });
        toast.loading('Creando producto directo...', { id: toastId });
        try {
            const formData = new FormData();

            // 🎯 T31: MODO DIRECTO - Enviar category_id en lugar de sections
            // PORQUÉ: La API modificada en /api/products/route.ts línea 328 detecta category_id sin sections
            // REGLA DE NEGOCIO: category_id y sections son mutuamente excluyentes en T31
            // FLUJO: FormData → API → Prisma.create({ category_id, section_id: null })
            formData.append('category_id', String(categoryId));

            // FILTRADO CRÍTICO: Excluir section_id y category_id para evitar conflictos
            // PORQUÉ: section_id debe ser null para productos directos, category_id ya se añadió arriba
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && key !== 'section_id' && key !== 'category_id') {
                    formData.append(key, String(value));
                }
            });

            if (imageFile) {
                formData.append('image', imageFile);
            }

            // ENDPOINT REUTILIZADO: Usa misma API que createProduct() pero con lógica adaptativa
            // CONEXIÓN: /api/products/route.ts línea 436 - FLUJO comentado para diferenciar modos
            const res = await fetch('/api/products', { method: 'POST', body: formData });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error);
            }

            const responseData = await res.json();
            toast.success('Producto directo creado', { id: toastId });

            // 🎯 T31: RECARGAR PRODUCTOS HÍBRIDOS - Tradicionales + Directos
            // PORQUÉ CRÍTICO: La categoría ahora puede tener productos directos que deben mostrarse
            // CONEXIÓN: fetchProductsByCategory() línea 280 usa API híbrida /api/categories/[id]/products
            // FLUJO: Creación → Recarga → CategoryGridView muestra productos directos + secciones
            // ARQUITECTURA: Mantiene consistencia con patrón de recarga tras CRUD
            await get().fetchProductsByCategory(categoryId);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error', { id: toastId });
        } finally {
            set({ isUpdating: false });
        }
    },

    updateProduct: async (id, data, imageFile) => {
        // 🧭 MIGA DE PAN: Actualiza productos existentes usando PUT en el endpoint de productos.
        // Se conecta con EditProductModal.tsx para la edición desde ambas vistas.
        // IMPORTANTE: El endpoint PUT requiere product_id, section_id y client_id obligatorios
        const toastId = `update-product-${id}`;
        set({ isUpdating: true });
        toast.loading('Actualizando producto...', { id: toastId });
        try {
            const formData = new FormData();
            formData.append('product_id', String(id));

            // Añadir campos requeridos por el endpoint
            const { activeSectionId, selectedSectionId, client } = get();
            const targetSectionId = activeSectionId || selectedSectionId;

            if (targetSectionId) formData.append('section_id', String(targetSectionId));
            if (client?.id) formData.append('client_id', String(client.id));

            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && key !== 'product_id') {
                    formData.append(key, String(value));
                }
            });
            if (imageFile) formData.append('image', imageFile);

            const res = await fetch('/api/products', { method: 'PUT', body: formData });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || errorData.error || 'Error al actualizar producto');
            }

            toast.success('Producto actualizado', { id: toastId });

            // Recargar productos de la sección activa
            if (targetSectionId) await get().fetchProductsBySection(targetSectionId);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error', { id: toastId });
        } finally {
            set({ isUpdating: false });
        }
    },

    deleteProduct: async (id) => {
        /**
         * 🧭 MIGA DE PAN CONTEXTUAL: Eliminación de producto con edge cases críticos (FASE 4)
         * 
         * PORQUÉ CRÍTICO: Maneja tanto productos tradicionales como productos directos (T31)
         * PROBLEMA RESUELTO: Antes no diferenciaba entre productos de sección vs productos directos
         * 
         * EDGE CASES MANEJADOS:
         * 1. Detección automática: Identifica si es producto tradicional o directo
         * 2. Recarga inteligente: Usa fetchProductsBySection o fetchProductsByCategory según tipo
         * 3. Rollback completo: Restaura estado si falla la operación
         * 4. Actualización de contadores: Refresca contadores de sección/categoría padre
         * 
         * CONEXIONES CRÍTICAS:
         * - DeleteConfirmationModal.tsx: Modal que invoca esta función
         * - ProductGridView.tsx: Botón de eliminar que abre el modal
         * - CategoryGridView.tsx: Contadores se actualizan tras eliminación
         * - SectionGridView.tsx: Contadores de productos se actualizan
         * 
         * PATRÓN v0.dev: Optimistic update → API call → Rollback si falla
         * ARQUITECTURA T31: Maneja jerarquía híbrida (tradicional + directa)
         */
        const toastId = `delete-product-${id}`;
        set({ isUpdating: true });
        toast.loading('Eliminando producto...', { id: toastId });
        
        // 🧭 MIGA DE PAN: Snapshot para rollback (productos son hojas, snapshot mínimo)
        const prevProducts = { ...get().products };
        
        try {
            // 🧭 MIGA DE PAN: OPTIMISTIC UPDATE - Eliminar producto inmediatamente
            set(state => {
                const newProducts = { ...state.products };
                
                // 🎯 EDGE CASE: Eliminar de todas las listas (secciones + categorías directas)
                // PORQUÉ NECESARIO: Producto puede estar en products[sectionId] o products[`cat-${categoryId}`]
                Object.keys(newProducts).forEach(key => {
                    if (Array.isArray(newProducts[key])) {
                        newProducts[key] = newProducts[key].filter(
                            (product: Product) => product.product_id !== id
                        );
                    }
                });
                
                return { ...state, products: newProducts };
            });

            // 🧭 MIGA DE PAN: Llamada a API
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al eliminar producto');
            }

            toast.success('Producto eliminado', { id: toastId });

            // 🎯 EDGE CASE: Recarga inteligente según contexto (T31 híbrido)
            // PROBLEMA RESUELTO: Debe detectar si recargar productos de sección o categoría
            const { activeCategoryId, selectedCategoryId, activeSectionId, selectedSectionId } = get();
            const targetCategoryId = selectedCategoryId || activeCategoryId;
            const targetSectionId = selectedSectionId || activeSectionId;

            if (targetCategoryId) {
                const sections = get().sections[targetCategoryId];
                const displayMode = getCategoryDisplayMode(sections || []);

                if (displayMode === 'simple') {
                    // 🧭 MIGA DE PAN: Producto directo eliminado, recargar productos de categoría
                    await get().fetchProductsByCategory(targetCategoryId);
                } else if (targetSectionId) {
                    // 🧭 MIGA DE PAN: Producto tradicional eliminado, recargar productos de sección
                    await get().fetchProductsBySection(targetSectionId);
                }

                // 🎯 EDGE CASE CRÍTICO: Actualizar contadores de sección/categoría padre
                // PORQUÉ NECESARIO: SectionGridView y CategoryGridView muestran contadores
                await get().fetchSectionsByCategory(targetCategoryId);
            }
            
        } catch (e) {
            // 🎯 EDGE CASE: Rollback de productos
            set(state => ({ ...state, products: prevProducts }));
            toast.error(e instanceof Error ? e.message : 'Error', { id: toastId });
        } finally {
            set({ isUpdating: false });
        }
    },

    toggleProductVisibility: async (id, status) => {
        // 🧭 MIGA DE PAN: Esta función alterna la visibilidad de productos usando el endpoint PATCH.
        // Se conecta con ProductGridView.tsx y ProductList.tsx para el botón "ojo" en ambas vistas.
        const toastId = `toggle-product-${id}`;
        set({ isUpdating: true });
        toast.loading('Actualizando visibilidad...', { id: toastId });
        try {
            const newStatus = status === 1 ? false : true;
            const res = await fetch(`/api/products/${id}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al actualizar visibilidad');
            }
            toast.success('Visibilidad actualizada', { id: toastId });

            // 🧭 MIGA DE PAN CONTEXTUAL: Refresco inteligente según contexto de navegación
            // PROBLEMA RESUELTO: Para categorías simples, debe usar fetchProductsByCategory
            // CONEXIÓN: useCategoryDisplayMode determina si es categoría simple o compleja
            const { activeCategoryId, selectedCategoryId, activeSectionId, selectedSectionId } = get();
            const targetCategoryId = selectedCategoryId || activeCategoryId;
            const targetSectionId = selectedSectionId || activeSectionId;

            // Para categorías simples, refrescar productos de categoría
            if (targetCategoryId) {
                const sections = get().sections[targetCategoryId];
                const displayMode = getCategoryDisplayMode(sections || []);

                if (displayMode === 'simple') {
                    await get().fetchProductsByCategory(targetCategoryId);
                } else if (targetSectionId) {
                    await get().fetchProductsBySection(targetSectionId);
                }

                // CRÍTICO: Actualizar secciones para refrescar contadores de productos visibles
                // PORQUÉ NECESARIO: Las secciones muestran "X/Y productos visibles" y necesitan refrescarse
                // CONEXIÓN: SectionGridView.tsx y SectionListView.tsx muestran visible_products_count
                await get().fetchSectionsByCategory(targetCategoryId);
            }
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error desconocido', { id: toastId });
        } finally {
            set({ isUpdating: false });
        }
    },

    setSelectedCategoryId: (id) => {
        set({ selectedCategoryId: id, selectedSectionId: null });
        // 🧭 MIGA DE PAN CONTEXTUAL: Esta función es el punto de entrada para navegación en ESCRITORIO
        // PORQUÉ: Se decidió separar la navegación móvil (handleCategorySelect) de la de escritorio (setSelectedCategoryId)
        // porque tienen flujos diferentes - escritorio usa master-detail, móvil usa drill-down
        // CONEXIONES: Se conecta con DashboardView.tsx línea ~45 en CategoryGridView.onCategorySelect
        // DECISIÓN ARQUITECTÓNICA: Siempre limpia selectedSectionId para forzar re-selección de sección
        // FLUJO: DashboardView → CategoryGridView → onClick → setSelectedCategoryId → fetchSectionsByCategory → SectionGridView
        if (id) {
            get().fetchSectionsByCategory(id);
        }
    },
    setSelectedSectionId: (id) => set({ selectedSectionId: id }),

    handleCategorySelect: (id) => {
        // 🧭 MIGA DE PAN CONTEXTUAL: Función EXCLUSIVA para navegación móvil en MobileView.tsx
        // PORQUÉ DE LA DECISIÓN: Se eliminó la auto-detección inteligente que causaba bugs de navegación
        // donde algunas categorías saltaban directamente a productos sin mostrar secciones
        // PROBLEMA RESUELTO: Antes usaba getCategoryDisplayMode() que clasificaba incorrectamente categorías
        // CONEXIONES CRÍTICAS:
        // - MobileView.tsx línea ~75: handleCategorySelectWithAutoDetection → handleCategorySelect
        // - CategoryList.tsx: onCategoryClick prop que recibe esta función
        // - Historial: Se conecta con handleBack() para navegación coherente
        // FLUJO GARANTIZADO: categories → sections → products (sin saltos)
        // ARQUITECTURA: Mantiene separación clara entre navegación móvil/escritorio

        // Guardar estado actual en historial para navegación coherente con handleBack()
        set(state => ({
            activeCategoryId: id,
            history: [...state.history, { view: state.activeView, id: state.activeCategoryId }]
        }));

        // DECISIÓN: Siempre cargar secciones y ir a vista sections (navegación tradicional)
        get().fetchSectionsByCategory(id);
        set({ activeView: 'sections' });
    },
    handleSectionSelect: (id) => {
        // 🧭 MIGA DE PAN CONTEXTUAL: Navegación de secciones a productos en vista móvil
        // CONEXIONES: MobileView.tsx → SectionListView.tsx → onSectionClick → handleSectionSelect
        // PORQUÉ: Guarda el estado en historial para que handleBack() funcione correctamente
        // FLUJO: sections view → products view + carga productos de la sección específica
        set(state => ({
            activeView: 'products',
            activeSectionId: id,
            history: [...state.history, { view: state.activeView, id: state.activeSectionId }]
        }));
        get().fetchProductsBySection(id);
    },
    handleBack: () => set(state => {
        // 🧭 MIGA DE PAN CONTEXTUAL: Navegación hacia atrás en vista móvil
        // PROBLEMA IDENTIFICADO: Lógica de navegación incorrecta causaba "página vacía"
        // FLUJO CORRECTO: products → sections → categories
        // CONEXIONES: MobileView.tsx línea ~240 en botón ArrowLeftIcon onClick

        // Si estamos en products, ir a sections (mantener categoría activa)
        if (state.activeView === 'products') {
            return {
                ...state,
                activeView: 'sections',
                activeSectionId: null // Limpiar sección pero mantener categoría
            };
        }

        // Si estamos en sections, ir a categories (limpiar todo)
        if (state.activeView === 'sections') {
            return {
                ...state,
                activeView: 'categories',
                activeCategoryId: null,
                activeSectionId: null
            };
        }

        // Si estamos en categories, no hacer nada (ya estamos en el nivel superior)
        return state;
    }),

}));

// --- FUNCIONES HELPER PARA AUTO-DETECCIÓN ---

/**
 * 🔍 Hook para obtener el modo de visualización de una categoría
 * 
 * @param categoryId - ID de la categoría
 * @returns 'simple' | 'sections' | 'loading' | 'error'
 * 
 * 🧭 MIGA DE PAN: Esta función helper se conecta con:
 * - CategoryGridView.tsx para renderizar UI condicional
 * - MobileView.tsx para adaptar navegación
 * - DashboardView.tsx para mostrar diferentes vistas
 */
export const useCategoryDisplayMode = (categoryId: number | null) => {
    const sections = useDashboardStore(state =>
        categoryId ? state.sections[categoryId] : undefined
    );
    const isLoading = useDashboardStore(state => state.isLoading);
    const error = useDashboardStore(state => state.error);

    if (error) return 'error';
    if (isLoading || !sections) return 'loading';

    return getCategoryDisplayMode(sections);
};

/**
 * 🔍 Hook para obtener productos de una categoría (tanto simple como compleja)
 * 
 * @param categoryId - ID de la categoría
 * @returns productos según el modo de la categoría
 * 
 * 🧭 MIGA DE PAN: Esta función helper unifica el acceso a productos:
 * - Para categorías simples: obtiene de products[`cat-${categoryId}`]
 * - Para categorías complejas: requiere sectionId adicional
 * - Se conecta con ProductGridView.tsx y listas de productos
 */
export const useCategoryProducts = (categoryId: number | null, sectionId?: number | null) => {
    const products = useDashboardStore(state => state.products);
    const displayMode = useCategoryDisplayMode(categoryId);

    if (!categoryId) return [];

    // Para categorías simples, usar la key especial
    if (displayMode === 'simple') {
        return products[`cat-${categoryId}`] || [];
    }

    // Para categorías complejas, usar sectionId tradicional
    if (displayMode === 'sections' && sectionId) {
        return products[sectionId] || [];
    }

    return [];
};

// --- 🎯 T31.5 FASE 2: COMPUTED VALUES REACTIVOS (CONTADORES HÍBRIDOS) ---

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Hook para contadores híbridos inteligentes de categorías
 * 
 * PORQUÉ CRÍTICO: Implementa el patrón de v0.dev para mostrar "Comidas (3 secciones, 2 directos)"
 * PROBLEMA RESUELTO: Antes solo mostraba contadores de secciones, ahora muestra información completa
 * 
 * ARQUITECTURA REACTIVA: Usa selectores derivados que se actualizan automáticamente cuando:
 * - Se crean/eliminan secciones en la categoría
 * - Se crean/eliminan productos directos en la categoría  
 * - Se cambia la visibilidad de secciones/productos
 * 
 * CONEXIONES CRÍTICAS:
 * - CategoryGridView.tsx: Renderizará estos contadores en lugar de solo secciones
 * - dashboardStore.sections[categoryId]: Fuente de datos para secciones
 * - dashboardStore.products[`cat-${categoryId}`]: Fuente de datos para productos directos
 * - getCategoryDisplayMode(): Determina si mostrar contadores híbridos o tradicionales
 * 
 * PATRÓN v0.dev: Computed values que se recalculan automáticamente sin re-renders innecesarios
 * OPTIMIZACIÓN: useMemo interno evita recálculos cuando los datos no cambian
 * 
 * @param categoryId - ID de la categoría para calcular contadores
 * @returns Objeto con contadores detallados y modo de visualización
 */
export const useCategoryWithCounts = (categoryId: number | null) => {
    const sections = useDashboardStore(state => 
        categoryId ? state.sections[categoryId] : undefined
    );
    const directProducts = useDashboardStore(state => 
        categoryId ? state.products[`cat-${categoryId}`] : undefined
    );
    const isLoading = useDashboardStore(state => state.isLoading);

    return React.useMemo(() => {
        if (!categoryId || isLoading) {
            return {
                displayMode: 'loading' as const,
                sectionsCount: 0,
                visibleSectionsCount: 0,
                directProductsCount: 0,
                visibleDirectProductsCount: 0,
                totalProductsCount: 0,
                visibleProductsCount: 0,
                displayText: 'Cargando...'
            };
        }

        // 🧭 MIGA DE PAN: Cálculos de secciones (jerarquía tradicional)
        const sectionsArray = sections || [];
        const sectionsCount = sectionsArray.length;
        const visibleSectionsCount = sectionsArray.filter(s => s.status === 1).length;

        // 🧭 MIGA DE PAN: Cálculos de productos directos (T31 - jerarquía híbrida)
        const directProductsArray = directProducts || [];
        const directProductsCount = directProductsArray.length;
        const visibleDirectProductsCount = directProductsArray.filter(p => p.status === 1).length;

        // 🧭 MIGA DE PAN: Determinar modo de visualización usando lógica existente
        const displayMode = getCategoryDisplayMode(sectionsArray);

        // 🧭 MIGA DE PAN: Calcular totales híbridos (secciones + productos directos)
        // CONEXIÓN: Estos totales se mostrarán en CategoryGridView como información contextual
        const totalProductsCount = sectionsArray.reduce((acc, section) => 
            acc + (section.products_count || 0), 0
        ) + directProductsCount;

        const visibleProductsCount = sectionsArray.reduce((acc, section) => 
            acc + (section.visible_products_count || 0), 0
        ) + visibleDirectProductsCount;

        // 🧭 MIGA DE PAN: Generar texto descriptivo inteligente según el modo
        // PATRÓN v0.dev: Texto contextual que ayuda al usuario a entender la estructura
        let displayText = '';
        
        if (displayMode === 'simple' && directProductsCount > 0) {
            // Categoría simple con productos directos: "5 productos directos"
            displayText = `${directProductsCount} producto${directProductsCount !== 1 ? 's' : ''} directo${directProductsCount !== 1 ? 's' : ''}`;
        } else if (displayMode === 'sections' && sectionsCount > 0) {
            if (directProductsCount > 0) {
                // Categoría híbrida: "3 secciones, 2 directos"
                displayText = `${sectionsCount} sección${sectionsCount !== 1 ? 'es' : ''}, ${directProductsCount} directo${directProductsCount !== 1 ? 's' : ''}`;
            } else {
                // Categoría tradicional: "3 secciones"
                displayText = `${sectionsCount} sección${sectionsCount !== 1 ? 'es' : ''}`;
            }
        } else {
            // Categoría vacía
            displayText = 'Sin contenido';
        }

        return {
            displayMode,
            sectionsCount,
            visibleSectionsCount,
            directProductsCount,
            visibleDirectProductsCount,
            totalProductsCount,
            visibleProductsCount,
            displayText
        };
    }, [categoryId, sections, directProducts, isLoading]);
};

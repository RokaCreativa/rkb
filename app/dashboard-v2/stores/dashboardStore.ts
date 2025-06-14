/**
 * @fileoverview dashboardStore.ts - Store centralizado de Zustand para el estado del dashboard.
 * @description Este store es la única fuente de verdad para el dashboard.
 * Se ha restaurado su estado completo para dar servicio tanto a la vista móvil como a la de escritorio,
 * y se ha corregido la lógica CRUD para que sea robusta y segura en tipos.
 */
import { create } from 'zustand';
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
        // 🧭 MIGA DE PAN: Esta función carga productos directamente desde una categoría
        // para categorías "simples" (que tienen 1 sola sección). Se conecta con:
        // - getCategoryDisplayMode() para auto-detectar si la categoría es simple
        // - CategoryGridView.tsx cuando renderiza productos directos 
        // - MobileView.tsx para navegación directa categoría → productos
        //
        // 💡 Diferencia clave con fetchProductsBySection:
        // - fetchProductsBySection: usa section_id (jerarquía completa)
        // - fetchProductsByCategory: usa category_id (jerarquía simplificada)
        set({ isLoading: true });
        try {
            const res = await fetch(`/api/products?category_id=${categoryId}`);
            if (!res.ok) throw new Error('Error al cargar productos');
            const productsData = await res.json();
            // Usamos categoryId como key en lugar de sectionId para diferenciarlo
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
        // 🧭 MIGA DE PAN: Esta función elimina categorías usando el endpoint DELETE.
        // Se conecta con DeleteConfirmationModal.tsx que es invocado desde ambas vistas.
        // Al eliminar una categoría, también se resetea la selección en escritorio.
        const toastId = `delete-category-${id}`;
        set({ isUpdating: true });
        toast.loading('Eliminando categoría...', { id: toastId });
        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al eliminar categoría');
            }

            toast.success('Categoría eliminada', { id: toastId });

            // Resetear selecciones si se eliminó la categoría activa
            const state = get();
            if (state.selectedCategoryId === id) {
                set({ selectedCategoryId: null, selectedSectionId: null });
            }
            if (state.activeCategoryId === id) {
                set({ activeView: 'categories', activeCategoryId: null, activeSectionId: null, history: [] });
            }

            // Recargar categorías
            const clientId = get().client?.id;
            if (clientId) await get().fetchCategories(clientId);
        } catch (e) {
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
        // 🧭 MIGA DE PAN: Elimina secciones usando DELETE en endpoint específico por ID.
        // Se conecta con DeleteConfirmationModal.tsx desde ambas vistas.
        // Al eliminar una sección, resetea la selección si era la sección activa.
        const toastId = `delete-section-${id}`;
        set({ isUpdating: true });
        toast.loading('Eliminando sección...', { id: toastId });
        try {
            const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al eliminar sección');
            }

            toast.success('Sección eliminada', { id: toastId });

            // Resetear selecciones si se eliminó la sección activa
            const state = get();
            if (state.selectedSectionId === id) {
                set({ selectedSectionId: null });
            }
            if (state.activeSectionId === id) {
                set({ activeView: 'sections', activeSectionId: null });
            }

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
    // CASOS DE USO: Categorías simples como "BEBIDAS" → "Coca Cola" (sin sección)
    createProductDirect: async (categoryId: number, data: Partial<Product>, imageFile?: File | null) => {
        const toastId = 'crud-product-direct';
        set({ isUpdating: true });
        toast.loading('Creando producto directo...', { id: toastId });
        try {
            const formData = new FormData();

            // 🎯 T31: MODO DIRECTO - Enviar category_id en lugar de sections
            // PORQUÉ: La API modificada detecta category_id sin sections para crear producto directo
            // REGLA DE NEGOCIO: category_id y sections son mutuamente excluyentes
            formData.append('category_id', String(categoryId));

            // Añadir todos los campos del producto
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && key !== 'section_id' && key !== 'category_id') {
                    formData.append(key, String(value));
                }
            });

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const res = await fetch('/api/products', { method: 'POST', body: formData });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error);
            }

            const responseData = await res.json();
            toast.success('Producto directo creado', { id: toastId });

            // 🎯 T31: RECARGAR PRODUCTOS HÍBRIDOS - Tradicionales + Directos
            // PORQUÉ: La categoría ahora puede tener productos directos que deben mostrarse
            // CONEXIÓN: fetchProductsByCategory() usa la API modificada que obtiene productos híbridos
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
        // 🧭 MIGA DE PAN: Elimina productos usando DELETE en endpoint específico por ID.
        // Se conecta con DeleteConfirmationModal.tsx desde ambas vistas.
        // Al ser el nivel más profundo de la jerarquía, solo necesita recargar la lista de productos.
        const toastId = `delete-product-${id}`;
        set({ isUpdating: true });
        toast.loading('Eliminando producto...', { id: toastId });
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al eliminar producto');
            }

            toast.success('Producto eliminado', { id: toastId });

            // Recargar productos de la sección activa
            const { activeSectionId, selectedSectionId } = get();
            const targetSectionId = activeSectionId || selectedSectionId;
            if (targetSectionId) await get().fetchProductsBySection(targetSectionId);
        } catch (e) {
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

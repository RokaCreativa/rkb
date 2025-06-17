/**
 * 🧭 MIGA DE PAN CONTEXTUAL MAESTRA: El Cerebro de la Aplicación
 *
 * 📍 UBICACIÓN: app/dashboard-v2/stores/dashboardStore.ts
 *
 * 🎯 PORQUÉ EXISTE:
 * Este store de Zustand es la ÚNICA FUENTE DE VERDAD para el estado del dashboard. Su propósito
 * es centralizar toda la lógica de negocio, el estado de la UI y las interacciones con la API,
 * sirviendo tanto a la vista de escritorio como a la móvil. Elimina la necesidad de pasar props
 * anidadas (`prop drilling`) y asegura que toda la aplicación reaccione de manera consistente
 * a los cambios de estado.
 *
 * 🔄 FLUJO DE DATOS GENERAL:
 * 1. `DashboardClient.tsx` inicia la carga de datos llamando a `initializeDashboard()`.
 * 2. Las acciones del store (ej. `createCategory`) realizan una llamada a la API correspondiente.
 * 3. Tras una respuesta exitosa, la acción actualiza el estado del store (ej. añade la nueva categoría a `state.categories`).
 * 4. Cualquier componente suscrito a esa parte del estado (ej. `CategoryGridView`) se re-renderiza automáticamente con los nuevos datos.
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - CONSUMIDO POR: `DashboardView.tsx`, `MobileView.tsx`, `CategoryGridView.tsx`, `SectionGridView.tsx`, `ProductGridView.tsx`, `EditModals.tsx`, `useModalState.tsx`.
 * - LLAMA A: Todas las APIs en `/app/api/{entidad}`.
 *
 * 🚨 PROBLEMAS HISTÓRICOS RESUELTOS:
 * - **Bucles infinitos (React 19):** Causados por selectores que devolvían nuevos arrays/objetos. Solucionado usando `useMemo` en los componentes para derivar datos, en lugar de hacerlo en el selector. (Ver Bitácora #32)
 * - **UI no responsiva:** Versiones anteriores tenían funciones CRUD no implementadas o rotas aquí, causando que los clics en la UI no tuvieran efecto.
 * - **Inconsistencia de tipos:** Manejaba tipos `legacy` y `v2`. Ahora está 100% en tipos v2.
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - La selección de una categoría (`setSelectedCategoryId`) DEBE limpiar la selección de sección (`selectedSectionId = null`) para mantener la jerarquía.
 * - La lógica de `fetchDataForCategory` es crucial para la arquitectura híbrida, ya que carga tanto las secciones como los productos directos de una categoría.
 * - Toda modificación de datos (CRUD) DEBE pasar por este store. Los componentes no deben llamar a las APIs directamente.
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
    showcasedProducts: Record<number, Product[]>;
    isLoading: boolean;
    isClientLoading: boolean;
    isUpdating: boolean;
    error: string | null;
    initialDataLoaded: boolean;
    selectedCategoryId: number | null;
    selectedSectionId: number | null;
    selectedClientId: number | null;
    isReorderMode: boolean;
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
    updateProduct: (id: number, data: Partial<Product>, imageFile?: File | null, internal?: boolean) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    toggleProductVisibility: (id: number, status: boolean) => Promise<void>;
    setSelectedCategoryId: (id: number | null) => void;
    setSelectedSectionId: (id: number | null) => void;
    setSelectedClientId: (clientId: number | null) => void;
    toggleShowcaseStatus: (productId: number) => Promise<void>;
    toggleReorderMode: () => void;
}

// --- ESTADO INICIAL ---

const initialState: DashboardState = {
    client: null,
    categories: [],
    sections: {},
    products: {},
    showcasedProducts: {},
    isLoading: false,
    isClientLoading: true,
    isUpdating: false,
    error: null,
    initialDataLoaded: false,
    selectedCategoryId: null,
    selectedSectionId: null,
    selectedClientId: null,
    isReorderMode: false,
};

// --- CREACIÓN DEL STORE ---

export const useDashboardStore = create<DashboardState & DashboardActions>((set, get) => ({
    ...initialState,

    // =================================================================
    // 🧭 ACCIÓN: initializeDashboard
    // 🎯 PROPÓSITO: Carga inicial de datos esenciales para el dashboard.
    // 🔄 FLUJO:
    // 1. Establece el estado de carga y el ID del cliente.
    // 2. Llama a la API para obtener los datos del cliente (`/api/client`).
    // 3. Llama a `fetchCategories()` para poblar la lista inicial de categorías.
    // 4. 🚨 LÓGICA CRÍTICA: Busca la categoría virtual y carga secuencialmente sus secciones y productos.
    // ⚡️ LLAMADO DESDE: `DashboardClient.tsx` al montar el componente.
    //
    // 🚨 PROBLEMA HISTÓRICO RESUELTO ("El Bug de la Carga Inicial", Junio 2025):
    // La versión anterior de esta función SOLO llamaba a `fetchCategories`, pero no cargaba proactivamente
    // el contenido de la categoría virtual. Esto provocaba que los "Productos Globales" no aparecieran
    // hasta que el usuario realizaba una acción que disparaba una recarga.
    //
    // ✅ SOLUCIÓN: Se añadió el bloque de lógica proactiva que busca la categoría virtual y luego
    // utiliza `fetchSectionsByCategory` y `fetchProductsBySection` para poblar el estado con los
    // productos globales desde el principio. (Ver Bitácora #37).
    // =================================================================
    initializeDashboard: async (clientId: number) => {
        set({ isClientLoading: true, initialDataLoaded: false, selectedClientId: clientId });
        try {
            const clientRes = await fetch(`/api/client?id=${clientId}`);
            if (!clientRes.ok) throw new Error('Cliente no encontrado');
            const clientData = await clientRes.json();
            set({ client: clientData });

            // Carga las categorías primero, es el punto de partida
            await get().fetchCategories(clientId);

            // 🧠 Lógica Proactiva: Carga el contenido de la categoría virtual
            // ✅ CORRECCIÓN FINAL: La carga debe ser secuencial para obtener el ID de la sección virtual.
            // Esta lógica, extraída de la bitácora, es la que faltaba.
            const categories = get().categories;
            const virtualCategory = categories.find(c => c.is_virtual_category);
            if (virtualCategory) {
                // 1. Carga las secciones de la categoría virtual
                await get().fetchSectionsByCategory(virtualCategory.category_id);

                // 2. Obtén la sección virtual recién cargada del estado
                const virtualSections = get().sections[virtualCategory.category_id];
                const virtualSection = virtualSections?.[0];

                // 3. Si la encontramos, cargamos los productos de ESA sección
                if (virtualSection) {
                    await get().fetchProductsBySection(virtualSection.section_id);
                }
            }

        } catch (e: any) {
            set({ error: e.message });
        } finally {
            set({ isClientLoading: false, initialDataLoaded: true });
        }
    },

    // =================================================================
    // 🧭 ACCIÓN: fetchCategories
    // 🎯 PROPÓSITO: Obtener todas las categorías para un cliente específico.
    // 🔄 FLUJO:
    // 1. Llama a la API `/api/categories?client_id=...`.
    // 2. Reemplaza el array `categories` en el estado con los datos recibidos.
    // =================================================================
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

    // =================================================================
    // 🧭 ACCIÓN: fetchDataForCategory
    // 🎯 PROPÓSITO: Carga todos los datos necesarios cuando se selecciona una categoría.
    //    Es el corazón de la arquitectura HÍBRIDA.
    // 🔄 FLUJO:
    // 1. Obtiene las secciones de la categoría (`/api/sections?category_id=...`).
    // 2. Obtiene los productos directos de la categoría (`/api/products?category_id=...`).
    // 3. Obtiene los productos para cada sección normal (no virtual).
    // ⚡️ LLAMADO DESDE: `setSelectedCategoryId()` cuando se selecciona una nueva categoría.
    // =================================================================
    fetchDataForCategory: async (categoryId: number) => {
        set({ isLoading: true });
        try {
            // 1. Cargar secciones y productos directos en paralelo
            const [sectionsRes, productsRes] = await Promise.all([
                fetch(`/api/sections?category_id=${categoryId}`),
                fetch(`/api/products?category_id=${categoryId}`)
            ]);

            if (!sectionsRes.ok) throw new Error('Error al cargar secciones');
            if (!productsRes.ok) throw new Error('Error al cargar productos de categoría');

            const sectionsData: Section[] = await sectionsRes.json();
            const productsData: Product[] = await productsRes.json();

            set(state => ({
                sections: { ...state.sections, [categoryId]: sectionsData },
                products: { ...state.products, [`cat-${categoryId}`]: productsData }
            }));

            // 2. Cargar productos de las secciones normales
            const normalSections = sectionsData.filter(s => !s.is_virtual);
            if (normalSections.length > 0) {
                const productFetchPromises = normalSections.map(section =>
                    get().fetchProductsBySection(section.section_id)
                );
                await Promise.all(productFetchPromises);
            }
        } catch (e: any) {
            set({ error: e.message });
        } finally {
            set({ isLoading: false });
        }
    },

    // =================================================================
    // 🧭 ACCIÓN: fetchProductsBySection
    // 🎯 PROPÓSITO: Obtener todos los productos para una sección específica.
    // =================================================================
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

    // =================================================================
    // 🧭 ACCIÓN: fetchProductsByCategory (OBsoleto, la lógica ahora está en fetchDataForCategory)
    //    Se mantiene por si se necesita en algún otro lugar, pero el flujo principal usa fetchDataForCategory.
    // =================================================================
    fetchProductsByCategory: async (categoryId: number) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`/api/products?category_id=${categoryId}`);
            if (!res.ok) throw new Error('Error al cargar productos de categoría');
            const productsData = await res.json();
            set(state => ({ products: { ...state.products, [`cat-${categoryId}`]: productsData } }));
        } catch (e: any) {
            set({ error: e.message });
        } finally {
            set({ isLoading: false });
        }
    },

    // =================================================================
    // 🧭 SETTERS DE ESTADO DE UI
    // 🎯 PROPÓSITO: Controlar el estado de la selección en la UI.
    // ⚠️ REGLA CRÍTICA: Cambiar la categoría resetea la sección.
    // =================================================================
    setSelectedCategoryId: (id: number | null) => {
        set({ selectedCategoryId: id, selectedSectionId: null });
        if (id !== null) {
            get().fetchDataForCategory(id);
        }
    },
    setSelectedSectionId: (id: number | null) => {
        set({ selectedSectionId: id });
    },
    setSelectedClientId: (clientId) => set({ selectedClientId: clientId }),

    toggleReorderMode: () => set(state => ({ isReorderMode: !state.isReorderMode })),

    // =================================================================
    // 🧭 ACCIONES CRUD (Crear, Actualizar, Eliminar, Visibilidad)
    // 🎯 PROPÓSITO: Centralizar toda la modificación de datos.
    // 🔄 FLUJO GENERAL CRUD:
    // 1. `set({ isUpdating: true })`.
    // 2. Si hay imagen, se sube primero a `/api/upload`.
    // 3. Se hace la llamada a la API (POST, PUT, DELETE).
    // 4. Si la API responde OK, se actualiza el estado local de Zustand para reflejar el cambio INMEDIATAMENTE.
    // 5. Se muestra un toast de éxito/error.
    // 6. `set({ isUpdating: false })`.
    // =================================================================

    createCategory: async (data, imageFile) => {
        set({ isUpdating: true });
        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('entityType', 'categories');
                const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
                const uploadData = await uploadResponse.json();
                if (!uploadResponse.ok) throw new Error(uploadData.error);
                data.image = uploadData.filePath;
            }

            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Error al crear la categoría');

            const newCategory = await response.json();
            set(state => ({ categories: [...state.categories, newCategory] }));
            toast.success('Categoría creada');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            set({ isUpdating: false });
        }
    },
    updateCategory: async (id, data, imageFile) => {
        set({ isUpdating: true });
        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('entityType', 'categories');
                const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
                const uploadData = await uploadResponse.json();
                if (!uploadResponse.ok) throw new Error(uploadData.error);
                data.image = uploadData.filePath;
            }

            const response = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Error al actualizar la categoría');
            const updatedCategory: Category = await response.json();
            set(state => ({
                categories: state.categories.map(c => c.category_id === id ? { ...c, ...updatedCategory } : c),
            }));
            toast.success('Categoría actualizada');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            set({ isUpdating: false });
        }
    },
    deleteCategory: async (id) => {
        const original = get().categories;
        set(state => ({ categories: state.categories.filter(c => c.category_id !== id) }));
        try {
            await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            toast.success('Categoría eliminada');
        } catch (error) {
            toast.error('No se pudo eliminar.');
            set({ categories: original });
        }
    },

    createSection: async (data, imageFile) => {
        set({ isUpdating: true });
        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('entityType', 'sections');
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const d = await res.json();
                if (!res.ok) throw new Error(d.error);
                data.image = d.filePath;
            }
            const response = await fetch('/api/sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al crear la sección');
            const newSection = await response.json();
            set(state => {
                const catId = newSection.category_id;
                const newSections = { ...state.sections };
                newSections[catId] = [...(newSections[catId] || []), newSection];
                return { sections: newSections };
            });
            toast.success('Sección creada');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            set({ isUpdating: false });
        }
    },
    updateSection: async (id, data, imageFile) => {
        set({ isUpdating: true });
        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('entityType', 'sections');
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const d = await res.json();
                if (!res.ok) throw new Error(d.error);
                data.image = d.filePath;
            }
            const response = await fetch(`/api/sections/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Error al actualizar');
            const updated: Section = await response.json();
            set(state => {
                const catId = updated.category_id;
                if (!catId || !state.sections[catId]) return state;
                const newSections = { ...state.sections };
                newSections[catId] = newSections[catId].map(s => s.section_id === id ? { ...s, ...updated } : s);
                return { sections: newSections };
            });
            toast.success('Sección actualizada');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            set({ isUpdating: false });
        }
    },
    deleteSection: async (id) => {
        const original = get().sections;
        let catId: number | null = null;
        for (const cId in original) {
            if (original[cId].some(s => s.section_id === id)) {
                catId = Number(cId);
                break;
            }
        }
        if (catId) {
            const finalCatId = catId;
            set(state => {
                const newSections = { ...state.sections };
                newSections[finalCatId] = newSections[finalCatId].filter(s => s.section_id !== id);
                return { sections: newSections };
            });
        }
        try {
            await fetch(`/api/sections/${id}`, { method: 'DELETE' });
            toast.success('Sección eliminada');
        } catch (error) {
            toast.error('No se pudo eliminar');
            set({ sections: original });
        }
    },

    createProduct: async (data, imageFile) => {
        set({ isUpdating: true });
        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('entityType', 'products');
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const d = await res.json();
                if (!res.ok) throw new Error(d.error);
                data.image = d.filePath;
            }
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al crear el producto');
            const newProduct: Product = await response.json();
            set(state => {
                const key = newProduct.section_id ? String(newProduct.section_id) : `cat-${newProduct.category_id}`;
                const newProducts = { ...state.products };
                newProducts[key] = [...(newProducts[key] || []), newProduct];
                return { products: newProducts };
            });
            toast.success('Producto creado');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            set({ isUpdating: false });
        }
    },
    updateProduct: async (id, data, imageFile) => {
        set({ isUpdating: true });
        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('entityType', 'products');
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const d = await res.json();
                if (!res.ok) throw new Error(d.error);
                data.image = d.filePath;
            }
            const response = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Error al actualizar');
            const updated: Product = await response.json();
            set(state => {
                const key = updated.section_id ? String(updated.section_id) : `cat-${updated.category_id}`;
                const newProducts = { ...state.products };
                if (newProducts[key]) {
                    newProducts[key] = newProducts[key].map(p => p.product_id === id ? { ...p, ...updated } : p);
                }
                return { products: newProducts };
            });
            toast.success('Producto actualizado');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            set({ isUpdating: false });
        }
    },
    deleteProduct: async (id) => {
        const original = get().products;
        set(state => {
            const newProducts = { ...state.products };
            for (const key in newProducts) {
                newProducts[key] = newProducts[key].filter(p => p.product_id !== id);
            }
            return { products: newProducts };
        });
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            toast.success('Producto eliminado');
        } catch (error) {
            toast.error('No se pudo eliminar');
            set({ products: original });
        }
    },

    toggleShowcaseStatus: async (productId: number) => {
        const productsState = get().products;
        let originalProduct: Product | undefined;
        let productKey: string | undefined;

        // --- Optimistic Update ---
        const newProducts = { ...productsState };
        for (const key in newProducts) {
            const productIndex = newProducts[key].findIndex(p => p.product_id === productId);
            if (productIndex !== -1) {
                originalProduct = { ...newProducts[key][productIndex] };
                productKey = key;
                newProducts[key][productIndex] = { ...originalProduct, is_showcased: !originalProduct.is_showcased };
                break;
            }
        }

        if (!originalProduct || !productKey) {
            toast.error("No se pudo encontrar el producto para actualizar.");
            return;
        }

        set({ products: newProducts });

        try {
            const response = await fetch(`/api/products/${productId}/toggle-showcase`, {
                method: 'PATCH',
            });
            if (!response.ok) throw new Error('Error en el servidor');

            const updatedProductFromServer: Product = await response.json();
            set(state => {
                const finalProducts = { ...state.products };
                if (finalProducts[productKey!]) {
                    const idx = finalProducts[productKey!].findIndex(p => p.product_id === productId);
                    if (idx !== -1) {
                        finalProducts[productKey!][idx] = updatedProductFromServer;
                    }
                }
                return { products: finalProducts };
            });

        } catch (error) {
            toast.error("No se pudo destacar el producto.");
            set({ products: productsState }); // Revert on failure
        }
    },

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
    toggleSectionVisibility: async (id, status) => {
        const originalSections = get().sections;
        set(state => ({
            sections: {
                ...state.sections,
                [state.selectedCategoryId!]: state.sections[state.selectedCategoryId!].map(s => s.section_id === id ? { ...s, status } : s)
            },
        }));
        try {
            await fetch(`/api/sections/${id}/visibility`, {
                method: 'PATCH',
                body: JSON.stringify({ status: status ? 1 : 0 }),
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            toast.error("Error al cambiar visibilidad");
            set({ sections: originalSections });
        }
    },
    toggleProductVisibility: async (id, status) => {
        const originalProducts = get().products;
        set(state => ({
            products: {
                ...state.products,
                [state.selectedSectionId ? String(state.selectedSectionId) : `cat-${state.selectedCategoryId}`]: state.products[state.selectedSectionId ? String(state.selectedSectionId) : `cat-${state.selectedCategoryId}`].map(p => p.product_id === id ? { ...p, status } : p)
            },
        }));
        try {
            await fetch(`/api/products/${id}/visibility`, {
                method: 'PATCH',
                body: JSON.stringify({ status: status ? 1 : 0 }),
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            toast.error("Error al cambiar visibilidad");
            set({ products: originalProducts });
        }
    },
}));
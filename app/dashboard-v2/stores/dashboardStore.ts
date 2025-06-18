/**
 * =================================================================================
 * 📖 MANDAMIENTO #7: SEPARACIÓN ABSOLUTA DE LÓGICA Y PRESENTACIÓN
 * ---------------------------------------------------------------------------------
 * Este store es el "cerebro" de la lógica de negocio. No contiene lógica de
 * presentación. Sus funciones son llamadas por hooks o componentes, pero no
 * sabe ni le importa cómo se ve la UI.
 * =================================================================================
 */
import { create } from "zustand"
import type { Category, Section, Product, Client } from "../types"
import { toast } from "react-hot-toast"
import { immer } from "zustand/middleware/immer"
import { apiClient } from '../services/apiClient'

// --- INTERFACES Y ESTADO INICIAL (sin cambios) ---
export interface DashboardState {
    client: Client | null
    categories: Category[]
    sections: Record<string, Section[]>
    products: Record<string, Product[]>
    showcasedProducts: Record<number, Product[]>
    isLoading: boolean
    isClientLoading: boolean
    isUpdating: boolean
    error: string | null
    initialDataLoaded: boolean
    selectedCategoryId: number | null
    selectedSectionId: number | null
    selectedClientId: number | null
    isReorderMode: boolean
}

export interface DashboardActions {
    initializeDashboard: (clientId: number) => Promise<void>
    fetchCategories: (clientId: number) => Promise<void>
    fetchSectionsByCategory: (categoryId: number) => Promise<void>
    fetchProductsBySection: (sectionId: number) => Promise<void>
    fetchProductsByCategory: (categoryId: number) => Promise<void>
    fetchDataForCategory: (categoryId: number) => Promise<void>
    createCategory: (data: Partial<Category>, imageFile?: File | null) => Promise<void>
    updateCategory: (id: number, data: Partial<Category>, imageFile?: File | null) => Promise<void>
    deleteCategory: (id: number) => Promise<void>
    toggleCategoryVisibility: (id: number, status: boolean) => Promise<void>
    createSection: (data: Partial<Section>, imageFile?: File | null) => Promise<void>
    updateSection: (id: number, data: Partial<Section>, imageFile?: File | null) => Promise<void>
    deleteSection: (id: number) => Promise<void>
    toggleSectionVisibility: (id: number, status: boolean) => Promise<void>
    createProduct: (data: Partial<Product>, imageFile?: File | null) => Promise<Product | undefined>
    updateProduct: (id: number, data: Partial<Product>, imageFile?: File | null) => Promise<void>
    deleteProduct: (id: number) => Promise<void>
    toggleProductVisibility: (id: number, status: boolean) => Promise<void>
    setSelectedCategoryId: (id: number | null) => Promise<void>
    setSelectedSectionId: (id: number | null) => void
    setSelectedClientId: (clientId: number | null) => void
    toggleShowcaseStatus: (productId: number) => Promise<void>
    toggleReorderMode: () => void
    uploadProductImage: (productId: number, imageFile: File) => Promise<string>
}

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
}

export const useDashboardStore = create(
    immer<DashboardState & DashboardActions>((set, get) => ({
        ...initialState,

        /**
         * 🧭 MIGA DE PAN CONTEXTUAL: Carga Inicial Proactiva del Dashboard
         *
         * 📍 UBICACIÓN: app/dashboard-v2/stores/dashboardStore.ts → initializeDashboard()
         *
         * 🎯 PORQUÉ EXISTE:
         * Para cargar todos los datos esenciales cuando el dashboard se monta por primera vez. Su misión
         * más crítica es resolver la arquitectura anidada de los "Productos Directos Globales" para
         * que la UI no se muestre vacía o incompleta al inicio.
         *
         * 🔄 FLUJO DE DATOS:
         * 1. `DashboardClient.tsx` invoca esta función con el `clientId`.
         * 2. Carga la información básica del cliente.
         * 3. Carga el listado COMPLETO de categorías (`fetchCategories`).
         * 4. 🧠 LÓGICA CRÍTICA: Busca la `virtualCategory` en el estado recién cargado.
         * 5. Si existe, invoca `fetchSectionsByCategory` para cargar las secciones de esa categoría virtual.
         * 6. En el estado recién actualizado, busca la `virtualSection` dentro de la `virtualCategory`.
         * 7. Si existe, invoca `fetchProductsBySection` para cargar los productos de esa sección.
         * 8. Estos productos son los "Productos Directos Globales".
         *
         * 🚨 PROBLEMA RESUELTO (Bitácora #37 y #38):
         * - Soluciona el bug donde los "Productos Globales" no aparecían en la carga inicial.
         * - La implementación anterior era errónea: intentaba cargar los productos directamente
         *   desde la categoría virtual, ignorando la capa intermedia de la sección virtual.
         * - Esta carga secuencial y anidada es la implementación correcta de la "Arquitectura Híbrida Definitiva" (Bitácora #35).
         * - Fecha de resolución: 2025-06-18.
         *
         * ⚠️ REGLAS DE NEGOCIO:
         * - La carga de datos para la arquitectura híbrida DEBE ser secuencial para resolver las dependencias anidadas.
         *
         * 🔗 DEPENDENCIAS:
         * - REQUIERE: `fetchCategories`, `fetchSectionsByCategory`, `fetchProductsBySection`.
         * - Se basa en que la API responda correctamente a cada uno de estos endpoints.
         *
         * 📖 MANDAMIENTOS RELACIONADOS:
         * - #1 (Contexto), #6 (Separación), #10 (Mejora Proactiva).
         */
        initializeDashboard: async (clientId: number) => {
            set({ isClientLoading: true, initialDataLoaded: false, selectedClientId: clientId });
            try {
                const clientRes = await fetch(`/api/client?id=${clientId}`);
                if (!clientRes.ok) throw new Error('Cliente no encontrado');
                const clientData = await clientRes.json();
                set({ client: clientData });

                // 1. Carga las categorías primero
                await get().fetchCategories(clientId);

                // 2. Lógica proactiva para cargar datos de la categoría virtual (según v0)
                const virtualCategory = get().categories.find(c => c.is_virtual_category);
                if (virtualCategory) {
                    // Carga las secciones de la categoría virtual
                    await get().fetchSectionsByCategory(virtualCategory.category_id);

                    // Encuentra la sección virtual dentro de la categoría virtual
                    const virtualSections = get().sections[virtualCategory.category_id] || [];
                    const virtualSection = virtualSections.find(s => s.is_virtual);

                    if (virtualSection) {
                        // Carga los productos de esa sección virtual (estos son los globales)
                        await get().fetchProductsBySection(virtualSection.section_id);
                    }
                }

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

        fetchDataForCategory: async (categoryId: number) => {
            set({ isLoading: true });
            try {
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
                const normalSections = sectionsData.filter(s => !s.is_virtual);
                if (normalSections.length > 0) {
                    await Promise.all(normalSections.map(section => get().fetchProductsBySection(section.section_id)));
                }
            } catch (e: any) {
                set({ error: e.message });
            } finally {
                set({ isLoading: false });
            }
        },

        createCategory: async (data, imageFile) => {
            set({ isUpdating: true });
            try {
                const newCategory = await apiClient<Category>('/api/categories', {
                    method: 'POST',
                    data,
                    imageFile
                });
                set(state => ({ categories: [...state.categories, newCategory] }));
                toast.success('Categoría creada');
            } catch (e: any) {
                toast.error(`Error al crear categoría: ${e.message}`);
            } finally {
                set({ isUpdating: false });
            }
        },

        updateCategory: async (id, data, imageFile) => {
            set({ isUpdating: true });
            try {
                const updatedCategory = await apiClient<Category>(`/api/categories/${id}`, {
                    method: 'PATCH',
                    data,
                    imageFile
                });
                set(state => {
                    const index = state.categories.findIndex(c => c.category_id === id);
                    if (index !== -1) {
                        state.categories[index] = { ...state.categories[index], ...updatedCategory };
                    }
                });
                toast.success('Categoría actualizada');
            } catch (e: any) {
                toast.error(`Error al actualizar categoría: ${e.message}`);
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

        toggleCategoryVisibility: async (id, status) => {
            try {
                await fetch(`/api/categories/${id}/visibility`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: status }),
                    headers: { 'Content-Type': 'application/json' },
                });
                set(state => ({
                    categories: state.categories.map(c => c.category_id === id ? { ...c, status } : c)
                }));
            } catch (error) {
                toast.error("Error al cambiar visibilidad");
            }
        },

        createSection: async (data, imageFile) => {
            set({ isUpdating: true });
            try {
                const newSection = await apiClient<Section>('/api/sections', {
                    method: 'POST',
                    data,
                    imageFile
                });
                const categoryId = newSection.category_id;
                if (categoryId) {
                    set(state => ({
                        sections: {
                            ...state.sections,
                            [categoryId]: [...(state.sections[categoryId] || []), newSection]
                        }
                    }));
                }
                toast.success('Sección creada');
            } catch (e: any) {
                toast.error(`Error al crear sección: ${e.message}`);
            } finally {
                set({ isUpdating: false });
            }
        },

        updateSection: async (id, data, imageFile) => {
            set({ isUpdating: true });
            try {
                const updatedSection = await apiClient<Section>(`/api/sections/${id}`, {
                    method: 'PATCH',
                    data,
                    imageFile
                });
                set(state => {
                    if (updatedSection.category_id) {
                        const sections = state.sections[updatedSection.category_id];
                        if (sections) {
                            const index = sections.findIndex(s => s.section_id === id);
                            if (index !== -1) {
                                sections[index] = { ...sections[index], ...updatedSection };
                            }
                        }
                    }
                });
                toast.success('Sección actualizada');
            } catch (e: any) {
                toast.error(`Error al actualizar sección: ${e.message}`);
            } finally {
                set({ isUpdating: false });
            }
        },

        deleteSection: async (id) => {
            const original = { ...get().sections };
            try {
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
                        state.sections[finalCatId] = state.sections[finalCatId].filter(s => s.section_id !== id);
                    });
                }
                await fetch(`/api/sections/${id}`, { method: 'DELETE' });
                toast.success('Sección eliminada');
            } catch (error) {
                toast.error('No se pudo eliminar');
                set({ sections: original });
            }
        },

        toggleSectionVisibility: async (id, status) => {
            try {
                await fetch(`/api/sections/${id}/visibility`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: status }),
                    headers: { 'Content-Type': 'application/json' },
                });
                set(state => {
                    const catId = state.selectedCategoryId;
                    if (!catId || !state.sections[catId]) return;
                    const sectionIndex = state.sections[catId].findIndex(s => s.section_id === id);
                    if (sectionIndex !== -1) state.sections[catId][sectionIndex].status = status;
                });
            } catch (error) {
                toast.error("Error al cambiar visibilidad");
            }
        },

        /**
         * 🧭 MIGA DE PAN CONTEXTUAL: Cambio de visibilidad de un producto
         *
         * 🎯 PORQUÉ EXISTE:
         * Para manejar el cambio de estado de visibilidad de cualquier producto.
         *
         * 🔄 FLUJO DE DATOS:
         * 1. Un `ActionIcon` en la UI (en un `GenericRow`) llama a esta función.
         * 2. Llama al endpoint de API dedicado (`/api/products/[id]/visibility`) enviando un booleano.
         * 3. Si la API responde con éxito, actualiza el estado local en Zustand.
         *
         * 🚨 PROBLEMA RESUELTO:
         * - La lógica de actualización de estado (`set`) anterior era frágil. Solo buscaba el producto en
         *   la lista "activa", fallando para productos directos globales.
         * - **SOLUCIÓN:** La nueva lógica itera sobre TODAS las listas de productos conocidas en `state.products`,
         *   asegurando que encontrará y actualizará el producto sin importar dónde se encuentre. Esto la hace
         *   mucho más robusta y compatible con la arquitectura híbrida.
         */
        toggleProductVisibility: async (id, status) => {
            try {
                await fetch(`/api/products/${id}/visibility`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: status }),
                    headers: { 'Content-Type': 'application/json' },
                });
                set(state => {
                    // Lógica de búsqueda mejorada: itera sobre todas las listas de productos.
                    for (const key in state.products) {
                        const productList = state.products[key];
                        const productIndex = productList.findIndex(p => p.product_id === id);

                        if (productIndex !== -1) {
                            // Producto encontrado, actualiza su estado y termina el bucle.
                            productList[productIndex].status = status;
                            break;
                        }
                    }
                });
            } catch (error) {
                toast.error("Error al cambiar visibilidad");
            }
        },

        setSelectedCategoryId: async (id: number | null) => {
            // Si se selecciona una categoría, resetea la sección seleccionada.
            set({ selectedCategoryId: id, selectedSectionId: null });

            // Si el ID no es nulo, busca los datos de esa categoría.
            if (id) {
                await get().fetchDataForCategory(id);
            }
        },

        setSelectedSectionId: (id: number | null) => {
            set({ selectedSectionId: id });
        },

        setSelectedClientId: (clientId) => set({ selectedClientId: clientId }),
        toggleReorderMode: () => set(state => ({ isReorderMode: !state.isReorderMode })),

        toggleShowcaseStatus: async (productId: number) => {
            try {
                const response = await fetch(`/api/products/${productId}/toggle-showcase`, { method: 'PATCH' });
                if (!response.ok) throw new Error('Error en el servidor');
                const updatedProduct: Product = await response.json();
                set(state => {
                    for (const key in state.products) {
                        const productIndex = state.products[key].findIndex(p => p.product_id === productId);
                        if (productIndex !== -1) {
                            state.products[key][productIndex] = updatedProduct;
                            break;
                        }
                    }
                });
            } catch (error) {
                toast.error("No se pudo destacar el producto.");
            }
        },

        deleteProduct: async (id) => {
            const original = { ...get().products };
            try {
                await fetch(`/api/products/${id}`, { method: 'DELETE' });
                set(state => {
                    for (const key in state.products) {
                        state.products[key] = state.products[key].filter(p => p.product_id !== id);
                    }
                });
                toast.success('Producto eliminado');
            } catch (error) {
                toast.error('No se pudo eliminar');
                set({ products: original });
            }
        },

        createProduct: async (data, imageFile) => {
            set({ isUpdating: true });
            try {
                const newProduct = await apiClient<Product>('/api/products', {
                    method: 'POST',
                    data,
                    imageFile
                });
                set(state => {
                    const key = newProduct.section_id ? String(newProduct.section_id) : `cat-${newProduct.category_id}`;
                    state.products[key] = [...(state.products[key] || []), newProduct];
                });
                toast.success('Producto creado');
                return newProduct;
            } catch (e: any) {
                toast.error(`Error al crear producto: ${e.message}`);
                return undefined;
            } finally {
                set({ isUpdating: false });
            }
        },

        updateProduct: async (id, data, imageFile) => {
            set({ isUpdating: true });
            try {
                const updatedProduct = await apiClient<Product>(`/api/products/${id}`, {
                    method: 'PATCH',
                    data,
                    imageFile
                });
                set(state => {
                    const key = updatedProduct.section_id
                        ? String(updatedProduct.section_id)
                        : `cat-${updatedProduct.category_id}`;

                    const productList = state.products[key];
                    if (productList) {
                        const index = productList.findIndex(p => p.product_id === id);
                        if (index !== -1) {
                            productList[index] = { ...productList[index], ...updatedProduct };
                        }
                    }
                });
                toast.success('Producto actualizado');
            } catch (e: any) {
                toast.error(`Error al actualizar producto: ${e.message}`);
            } finally {
                set({ isUpdating: false });
            }
        },

        uploadProductImage: async (productId: number, imageFile: File) => {
            const formData = new FormData()
            formData.append("file", imageFile)
            formData.append("entityType", "products")
            formData.append("entityId", String(productId))

            const res = await fetch("/api/upload", { method: "POST", body: formData })
            const d = await res.json()
            if (!res.ok) throw new Error(d.error || "Error al subir la imagen")
            return d.filePath
        },
    })),
)

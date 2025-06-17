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
    updateCategory: (id: number, data: Partial<Category>, imageFile?: File | null, internal?: boolean) => Promise<void>
    deleteCategory: (id: number) => Promise<void>
    toggleCategoryVisibility: (id: number, status: boolean) => Promise<void>
    createSection: (data: Partial<Section>, imageFile?: File | null) => Promise<void>
    updateSection: (id: number, data: Partial<Section>, imageFile?: File | null, internal?: boolean) => Promise<void>
    deleteSection: (id: number) => Promise<void>
    toggleSectionVisibility: (id: number, status: boolean) => Promise<void>
    createProduct: (data: Partial<Product>, imageFile?: File | null) => Promise<Product>
    updateProduct: (id: number, data: Partial<Product>, imageFile?: File | null) => Promise<Product>
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
                if (imageFile) {
                    data.image = await get().uploadProductImage(0, imageFile);
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
                    data.image = await get().uploadProductImage(id, imageFile);
                }
                const res = await fetch(`/api/categories/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (!res.ok) throw new Error('Error al actualizar');
                const updatedCategory = await res.json();
                set(state => ({
                    categories: state.categories.map(c => c.category_id === id ? { ...c, ...updatedCategory } : c)
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

        toggleCategoryVisibility: async (id, status) => {
            try {
                await fetch(`/api/categories/${id}/visibility`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: status ? 1 : 0 }),
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
                if (imageFile) {
                    data.image = await get().uploadProductImage(0, imageFile);
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
                    state.sections[catId] = [...(state.sections[catId] || []), newSection];
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
                    data.image = await get().uploadProductImage(id, imageFile);
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
                    if (!catId || !state.sections[catId]) return;
                    const sectionIndex = state.sections[catId].findIndex(s => s.section_id === id);
                    if (sectionIndex !== -1) state.sections[catId][sectionIndex] = updated;
                });
                toast.success('Sección actualizada');
            } catch (e: any) {
                toast.error(e.message);
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
                    body: JSON.stringify({ status: status ? 1 : 0 }),
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

        toggleProductVisibility: async (id, status) => {
            try {
                await fetch(`/api/products/${id}/visibility`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: status ? 1 : 0 }),
                    headers: { 'Content-Type': 'application/json' },
                });
                set(state => {
                    const key = state.selectedSectionId ? String(state.selectedSectionId) : `cat-${state.selectedCategoryId}`;
                    if (!state.products[key]) return;
                    const productIndex = state.products[key].findIndex(p => p.product_id === id);
                    if (productIndex !== -1) state.products[key][productIndex].status = status;
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
            set({ isUpdating: true })
            try {
                if (imageFile) {
                    const imageUrl = await get().uploadProductImage(0, imageFile)
                    data.image = imageUrl
                }
                const response = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                })
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || "Error al crear el producto")
                }
                const newProduct: Product = await response.json()
                set((state) => {
                    const key = newProduct.section_id ? String(newProduct.section_id) : `cat-${newProduct.category_id}`
                    state.products[key] = [...(state.products[key] || []), newProduct]
                })
                toast.success("Producto creado")
                return newProduct
            } catch (e: any) {
                toast.error(e.message)
                throw e
            } finally {
                set({ isUpdating: false })
            }
        },

        /**
         * 🧭 MIGA DE PAN CONTEXTUAL: Acción de Actualización de Producto (Refactorizada)
         *
         * 📍 UBICACIÓN: app/dashboard-v2/stores/dashboardStore.ts → updateProduct()
         *
         * 🎯 PORQUÉ EXISTE (REFACTORIZADO):
         * Para ser una función pura de lógica de negocio, agnóstica a la UI. Su única misión
         * es validar datos, llamar a la API, actualizar el estado de datos interno y reportar
         * el resultado de forma predecible.
         *
         * 🔄 FLUJO DE DATOS:
         * 1. `EditModal.handleSave()` invoca esta función.
         * 2. `updateProduct()` llama a `PATCH /api/products/[id]`.
         * 3. Tras una respuesta exitosa, actualiza `state.products` con el nuevo dato.
         * 4. Devuelve una `Promise<Product>` que se resuelve con el producto actualizado.
         * 5. Si la API falla, lanza un `Error` que es capturado por el `catch` del modal.
         *
         * 🚨 PROBLEMA RESUELTO:
         * - Se eliminó la referencia a `state.modalState.isSubmitting`, que era la causa
         *   del `TypeError` y una violación grave de la separación de responsabilidades.
         * - Fecha de resolución: 2025-06-18.
         *
         * ⚠️ REGLAS DE NEGOCIO:
         * - La función ahora devuelve una promesa, permitiendo al llamador (la UI) reaccionar
         *   al éxito o fracaso de la operación de forma asíncrona.
         * - Es responsabilidad de esta función manejar los `toast` de notificación al usuario.
         *
         * 📖 MANDAMIENTOS RELACIONADOS:
         * - #6 (Separación de Responsabilidades): Esta refactorización es un ejemplo clave.
         */
        updateProduct: async (id, data, imageFile) => {
            set({ isUpdating: true, error: null })

            try {
                const updatedProductData: Partial<Product> = { ...data }

                if (imageFile) {
                    const imageUrl = await get().uploadProductImage(id, imageFile)
                    updatedProductData.image = imageUrl
                }

                const response = await fetch(`/api/products/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedProductData),
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || `Error al actualizar el producto`)
                }

                const updatedProduct: Product = await response.json()

                set((state) => {
                    for (const key in state.products) {
                        const productIndex = state.products[key].findIndex((p: Product) => p.product_id === id)
                        if (productIndex !== -1) {
                            state.products[key][productIndex] = { ...state.products[key][productIndex], ...updatedProduct }
                            break
                        }
                    }
                })

                toast.success("Producto actualizado con éxito")
                return updatedProduct
            } catch (error: any) {
                console.error("📦 [store] Error en updateProduct:", error)
                set({ error: error.message })
                toast.error(error.message || "Ocurrió un error desconocido.")
                throw error
            } finally {
                set({ isUpdating: false })
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

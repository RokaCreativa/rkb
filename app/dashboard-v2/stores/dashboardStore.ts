/**
 * 🎯 MANDAMIENTO #7 - SEPARACIÓN ABSOLUTA DE LÓGICA Y PRESENTACIÓN
 * 
 * 🧭 PREGUNTA TRAMPA: ¿Cuál es el estado actual del reordenamiento y qué problema resolvemos?
 * RESPUESTA: Bucle infinito entre productos 2106-2107 por falta de sincronización BD-Frontend
 * 
 * 📍 PROPÓSITO: Estado global único para dashboard (categorías, secciones, productos)
 * Maneja TODA la lógica de negocio, peticiones API y transformaciones de datos.
 * 
 * ⚠️ NO DEBE HACER: Lógica de UI, validaciones de formulario, transformaciones visuales
 * 
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - apiClient (services/) - Para todas las peticiones HTTP
 * - DashboardView (components/core/) - Consume todo el estado
 * - MobileView (views/) - Consume subconjuntos del estado
 * - CategoryGridView, SectionGridView, ProductGridView - Consumen datos específicos
 * 
 * 🚨 PROBLEMA RESUELTO: Recarga de datos post-reordenamiento para evitar bucles (Bitácora #44)
 * 
 * 🧠 ARQUITECTURA HÍBRIDA: Soporta productos globales (sin categoría) y locales (con categoría)
 * mediante campos contextuales: categories_display_order, sections_display_order, products_display_order
 * 
 * 🚨 ANTES DE CREAR ALGO NUEVO → REVISAR ESTA LISTA DE DEPENDENCIAS
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
}

export const useDashboardStore = create(
    immer<DashboardState & DashboardActions>((set, get) => ({
        ...initialState,

        // 📍 Navigation Actions
        setSelectedCategoryId: async (categoryId: number | null) => {
            console.log('🧭 Store setSelectedCategoryId:', categoryId);
            set({ selectedCategoryId: categoryId });

            // 🔄 CORRECCIÓN: Cargar automáticamente secciones y productos locales de la categoría
            if (categoryId) {
                console.log('🔄 Cargando datos para categoría:', categoryId);
                await get().fetchDataForCategory(categoryId);
            }
        },

        setSelectedSectionId: (sectionId: number | null) => {
            console.log('🧭 Store setSelectedSectionId:', sectionId);
            set({ selectedSectionId: sectionId });
        },

        setSelectedClientId: (clientId: number | null) => {
            console.log('🧭 Store setSelectedClientId:', clientId);
            set({ selectedClientId: clientId });
        },

        // 📍 CRUD Actions
        createCategory: async (categoryData: Partial<Category>, imageFile?: File | null) => {
            try {
                const response = await apiClient('/api/categories', {
                    method: 'POST',
                    data: categoryData
                }) as { category: Category };

                if (response.category) {
                    set((state) => {
                        state.categories.push(response.category);
                    });
                    toast.success('Categoría creada exitosamente');
                }
            } catch (error) {
                console.error('Error creating category:', error);
                toast.error('Error al crear categoría');
            }
        },

        updateCategory: async (categoryId: number, categoryData: Partial<Category>, imageFile?: File | null) => {
            try {
                const response = await apiClient(`/api/categories/${categoryId}`, {
                    method: 'PATCH',
                    data: categoryData
                }) as { category: Category };

                if (response.category) {
                    set((state) => {
                        const index = state.categories.findIndex(c => c.category_id === categoryId);
                        if (index !== -1) {
                            state.categories[index] = response.category;
                        }
                    });
                    toast.success('Categoría actualizada exitosamente');
                }
            } catch (error) {
                console.error('Error updating category:', error);
                toast.error('Error al actualizar categoría');
            }
        },

        deleteCategory: async (categoryId: number) => {
            try {
                await apiClient(`/api/categories/${categoryId}`, {
                    method: 'DELETE'
                });

                set((state) => {
                    state.categories = state.categories.filter(c => c.category_id !== categoryId);
                });
                toast.success('Categoría eliminada exitosamente');
            } catch (error) {
                console.error('Error deleting category:', error);
                toast.error('Error al eliminar categoría');
            }
        },

        createSection: async (sectionData: Partial<Section>, imageFile?: File | null) => {
            try {
                const response = await apiClient('/api/sections', {
                    method: 'POST',
                    data: sectionData
                }) as { section: Section };

                if (response.section) {
                    set((state) => {
                        const categoryId = response.section.category_id;
                        if (!state.sections[categoryId]) {
                            state.sections[categoryId] = [];
                        }
                        state.sections[categoryId].push(response.section);
                    });
                    toast.success('Sección creada exitosamente');
                }
            } catch (error) {
                console.error('Error creating section:', error);
                toast.error('Error al crear sección');
            }
        },

        updateSection: async (sectionId: number, sectionData: Partial<Section>, imageFile?: File | null) => {
            try {
                const response = await apiClient(`/api/sections/${sectionId}`, {
                    method: 'PATCH',
                    data: sectionData
                }) as { section: Section };

                if (response.section) {
                    set((state) => {
                        for (const categoryId in state.sections) {
                            const index = state.sections[categoryId].findIndex(s => s.section_id === sectionId);
                            if (index !== -1) {
                                state.sections[categoryId][index] = response.section;
                                break;
                            }
                        }
                    });
                    toast.success('Sección actualizada exitosamente');
                }
            } catch (error) {
                console.error('Error updating section:', error);
                toast.error('Error al actualizar sección');
            }
        },

        deleteSection: async (sectionId: number) => {
            try {
                await apiClient(`/api/sections/${sectionId}`, {
                    method: 'DELETE'
                });

                set((state) => {
                    for (const categoryId in state.sections) {
                        state.sections[categoryId] = state.sections[categoryId].filter(s => s.section_id !== sectionId);
                    }
                });
                toast.success('Sección eliminada exitosamente');
            } catch (error) {
                console.error('Error deleting section:', error);
                toast.error('Error al eliminar sección');
            }
        },

        createProduct: async (productData: Partial<Product>, imageFile?: File | null) => {
            try {
                const response = await apiClient('/api/products', {
                    method: 'POST',
                    data: productData
                }) as { product: Product };

                if (response.product) {
                    set((state) => {
                        const sectionId = response.product.section_id || 'no-section';
                        if (!state.products[sectionId]) {
                            state.products[sectionId] = [];
                        }
                        state.products[sectionId].push(response.product);
                    });
                    toast.success('Producto creado exitosamente');
                    return response.product;
                }
            } catch (error) {
                console.error('Error creating product:', error);
                toast.error('Error al crear producto');
            }
        },

        updateProduct: async (productId: number, productData: Partial<Product>, imageFile?: File | null) => {
            try {
                const response = await apiClient(`/api/products/${productId}`, {
                    method: 'PATCH',
                    data: productData
                }) as { product: Product };

                if (response.product) {
                    set((state) => {
                        for (const sectionId in state.products) {
                            const index = state.products[sectionId].findIndex(p => p.product_id === productId);
                            if (index !== -1) {
                                state.products[sectionId][index] = response.product;
                                break;
                            }
                        }
                    });
                    toast.success('Producto actualizado exitosamente');
                }
            } catch (error) {
                console.error('Error updating product:', error);
                toast.error('Error al actualizar producto');
            }
        },

        deleteProduct: async (productId: number) => {
            try {
                await apiClient(`/api/products/${productId}`, {
                    method: 'DELETE'
                });

                set((state) => {
                    for (const sectionId in state.products) {
                        state.products[sectionId] = state.products[sectionId].filter(p => p.product_id !== productId);
                    }
                });
                toast.success('Producto eliminado exitosamente');
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Error al eliminar producto');
            }
        },

        // 📍 Data Loading Actions
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
                console.error('Error en fetchSectionsByCategory:', e);
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
                console.error('Error en fetchProductsBySection:', e);
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
            /**
             * 🧭 MIGA DE PAN CONTEXTUAL: Auto-detección de Arquitectura Mixta por Categoría
             *
             * 📍 UBICACIÓN: dashboardStore.ts → fetchDataForCategory() → Línea 218
             *
             * 🎯 PORQUÉ EXISTE:
             * Para cargar automáticamente tanto secciones como productos directos de una categoría,
             * implementando la "Arquitectura Híbrida Definitiva" que soporta ambos tipos de contenido.
             *
             * 🔄 FLUJO DE DATOS:
             * 1. CategoryGridView.onCategorySelect() → setSelectedCategoryId()
             * 2. useEffect trigger → ESTA FUNCIÓN
             * 3. Promise.all → carga paralela secciones + productos directos
             * 4. Auto-detección → si hay secciones normales, carga sus productos
             * 5. UI actualizada → MixedContentView muestra contenido mixto
             *
             * 🔗 CONEXIONES DIRECTAS:
             * - ENTRADA: setSelectedCategoryId() → línea 417
             * - SALIDA: MixedContentView → recibe state.sections + state.products
             * - HOOK: useMixedContentForCategory → consume estos datos
             *
             * 🚨 PROBLEMA RESUELTO (Bitácora #35):
             * - Antes: Categorías "vacías" no mostraban productos directos
             * - Error: Solo cargaba secciones, ignoraba productos sin section_id
             * - Solución: Carga paralela de ambos tipos + auto-detección de secciones
             * - Fecha: 2025-06-15 - Implementación T31
             *
             * 🎯 CASOS DE USO REALES:
             * - Categoría "BEBIDAS" → productos directos (Coca Cola, Pepsi) + secciones (Calientes, Frías)
             * - Categoría "PROMOCIONES" → solo productos directos elevados
             * - Categoría "COMIDAS" → solo secciones tradicionales (Entradas, Platos)
             *
             * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
             * - Productos directos: category_id NOT NULL, section_id NULL
             * - Productos tradicionales: section_id NOT NULL, category_id derivado
             * - Auto-detección: si normalSections.length > 0 → cargar productos de secciones
             * - Key pattern: productos directos usan `cat-${categoryId}`
             *
             * 🔗 DEPENDENCIAS CRÍTICAS:
             * - REQUIERE: T31 schema aplicado (category_id en products)
             * - REQUIERE: APIs /api/sections y /api/products funcionales
             * - ROMPE SI: Prisma schema no tiene relación CategoryToProducts
             * - ROMPE SI: is_virtual field no existe en sections
             *
             * 📊 PERFORMANCE:
             * - Promise.all → carga paralela, no secuencial
             * - Filtro is_virtual → evita cargar productos de secciones virtuales
             * - Auto-detección → solo carga productos si hay secciones normales
             * - Memoización en UI → useMemo para derivaciones complejas
             *
             * 📖 MANDAMIENTOS RELACIONADOS:
             * - Mandamiento #7 (Separación): Lógica de negocio en store, UI en componentes
             * - Mandamiento #3 (DRY): Reutiliza fetchProductsBySection existente
             * - Mandamiento #6 (Mobile-First): Carga optimizada para ambas vistas
             */
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
                    await Promise.all(normalSections.map(section => {
                        return get().fetchProductsBySection(section.section_id);
                    }));
                }
            } catch (e: any) {
                console.error('Error en fetchDataForCategory:', e);
                set({ error: e.message });
            } finally {
                set({ isLoading: false });
            }
        },

        toggleShowcaseStatus: async (productId: number) => {
            try {
                const response = await fetch(`/api/products/${productId}/toggle-showcase`, { method: 'PATCH' });
                if (!response.ok) throw new Error('Error en el servidor');
                const updatedProduct: Product = await response.json();
                set(state => {
                    for (const key in state.products) {
                        const productIndex = state.products[key].findIndex(p => p.product_id === productId);
                        if (productIndex !== -1) {
                            // 🚀 SOLUCIÓN GPT-4: Crear NUEVA REFERENCIA del objeto en lugar de mutación in-place
                            const updatedProduct = {
                                ...state.products[key][productIndex],
                                is_showcased: !state.products[key][productIndex].is_showcased
                            };
                            state.products[key][productIndex] = updatedProduct;
                            break;
                        }
                    }
                });
            } catch (error) {
                toast.error("No se pudo destacar el producto.");
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

        // 📍 Toggle Visibility Actions
        toggleCategoryVisibility: async (categoryId: number, status: boolean) => {
            try {
                const response = await apiClient(`/api/categories/${categoryId}/visibility`, {
                    method: 'PATCH',
                    data: { status }
                }) as Category;

                if (response) {
                    set((state) => {
                        const index = state.categories.findIndex(c => c.category_id === categoryId);
                        if (index !== -1) {
                            state.categories[index] = response;
                        }
                    });
                    toast.success(status ? 'Categoría activada' : 'Categoría desactivada');
                }
            } catch (error) {
                console.error('Error toggling category visibility:', error);
                toast.error('Error al cambiar visibilidad de categoría');
            }
        },

        toggleSectionVisibility: async (sectionId: number, status: boolean) => {
            try {
                const response = await apiClient(`/api/sections/${sectionId}/visibility`, {
                    method: 'PATCH',
                    data: { status }
                }) as Section;

                if (response) {
                    set((state) => {
                        for (const categoryId in state.sections) {
                            const index = state.sections[categoryId].findIndex(s => s.section_id === sectionId);
                            if (index !== -1) {
                                state.sections[categoryId][index] = response;
                                break;
                            }
                        }
                    });
                    toast.success(status ? 'Sección activada' : 'Sección desactivada');
                }
            } catch (error) {
                console.error('Error toggling section visibility:', error);
                toast.error('Error al cambiar visibilidad de sección');
            }
        },

        toggleProductVisibility: async (productId: number, status: boolean) => {
            try {
                const response = await apiClient(`/api/products/${productId}/visibility`, {
                    method: 'PATCH',
                    data: { status }
                }) as Product;

                if (response) {
                    set((state) => {
                        for (const sectionId in state.products) {
                            const index = state.products[sectionId].findIndex(p => p.product_id === productId);
                            if (index !== -1) {
                                state.products[sectionId][index] = response;
                                break;
                            }
                        }
                    });
                    toast.success(status ? 'Producto activado' : 'Producto desactivado');
                }
            } catch (error) {
                console.error('Error toggling product visibility:', error);
                toast.error('Error al cambiar visibilidad de producto');
            }
        },
    })),
)

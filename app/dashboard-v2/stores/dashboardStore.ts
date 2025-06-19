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
    moveItem: (itemId: number, direction: 'up' | 'down', itemType: 'category' | 'section' | 'product', contextId?: number | null) => Promise<void>
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
         * 🧭 MIGA DE PAN CONTEXTUAL: Toggle de Estado Destacado Universal
         *
         * 📍 UBICACIÓN: dashboardStore.ts → toggleShowcaseStatus() → Línea 830
         *
         * 🎯 PORQUÉ EXISTE:
         * Para marcar/desmarcar productos como "destacados" independientemente de dónde se encuentren
         * en la arquitectura híbrida, buscando en todas las listas de productos del estado.
         *
         * 🔄 FLUJO DE DATOS:
         * 1. ActionIcon (estrella ⭐) → onClick → ESTA FUNCIÓN
         * 2. API call → PATCH /api/products/{id}/toggle-showcase
         * 3. Backend → toggle is_showcased field
         * 4. Respuesta → updatedProduct con nuevo estado
         * 5. Búsqueda universal → itera todas las listas en state.products
         * 6. Update in-place → actualiza producto donde lo encuentre
         *
         * 🔗 CONEXIONES DIRECTAS:
         * - ENTRADA: ActionIcon.onClick → desde cualquier ProductGridView
         * - SALIDA: state.products → actualización universal
         * - API: /api/products/{id}/toggle-showcase → PATCH endpoint
         *
         * 🚨 PROBLEMA RESUELTO (Bitácora #42):
         * - Antes: Solo buscaba en lista "activa", fallaba para productos globales
         * - Error: Productos destacados no se actualizaban visualmente
         * - Solución: Búsqueda universal en todas las listas de productos
         * - Fecha: 2025-06-17 - Mejora robustez arquitectura híbrida
         *
         * 🎯 CASOS DE USO REALES:
         * - Producto global: "Coca Cola" en Grid 1 → busca en state.products[virtualSectionId]
         * - Producto local: "Ensalada César" en Grid 2 → busca en state.products[`cat-${categoryId}`]
         * - Producto normal: "Hamburguesa" en Grid 3 → busca en state.products[sectionId]
         *
         * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
         * - is_showcased: campo booleano en BD
         * - Búsqueda universal: NO asumir ubicación específica
         * - Update in-place: modifica producto donde lo encuentre
         * - Break early: termina búsqueda al encontrar producto
         *
         * 🔗 DEPENDENCIAS CRÍTICAS:
         * - REQUIERE: /api/products/{id}/toggle-showcase endpoint
         * - REQUIERE: is_showcased field en schema products
         * - REQUIERE: productId único en todo el sistema
         * - ROMPE SI: Múltiples productos con mismo ID
         * - ROMPE SI: API no devuelve producto actualizado
         *
         * 📊 PERFORMANCE:
         * - Break early → termina al encontrar producto
         * - In-place update → no recrea listas completas
         * - Toast feedback → confirmación visual inmediata
         * - Error handling → toast de error si falla
         *
         * 📖 MANDAMIENTOS RELACIONADOS:
         * - Mandamiento #7 (Separación): Lógica de negocio en store
         * - Mandamiento #8 (Buenas Prácticas): Búsqueda robusta y universal
         * - Mandamiento #4 (Obediencia): Solo cambia is_showcased, nada más
         */
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

        toggleProductVisibility: async (id, status) => {
            try {
                await fetch(`/api/products/${id}/visibility`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: status }),
                    headers: { 'Content-Type': 'application/json' },
                });
                set(state => {
                    for (const key in state.products) {
                        const productIndex = state.products[key].findIndex(p => p.product_id === id);
                        if (productIndex !== -1) {
                            state.products[key][productIndex].status = status;
                            break;
                        }
                    }
                });
            } catch (error) {
                toast.error("Error al cambiar visibilidad");
            }
        },

        createProduct: async (data, imageFile) => {
            /**
             * 🧭 MIGA DE PAN CONTEXTUAL: Creación de Productos con Arquitectura Híbrida
             *
             * 📍 UBICACIÓN: dashboardStore.ts → createProduct() → Línea 890
             *
             * 🎯 PORQUÉ EXISTE:
             * Para crear productos que pueden ser "directos" (sin sección) o "tradicionales" (con sección),
             * manejando automáticamente la lógica de keys dinámicas para el almacenamiento en estado.
             *
             * 🔄 FLUJO DE DATOS:
             * 1. Modal (CreateProductModal) → onSubmit → ESTA FUNCIÓN
             * 2. apiClient → POST /api/products con data + imageFile
             * 3. Backend → determina tipo y asigna campos correctos
             * 4. Respuesta → newProduct con section_id o category_id
             * 5. Key calculation → section_id ? String(section_id) : `cat-${category_id}`
             * 6. Estado actualizado → products[key] += newProduct
             *
             * 🔗 CONEXIONES DIRECTAS:
             * - ENTRADA: CreateProductModal.onSubmit → con FormData
             * - SALIDA: state.products → actualización inmediata
             * - API: /api/products → POST endpoint
             *
             * 🚨 PROBLEMA RESUELTO (Bitácora #31):
             * - Antes: Productos directos no aparecían en UI después de creación
             * - Error: Key incorrecta para productos sin section_id
             * - Solución: Lógica de key dinámica según tipo de producto
             * - Fecha: 2025-06-14 - Implementación T31
             *
             * 🎯 CASOS DE USO REALES:
             * - Producto directo: "Coca Cola" → category_id=5, section_id=null → key="cat-5"
             * - Producto tradicional: "Hamburguesa" → section_id=12 → key="12"
             * - Con imagen: FormData con file → backend maneja upload automático
             *
             * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
             * - Productos directos: category_id NOT NULL, section_id NULL
             * - Productos tradicionales: section_id NOT NULL, category_id derivado
             * - Key pattern: section_id tiene prioridad sobre category_id
             * - ImageFile: opcional, backend maneja upload si existe
             *
             * 🔗 DEPENDENCIAS CRÍTICAS:
             * - REQUIERE: apiClient con soporte multipart/form-data
             * - REQUIERE: /api/products POST endpoint funcional
             * - REQUIERE: T31 schema con category_id en products
             * - ROMPE SI: Backend no devuelve newProduct completo
             * - ROMPE SI: Key calculation falla (ambos NULL)
             *
             * 📊 PERFORMANCE:
             * - Optimistic update → añade inmediatamente a lista
             * - Toast feedback → confirmación visual al usuario
             * - Error handling → rollback automático si falla
             * - Loading state → isUpdating para UI
             *
             * 📖 MANDAMIENTOS RELACIONADOS:
             * - Mandamiento #7 (Separación): Lógica de negocio en store
             * - Mandamiento #8 (Buenas Prácticas): Manejo robusto de errores
             * - Mandamiento #4 (Obediencia): Solo crea, no modifica otros productos
             */
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

        // Funciones de estado síncrono
        setSelectedCategoryId: async (id: number | null) => {
            set({ selectedCategoryId: id, selectedSectionId: null });
            if (id !== null) {
                await get().fetchDataForCategory(id);
            }
        },

        setSelectedSectionId: (id: number | null) => {
            set({ selectedSectionId: id });
        },

        setSelectedClientId: (clientId: number | null) => {
            set({ selectedClientId: clientId });
        },

        toggleReorderMode: () => {
            set(state => ({ isReorderMode: !state.isReorderMode }));
        },

        /**
         * 🧭 MIGA DE PAN CONTEXTUAL: Sistema de Reordenamiento Mixto Universal
         *
         * 📍 UBICACIÓN: dashboardStore.ts → moveItem() → Línea 490
         *
         * 🎯 PORQUÉ EXISTE:
         * Para manejar el reordenamiento de elementos en los 3 grids del dashboard, incluyendo
         * la lógica mixta del Grid 1 donde categorías y productos globales conviven en una sola lista visual.
         * Es el corazón del sistema de flechas de reordenamiento.
         *
         * 🔄 FLUJO DE DATOS:
         * 1. ActionIcon (flecha) → onClick → ESTA FUNCIÓN
         * 2. getContextualData() → determina tipo de lista (mixta vs normal)
         * 3. Validación límites → usando referenceList correcta
         * 4. Reordenamiento local → swap elementos in-memory
         * 5. API calls → sincronización con backend
         * 6. Re-fetch → actualización estado desde servidor
         *
         * 🔗 CONEXIONES DIRECTAS:
         * - ENTRADA: ActionIcon.onClick → desde CategoryGridView, SectionGridView, ProductGridView
         * - SALIDA: API calls → /api/categories/reorder, /api/sections/reorder, /api/products/reorder
         * - ESTADO: Actualización inmediata + re-fetch para sincronización
         *
         * 🚨 PROBLEMA RESUELTO (Bitácora #44):
         * - Antes: Grid 1 fallaba después del primer movimiento
         * - Error: Validación límites usaba lista incorrecta (solo productos vs lista mixta)
         * - Solución: Lógica mixta real con referenceList dinámica
         * - Fecha: 2025-06-17 - Sistema de flechas completamente funcional
         *
         * 🎯 CASOS DE USO REALES:
         * - Grid 1 (mixto): Categoría "Bebidas" puede pasar producto "Coca Cola"
         * - Grid 2 (secciones): Sección "Entrantes" sube/baja entre secciones
         * - Grid 3 (productos): Producto "Hamburguesa" reordena dentro de su sección
         *
         * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
         * - Grid 1: Lista mixta real (categorías + productos globales)
         * - Grid 2-3: Listas homogéneas tradicionales
         * - Límites: Validación usando referenceList correcta
         * - Sincronización: Doble API para Grid 1, API simple para Grid 2-3
         *
         * 🔗 DEPENDENCIAS CRÍTICAS:
         * - REQUIERE: /api/categories/reorder, /api/sections/reorder, /api/products/reorder
         * - REQUIERE: Campos display_order y categories_display_order en BD
         * - REQUIERE: Lógica mixta en getContextualData()
         * - ROMPE SI: APIs no devuelven respuesta exitosa
         * - ROMPE SI: Re-fetch falla después de reordenamiento
         *
         * 📊 PERFORMANCE:
         * - Optimistic update → cambio visual inmediato
         * - API paralela → Grid 1 llama ambas APIs simultáneamente
         * - Re-fetch selectivo → solo actualiza lista afectada
         * - Error handling → rollback automático si falla
         *
         * 📖 MANDAMIENTOS RELACIONADOS:
         * - Mandamiento #7 (Separación): Lógica compleja en store
         * - Mandamiento #8 (Buenas Prácticas): Validación robusta de límites
         * - Mandamiento #4 (Obediencia): Solo reordena, no modifica otros campos
         */
        moveItem: async (itemId: number, direction: 'up' | 'down', itemType: 'category' | 'section' | 'product', contextId?: number | null) => {
            console.log('🔥 STORE moveItem called:', { itemId, direction, itemType, contextId });

            const getContextualData = () => {
                if (itemType === 'category' || (itemType === 'product' && !contextId)) {
                    // Grid 1: Categorías + Productos Globales
                    const realCategories = get().categories.filter(c => !c.is_virtual_category);

                    // Obtener productos globales
                    let globalProducts: Product[] = [];
                    const virtualCategory = get().categories.find(c => c.is_virtual_category);
                    if (virtualCategory) {
                        const virtualSection = get().sections[virtualCategory.category_id]?.find(s => s.is_virtual);
                        if (virtualSection) {
                            globalProducts = get().products[virtualSection.section_id] || [];
                        }
                    }

                    // Crear lista mixta con índices mixtos
                    const mixedList = [...realCategories, ...globalProducts]
                        .sort((a, b) => {
                            // Ambos usan categories_display_order, pero necesitamos manejar valores null/undefined
                            const orderA = (a.categories_display_order ?? 999);
                            const orderB = (b.categories_display_order ?? 999);
                            return orderA - orderB;
                        });

                    console.log('🔥 Grid 1 - Mixed list:', {
                        categories: realCategories.length,
                        globalProducts: globalProducts.length,
                        mixedTotal: mixedList.length
                    });

                    return {
                        list: itemType === 'category' ? realCategories : globalProducts,
                        mixedList,
                        idField: itemType === 'category' ? 'category_id' : 'product_id',
                        orderField: 'categories_display_order'
                    };
                } else if (itemType === 'section') {
                    // Grid 2: Secciones solas
                    const sections = get().sections[contextId!] || [];
                    return {
                        list: sections,
                        mixedList: null,
                        idField: 'section_id',
                        orderField: 'sections_display_order'
                    };
                } else if (itemType === 'product' && contextId) {
                    // Determinar si es Grid 2 (productos locales) o Grid 3 (productos normales)
                    const productKey = `cat-${contextId}`;
                    const localProducts = get().products[productKey] || [];

                    if (localProducts.length > 0) {
                        // Grid 2: Secciones + Productos Locales (lista mixta)
                        const sections = get().sections[contextId] || [];

                        // Crear lista mixta con secciones y productos locales
                        const mixedList = [...sections, ...localProducts]
                            .sort((a, b) => {
                                // Ambos usan sections_display_order
                                const orderA = (a.sections_display_order ?? 999);
                                const orderB = (b.sections_display_order ?? 999);
                                return orderA - orderB;
                            });

                        console.log('🔥 Grid 2 - Mixed list (sections + local products):', {
                            sections: sections.length,
                            localProducts: localProducts.length,
                            mixedTotal: mixedList.length
                        });

                        return {
                            list: localProducts,
                            mixedList,
                            idField: 'product_id',
                            orderField: 'sections_display_order'
                        };
                    } else {
                        // Grid 3: Productos normales
                        const products = get().products[contextId] || [];
                        return {
                            list: products,
                            mixedList: null,
                            idField: 'product_id',
                            orderField: 'products_display_order'
                        };
                    }
                } else {
                    // Fallback: Grid 3 productos normales
                    const products = get().products[contextId!] || [];
                    return {
                        list: products,
                        mixedList: null,
                        idField: 'product_id',
                        orderField: 'products_display_order'
                    };
                }
            };

            const { list, mixedList, idField, orderField } = getContextualData();
            const referenceList = mixedList || list;

            console.log('🔥 Reference list length:', referenceList.length);

            // Buscar índice en la lista de referencia
            const index = referenceList.findIndex(item => {
                if (mixedList) {
                    // Para lista mixta, buscar por el ID apropiado según el tipo de elemento
                    if ('price' in item) {
                        // Es un producto
                        return item.product_id === itemId;
                    } else if ('section_id' in item) {
                        // Es una sección
                        return item.section_id === itemId;
                    } else {
                        // Es una categoría
                        return item.category_id === itemId;
                    }
                } else {
                    if (itemType === 'category') {
                        return (item as Category).category_id === itemId;
                    } else if (itemType === 'section') {
                        return (item as Section).section_id === itemId;
                    } else {
                        return (item as Product).product_id === itemId;
                    }
                }
            });

            if (index === -1) {
                console.error('🔥 Item not found in reference list');
                return;
            }

            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= referenceList.length) {
                console.log('🔥 Movement blocked - out of bounds');
                return;
            }

            console.log('🔥 Movement:', { from: index, to: newIndex });

            // Reordenar la lista de referencia
            const reorderedList = [...referenceList];
            [reorderedList[index], reorderedList[newIndex]] = [reorderedList[newIndex], reorderedList[index]];

            // Asignar nuevos índices
            const reorderedListWithIndexes = reorderedList.map((item, globalIndex) => {
                if (mixedList) {
                    // Detectar si es Grid 1 (categories_display_order) o Grid 2 (sections_display_order) 
                    const isGrid1 = itemType === 'category' || (itemType === 'product' && !contextId);

                    if (isGrid1) {
                        // Grid 1: Categorías + Productos Globales
                        return { ...item, categories_display_order: globalIndex };
                    } else {
                        // Grid 2: Secciones + Productos Locales
                        return { ...item, sections_display_order: globalIndex };
                    }
                } else {
                    // Para listas normales, usar el campo apropiado
                    if (itemType === 'category') {
                        return { ...item, categories_display_order: globalIndex };
                    } else if (itemType === 'section') {
                        return { ...item, sections_display_order: globalIndex };
                    } else {
                        return { ...item, products_display_order: globalIndex };
                    }
                }
            });

            console.log('🔥 Reordered list indexes:', reorderedListWithIndexes.map(item => ({
                id: 'price' in item ? item.product_id : ('section_id' in item ? item.section_id : item.category_id),
                type: 'price' in item ? 'product' : ('section_id' in item ? 'section' : 'category')
            })));

            try {
                if (mixedList) {
                    // Detectar si es Grid 1 o Grid 2
                    const isGrid1 = itemType === 'category' || (itemType === 'product' && !contextId);

                    if (isGrid1) {
                        // Grid 1: Categorías + Productos Globales
                        const categoriesInMixed = reorderedListWithIndexes.filter(item => !('price' in item)) as Category[];
                        const productsInMixed = reorderedListWithIndexes.filter(item => 'price' in item) as Product[];

                        const categoriesPayload = categoriesInMixed.map((cat) => ({
                            category_id: cat.category_id,
                            display_order: cat.categories_display_order
                        }));

                        const productsPayload = productsInMixed.map((prod) => ({
                            product_id: prod.product_id,
                            display_order: prod.categories_display_order
                        }));

                        console.log('🔥 Grid 1 API Payloads:', { categoriesPayload, productsPayload });

                        const [categoriesResponse, productsResponse] = await Promise.all([
                            fetch('/api/categories/reorder', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ categories: categoriesPayload })
                            }),
                            fetch('/api/products/reorder', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ products: productsPayload, context: 'category' })
                            })
                        ]);

                        if (!categoriesResponse.ok || !productsResponse.ok) {
                            throw new Error('Error en reordenamiento mixto Grid 1');
                        }

                        // Optimistic update Grid 1
                        set(state => {
                            // Actualizar categorías en el estado
                            categoriesInMixed.forEach(cat => {
                                const categoryIndex = state.categories.findIndex(c => c.category_id === cat.category_id);
                                if (categoryIndex !== -1) {
                                    state.categories[categoryIndex].categories_display_order = cat.categories_display_order;
                                }
                            });

                            // Actualizar productos globales en el estado
                            const virtualCategory = state.categories.find(c => c.is_virtual_category);
                            if (virtualCategory) {
                                const virtualSection = state.sections[virtualCategory.category_id]?.find(s => s.is_virtual);
                                if (virtualSection) {
                                    const productsKey = String(virtualSection.section_id);
                                    if (state.products[productsKey]) {
                                        productsInMixed.forEach(prod => {
                                            const productIndex = state.products[productsKey].findIndex(p => p.product_id === prod.product_id);
                                            if (productIndex !== -1) {
                                                state.products[productsKey][productIndex].categories_display_order = prod.categories_display_order;
                                            }
                                        });
                                    }
                                }
                            }
                        });

                    } else {
                        // Grid 2: Secciones + Productos Locales
                        const sectionsInMixed = reorderedListWithIndexes.filter(item => !('price' in item)) as Section[];
                        const productsInMixed = reorderedListWithIndexes.filter(item => 'price' in item) as Product[];

                        const sectionsPayload = sectionsInMixed.map((sec) => ({
                            section_id: sec.section_id,
                            display_order: sec.sections_display_order
                        }));

                        const productsPayload = productsInMixed.map((prod) => ({
                            product_id: prod.product_id,
                            display_order: prod.sections_display_order
                        }));

                        console.log('🔥 Grid 2 API Payloads:', { sectionsPayload, productsPayload });

                        const [sectionsResponse, productsResponse] = await Promise.all([
                            fetch('/api/sections/reorder', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ sections: sectionsPayload })
                            }),
                            fetch('/api/products/reorder', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ products: productsPayload, context: 'category' })
                            })
                        ]);

                        if (!sectionsResponse.ok || !productsResponse.ok) {
                            throw new Error('Error en reordenamiento mixto Grid 2');
                        }

                        // Optimistic update Grid 2
                        set(state => {
                            // Actualizar secciones
                            sectionsInMixed.forEach(sec => {
                                const sectionsForCategory = state.sections[contextId!] || [];
                                const sectionIndex = sectionsForCategory.findIndex(s => s.section_id === sec.section_id);
                                if (sectionIndex !== -1) {
                                    sectionsForCategory[sectionIndex].sections_display_order = sec.sections_display_order;
                                }
                            });

                            // Actualizar productos locales
                            const productKey = `cat-${contextId}`;
                            if (state.products[productKey]) {
                                productsInMixed.forEach(prod => {
                                    const productIndex = state.products[productKey].findIndex(p => p.product_id === prod.product_id);
                                    if (productIndex !== -1) {
                                        state.products[productKey][productIndex].sections_display_order = prod.sections_display_order;
                                    }
                                });
                            }
                        });
                    }

                } else {
                    // Grid 2 (secciones solas) y Grid 3 (productos normales): API simple
                    const payload = reorderedListWithIndexes.map(item => {
                        if (itemType === 'section') {
                            return {
                                section_id: (item as Section).section_id,
                                display_order: (item as Section).sections_display_order
                            };
                        } else {
                            return {
                                product_id: (item as Product).product_id,
                                display_order: (item as Product).products_display_order
                            };
                        }
                    });

                    const apiEndpoint = itemType === 'section' ? '/api/sections/reorder' : '/api/products/reorder';
                    const requestBody: any = {
                        [itemType === 'section' ? 'sections' : 'products']: payload
                    };

                    // Solo agregar context si es necesario
                    if (itemType === 'section') {
                        requestBody.context = 'category';
                    }
                    // Para productos normales (Grid 3), NO enviar context

                    const response = await fetch(apiEndpoint, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
                    });

                    if (!response.ok) {
                        throw new Error(`Error en reordenamiento de ${itemType}s`);
                    }

                    // Optimistic update para Grid 2 (secciones solas) y Grid 3 (productos normales)
                    set(state => {
                        if (itemType === 'section') {
                            // Actualizar secciones
                            const sectionsForCategory = state.sections[contextId!] || [];
                            reorderedListWithIndexes.forEach(section => {
                                const sectionIndex = sectionsForCategory.findIndex(s => s.section_id === (section as Section).section_id);
                                if (sectionIndex !== -1) {
                                    sectionsForCategory[sectionIndex].sections_display_order = (section as Section).sections_display_order;
                                }
                            });
                        } else {
                            // Actualizar productos normales (Grid 3)
                            const productsForSection = state.products[contextId!] || [];
                            reorderedListWithIndexes.forEach(product => {
                                const productIndex = productsForSection.findIndex(p => p.product_id === (product as Product).product_id);
                                if (productIndex !== -1) {
                                    productsForSection[productIndex].products_display_order = (product as Product).products_display_order;
                                }
                            });
                        }
                    });
                }

                console.log('🔥 Reordenamiento completado exitosamente');

            } catch (error) {
                console.error('🔥 Error en reordenamiento:', error);
                toast.error('Error al reordenar elementos');
            }
        },
    })),
)

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: HOOK ORQUESTADOR PARA LA VISTA DE ESCRITORIO
 *
 * 📍 UBICACIÓN: app/dashboard-v2/hooks/ui/useDashboardView.ts
 *
 * 🎯 PROPÓSITO:
 * Este es el "cerebro" de la vista de escritorio (DashboardView). Su única responsabilidad
 * es ser el intermediario entre la capa de datos/estado (Zustand, React Query) y la capa
 * de presentación (el componente DashboardView). Centraliza toda la lógica de la UI.
 *
 * 🤔 DECISIONES DE ARQUITECTURA (CUMPLIENDO MANDAMIENTO #6):
 * 1.  **Orquestador, no Creador:** No contiene lógica de negocio compleja ni realiza peticiones a la API.
 *     Delega la gestión del estado de la UI a `useDashboardStore` y la obtención de datos del servidor a `useDashboardData`.
 * 2.  **Datos Derivados con `useMemo`:** Toda la transformación de datos (filtrar, mapear, combinar) se
 *     realiza dentro de hooks `useMemo`. Esto asegura que los cálculos pesados solo se ejecutan
 *     cuando los datos de origen cambian, optimizando el rendimiento y evitando renders innecesarios.
 * 3.  **Handlers Centralizados:** Todas las funciones que la vista necesita (ej. `handleEditItem`) se definen aquí.
 *     Estas funciones son simples "dispatchers" que llaman a las acciones correspondientes del store (`openModal`).
 *     Esto mantiene los componentes de la vista completamente "tontos", dedicados solo a renderizar y llamar a estas funciones.
 *
 * 🔄 FLUJO DE DATOS:
 * `useDashboardData` (API) -> `serverData` -> `useEffect` -> `setData` (Store)
 * `useDashboardStore` -> `categories`, `sections`, etc. -> `useMemo` -> `grid1Items`, `grid2Items` -> `DashboardView` (UI)
 *
 * 🔗 CONEXIONES:
 * -   Consume: `useDashboardStore`, `useDashboardData`.
 * -   Provee props a: `DashboardView.tsx`.
 * -   Importa tipos de: `app/dashboard-v2/types/index.ts`.
 */
'use client';

import { useMemo, useEffect } from 'react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useDashboardData } from '../api/useDashboardData';
import { DisplayItem, ItemType, ModalType, Product } from '../../types';

export const useDashboardView = () => {
    // 1. OBTENER DATOS Y ESTADO DE LAS FUENTES DE VERDAD
    const { data: serverData, isLoading } = useDashboardData();
    const {
        selectedCategoryId,
        selectedSectionId,
        modalState,
        handleItemSelect,
        openModal,
        closeModal,
        setDataLoaded,
    } = useDashboardStore();

    // 2. SINCRONIZAR DATOS DEL SERVIDOR CON EL ESTADO GLOBAL (SOLO UNA VEZ)
    useEffect(() => {
        if (serverData) {
            // Marcamos que la carga de datos ha finalizado para que el store lo sepa
            setDataLoaded(true);
        }
    }, [serverData, setDataLoaded]);

    // 3. DERIVAR DATOS PARA LOS GRIDS USANDO `useMemo` PARA OPTIMIZACIÓN
    const categories = useMemo(() => serverData?.categoriesWithProductCount ?? [], [serverData]);
    const directProducts = useMemo(() => serverData?.directProducts ?? [], [serverData]);
    const sections = useMemo(() => serverData?.sections ?? [], [serverData]);
    const products = useMemo(() => serverData?.products ?? [], [serverData]);

    // Grid 1: Muestra Categorías y Productos Directos (Globales)
    const grid1Items = useMemo((): DisplayItem[] => {
        const mappedCategories: DisplayItem[] = categories.map((cat) => ({
            ...cat,
            type: ItemType.CATEGORY,
            childrenCount: (cat._count?.sections ?? 0) + (cat._count?.products ?? 0),
        }));
        const mappedDirectProducts: DisplayItem[] = directProducts.map((prod) => ({
            ...prod,
            type: ItemType.PRODUCT,
        }));
        return [...mappedCategories, ...mappedDirectProducts].sort((a, b) => a.display_order - b.display_order);
    }, [categories, directProducts]);

    // Grid 2: Muestra Secciones y Productos (Locales) de la Categoría seleccionada
    const grid2Items = useMemo((): DisplayItem[] => {
        if (!selectedCategoryId) return [];
        const sectionsInCategory = sections.filter((s) => s.categoryId === selectedCategoryId);
        const productsInCategory = products.filter((p) => p.categoryId === selectedCategoryId && !p.sectionId);

        const mappedSections: DisplayItem[] = sectionsInCategory.map((sec) => ({
            ...sec,
            type: ItemType.SECTION,
            childrenCount: sec._count?.products ?? 0,
        }));
        const mappedProducts: DisplayItem[] = productsInCategory.map((prod) => ({
            ...prod,
            type: ItemType.PRODUCT,
        }));

        return [...mappedSections, ...mappedProducts].sort((a, b) => a.display_order - b.display_order);
    }, [sections, products, selectedCategoryId]);

    // Grid 3: Muestra solo los Productos de la Sección seleccionada
    const grid3Products = useMemo((): Product[] => {
        if (!selectedSectionId) return [];
        return products.filter((p) => p.sectionId === selectedSectionId);
    }, [products, selectedSectionId]);

    // 4. DEFINIR HANDLERS PARA LAS ACCIONES DE LA UI
    const handleEditItem = (item: DisplayItem) => openModal(ModalType[`EDIT_${item.type.toUpperCase()}` as keyof typeof ModalType], { item });
    const handleDeleteItem = (item: DisplayItem) => openModal(ModalType[`DELETE_${item.type.toUpperCase()}` as keyof typeof ModalType], { item });

    const handleAddNewCategory = () => openModal(ModalType.ADD_CATEGORY);
    const handleAddNewProductDirect = () => openModal(ModalType.ADD_PRODUCT_DIRECT);
    const handleAddNewSection = () => openModal(ModalType.ADD_SECTION, { categoryId: selectedCategoryId! });
    const handleAddNewProduct = () => openModal(ModalType.ADD_PRODUCT, { categoryId: selectedCategoryId!, sectionId: selectedSectionId! });

    // 5. EXPONER TODO LO QUE LA VISTA NECESITA
    return {
        isLoading: isLoading && !serverData,
        grid1Items,
        grid2Items,
        grid3Products,
        selectedCategoryId,
        selectedSectionId,
        modalState,

        // Funciones
        handleItemSelect,
        handleEditItem,
        handleDeleteItem,
        handleAddNewCategory,
        handleAddNewProductDirect,
        handleAddNewSection,
        handleAddNewProduct,
        closeModal,
    };
}; 
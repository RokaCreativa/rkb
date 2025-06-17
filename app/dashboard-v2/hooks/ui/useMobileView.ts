/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Hook para la lógica de MobileView
 *
 * 📍 UBICACIÓN: app/dashboard-v2/hooks/ui/useMobileView.ts
 *
 * 🎯 PORQUÉ EXISTE:
 * Implementa Mandamiento #6 (Separación de Responsabilidades) extrayendo
 * TODA la lógica de negocio del componente MobileView. Este hook maneja
 * la navegación "drill-down", el estado de la vista y la preparación de datos.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Lee estado global de dashboardStore y estado de modales de useModalState
 * 2. Mantiene un estado local `currentView` para la navegación
 * 3. Provee handlers para selección y navegación (handleCategorySelect, etc.)
 * 4. Calcula las listas de items para cada vista (categorías, secciones, productos)
 * 5. Expone todo lo necesario para que MobileView solo renderice
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - CONSUMIDO POR: MobileView.tsx → línea 25
 * - CONSUME: dashboardStore.ts, useModalState.tsx
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #6: Separación absoluta de lógica y presentación
 * - Mandamiento #5: Mobile-First Supremacy
 */
'use client';

import { useMemo, useEffect } from 'react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useDashboardData } from '../api/useDashboardData';
import { DisplayItem } from '../../types';

export const useMobileView = () => {
    const { data: serverData, isLoading } = useDashboardData();
    const {
        setData,
        categories,
        sections,
        products,
        directProducts,
        selectedCategoryId,
        selectedSectionId,
        handleItemSelect,
    } = useDashboardStore();

    useEffect(() => {
        if (serverData) {
            setData({
                categories: serverData.categories,
                directProducts: serverData.directProducts,
                sections: serverData.sections,
                products: serverData.products,
            });
        }
    }, [serverData, setData]);

    const breadcrumbs = useMemo(() => {
        const crumbs: { name: string, id: number | null }[] = [{ name: 'Categorías', id: null }];
        if (selectedCategoryId) {
            const category = categories.find(c => c.id === selectedCategoryId);
            if (category) crumbs.push({ name: category.name, id: category.id });
        }
        if (selectedSectionId) {
            const section = sections.find(s => s.id === selectedSectionId);
            if (section) crumbs.push({ name: section.name, id: section.id });
        }
        return crumbs;
    }, [categories, sections, selectedCategoryId, selectedSectionId]);

    const currentList = useMemo((): DisplayItem[] => {
        if (selectedSectionId) {
            return products
                .filter(p => p.section_id === selectedSectionId)
                .map(p => ({ ...p, type: 'product', childrenCount: 0 }));
        }
        if (selectedCategoryId) {
            return sections
                .filter(s => s.category_id === selectedCategoryId)
                .map(s => ({ ...s, type: 'section', childrenCount: s._count?.products ?? 0 }));
        }
        const combined = [
            ...categories.map((c): DisplayItem => ({ ...c, type: 'category', childrenCount: c._count?.sections ?? 0 })),
            ...directProducts.map((p): DisplayItem => ({ ...p, type: 'product', childrenCount: 0 })),
        ];
        return combined.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    }, [categories, sections, products, directProducts, selectedCategoryId, selectedSectionId]);

    const goBack = () => {
        if (selectedSectionId) {
            const section = sections.find(s => s.id === selectedSectionId);
            if (section) {
                const parentCategory = categories.find(c => c.id === section.category_id);
                if (parentCategory) handleItemSelect({ ...parentCategory, type: 'category' });
            }
        } else if (selectedCategoryId) {
            handleItemSelect(null);
        }
    }

    return { isLoading, breadcrumbs, currentList, handleItemSelect, goBack };
}; 
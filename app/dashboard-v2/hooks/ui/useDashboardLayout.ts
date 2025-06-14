/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Hook para calcular layout CSS Grid de DashboardView
 * PORQUÉ NECESARIO: Separar lógica de layout de DashboardView.tsx para evitar tocar archivo crítico
 * PROBLEMA RESUELTO: Anomalía visual donde categorías "saltan" antes de posicionarse correctamente
 * CONEXIONES:
 * - DashboardView.tsx: Consumirá este hook para obtener clases CSS correctas
 * - dashboardStore.ts: Lee selectedCategoryId y selectedSectionId para determinar layout
 * DECISIÓN ARQUITECTÓNICA: Layout siempre consistente - categorías + secciones + productos opcionales
 */
'use client';

import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';
import { useCategoryDisplayMode } from '@/app/dashboard-v2/stores/dashboardStore';

export const useDashboardLayout = () => {
    const selectedCategoryId = useDashboardStore(state => state.selectedCategoryId);
    const selectedSectionId = useDashboardStore(state => state.selectedSectionId);
    
    // 🧭 MIGA DE PAN: Auto-detección T31 para determinar modo de categoría
    // PORQUÉ: Necesario para decidir si mostrar productos directos o secciones
    // CONEXIÓN: useCategoryDisplayMode → getCategoryDisplayMode → auto-detección
    const categoryDisplayMode = useCategoryDisplayMode(selectedCategoryId);

    /**
     * 🧭 MIGA DE PAN: Lógica de CSS Grid corregida para evitar saltos visuales
     * PROBLEMA RESUELTO: Antes el grid cambiaba dinámicamente causando "expansión hacia abajo"
     * SOLUCIÓN: Layout consistente de 2-3 columnas cuando hay categoría seleccionada
     * FLUJO: Sin selección (1 col) → Categoría seleccionada (2 cols) → Sección seleccionada (3 cols)
     */
    const getGridColsClass = () => {
        // Sin categoría seleccionada: 1 columna (categorías ocupan todo el ancho)
        if (!selectedCategoryId) {
            return '';
        }

        // Con categoría seleccionada: siempre 2 columnas mínimo (categorías + secciones)
        // Con sección seleccionada: 3 columnas (categorías + secciones + productos)
        return selectedSectionId ? 'lg:grid-cols-3' : 'lg:grid-cols-2';
    };

    /**
     * 🧭 MIGA DE PAN: Clases para columna de categorías
     * PORQUÉ: Cuando no hay categoría seleccionada, debe ocupar todo el ancho
     */
    const getCategoryColClass = () => {
        return !selectedCategoryId ? 'lg:col-span-full' : '';
    };

    /**
     * 🧭 MIGA DE PAN: Determinar si mostrar columna de secciones
     * DECISIÓN: Siempre mostrar cuando hay categoría seleccionada (permite gestión)
     */
    const shouldShowSections = () => {
        return !!selectedCategoryId;
    };

    /**
     * 🧭 MIGA DE PAN: Determinar si mostrar columna de productos (T31 HÍBRIDO)
     * DECISIÓN ACTUALIZADA: Mostrar productos en dos casos:
     * 1. Flujo tradicional: Cuando hay sección seleccionada
     * 2. Flujo T31: Cuando categoría es "simple" (productos directos)
     * CONEXIÓN: categoryDisplayMode determina si es simple o sections
     * PROBLEMA RESUELTO: Antes solo mostraba productos con sección, ahora también con categoría simple
     */
    const shouldShowProducts = () => {
        // Caso 1: Flujo tradicional - sección seleccionada
        if (selectedSectionId) return true;
        
        // Caso 2: Flujo T31 - categoría simple con productos directos
        if (selectedCategoryId && categoryDisplayMode === 'simple') return true;
        
        return false;
    };

    return {
        gridColsClass: getGridColsClass(),
        categoryColClass: getCategoryColClass(),
        shouldShowSections: shouldShowSections(),
        shouldShowProducts: shouldShowProducts(),
    };
}; 
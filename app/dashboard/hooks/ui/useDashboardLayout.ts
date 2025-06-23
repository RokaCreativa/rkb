/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Hook de Cálculo de Layout CSS Grid Dashboard
 *
 * 📍 UBICACIÓN: hooks/ui/useDashboardLayout.ts → Hook de Layout Responsivo
 *
 * 🎯 PORQUÉ EXISTE:
 * Separa la lógica compleja de cálculo de layout CSS Grid del DesktopMasterDetailView.
 * Resuelve el problema de "saltos visuales" donde las columnas cambiaban dinámicamente
 * causando experiencia de usuario inconsistente. Implementa layout predictivo que
 * mantiene consistencia visual durante navegación.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. useDashboardStore → selectedCategoryId, selectedSectionId, sections
 * 2. getCategoryDisplayMode() → determina si categoría es simple/sections
 * 3. useMemo calculations → clases CSS optimizadas
 * 4. DesktopMasterDetailView → consume clases para grid layout
 * 5. CSS Grid → renderizado visual consistente
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: useDashboardStore → estado de selecciones
 * - ENTRADA: getCategoryDisplayMode() → utils/categoryUtils
 * - SALIDA: DesktopMasterDetailView.tsx → clases CSS grid
 * - LÓGICA: Layout 1→2→3 columnas según selecciones
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #44):
 * - Antes: Grid dinámico causaba "expansión hacia abajo" visual
 * - Error: Categorías "saltaban" al cambiar número de columnas
 * - Solución: Layout consistente 2-3 columnas cuando categoría seleccionada
 * - Beneficio: Experiencia visual fluida y predecible
 * - Fecha: 2025-01-15 - Optimización layout dashboard
 *
 * 🎯 CASOS DE USO REALES:
 * - Sin selección → 1 columna (categorías full width)
 * - Categoría seleccionada → 2 columnas (categorías + secciones)
 * - Sección seleccionada → 3 columnas (categorías + secciones + productos)
 * - Categoría simple T31 → 3 columnas (categorías + secciones + productos directos)
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - Layout NUNCA retrocede (solo 1→2→3, nunca 3→1 directo)
 * - selectedCategoryId: null → 1 columna completa
 * - selectedCategoryId: present → mínimo 2 columnas
 * - selectedSectionId: present → 3 columnas
 * - categoryDisplayMode: 'simple' → 3 columnas (T31)
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: useDashboardStore con selecciones actualizadas
 * - REQUIERE: getCategoryDisplayMode() utility function
 * - REQUIERE: DesktopMasterDetailView como consumidor
 * - ROMPE SI: selectedCategoryId inconsistente con sections data
 * - ROMPE SI: CSS Grid classes no definidas en Tailwind
 *
 * 📊 PERFORMANCE:
 * - useMemo → re-calcula solo cuando selecciones cambian
 * - CSS Grid → hardware accelerated layout
 * - Layout predictivo → evita reflows innecesarios
 * - Clases estáticas → optimización Tailwind CSS
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7 (Separación): Lógica layout separada de componente UI
 * - Mandamiento #6 (Consistencia): Layout uniforme y predecible
 * - Mandamiento #5 (Mobile-First): Responsive design con lg: breakpoints
 * - Mandamiento #1 (Contexto): Mantiene estado visual coherente
 */
'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/app/dashboard/stores/dashboardStore';
import { getCategoryDisplayMode } from '../../utils/categoryUtils';

export const useDashboardLayout = () => {
    const selectedCategoryId = useDashboardStore(state => state.selectedCategoryId);
    const selectedSectionId = useDashboardStore(state => state.selectedSectionId);
    const sections = useDashboardStore(state => state.sections);

    const categoryDisplayMode = useMemo(() => {
        if (!selectedCategoryId) return 'none';
        const categorySections = sections[selectedCategoryId] || [];
        return getCategoryDisplayMode(categorySections);
    }, [selectedCategoryId, sections]);

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
/**
 * 🎯 Category Hierarchy Auto-Detection Utilities
 * 
 * Este módulo implementa la lógica de auto-detección inteligente para determinar
 * si una categoría debe mostrar productos directamente (modo "simple") o 
 * mostrar secciones intermedias (modo "sections").
 * 
 * 🔗 Relacionado con: 
 * - dashboardStore.ts (usa estas funciones para adaptar el fetching)
 * - DashboardView.tsx (renderiza UI diferente según el modo detectado)
 * - MobileView.tsx (adapta navegación móvil según el modo)
 * 
 * 📋 Implementa: Checklist T32.1 - Auto-detección inteligente para jerarquía flexible
 */

import { Section } from '../types';

/**
 * Tipo que representa los modos de visualización de categorías
 */
export type CategoryDisplayMode = 'simple' | 'sections';

/**
 * 🔍 Detecta automáticamente el modo de visualización de una categoría
 * 
 * @param sections - Array de secciones pertenecientes a la categoría
 * @returns 'simple' si solo hay 1 sección (productos directos), 'sections' si hay múltiples o ninguna
 * 
 * 💡 Lógica de decisión:
 * - Si la categoría tiene 0 secciones → modo "sections" (mostrar vista vacía para agregar primera sección)
 * - Si la categoría tiene 1 sola sección → modo "simple" (ej: SNACKS con productos directos)
 * - Si la categoría tiene múltiples secciones → modo "sections" (ej: HAMBURGUESAS con tipos)
 * 
 * 🎯 Esta función es el corazón de la jerarquía flexible - permite que EN EL MISMO MENÚ
 * algunas categorías vayan directo a productos mientras otras usen secciones intermedias
 */
export const getCategoryDisplayMode = (sections: Section[]): CategoryDisplayMode => {
    // Early return para mejor legibilidad (Mandamiento #7)
    if (sections.length === 1) {
        return 'simple';
    }

    // Categorías vacías (0 secciones) o con múltiples secciones usan modo "sections"
    return 'sections';
};

/**
 * 🔍 Verifica si una categoría debe usar modo simple (productos directos)
 * 
 * @param sections - Array de secciones de la categoría
 * @returns true si la categoría debe mostrar productos directamente
 * 
 * 💭 Helper function para mejorar la legibilidad en condicionales
 */
export const isCategorySimpleMode = (sections: Section[]): boolean => {
    return getCategoryDisplayMode(sections) === 'simple';
};

/**
 * 🔍 Verifica si una categoría debe usar modo sections (jerarquía completa)
 * 
 * @param sections - Array de secciones de la categoría  
 * @returns true si la categoría debe mostrar secciones intermedias
 * 
 * 💭 Helper function para mejorar la legibilidad en condicionales
 */
export const isCategorySectionsMode = (sections: Section[]): boolean => {
    return getCategoryDisplayMode(sections) === 'sections';
}; 
/**
 * @fileoverview Tipos y interfaces para el dashboard v2
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

/**
 * Define los tipos de vista disponibles en el dashboard
 * - CATEGORIES: Vista de lista de categorías
 * - SECTIONS: Vista de secciones dentro de una categoría
 * - PRODUCTS: Vista de productos dentro de una sección
 */
export type ViewType = 'CATEGORIES' | 'SECTIONS' | 'PRODUCTS';

/**
 * Define los modos posibles al interactuar con elementos del menú
 * - VIEW: Modo de visualización normal
 * - CREATE: Modo de creación de nuevo elemento
 * - EDIT: Modo de edición de elemento existente
 * - DELETE: Modo de confirmación de eliminación
 */
export type InteractionMode = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE';

/**
 * Estado básico de carga para operaciones asíncronas
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Estado de expansión para elementos colapsables
 */
export interface ExpansionState {
  expandedCategories: { [key: number]: boolean };
  expandedSections: { [key: number]: boolean };
}

/**
 * Estado de elementos seleccionados actualmente
 */
export interface SelectionState {
  selectedCategory: number | null;
  selectedSection: number | null;
  selectedProduct: number | null;
} 
/**
 * @fileoverview Tipos comunes para la UI del dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 * 
 * Este archivo contiene los tipos e interfaces relacionados con la UI común del dashboard.
 */

/**
 * Tipo de vista del dashboard
 */
export type ViewType = 'CATEGORIES' | 'SECTIONS' | 'PRODUCTS';

/**
 * Modo de interacción con elementos
 */
export type InteractionMode = 'VIEW' | 'EDIT' | 'REORDER' | 'DELETE';

/**
 * Estado de carga para componentes
 */
export type LoadingState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

/**
 * Estado de expansión para elementos colapsables
 */
export interface ExpansionState {
  [key: number]: boolean;
}

/**
 * Estado de selección para diferentes elementos
 */
export interface SelectionState {
  selectedCategoryId: number | null;
  selectedSectionId: number | null;
  selectedProductId: number | null;
}

/**
 * Props para el componente MobilePreview
 */
export interface MobilePreviewProps {
  selectedCategory?: any | null;
  selectedSection?: any | null;
  products?: any[];
}

/**
 * Props para el componente Breadcrumbs
 */
export interface BreadcrumbsProps {
  currentView: ViewType;
  selectedCategory: any | null;
  selectedSection: any | null;
  onBackToCategories: () => void;
  onBackToSections: () => void;
} 
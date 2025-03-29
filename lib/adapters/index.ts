/**
 * Exportaciones de los adaptadores
 * 
 * Este archivo sirve como punto central para exportar todos los adaptadores
 * facilitando su importación desde otros módulos.
 */

// Exportar adaptadores de tipos de categorías
export {
  adaptHookCategoryToDashboard,
  adaptDashboardCategoryToHook,
  adaptHookCategoriesToDashboard,
  adaptDashboardCategoriesToHook
} from './category-adapter';

// Exportar adaptadores de funciones de categorías
export {
  adaptFetchCategories,
  adaptToggleCategoryVisibility,
  adaptDeleteCategory,
  adaptReorderCategory
} from './category-functions-adapter'; 
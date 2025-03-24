/**
 * Archivo de barril (barrel file) para los componentes del dashboard
 * 
 * Este archivo simplifica la importación de componentes desde un único punto,
 * permitiendo usar:
 * 
 * import { CategoriesView, SectionsView, ProductsView, ... } from './components/dashboard';
 * 
 * en lugar de importaciones individuales desde cada archivo.
 */

export { default as CategoriesView } from './CategoriesView';
export { default as SectionsView } from './SectionsView';
export { default as ProductsView } from './ProductsView';
export { default as DashboardLayout } from './DashboardLayout';
export { default as ApiStateHandler } from './ApiStateHandler'; 
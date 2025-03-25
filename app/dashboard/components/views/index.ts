/**
 * Archivo de barril (barrel file) para los componentes de vistas del dashboard
 * 
 * Este archivo simplifica la importación de componentes desde un único punto,
 * permitiendo usar:
 * 
 * import { CategoriesView, SectionsView, ProductsView } from '@/app/dashboard/components/views';
 */

export { default as CategoriesView } from './CategoriesView';
export { default as SectionsView } from './SectionsView';
export { default as ProductsView } from './ProductsView';
// CategoriesView necesita ser recuperado de su ubicación original
// export { default as CategoriesView } from './CategoriesView'; 
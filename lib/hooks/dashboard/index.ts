/**
 * Archivo barril (barrel file) para hooks relacionados con el dashboard
 * 
 * Este archivo simplifica la importación de hooks desde un único punto,
 * permitiendo usar:
 * import { 
 *   useDashboardCategories, 
 *   useDashboardSections, 
 *   useDashboardProducts,
 *   useDashboardNavigation,
 *   useDashboardModals,
 *   useDashboardService
 * } from '@/lib/hooks/dashboard';
 */

export { default as useDashboardCategories } from './useDashboardCategories';
export { default as useDashboardSections } from './useDashboardSections';
export { default as useDashboardProducts } from './useDashboardProducts';
export { default as useDashboardNavigation } from './useDashboardNavigation';
export { default as useDashboardModals } from './useDashboardModals';
export { default as useDashboardService } from './useDashboardService';
export type { DashboardView } from './useDashboardNavigation'; 
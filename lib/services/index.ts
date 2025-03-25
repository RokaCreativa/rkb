/**
 * Archivo barril (barrel file) para servicios de la aplicación
 * 
 * Este archivo simplifica la importación de servicios desde un único punto,
 * permitiendo usar:
 * import { 
 *   ApiService, 
 *   CategoryService, 
 *   SectionService,
 *   ProductService,
 *   DashboardService
 * } from '@/lib/services';
 */

export { ApiService, ApiError } from './api';
export { CategoryService } from './categoryService';
export { SectionService } from './sectionService';
export { ProductService } from './productService';
export { default as DashboardService } from './dashboardService'; 
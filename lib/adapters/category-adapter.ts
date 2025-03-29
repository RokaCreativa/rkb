/**
 * Adaptadores para la conversión de tipos de categorías
 * 
 * Este archivo contiene funciones para convertir objetos Category
 * entre diferentes formatos usados en la aplicación:
 * - Formato Dashboard: status como número (0/1)
 * - Formato Hook: status como booleano (true/false)
 */

import { Category as DashboardCategory } from '@/app/types/menu';

// Definimos la interfaz como está implementada en el hook
interface HookCategory {
  category_id: number;
  name: string;
  image: string | null;
  status: boolean; // En el hook es booleano
  display_order: number;
  client_id: number;
  sections_count?: number;
  visible_sections_count?: number;
}

/**
 * Convierte una categoría del formato del hook (con status booleano) 
 * al formato del dashboard (con status numérico)
 */
export function adaptHookCategoryToDashboard(category: HookCategory): DashboardCategory {
  return {
    category_id: category.category_id,
    name: category.name,
    image: category.image,
    status: category.status ? 1 : 0, // Convertir booleano a numérico
    display_order: category.display_order,
    client_id: category.client_id,
    sections_count: category.sections_count,
    visible_sections_count: category.visible_sections_count
  };
}

/**
 * Convierte una categoría del formato del dashboard (con status numérico) 
 * al formato del hook (con status booleano)
 */
export function adaptDashboardCategoryToHook(category: DashboardCategory): HookCategory {
  return {
    category_id: category.category_id,
    name: category.name,
    image: category.image,
    status: category.status === 1, // Convertir numérico a booleano
    display_order: category.display_order,
    client_id: category.client_id,
    sections_count: category.sections_count,
    visible_sections_count: category.visible_sections_count
  };
}

/**
 * Convierte un array de categorías del formato hook al formato dashboard
 */
export function adaptHookCategoriesToDashboard(categories: HookCategory[]): DashboardCategory[] {
  return categories.map(adaptHookCategoryToDashboard);
}

/**
 * Convierte un array de categorías del formato dashboard al formato hook
 */
export function adaptDashboardCategoriesToHook(categories: DashboardCategory[]): HookCategory[] {
  return categories.map(adaptDashboardCategoryToHook);
} 
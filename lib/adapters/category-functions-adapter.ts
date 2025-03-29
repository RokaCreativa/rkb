/**
 * Adaptadores para las funciones de gestión de categorías
 * 
 * Este archivo contiene funciones que adaptan los métodos del hook useCategories
 * para que funcionen con los tipos y convenciones del dashboard principal.
 */

import { Category } from '@/app/types/menu';
import { adaptDashboardCategoryToHook, adaptHookCategoryToDashboard } from './category-adapter';
import { toast } from 'react-hot-toast';

/**
 * Adapta la función fetchCategories del hook para funcionar con paginación
 * 
 * @param hookFetchCategories - Función original del hook
 * @returns Función adaptada compatible con el dashboard
 */
export function adaptFetchCategories(
  hookFetchCategories: () => Promise<void>,
  setIsLoading: (isLoading: boolean) => void
) {
  return async (options?: { page?: number; limit?: number }) => {
    try {
      setIsLoading(true);
      
      // Por ahora, el hook no soporta paginación, así que solo llamamos a la función base
      await hookFetchCategories();
      
      setIsLoading(false);
      
      // En una fase posterior, implementar soporte completo de paginación
      return { success: true };
    } catch (error) {
      console.error('Error en fetchCategories adaptado:', error);
      toast.error('No se pudieron cargar las categorías');
      setIsLoading(false);
      return { success: false, error };
    }
  };
}

/**
 * Adapta la función toggleCategoryVisibility del hook
 * 
 * @param hookToggleVisibility - Función original del hook
 * @returns Función adaptada compatible con el dashboard
 */
export function adaptToggleCategoryVisibility(
  hookToggleVisibility: (id: number, currentStatus: number) => Promise<void>
) {
  return async (
    categoryId: number, 
    currentVisibility: number,
    categories: Category[],
    setCategories: (categories: Category[]) => void
  ) => {
    try {
      // La función del hook ya actualiza el estado interno,
      // pero necesitamos actualizar también el estado del dashboard
      await hookToggleVisibility(categoryId, currentVisibility);
      
      // El hook ya muestra notificaciones de éxito/error
      return true;
    } catch (error) {
      console.error('Error en toggleCategoryVisibility adaptado:', error);
      return false;
    }
  };
}

/**
 * Adapta la función deleteCategory del hook
 * 
 * @param hookDeleteCategory - Función original del hook
 * @returns Función adaptada compatible con el dashboard
 */
export function adaptDeleteCategory(
  hookDeleteCategory: (id: number) => Promise<boolean>
) {
  return async (
    categoryId: number,
    setCategories: (updater: (prev: Category[]) => Category[]) => void
  ) => {
    try {
      const success = await hookDeleteCategory(categoryId);
      
      if (success) {
        // El hook ya actualiza su estado interno, pero necesitamos actualizar
        // también el estado del dashboard mientras coexistan ambos
        setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
      }
      
      return success;
    } catch (error) {
      console.error('Error en deleteCategory adaptado:', error);
      return false;
    }
  };
}

/**
 * Adapta la función reorderCategory del hook
 * 
 * @param hookReorderCategory - Función original del hook
 * @returns Función adaptada compatible con el dashboard
 */
export function adaptReorderCategory(
  hookReorderCategory: (sourceIndex: number, destinationIndex: number) => Promise<void>
) {
  return async (
    categories: Category[],
    sourceIndex: number, 
    destinationIndex: number,
    setCategories: (categories: Category[]) => void,
    setIsLoading: (isLoading: boolean) => void
  ) => {
    setIsLoading(true);
    
    try {
      // El hook ya maneja la actualización de su estado interno
      await hookReorderCategory(sourceIndex, destinationIndex);
      
      // El hook ya muestra notificaciones de éxito/error
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error en reorderCategory adaptado:', error);
      setIsLoading(false);
      return false;
    }
  };
} 
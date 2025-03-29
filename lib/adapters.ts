/**
 * @file Adaptadores para integrar los hooks con el dashboard
 * @description Este archivo contiene adaptadores que facilitan la interoperabilidad entre 
 * los hooks originales de la aplicación y el nuevo dashboard
 */

import { Category } from '@/app/types/menu';
import { Dispatch, SetStateAction } from 'react';

/**
 * Adapta las categorías del hook al formato esperado por el dashboard
 */
export function adaptHookCategoriesToDashboard(hookCategories: any[]): Category[] {
  return hookCategories.map(cat => ({
    ...cat,
    status: cat.status ? 1 : 0, // Convertir booleano a numérico
  })) as unknown as Category[];
}

/**
 * Adapta la función de fetchCategories del hook para el dashboard
 */
export function adaptFetchCategories(hookFetchCategories: Function) {
  return async () => {
    try {
      const categories = await hookFetchCategories();
      return adaptHookCategoriesToDashboard(categories);
    } catch (error) {
      console.error('Error en adaptFetchCategories:', error);
      throw error;
    }
  };
}

/**
 * Adapta la función de toggleCategoryVisibility del hook para el dashboard
 */
export function adaptToggleCategoryVisibility(hookToggleVisibility: Function) {
  return async (
    categoryId: number, 
    currentStatus: number,
    categories: Category[],
    setCategories: Dispatch<SetStateAction<Category[]>>
  ) => {
    try {
      // El hook espera un booleano para el estado actual
      const isCurrentlyVisible = currentStatus === 1;
      
      // Llamar a la función del hook
      await hookToggleVisibility(categoryId, isCurrentlyVisible);
      
      // Actualizar el estado local para mantener la UI consistente
      setCategories(
        categories.map(cat => 
          cat.category_id === categoryId 
            ? { ...cat, status: currentStatus === 1 ? 0 : 1 } 
            : cat
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error en adaptToggleCategoryVisibility:', error);
      return false;
    }
  };
}

/**
 * Adapta la función de deleteCategory del hook para el dashboard
 */
export function adaptDeleteCategory(hookDeleteCategory: Function) {
  return async (
    categoryId: number,
    setCategories: Dispatch<SetStateAction<Category[]>>
  ) => {
    try {
      // Llamar a la función del hook
      const success = await hookDeleteCategory(categoryId);
      
      if (success) {
        // Actualizar el estado local para mantener la UI consistente
        setCategories((prevCategories: Category[]) => 
          prevCategories.filter((cat: Category) => cat.category_id !== categoryId)
        );
      }
      
      return success;
    } catch (error) {
      console.error('Error en adaptDeleteCategory:', error);
      return false;
    }
  };
}

/**
 * Adapta la función de reorderCategory del hook para el dashboard
 */
export function adaptReorderCategory(hookReorderCategory: Function) {
  return async (
    categories: Category[],
    sourceIndex: number,
    destinationIndex: number,
    setCategories: Dispatch<SetStateAction<Category[]>>,
    setIsLoading: Dispatch<SetStateAction<boolean>>
  ) => {
    try {
      setIsLoading(true);
      
      // Llamar a la función del hook
      const success = await hookReorderCategory(sourceIndex, destinationIndex);
      
      if (success) {
        // Realizar la reordenación localmente
        const reorderedCategories = [...categories];
        const [movedItem] = reorderedCategories.splice(sourceIndex, 1);
        reorderedCategories.splice(destinationIndex, 0, movedItem);
        
        // Actualizar órdenes de visualización
        const updatedCategories = reorderedCategories.map((category, index) => ({
          ...category,
          display_order: index + 1
        }));
        
        // Actualizar estado local
        setCategories(updatedCategories);
      }
      
      return success;
    } catch (error) {
      console.error('Error en adaptReorderCategory:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
} 
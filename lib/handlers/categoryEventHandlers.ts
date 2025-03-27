/**
 * Controladores de eventos para categorías
 * 
 * Este módulo contiene funciones extraídas de page.tsx para gestionar 
 * los eventos relacionados con categorías en el dashboard.
 * Parte del plan de refactorización para reducir el tamaño de page.tsx.
 *
 * @module categoryEventHandlers
 */

import { toast } from 'react-hot-toast';
import { Category } from '@/lib/types';

/**
 * Maneja el reordenamiento de categorías mediante drag and drop
 * 
 * @param categories - Lista actual de categorías 
 * @param sourceIndex - Índice de origen del elemento arrastrado
 * @param destinationIndex - Índice de destino donde se suelta
 * @param setCategories - Función para actualizar el estado de categorías
 * @param setIsLoading - Función para controlar el estado de carga
 * @returns Promise que se resuelve cuando la operación está completa
 */
export const handleReorderCategory = async (
  categories: Category[],
  sourceIndex: number,
  destinationIndex: number,
  setCategories: (categories: Category[]) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  if (sourceIndex === destinationIndex) return;
  
  // Crear una copia del array de categorías
  const reorderedCategories = [...categories];
  
  // Realizar el reordenamiento localmente
  const [removed] = reorderedCategories.splice(sourceIndex, 1);
  reorderedCategories.splice(destinationIndex, 0, removed);
  
  // Actualizar el estado local inmediatamente para feedback visual
  setCategories(reorderedCategories);
  
  try {
    // Indicar que está procesando
    setIsLoading(true);
    
    // Actualizar los display_order de todas las categorías reordenadas
    const updatedCategories = reorderedCategories.map((cat, index) => ({
      ...cat,
      display_order: index + 1
    }));
    
    // Preparar datos para la API
    const updateData = updatedCategories.map(cat => ({
      id: cat.category_id,
      display_order: cat.display_order
    }));
    
    // Llamar a la API para guardar los cambios
    const response = await fetch('/api/categories/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: updateData })
    });
    
    if (!response.ok) {
      throw new Error(`Error al actualizar el orden de categorías: ${response.status} ${response.statusText}`);
    }
    
    toast.success('Orden de categorías actualizado');
  } catch (error) {
    console.error('Error al reordenar categorías:', error);
    toast.error('Error al actualizar el orden de las categorías');
    
    // Volver a cargar las categorías en caso de error
    try {
      const refreshedCategories = await reloadCategories(setCategories);
      console.log('Categorías recargadas después del error de reordenamiento');
    } catch (refreshError) {
      console.error('Error al intentar recargar categorías:', refreshError);
    }
  } finally {
    setIsLoading(false);
  }
};

/**
 * Actualiza la visibilidad de una categoría
 * 
 * @param categoryId - ID de la categoría a modificar
 * @param currentStatus - Estado actual (1 = visible, 0 = oculto)
 * @param setIsUpdatingVisibility - Función para controlar el estado de carga
 * @param setCategories - Función para actualizar el estado de categorías
 * @returns Promise que se resuelve cuando la operación está completa
 */
export const toggleCategoryVisibility = async (
  categoryId: number,
  currentStatus: number,
  setIsUpdatingVisibility: (id: number | null) => void,
  setCategories: (updater: (prev: Category[]) => Category[]) => void
) => {
  try {
    // Indicar que está procesando esta categoría específica
    setIsUpdatingVisibility(categoryId);
    
    // Optimistic UI update
    setCategories(prev => 
      prev.map(cat => 
        cat.category_id === categoryId 
          ? { ...cat, status: cat.status === 1 ? 0 : 1 } 
          : cat
      )
    );
    
    // Realizar la llamada a la API
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: currentStatus === 1 ? 0 : 1 })
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar la visibilidad');
    }
    
    // Mostrar notificación de éxito
    toast.success(`Categoría ${currentStatus === 1 ? 'oculta' : 'visible'}`);
  } catch (error) {
    console.error('Error al cambiar visibilidad:', error);
    toast.error('Error al actualizar la categoría');
    
    // Revertir el cambio en caso de error
    setCategories(prev => 
      prev.map(cat => 
        cat.category_id === categoryId 
          ? { ...cat, status: currentStatus } 
          : cat
      )
    );
  } finally {
    // Finalizar el estado de carga
    setIsUpdatingVisibility(null);
  }
};

/**
 * Elimina una categoría
 * 
 * @param categoryId - ID de la categoría a eliminar
 * @param setCategories - Función para actualizar el estado de categorías
 * @returns Promise que se resuelve cuando la operación está completa
 */
export const deleteCategory = async (
  categoryId: number,
  setCategories: (updater: (prev: Category[]) => Category[]) => void
) => {
  try {
    // Optimistic UI update
    setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
    
    // Realizar la llamada a la API
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar la categoría');
    }
    
    toast.success('Categoría eliminada correctamente');
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    toast.error('Error al eliminar la categoría');
    
    // Recargar datos en caso de error
    await reloadCategories(categories => setCategories(() => categories));
  }
};

/**
 * Función auxiliar para recargar categorías desde la API
 * 
 * @param setCategories - Función para actualizar el estado de categorías
 * @returns Promise que se resuelve con las categorías cargadas
 */
const reloadCategories = async (
  setCategories: (categories: Category[]) => void
) => {
  try {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Error al recargar categorías');
    }
    const data = await response.json();
    setCategories(data);
    return data;
  } catch (err) {
    console.error('Error al recargar categorías:', err);
    throw err;
  }
}; 
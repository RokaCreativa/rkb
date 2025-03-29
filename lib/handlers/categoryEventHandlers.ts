/**
 * Manejadores de eventos para operaciones con categorías
 */

import { Category } from '@/app/types/menu';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Manejador para reordenar categorías
 */
export async function handleReorderCategory(
  categories: Category[],
  setCategories: (updatedCategories: Category[]) => void,
  sourceIndex: number,
  destinationIndex: number,
  setIsLoading?: (isLoading: boolean) => void
) {
  if (sourceIndex === destinationIndex || !categories.length) return;
  
  if (setIsLoading) setIsLoading(true);
  
  // Realizar la reordenación localmente primero (para UI responsiva)
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
  
  try {
    // Enviar actualización al servidor
    await fetch('/api/categories/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categories: updatedCategories.map(cat => ({
          id: cat.category_id,
          display_order: cat.display_order
        }))
      }),
    });
    
    toast.success('Orden actualizado correctamente');
  } catch (error) {
    console.error('Error al reordenar categorías:', error);
    toast.error('Error al actualizar el orden');
    
    // Restaurar el orden original en caso de error
    setCategories(categories);
  } finally {
    if (setIsLoading) setIsLoading(false);
  }
}

/**
 * Manejador para alternar visibilidad de categoría
 */
export async function toggleCategoryVisibility(
  categoryId: number,
  currentStatus: number,
  categories: Category[],
  setCategories: Dispatch<SetStateAction<Category[]>>,
  setIsUpdatingVisibility?: Dispatch<SetStateAction<number | null>>
) {
  if (setIsUpdatingVisibility) setIsUpdatingVisibility(categoryId);
  const newStatus = currentStatus === 1 ? 0 : 1;
  
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar la visibilidad');
    }
    
    // Actualizar la categoría en el estado local
    setCategories(prev => prev.map(cat => 
      cat.category_id === categoryId ? { ...cat, status: newStatus } : cat
    ));
    
    toast.success(newStatus === 1 ? 'Categoría visible' : 'Categoría oculta');
  } catch (error) {
    console.error('Error al cambiar visibilidad de categoría:', error);
    toast.error('No se pudo cambiar la visibilidad');
  } finally {
    if (setIsUpdatingVisibility) setIsUpdatingVisibility(null);
  }
}

/**
 * Manejador para eliminar categoría
 */
export async function deleteCategory(
  categoryId: number,
  setCategories: Dispatch<SetStateAction<Category[]>>,
  setIsDeletingCategory?: Dispatch<SetStateAction<boolean>>
): Promise<boolean> {
  if (setIsDeletingCategory) setIsDeletingCategory(true);
  
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar la categoría');
    }
    
    // Actualizar el estado local
    setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
    
    toast.success('Categoría eliminada correctamente');
    return true;
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    toast.error('No se pudo eliminar la categoría');
    return false;
  } finally {
    if (setIsDeletingCategory) setIsDeletingCategory(false);
  }
}

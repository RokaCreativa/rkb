/**
 * @file useCategoryManagement.ts
 * @description Hook personalizado para la gestión de categorías en el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @created 2024-03-29
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Category } from '@/app/types/menu';
import { DashboardService } from '@/lib/services/dashboardService';

// Interfaz para opciones de paginación
interface PaginationOptions {
  page?: number;
  limit?: number;
}

// Interfaz para metadatos de paginación
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Hook personalizado para gestionar el estado y operaciones de categorías
 * 
 * @param initialPagination - Opciones iniciales de paginación
 * @returns Objeto con estado y funciones para gestionar categorías
 */
export const useCategoryManagement = (initialPagination?: PaginationOptions) => {
  // Estado para las categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationOptions>(initialPagination || {});
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);

  /**
   * Carga las categorías desde la API
   */
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await DashboardService.fetchCategories(pagination);
      
      // Verificar si la respuesta es paginada
      if ('data' in result && 'meta' in result) {
        setCategories(result.data as Category[]);
        setPaginationMeta(result.meta);
      } else {
        setCategories((result as any).categories || []);
        setPaginationMeta(null);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Error al cargar categorías');
      toast.error('Error al cargar las categorías');
      console.error('Error al cargar categorías:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination]);

  /**
   * Cambia la página actual de categorías
   */
  const changePage = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      page
    }));
  }, []);

  /**
   * Cambia el número de elementos por página
   */
  const changePageSize = useCallback((limit: number) => {
    setPagination(prev => ({
      ...prev,
      limit,
      page: 1 // Resetear a la primera página cuando se cambia el tamaño de página
    }));
  }, []);

  /**
   * Crea una nueva categoría
   */
  const createCategory = useCallback(async (categoryData: Partial<Category>): Promise<boolean> => {
    try {
      const result = await DashboardService.createCategory(categoryData);
      
      if (result.success) {
        toast.success('Categoría creada correctamente');
        await loadCategories(); // Recargar categorías para reflejar cambios
        return true;
      } else {
        toast.error('Error al crear la categoría');
        return false;
      }
    } catch (error) {
      console.error('Error al crear categoría:', error);
      toast.error('Error al crear la categoría');
      return false;
    }
  }, [loadCategories]);

  /**
   * Actualiza una categoría existente
   */
  const updateCategory = useCallback(async (categoryId: number, categoryData: Partial<Category>): Promise<boolean> => {
    try {
      const result = await DashboardService.updateCategory(categoryId, categoryData);
      
      if (result.success) {
        toast.success('Categoría actualizada correctamente');
        
        // Actualizar localmente para evitar recarga completa
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.category_id === categoryId ? { ...cat, ...categoryData } : cat
          )
        );
        
        return true;
      } else {
        toast.error('Error al actualizar la categoría');
        return false;
      }
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      toast.error('Error al actualizar la categoría');
      return false;
    }
  }, []);

  /**
   * Elimina una categoría
   */
  const deleteCategory = useCallback(async (categoryId: number): Promise<boolean> => {
    try {
      const result = await DashboardService.deleteCategory(categoryId);
      
      if (result.success) {
        toast.success('Categoría eliminada correctamente');
        
        // Eliminar categoría del estado local
        setCategories(prevCategories => 
          prevCategories.filter(cat => cat.category_id !== categoryId)
        );
        
        return true;
      } else {
        toast.error('Error al eliminar la categoría');
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      toast.error('Error al eliminar la categoría');
      return false;
    }
  }, []);

  /**
   * Actualiza la visibilidad de una categoría
   */
  const toggleCategoryVisibility = useCallback(async (categoryId: number, currentStatus: number): Promise<boolean> => {
    // Nuevo estado opuesto al actual (0 -> 1, 1 -> 0)
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    setIsUpdatingVisibility(categoryId);
    
    try {
      const result = await DashboardService.updateCategoryVisibility(categoryId, newStatus);
      
      if (result.category) {
        // Actualizar el estado local para reflejar el cambio
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.category_id === categoryId ? { ...cat, status: newStatus } : cat
          )
        );
        
        const statusText = newStatus === 1 ? 'visible' : 'oculta';
        toast.success(`Categoría ahora está ${statusText}`);
        return true;
      } else {
        toast.error('Error al cambiar visibilidad de la categoría');
        return false;
      }
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error);
      toast.error('Error al cambiar visibilidad de la categoría');
      return false;
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, []);

  /**
   * Reordena las categorías
   */
  const reorderCategory = useCallback(async (categoryId: number, newOrder: number): Promise<boolean> => {
    try {
      const result = await DashboardService.updateCategoryOrder(categoryId, newOrder);
      
      if (result.category) {
        // Reordenar categorías en el estado local
        // Este es un enfoque simple, podría necesitar lógica más compleja
        // dependiendo de cómo funciona el reordenamiento en tu aplicación
        setCategories(prevCategories => {
          const sorted = [...prevCategories].sort((a, b) => 
            a.category_id === categoryId 
              ? (newOrder < b.display_order ? -1 : 1)
              : b.category_id === categoryId
                ? (newOrder < a.display_order ? 1 : -1)
                : a.display_order - b.display_order
          );
          
          // Asignar nuevos órdenes
          return sorted.map((cat, index) => ({
            ...cat,
            display_order: index + 1
          }));
        });
        
        toast.success('Orden actualizado correctamente');
        return true;
      } else {
        toast.error('Error al actualizar el orden');
        return false;
      }
    } catch (error) {
      console.error('Error al reordenar categoría:', error);
      toast.error('Error al actualizar el orden');
      return false;
    }
  }, []);

  // Cargar categorías cuando cambian las opciones de paginación
  useEffect(() => {
    loadCategories();
  }, [loadCategories, pagination]);

  return {
    // Estado
    categories,
    isLoading,
    error,
    pagination,
    paginationMeta,
    isUpdatingVisibility,
    
    // Acciones
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryVisibility,
    reorderCategory,
    
    // Paginación
    changePage,
    changePageSize
  };
};

export default useCategoryManagement; 
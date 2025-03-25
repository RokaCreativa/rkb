"use client";

/**
 * @fileoverview Hook para gestionar categorías en el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 * 
 * Este hook proporciona funcionalidades para gestionar categorías,
 * incluyendo creación, actualización, eliminación y cambio de visibilidad.
 */

import { useState, useCallback, useEffect } from 'react';
import { Category } from '@/app/types/menu';
import { toast } from 'react-hot-toast';
import axios from 'axios';

/**
 * Opciones de configuración para el hook de categorías
 */
interface UseDashboardCategoriesOptions {
  /** ID del cliente propietario de las categorías */
  clientId: number | null;
  /** Función a ejecutar cuando una operación tiene éxito */
  onSuccess?: () => void;
  /** Función a ejecutar cuando una operación falla */
  onError?: (error: Error) => void;
}

/**
 * Hook para gestionar categorías en el dashboard
 * 
 * Proporciona funcionalidades para:
 * - Cargar categorías de un cliente específico
 * - Crear nuevas categorías
 * - Actualizar categorías existentes
 * - Eliminar categorías
 * - Cambiar visibilidad de categorías
 * - Reordenar categorías mediante drag and drop
 * 
 * @param options - Opciones de configuración para el hook
 * @returns Objeto con categorías y funciones para gestionarlas
 */
export default function useDashboardCategories(options: UseDashboardCategoriesOptions) {
  const { clientId, onSuccess, onError } = options;
  
  // Estados
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);

  /**
   * Carga las categorías del cliente
   */
  const fetchCategories = useCallback(async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/clients/${clientId}/categories`);
      setCategories(response.data);
      onSuccess?.();
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al cargar categorías');
      setError(error);
      onError?.(error);
      toast.error('Error al cargar las categorías');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [clientId, onSuccess, onError]);

  // Cargar categorías al iniciar si hay un clientId
  useEffect(() => {
    if (clientId) {
      fetchCategories();
    }
  }, [clientId, fetchCategories]);

  /**
   * Crea una nueva categoría
   * @param categoryData - Datos de la nueva categoría (nombre, imagen, etc.)
   * @returns La categoría creada o null si hay un error
   */
  const createCategory = useCallback(async (categoryData: Partial<Category>) => {
    if (!clientId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Agregar datos básicos
      formData.append('name', categoryData.name || '');
      formData.append('client_id', clientId.toString());
      
      // Agregar imagen si existe
      if (categoryData.image && typeof categoryData.image !== 'string') {
        formData.append('image', categoryData.image);
      }
      
      // Agregar status si existe
      if (categoryData.status !== undefined) {
        formData.append('status', categoryData.status.toString());
      }
      
      const response = await axios.post(`/api/categories`, formData);
      
      // Actualizar estado local
      const newCategory = response.data;
      setCategories(prev => [...prev, newCategory]);
      
      toast.success('Categoría creada correctamente');
      onSuccess?.();
      
      return newCategory;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al crear la categoría');
      setError(error);
      onError?.(error);
      toast.error('Error al crear la categoría');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clientId, onSuccess, onError]);

  /**
   * Actualiza una categoría existente
   * @param categoryId - ID de la categoría a actualizar
   * @param categoryData - Datos actualizados de la categoría
   * @returns true si la actualización tuvo éxito, false en caso contrario
   */
  const updateCategory = useCallback(async (categoryId: number, categoryData: Partial<Category>) => {
    if (!clientId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Agregar datos básicos si se proporcionan
      if (categoryData.name !== undefined) {
        formData.append('name', categoryData.name);
      }
      
      // Agregar imagen si existe y es un archivo (no una URL string)
      if (categoryData.image && typeof categoryData.image !== 'string') {
        formData.append('image', categoryData.image);
      }
      
      // Agregar status si se proporciona
      if (categoryData.status !== undefined) {
        formData.append('status', categoryData.status.toString());
      }
      
      await axios.patch(`/api/categories/${categoryId}`, formData);
      
      // Actualizar estado local
      setCategories(prev => prev.map(cat => 
        cat.category_id === categoryId 
          ? { ...cat, ...categoryData, image: categoryData.image || cat.image } 
          : cat
      ));
      
      toast.success('Categoría actualizada correctamente');
      onSuccess?.();
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al actualizar la categoría');
      setError(error);
      onError?.(error);
      toast.error('Error al actualizar la categoría');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clientId, onSuccess, onError]);

  /**
   * Elimina una categoría
   * @param categoryId - ID de la categoría a eliminar
   * @returns true si la eliminación tuvo éxito, false en caso contrario
   */
  const deleteCategory = useCallback(async (categoryId: number) => {
    if (!clientId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/api/categories/${categoryId}`);
      
      // Actualizar estado local
      setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
      
      toast.success('Categoría eliminada correctamente');
      onSuccess?.();
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al eliminar la categoría');
      setError(error);
      onError?.(error);
      toast.error('Error al eliminar la categoría');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clientId, onSuccess, onError]);

  /**
   * Cambia la visibilidad de una categoría
   * @param categoryId - ID de la categoría
   * @param currentStatus - Estado actual de visibilidad (1 = visible, 0 = oculto)
   * @returns true si la operación tuvo éxito, false en caso contrario
   */
  const toggleCategoryVisibility = useCallback(async (categoryId: number, currentStatus: number) => {
    if (!clientId) return false;
    
    setIsUpdatingVisibility(categoryId);
    setError(null);
    
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    try {
      await axios.patch(`/api/clients/${clientId}/categories/${categoryId}`, {
        status: newStatus
      });
      
      // Actualizar estado local
      setCategories(prev => prev.map(cat => 
        cat.category_id === categoryId ? { ...cat, status: newStatus } : cat
      ));
      
      toast.success(newStatus === 1 ? 'Categoría visible' : 'Categoría oculta');
      onSuccess?.();
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al cambiar visibilidad');
      setError(error);
      onError?.(error);
      toast.error('Error al cambiar la visibilidad');
      return false;
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, [clientId, onSuccess, onError]);

  /**
   * Reordena categorías mediante drag and drop
   * @param sourceIndex - Índice de origen
   * @param destinationIndex - Índice de destino
   * @returns true si la operación tuvo éxito, false en caso contrario
   */
  const reorderCategories = useCallback(async (sourceIndex: number, destinationIndex: number) => {
    if (!clientId || categories.length === 0) return false;
    if (sourceIndex === destinationIndex) return true;
    
    // Crear una copia del array para manipularla
    const reorderedCategories = [...categories];
    const [movedItem] = reorderedCategories.splice(sourceIndex, 1);
    reorderedCategories.splice(destinationIndex, 0, movedItem);
    
    // Actualizar el orden de visualización en la copia
    const updatedCategories = reorderedCategories.map((cat, index) => ({
      ...cat,
      display_order: index + 1
    }));
    
    // Actualizar estado local inmediatamente para UI responsiva
    setCategories(updatedCategories);
    
    try {
      // Enviar orden actualizado al servidor
      await axios.post(`/api/clients/${clientId}/categories/reorder`, {
        categories: updatedCategories.map(cat => ({
          category_id: cat.category_id,
          display_order: cat.display_order
        }))
      });
      
      onSuccess?.();
      return true;
    } catch (err) {
      // Revertir cambios en caso de error
      setCategories(categories);
      
      const error = err instanceof Error ? err : new Error('Error desconocido al reordenar');
      setError(error);
      onError?.(error);
      toast.error('Error al reordenar las categorías');
      return false;
    }
  }, [clientId, categories, onSuccess, onError]);

  return {
    categories,
    isLoading,
    error,
    isUpdatingVisibility,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryVisibility,
    reorderCategories
  };
} 
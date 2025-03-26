"use client";

/**
 * @fileoverview Hook para gestionar categorías en el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-28
 * 
 * Este hook proporciona funcionalidades para gestionar categorías,
 * incluyendo creación, actualización, eliminación y cambio de visibilidad.
 * Se ha añadido soporte para paginación (28/03/2024).
 */

import { useState, useCallback, useEffect } from 'react';
import { Category } from '@/app/types/menu';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import useDashboardService from './useDashboardService';

/**
 * Interfaz para opciones de paginación
 */
interface PaginationOptions {
  /** Número de página (comienza en 1) */
  page?: number;
  /** Elementos por página (0 = sin límite) */
  limit?: number;
}

/**
 * Interfaz para metadatos de paginación
 */
interface PaginationMeta {
  /** Número total de elementos disponibles */
  total: number;
  /** Página actual */
  page: number;
  /** Elementos por página */
  limit: number;
  /** Número total de páginas */
  totalPages: number;
}

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
  /** Opciones de paginación iniciales (opcional) */
  initialPagination?: PaginationOptions;
}

/**
 * Hook para gestionar categorías en el dashboard
 * 
 * Proporciona funcionalidades para:
 * - Cargar categorías de un cliente específico (con soporte para paginación)
 * - Crear nuevas categorías
 * - Actualizar categorías existentes
 * - Eliminar categorías
 * - Cambiar visibilidad de categorías
 * - Reordenar categorías mediante drag and drop
 * - Navegación entre páginas de categorías
 * 
 * @param options - Opciones de configuración para el hook
 * @returns Objeto con categorías, funciones para gestionarlas y metadatos de paginación
 * 
 * @example
 * // Sin paginación (comportamiento original)
 * const {
 *   categories,
 *   isLoading,
 *   createCategory
 * } = useDashboardCategories({ clientId: 123 });
 * 
 * // Con paginación
 * const {
 *   categories,
 *   paginationMeta,
 *   changePage,
 *   changePageSize,
 *   isLoading,
 *   createCategory
 * } = useDashboardCategories({
 *   clientId: 123,
 *   initialPagination: { page: 1, limit: 10 }
 * });
 */
export default function useDashboardCategories(options: UseDashboardCategoriesOptions) {
  const { clientId, onSuccess, onError, initialPagination } = options;
  
  // Obtener el servicio del dashboard (actualizado con soporte para paginación)
  const dashboardService = useDashboardService();
  
  // Estados
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  
  // Estado para paginación
  const [paginationOptions, setPaginationOptions] = useState<PaginationOptions>(initialPagination || {});
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  /**
   * Carga las categorías del cliente
   * Soporta paginación opcional
   * 
   * @returns Array de categorías cargadas
   */
  const fetchCategories = useCallback(async () => {
    if (!clientId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Usar el servicio actualizado que soporta paginación
      const result = await dashboardService.fetchCategories(paginationOptions);
      
      // Actualizar el estado con las categorías recibidas
      setCategories(result.categories);
      
      // Si hay metadatos de paginación, guardarlos
      if (result.meta) {
        setPaginationMeta(result.meta);
      } else {
        // Si no hay metadatos pero hay categorías, calcular valores aproximados
        setPaginationMeta({
          total: result.categories.length,
          page: 1,
          limit: result.categories.length,
          totalPages: 1
        });
      }
      
      onSuccess?.();
      return result.categories;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al cargar categorías');
      setError(error);
      onError?.(error);
      toast.error('Error al cargar las categorías');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [clientId, dashboardService, paginationOptions, onSuccess, onError]);

  // Cargar categorías al iniciar o cuando cambian las opciones de paginación
  useEffect(() => {
    if (clientId) {
      fetchCategories();
    }
  }, [clientId, paginationOptions, fetchCategories]);

  /**
   * Cambia a una página específica de categorías
   * 
   * @param page - Número de página a cargar (comenzando en 1)
   */
  const changePage = useCallback((page: number) => {
    if (page < 1) {
      console.error('El número de página debe ser mayor o igual a 1');
      return;
    }
    
    setPaginationOptions(prev => ({
      ...prev,
      page
    }));
  }, []);

  /**
   * Cambia el número de elementos por página
   * 
   * @param limit - Número de elementos por página (0 = sin límite)
   */
  const changePageSize = useCallback((limit: number) => {
    if (limit < 0) {
      console.error('El límite debe ser mayor o igual a 0');
      return;
    }
    
    setPaginationOptions(prev => ({
      ...prev,
      limit,
      // Resetear a página 1 cuando cambia el tamaño de página
      page: 1
    }));
  }, []);

  /**
   * Desactiva la paginación y carga todas las categorías
   */
  const loadAllCategories = useCallback(() => {
    setPaginationOptions({});
  }, []);

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
      
      // Si estamos en la primera página o sin paginación, añadir la categoría al estado
      // De lo contrario, recargar para mantener consistencia con el servidor
      if (!paginationOptions.page || paginationOptions.page === 1) {
        setCategories(prev => [...prev, newCategory]);
      } else {
        // Recargar para mantener integridad de datos
        fetchCategories();
      }
      
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
  }, [clientId, fetchCategories, paginationOptions.page, onSuccess, onError]);

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
      
      // Si estamos usando paginación y esto reduce el número total por debajo del límite de la página
      if (paginationMeta && categories.length <= 1 && paginationMeta.page > 1) {
        // Ir a la página anterior
        changePage(paginationMeta.page - 1);
      } else if (paginationMeta) {
        // Actualizar metadatos de paginación
        setPaginationMeta(prev => prev ? {
          ...prev,
          total: Math.max(0, prev.total - 1),
          totalPages: Math.max(1, Math.ceil((prev.total - 1) / prev.limit))
        } : null);
      }
      
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
  }, [clientId, categories.length, paginationMeta, changePage, onSuccess, onError]);

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
    // Propiedades relacionadas con paginación
    paginationMeta,
    paginationOptions,
    changePage,
    changePageSize,
    loadAllCategories,
    // Funciones CRUD
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryVisibility,
    reorderCategories
  };
} 
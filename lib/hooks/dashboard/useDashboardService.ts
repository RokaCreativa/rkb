/**
 * @file useDashboardService.ts
 * @description Hook para proporcionar acceso a los servicios de API del dashboard
 * @author TuNombre
 * @version 1.0.0
 * @lastUpdated 2024-03-27
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import DashboardService from '@/lib/services/dashboardService';
import { Category, Section, Product, Client } from '@/app/types/menu';

/**
 * Hook que proporciona acceso a los servicios de API del dashboard
 * con manejo de estados de carga y errores
 */
export const useDashboardService = () => {
  // Estados para tracking de operaciones en curso
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatingItems, setUpdatingItems] = useState<{
    categories: number[];
    sections: number[];
    products: number[];
  }>({
    categories: [],
    sections: [],
    products: []
  });

  /**
   * Funcion genérica para ejecutar operaciones de API con manejo de carga y errores
   */
  const executeApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    successMessage?: string,
    setLoadingState: boolean = true
  ): Promise<T | null> => {
    if (setLoadingState) setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(error.message || 'Ha ocurrido un error');
      console.error('Error en API call:', error);
      return null;
    } finally {
      if (setLoadingState) setIsLoading(false);
    }
  }, []);

  /**
   * Marca un ítem como en proceso de actualización
   */
  const markItemAsUpdating = useCallback((type: 'categories' | 'sections' | 'products', id: number) => {
    setUpdatingItems(prev => ({
      ...prev,
      [type]: [...prev[type], id]
    }));
  }, []);

  /**
   * Marca un ítem como finalizado su proceso de actualización
   */
  const markItemUpdateComplete = useCallback((type: 'categories' | 'sections' | 'products', id: number) => {
    setUpdatingItems(prev => ({
      ...prev,
      [type]: prev[type].filter(itemId => itemId !== id)
    }));
  }, []);

  /**
   * Verifica si un ítem está siendo actualizado
   */
  const isItemUpdating = useCallback((type: 'categories' | 'sections' | 'products', id: number): boolean => {
    return updatingItems[type].includes(id);
  }, [updatingItems]);

  // ----- FUNCIONES PARA DATOS DEL CLIENTE -----

  /**
   * Obtiene los datos del cliente
   */
  const fetchClientData = useCallback(async (): Promise<Client | null> => {
    const result = await executeApiCall(
      async () => DashboardService.fetchClientData(),
      undefined,
      true
    );
    
    return result?.client || null;
  }, [executeApiCall]);

  // ----- FUNCIONES PARA CATEGORÍAS -----

  /**
   * Obtiene todas las categorías
   */
  const fetchCategories = useCallback(async (): Promise<Category[]> => {
    const result = await executeApiCall(
      async () => DashboardService.fetchCategories(),
      undefined,
      true
    );
    
    return result?.categories || [];
  }, [executeApiCall]);

  /**
   * Actualiza la visibilidad de una categoría
   */
  const toggleCategoryVisibility = useCallback(async (categoryId: number, newStatus: number): Promise<Category | null> => {
    markItemAsUpdating('categories', categoryId);
    
    const result = await executeApiCall(
      async () => DashboardService.updateCategoryVisibility(categoryId, newStatus),
      newStatus === 1 ? 'Categoría visible' : 'Categoría oculta',
      false
    );
    
    markItemUpdateComplete('categories', categoryId);
    return result?.category || null;
  }, [executeApiCall, markItemAsUpdating, markItemUpdateComplete]);

  /**
   * Elimina una categoría
   */
  const deleteCategory = useCallback(async (categoryId: number): Promise<boolean> => {
    const result = await executeApiCall(
      async () => DashboardService.deleteCategory(categoryId),
      'Categoría eliminada correctamente',
      true
    );
    
    return !!result?.success;
  }, [executeApiCall]);

  /**
   * Reordena las categorías
   */
  const reorderCategories = useCallback(async (categories: Category[]): Promise<boolean> => {
    // Aquí podrías implementar la lógica para reordenar categorías
    // usando algún endpoint específico o actualizando cada categoría individualmente
    return true;
  }, []);

  // ----- FUNCIONES PARA SECCIONES -----

  /**
   * Obtiene las secciones de una categoría
   */
  const fetchSections = useCallback(async (categoryId: number): Promise<Section[]> => {
    const result = await executeApiCall(
      async () => DashboardService.fetchSections(categoryId),
      undefined,
      true
    );
    
    return result?.sections || [];
  }, [executeApiCall]);

  /**
   * Actualiza la visibilidad de una sección
   */
  const toggleSectionVisibility = useCallback(async (sectionId: number, newStatus: number): Promise<Section | null> => {
    markItemAsUpdating('sections', sectionId);
    
    const result = await executeApiCall(
      async () => DashboardService.updateSectionVisibility(sectionId, newStatus),
      newStatus === 1 ? 'Sección visible' : 'Sección oculta',
      false
    );
    
    markItemUpdateComplete('sections', sectionId);
    return result?.section || null;
  }, [executeApiCall, markItemAsUpdating, markItemUpdateComplete]);

  /**
   * Elimina una sección
   */
  const deleteSection = useCallback(async (sectionId: number): Promise<boolean> => {
    const result = await executeApiCall(
      async () => DashboardService.deleteSection(sectionId),
      'Sección eliminada correctamente',
      true
    );
    
    return !!result?.success;
  }, [executeApiCall]);

  /**
   * Reordena las secciones
   */
  const reorderSections = useCallback(async (sections: Section[]): Promise<boolean> => {
    const result = await executeApiCall(
      async () => DashboardService.reorderSections(sections),
      'Secciones reordenadas correctamente',
      true
    );
    
    return !!result?.success;
  }, [executeApiCall]);

  // ----- FUNCIONES PARA PRODUCTOS -----

  /**
   * Obtiene los productos de una sección
   */
  const fetchProducts = useCallback(async (sectionId: number): Promise<Product[]> => {
    const result = await executeApiCall(
      async () => DashboardService.fetchProducts(sectionId),
      undefined,
      true
    );
    
    return result?.products || [];
  }, [executeApiCall]);

  /**
   * Actualiza la visibilidad de un producto
   */
  const toggleProductVisibility = useCallback(async (productId: number, newStatus: number): Promise<Product | null> => {
    markItemAsUpdating('products', productId);
    
    const result = await executeApiCall(
      async () => DashboardService.updateProductVisibility(productId, newStatus),
      newStatus === 1 ? 'Producto visible' : 'Producto oculto',
      false
    );
    
    markItemUpdateComplete('products', productId);
    return result?.product || null;
  }, [executeApiCall, markItemAsUpdating, markItemUpdateComplete]);

  /**
   * Elimina un producto
   */
  const deleteProduct = useCallback(async (productId: number): Promise<boolean> => {
    const result = await executeApiCall(
      async () => DashboardService.deleteProduct(productId),
      'Producto eliminado correctamente',
      true
    );
    
    return !!result?.success;
  }, [executeApiCall]);

  /**
   * Reordena los productos
   */
  const reorderProducts = useCallback(async (products: Product[]): Promise<boolean> => {
    const result = await executeApiCall(
      async () => DashboardService.reorderProducts(products),
      'Productos reordenados correctamente',
      true
    );
    
    return !!result?.success;
  }, [executeApiCall]);

  return {
    // Estados
    isLoading,
    error,
    isItemUpdating,
    
    // Funciones para datos del cliente
    fetchClientData,
    
    // Funciones para categorías
    fetchCategories,
    toggleCategoryVisibility,
    deleteCategory,
    reorderCategories,
    
    // Funciones para secciones
    fetchSections,
    toggleSectionVisibility,
    deleteSection,
    reorderSections,
    
    // Funciones para productos
    fetchProducts,
    toggleProductVisibility,
    deleteProduct,
    reorderProducts
  };
};

export default useDashboardService; 
/**
 * @file useDashboardService.ts
 * @description Hook para proporcionar acceso a los servicios de API del dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import DashboardService from '@/lib/services/dashboardService';
import { Category, Section, Product, Client } from '@/app/types/menu';

/**
 * Hook que proporciona acceso a los servicios de API del dashboard
 * con manejo de estados de carga y errores
 * 
 * Este hook encapsula todas las operaciones de la API relacionadas con
 * el dashboard, incluyendo:
 * 
 * - Gestión de categorías (crear, actualizar, eliminar, reordenar)
 * - Gestión de secciones (crear, actualizar, eliminar, reordenar, mover)
 * - Gestión de productos (crear, actualizar, eliminar, reordenar)
 * - Manejo de estados de carga y errores
 * - Notificaciones de éxito/error mediante toast
 * 
 * @example
 * // Uso básico en un componente
 * const {
 *   createCategory,
 *   updateCategory,
 *   deleteCategory,
 *   isLoading,
 *   error
 * } = useDashboardService();
 * 
 * // Crear una nueva categoría
 * const handleSubmit = async (data) => {
 *   const success = await createCategory(data);
 *   if (success) {
 *     // Operación exitosa
 *   }
 * };
 * 
 * @returns Objeto con funciones para operaciones CRUD y estados de carga/error
 */
export const useDashboardService = () => {
  // Estados para tracking de operaciones en curso
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
      setError(error.message || 'Ha ocurrido un error');
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
   * Obtiene todas las categorías del cliente actual
   */
  const fetchCategories = useCallback(async (): Promise<Category[]> => {
    const result = await executeApiCall(
      async () => DashboardService.fetchCategories(),
      undefined,
      true
    );
    
    return result?.categories?.map(category => ({
      category_id: category.category_id,
      name: category.name,
      image: typeof category.image === 'string' ? category.image : null,
      status: category.status,
      display_order: category.display_order,
      client_id: category.client_id,
      sections_count: category.sections_count
    })) || [];
  }, [executeApiCall]);

  /**
   * Crea una nueva categoría
   * 
   * @param category - Datos de la categoría a crear
   * @param clientId - ID del cliente (opcional, se usa el cliente actual si no se proporciona)
   * @returns Promise<boolean> - true si la operación fue exitosa, false en caso de error
   * 
   * @example
   * const newCategory = {
   *   name: "Bebidas",
   *   image: "/uploads/bebidas.jpg",
   *   status: 1
   * };
   * const success = await createCategory(newCategory);
   */
  const createCategory = useCallback(async (category: Partial<Category>, clientId?: number): Promise<boolean> => {
    const result = await executeApiCall(
      async () => DashboardService.createCategory(category, clientId),
      'Categoría creada correctamente',
      true
    );
    
    return !!result?.success;
  }, [executeApiCall]);
  
  /**
   * Actualiza una categoría existente
   * 
   * @param categoryId - ID de la categoría a actualizar
   * @param data - Datos actualizados para la categoría
   * @returns Promise<boolean> - true si la operación fue exitosa, false en caso de error
   * 
   * @example
   * const updatedData = {
   *   name: "Bebidas Frías",
   *   status: 1
   * };
   * const success = await updateCategory(5, updatedData);
   */
  const updateCategory = useCallback(async (categoryId: number, data: Partial<Category>): Promise<boolean> => {
    const result = await executeApiCall(
      async () => DashboardService.updateCategory(categoryId, data),
      'Categoría actualizada correctamente',
      true
    );
    
    return !!result?.success;
  }, [executeApiCall]);
  
  /**
   * Elimina una categoría por su ID
   * 
   * Esta operación también eliminará todas las secciones y productos
   * asociados a la categoría.
   * 
   * @param categoryId - ID de la categoría a eliminar
   * @returns Promise<boolean> - true si la operación fue exitosa, false en caso de error
   * 
   * @example
   * const success = await deleteCategory(5);
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
   * Obtiene todas las secciones de una categoría
   */
  const fetchSections = useCallback(async (categoryId: number): Promise<Section[]> => {
    const result = await executeApiCall(
      async () => DashboardService.fetchSections(categoryId),
      undefined,
      true
    );
    
    return result?.sections?.map(section => ({
      section_id: section.section_id,
      name: section.name,
      image: typeof section.image === 'string' ? section.image : null,
      category_id: section.category_id,
      client_id: section.client_id,
      display_order: section.display_order,
      status: section.status,
      created_at: section.created_at,
      updated_at: section.updated_at,
      products_count: section.products_count
    })) || [];
  }, [executeApiCall]);

  /**
   * Crea una nueva sección dentro de una categoría
   * 
   * @param section - Datos de la sección a crear
   * @param categoryId - ID de la categoría a la que pertenece
   * @returns Promise<boolean> - true si la operación fue exitosa, false en caso de error
   * 
   * @example
   * const newSection = {
   *   name: "Refrescos",
   *   description: "Bebidas frías sin alcohol",
   *   status: 1
   * };
   * const success = await createSection(newSection, 5);
   */
  const createSection = useCallback(async (section: Partial<Section>, categoryId: number): Promise<boolean> => {
    const result = await executeApiCall(
      async () => DashboardService.createSection(section, categoryId),
      'Sección creada correctamente',
      true
    );
    
    return !!result?.success;
  }, [executeApiCall]);
  
  /**
   * Actualiza una sección existente
   * 
   * @param sectionId - ID de la sección a actualizar
   * @param data - Datos actualizados para la sección
   * @returns Promise<boolean> - true si la operación fue exitosa, false en caso de error
   * 
   * @example
   * const updatedData = {
   *   name: "Refrescos y Sodas",
   *   status: 1
   * };
   * const success = await updateSection(10, updatedData);
   */
  const updateSection = useCallback(async (sectionId: number, data: Partial<Section>): Promise<boolean> => {
    const result = await executeApiCall(
      async () => DashboardService.updateSection(sectionId, data),
      'Sección actualizada correctamente',
      true
    );
    
    return !!result?.success;
  }, [executeApiCall]);
  
  /**
   * Elimina una sección por su ID
   * 
   * Esta operación también eliminará todos los productos
   * asociados a la sección.
   * 
   * @param sectionId - ID de la sección a eliminar
   * @returns Promise<boolean> - true si la operación fue exitosa, false en caso de error
   * 
   * @example
   * const success = await deleteSection(10);
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
   * Obtiene todos los productos de una sección
   */
  const fetchProducts = useCallback(async (sectionId: number): Promise<Product[]> => {
    const result = await executeApiCall(
      async () => DashboardService.fetchProducts(sectionId),
      undefined,
      true
    );
    
    return result?.products?.map(product => ({
      product_id: product.product_id,
      name: product.name,
      image: typeof product.image === 'string' ? product.image : null,
      status: product.status,
      price: product.price,
      section_id: product.section_id,
      client_id: product.client_id,
      display_order: product.display_order,
      description: product.description,
      sections: product.sections
    })) || [];
  }, [executeApiCall]);

  /**
   * Crea un nuevo producto dentro de una sección
   * 
   * @param product - Datos del producto a crear
   * @param sectionId - ID de la sección a la que pertenece
   * @returns Promise<boolean> - true si la operación fue exitosa, false en caso de error
   * 
   * @example
   * const newProduct = {
   *   name: "Coca Cola",
   *   description: "Refresco de cola",
   *   price: 2.50,
   *   status: 1
   * };
   * const success = await createProduct(newProduct, 10);
   */
  const createProduct = useCallback(async (product: Partial<Product>, sectionId: number): Promise<boolean> => {
    const result = await executeApiCall(
      async () => DashboardService.createProduct(product, sectionId),
      'Producto creado correctamente',
      true
    );
    
    return !!result?.success;
  }, [executeApiCall]);
  
  /**
   * Actualiza un producto existente
   * 
   * @param productId - ID del producto a actualizar
   * @param data - Datos actualizados para el producto
   * @returns Promise<boolean> - true si la operación fue exitosa, false en caso de error
   * 
   * @example
   * const updatedData = {
   *   name: "Coca Cola Zero",
   *   price: 2.75,
   *   status: 1
   * };
   * const success = await updateProduct(15, updatedData);
   */
  const updateProduct = useCallback(async (productId: number, data: Partial<Product>): Promise<boolean> => {
    const result = await executeApiCall(
      async () => DashboardService.updateProduct(productId, data),
      'Producto actualizado correctamente',
      true
    );
    
    return !!result?.success;
  }, [executeApiCall]);
  
  /**
   * Elimina un producto por su ID
   * 
   * @param productId - ID del producto a eliminar
   * @param sectionId - ID de la sección a la que pertenece (para actualizar caché)
   * @returns Promise<boolean> - true si la operación fue exitosa, false en caso de error
   * 
   * @example
   * const success = await deleteProduct(15, 10);
   */
  const deleteProduct = useCallback(async (productId: number, sectionId?: number): Promise<boolean> => {
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

  // Retornar todas las funciones y estados
  return {
    // Estados
    isLoading,
    error,
    
    // Funciones de utilidad
    isItemUpdating,
    
    // Funciones del cliente
    fetchClientData,
    
    // Funciones de categorías
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    
    // Funciones de secciones
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    
    // Funciones de productos
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    reorderProducts
  };
};

export default useDashboardService; 
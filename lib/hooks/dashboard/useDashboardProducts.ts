"use client";

/**
 * @fileoverview Hook para gestionar productos en el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 * 
 * Este hook proporciona funcionalidades para gestionar productos,
 * incluyendo creación, actualización, eliminación y cambio de visibilidad.
 */

import { useState, useCallback } from 'react';
import { Product } from '@/app/types/menu';
import { toast } from 'react-hot-toast';
import axios from 'axios';

/**
 * Opciones de configuración para el hook de productos
 */
interface UseDashboardProductsOptions {
  /** Función a ejecutar cuando una operación tiene éxito */
  onSuccess?: () => void;
  /** Función a ejecutar cuando una operación falla */
  onError?: (error: Error) => void;
}

/**
 * Hook para gestionar productos en el dashboard
 * 
 * Proporciona funcionalidades para:
 * - Cargar productos de una sección específica
 * - Crear nuevos productos
 * - Actualizar productos existentes
 * - Eliminar productos
 * - Cambiar visibilidad de productos
 * - Reordenar productos mediante drag and drop
 * 
 * @param options - Opciones de configuración para el hook
 * @returns Objeto con productos y funciones para gestionarlos
 */
export default function useDashboardProducts(options?: UseDashboardProductsOptions) {
  // Estado para almacenar productos organizados por sección
  const [products, setProducts] = useState<Record<number, Product[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);

  /**
   * Carga los productos de una sección específica
   * @param sectionId - ID de la sección cuyos productos se desean cargar
   */
  const fetchProducts = useCallback(async (sectionId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/sections/${sectionId}/products`);
      setProducts(prev => ({
        ...prev,
        [sectionId]: response.data
      }));
      
      options?.onSuccess?.();
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al cargar productos');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al cargar los productos');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Crea un nuevo producto
   * @param productData - FormData con los datos del producto a crear
   * @returns El producto creado o null si hay un error
   */
  const createProduct = useCallback(async (productData: FormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const sectionId = productData.get('section_id') as string;
      
      if (!sectionId) {
        throw new Error('ID de sección no proporcionado');
      }

      const response = await axios.post('/api/products', productData);
      const newProduct = response.data;
      
      // Actualizar la lista local de productos
      setProducts(prev => {
        const sectionProducts = prev[parseInt(sectionId)] || [];
        return {
          ...prev,
          [sectionId]: [...sectionProducts, newProduct]
        };
      });
      
      toast.success('Producto creado con éxito');
      options?.onSuccess?.();
      
      return newProduct;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al crear el producto');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al crear el producto');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Actualiza un producto existente
   * @param productId - ID del producto a actualizar
   * @param productData - FormData con los datos actualizados
   * @returns true si la actualización tuvo éxito, false en caso contrario
   */
  const updateProduct = useCallback(async (productId: number, productData: FormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const sectionId = productData.get('section_id') as string;
      
      if (!sectionId) {
        throw new Error('ID de sección no proporcionado');
      }

      const response = await axios.put(`/api/products/${productId}`, productData);
      const updatedProduct = response.data;
      
      // Actualizar la lista local de productos
      setProducts(prev => {
        const prevSectionProducts = prev[parseInt(sectionId)] || [];
        const updatedProducts = prevSectionProducts.map(prod => 
          prod.product_id === productId ? updatedProduct : prod
        );
        
        return {
          ...prev,
          [sectionId]: updatedProducts
        };
      });
      
      toast.success('Producto actualizado con éxito');
      options?.onSuccess?.();
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al actualizar el producto');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al actualizar el producto');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Elimina un producto
   * @param productId - ID del producto a eliminar
   * @param sectionId - ID de la sección a la que pertenece el producto
   * @returns true si la eliminación tuvo éxito, false en caso contrario
   */
  const deleteProduct = useCallback(async (productId: number, sectionId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/api/products/${productId}`);
      
      // Actualizar la lista local de productos
      setProducts(prev => {
        const sectionProducts = prev[sectionId] || [];
        return {
          ...prev,
          [sectionId]: sectionProducts.filter(prod => prod.product_id !== productId)
        };
      });
      
      toast.success('Producto eliminado con éxito');
      options?.onSuccess?.();
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al eliminar el producto');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al eliminar el producto');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Cambia la visibilidad de un producto
   * @param productId - ID del producto
   * @param sectionId - ID de la sección a la que pertenece el producto
   * @param currentStatus - Estado actual de visibilidad (1 = visible, 0 = oculto)
   * @returns true si la operación tuvo éxito, false en caso contrario
   */
  const toggleProductVisibility = useCallback(async (productId: number, sectionId: number, currentStatus: number) => {
    setIsUpdatingVisibility(productId);
    setError(null);
    
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      
      await axios.patch(`/api/products/${productId}`, {
        status: newStatus
      });
      
      // Actualizar la lista local de productos
      setProducts(prev => {
        const sectionProducts = prev[sectionId] || [];
        return {
          ...prev,
          [sectionId]: sectionProducts.map(prod => 
            prod.product_id === productId ? { ...prod, status: newStatus } : prod
          )
        };
      });
      
      toast.success(newStatus === 1 ? 'Producto visible' : 'Producto oculto');
      options?.onSuccess?.();
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al cambiar visibilidad');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al cambiar la visibilidad');
      return false;
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, [options]);

  /**
   * Reordena productos mediante drag and drop
   * @param sectionId - ID de la sección 
   * @param sourceIndex - Índice de origen
   * @param destinationIndex - Índice de destino
   * @returns true si la operación tuvo éxito, false en caso contrario
   */
  const reorderProducts = useCallback(async (sectionId: number, sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return true;
    
    const sectionProducts = products[sectionId] || [];
    if (!sectionProducts.length) return false;
    
    // Crear copia para reordenar
    const reorderedProducts = [...sectionProducts];
    const [movedItem] = reorderedProducts.splice(sourceIndex, 1);
    reorderedProducts.splice(destinationIndex, 0, movedItem);
    
    // Actualizar órdenes de visualización
    const updatedProducts = reorderedProducts.map((prod, index) => ({
      ...prod,
      display_order: index + 1
    }));
    
    // Actualizar estado local inmediatamente para UI responsiva
    setProducts(prev => ({
      ...prev,
      [sectionId]: updatedProducts
    }));
    
    try {
      // Enviar al servidor
      await axios.post(`/api/sections/${sectionId}/products/reorder`, {
        products: updatedProducts.map(prod => ({
          product_id: prod.product_id,
          display_order: prod.display_order
        }))
      });
      
      options?.onSuccess?.();
      return true;
    } catch (err) {
      // Revertir cambios en caso de error
      setProducts(prev => ({
        ...prev,
        [sectionId]: sectionProducts
      }));
      
      const error = err instanceof Error ? err : new Error('Error desconocido al reordenar');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al reordenar los productos');
      return false;
    }
  }, [products, options]);

  return {
    products,
    isLoading,
    error,
    isUpdatingVisibility,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility,
    reorderProducts
  };
} 
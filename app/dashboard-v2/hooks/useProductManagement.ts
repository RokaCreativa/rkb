"use client";

/**
 * @fileoverview Hook para gestionar los productos del menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { useState, useCallback } from 'react';
import { Product } from '@/app/types/menu';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

/**
 * Hook para gestionar los productos del menú
 * 
 * Proporciona funciones para cargar, crear, actualizar y eliminar productos,
 * además de manejar estados relacionados como carga y errores.
 * 
 * @returns Funciones y estados para la gestión de productos
 */
export default function useProductManagement() {
  const { data: session } = useSession();
  // Usamos un objeto para organizar productos por sección
  const [products, setProducts] = useState<{ [key: number]: Product[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga los productos de una sección específica
   * 
   * @param sectionId ID de la sección
   * @returns Promise con los productos cargados
   */
  const fetchProductsBySection = useCallback(async (sectionId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products?section_id=${sectionId}`);
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        // Actualizamos solo los productos de esta sección
        setProducts(prev => ({
          ...prev,
          [sectionId]: data
        }));
      } else {
        throw new Error('Formato de datos incorrecto');
      }
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error al cargar los productos');
      setIsLoading(false);
      return [];
    }
  }, []);

  /**
   * Crea un nuevo producto
   * 
   * @param formData Datos del nuevo producto
   * @param sectionId ID de la sección a la que pertenece
   * @returns Promise con el producto creado o null en caso de error
   */
  const createProduct = useCallback(async (formData: FormData, sectionId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el producto');
      }
      
      const newProduct = await response.json();
      
      // Actualizamos el estado local con el nuevo producto
      setProducts(prev => {
        const sectionProducts = [...(prev[sectionId] || []), newProduct];
        return {
          ...prev,
          [sectionId]: sectionProducts
        };
      });
      
      toast.success('Producto creado correctamente');
      setIsLoading(false);
      return newProduct;
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Error al crear el producto');
      toast.error('Error al crear el producto');
      setIsLoading(false);
      return null;
    }
  }, []);

  /**
   * Actualiza un producto existente
   * 
   * @param formData Datos actualizados del producto
   * @param productId ID del producto a actualizar
   * @param sectionId ID de la sección a la que pertenece
   * @returns Promise con el producto actualizado o null en caso de error
   */
  const updateProduct = useCallback(async (formData: FormData, productId: number, sectionId: number) => {
    try {
      setIsLoading(true);
      formData.append('id', productId.toString());
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }
      
      const updatedProduct = await response.json();
      
      // Actualizamos el estado local con el producto actualizado
      setProducts(prev => {
        const sectionProducts = prev[sectionId] || [];
        const updatedProducts = sectionProducts.map(product =>
          product.product_id === productId ? updatedProduct : product
        );
        
        return {
          ...prev,
          [sectionId]: updatedProducts
        };
      });
      
      toast.success('Producto actualizado correctamente');
      setIsLoading(false);
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Error al actualizar el producto');
      toast.error('Error al actualizar el producto');
      setIsLoading(false);
      return null;
    }
  }, []);

  /**
   * Elimina un producto
   * 
   * @param productId ID del producto a eliminar
   * @param sectionId ID de la sección a la que pertenece
   * @returns Promise con resultado booleano de la operación
   */
  const deleteProduct = useCallback(async (productId: number, sectionId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }
      
      // Actualizamos el estado local eliminando el producto
      setProducts(prev => {
        const sectionProducts = prev[sectionId] || [];
        const updatedProducts = sectionProducts.filter(
          product => product.product_id !== productId
        );
        
        return {
          ...prev,
          [sectionId]: updatedProducts
        };
      });
      
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Error al eliminar el producto');
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Actualiza la visibilidad de un producto
   * 
   * @param productId ID del producto
   * @param currentStatus Estado actual de visibilidad
   * @param sectionId ID de la sección a la que pertenece
   * @returns Promise con resultado booleano de la operación
   */
  const toggleProductVisibility = useCallback(async (productId: number, currentStatus: number, sectionId: number) => {
    try {
      setIsUpdatingVisibility(productId);
      
      // Actualización optimista en UI
      const newStatus = currentStatus === 1 ? 0 : 1;
      
      // Actualizar el estado local
      setProducts(prev => {
        const sectionProducts = prev[sectionId] || [];
        const updatedProducts = sectionProducts.map(product => {
          if (product.product_id === productId) {
            return { ...product, status: newStatus };
          }
          return product;
        });
        
        return {
          ...prev,
          [sectionId]: updatedProducts
        };
      });
      
      // Enviar actualización al servidor
      const response = await fetch(`/api/products/${productId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la visibilidad');
      }
      
      setIsUpdatingVisibility(null);
      return true;
    } catch (err) {
      console.error('Error toggling product visibility:', err);
      setIsUpdatingVisibility(null);
      
      // Si ocurre un error, revertimos el cambio en el estado local
      setProducts(prev => {
        const sectionProducts = prev[sectionId] || [];
        const updatedProducts = sectionProducts.map(product => {
          if (product.product_id === productId) {
            return { ...product, status: currentStatus };
          }
          return product;
        });
        
        return {
          ...prev,
          [sectionId]: updatedProducts
        };
      });
      
      toast.error('Error al cambiar la visibilidad del producto');
      return false;
    }
  }, []);

  return {
    products,
    setProducts,
    isLoading,
    isUpdatingVisibility,
    error,
    fetchProductsBySection,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility
  };
} 
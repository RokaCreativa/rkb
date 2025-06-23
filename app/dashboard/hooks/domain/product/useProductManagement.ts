"use client";

/**
 * @fileoverview Hook para gestionar los productos del menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { useState, useCallback, useMemo } from 'react';
import { Product, ProductState, ProductActions } from '@/app/dashboard/types';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Hook de Gestión Completa de Productos (Legacy)
 *
 * 📍 UBICACIÓN: hooks/domain/product/useProductManagement.ts → Hook de Negocio Legacy
 *
 * 🎯 PORQUÉ EXISTE:
 * Hook legacy de gestión de productos que implementaba la lógica de negocio antes de la
 * centralización en dashboardStore.ts. Mantiene funcionalidades específicas de productos
 * como gestión por sección, estados de carga granulares y lógica de actualización compleja.
 * Actualmente en desuso tras migración a arquitectura Zustand unificada.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. useState local → productos organizados por sección {[sectionId]: Product[]}
 * 2. fetchProductsBySection() → carga específica por sección
 * 3. CRUD operations → fetch directo a APIs + estado local
 * 4. toggleProductVisibility() → lógica específica de visibilidad
 * 5. useMemo return → API completa para componentes
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - LEGACY: Componentes pre-refactorización V2
 * - APIS: /api/products, /api/products/[id], /api/products/[id]/visibility
 * - REEMPLAZADO POR: dashboardStore.ts (Zustand) → funcionalidad unificada
 * - SESSION: useSession() para autenticación
 *
 * 🚨 PROBLEMA RESUELTO → MIGRADO (Bitácora #35):
 * - Antes: Lógica dispersa en múltiples hooks especializados
 * - Error: Estado fragmentado, duplicación de lógica CRUD
 * - Solución: Migración completa a dashboardStore.ts (Zustand)
 * - Estado: LEGACY - mantenido para referencia histórica
 * - Fecha: 2025-01-12 - Refactorización V2 completada
 *
 * 🎯 CASOS DE USO REALES (LEGACY):
 * - Gestión productos por sección específica
 * - Estados de carga granulares por operación
 * - Lógica de cambio de sección en productos
 * - Visibilidad con re-fetch automático
 * - Organización productos por sección en estado
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS (LEGACY):
 * - products organizados por sectionId: {[sectionId]: Product[]}
 * - fetchProductsBySection() actualiza solo sección específica
 * - updateProduct() maneja cambios de sección automáticamente
 * - toggleProductVisibility() requiere re-fetch para orden correcto
 * - Estados de carga independientes por operación
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: APIs /api/products funcionales
 * - REQUIERE: useSession() para autenticación
 * - REQUIERE: Product types desde types/
 * - REEMPLAZADO POR: dashboardStore.ts + useDashboardStore()
 * - ESTADO: LEGACY - no usar en desarrollo nuevo
 *
 * 📊 PERFORMANCE (LEGACY):
 * - Estado local → sin persistencia entre re-renders
 * - Fetch granular → solo secciones necesarias
 * - useMemo → API estable para componentes
 * - Re-fetch automático → garantiza consistencia datos
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #3 (DRY): VIOLADO - duplicaba lógica dashboardStore
 * - Mandamiento #7 (Separación): CUMPLIDO - lógica separada de UI
 * - Mandamiento #2 (Actualización): MIGRADO - reemplazado por Zustand
 * - Mandamiento #1 (Contexto): LEGACY - contexto ahora en store global
 */

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
   * @returns Promise con el producto creado o null en caso de error
   */
  const createProduct = useCallback(async (formData: FormData) => {
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
      const sectionId = newProduct.section_id;

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
   * @returns Promise con el producto actualizado o null en caso de error
   */
  const updateProduct = useCallback(async (formData: FormData, productId: number) => {
    try {
      setIsLoading(true);
      formData.append('id', productId.toString());

      // Encontrar el sectionId del producto actual
      let originalSectionId: number | null = null;
      for (const [secId, productsList] of Object.entries(products)) {
        if (productsList.some(p => p.product_id === productId)) {
          originalSectionId = parseInt(secId);
          break;
        }
      }

      if (!originalSectionId) {
        throw new Error('No se encontró el producto a actualizar');
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }

      const updatedProduct = await response.json();
      const newSectionId = updatedProduct.section_id;

      // Actualizamos el estado local con el producto actualizado
      setProducts(prev => {
        // Si el producto cambió de sección
        if (originalSectionId !== newSectionId) {
          // Eliminar de la sección original
          const originalSectionProducts = prev[originalSectionId!] || [];
          const filteredOriginalProducts = originalSectionProducts.filter(
            product => product.product_id !== productId
          );

          // Añadir a la nueva sección
          const newSectionProducts = [...(prev[newSectionId] || []), updatedProduct];

          return {
            ...prev,
            [originalSectionId!]: filteredOriginalProducts,
            [newSectionId]: newSectionProducts
          };
        }
        // Si no cambió de sección, simplemente actualizamos el producto
        else {
          const sectionProducts = prev[newSectionId] || [];
          const updatedProducts = sectionProducts.map(product =>
            product.product_id === productId ? updatedProduct : product
          );

          return {
            ...prev,
            [newSectionId]: updatedProducts
          };
        }
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
  }, [products]);

  /**
   * Elimina un producto
   * 
   * @param productId ID del producto a eliminar
   * @returns Promise con resultado booleano de la operación
   */
  const deleteProduct = useCallback(async (productId: number) => {
    try {
      // Encontrar el sectionId del producto
      let sectionId: number | null = null;
      for (const [secId, productsList] of Object.entries(products)) {
        if (productsList.some(p => p.product_id === productId)) {
          sectionId = parseInt(secId);
          break;
        }
      }

      if (!sectionId) {
        throw new Error('No se encontró el producto a eliminar');
      }

      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      // Actualizamos el estado local eliminando el producto
      setProducts(prev => {
        const sectionProducts = prev[sectionId!] || [];
        const updatedProducts = sectionProducts.filter(
          product => product.product_id !== productId
        );

        return {
          ...prev,
          [sectionId!]: updatedProducts
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
  }, [products]);

  /**
   * Actualiza la visibilidad de un producto
   * 
   * @param productId ID del producto
   * @param currentStatus Estado actual de visibilidad
   * @returns Promise con resultado booleano de la operación
   */
  const toggleProductVisibility = useCallback(async (productId: number, currentStatus: number) => {
    // Encontrar el sectionId del producto para poder recargar la lista
    let sectionId: number | null = null;
    for (const [secId, productsList] of Object.entries(products)) {
      if (productsList.some(p => p.product_id === productId)) {
        sectionId = parseInt(secId);
        break;
      }
    }

    if (sectionId === null) {
      toast.error('No se pudo encontrar la sección del producto.');
      return false;
    }

    setIsUpdatingVisibility(productId);

    try {
      // CORRECCIÓN: La ruta correcta usa [id], no [productId]
      const response = await fetch(`/api/products/${productId}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: !currentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido en la API' }));
        console.error('API Error:', errorData);
        throw new Error(`Error al actualizar la visibilidad: ${errorData.error}`);
      }

      // Forzar la recarga de los productos de la sección para obtener el nuevo orden
      await fetchProductsBySection(sectionId);

      toast.success('Visibilidad actualizada');
      return true;
    } catch (err) {
      console.error('Error toggling visibility:', err);
      toast.error((err as Error).message || 'Error al cambiar la visibilidad');
      return false;
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, [products, fetchProductsBySection]);

  return useMemo(() => ({
    products,
    isLoading,
    isUpdatingVisibility,
    error,
    fetchProductsBySection,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility,
    setProducts,
  }), [
    products,
    isLoading,
    isUpdatingVisibility,
    error,
    fetchProductsBySection,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility
  ]);
} 
/**
 * @file useProductManagement.ts
 * @description Hook personalizado para la gestión de productos en el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @created 2024-03-29
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Product } from '@/app/types/menu';
import { DashboardService } from '@/lib/services/dashboardService';

/**
 * Interface para almacenar los productos organizados por sección
 */
interface ProductsBySection {
  [sectionId: string]: Product[];
}

/**
 * Hook personalizado para gestionar el estado y operaciones de productos
 * 
 * @returns Objeto con estado y funciones para gestionar productos
 */
export const useProductManagement = () => {
  // Estado para los productos (organizados por sección)
  const [products, setProducts] = useState<ProductsBySection>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [loadedSections, setLoadedSections] = useState<number[]>([]);

  /**
   * Carga los productos para una sección específica
   */
  const loadProducts = useCallback(async (sectionId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await DashboardService.fetchProducts(sectionId);
      
      // Actualizar los productos para esta sección
      setProducts(prev => ({
        ...prev,
        [sectionId]: result.products || []
      }));
      
      // Marcar esta sección como cargada
      setLoadedSections(prev => 
        prev.includes(sectionId) ? prev : [...prev, sectionId]
      );
      
      return result.products || [];
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Error al cargar productos');
      toast.error('Error al cargar los productos');
      console.error('Error al cargar productos:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo producto para una sección
   */
  const createProduct = useCallback(async (productData: Partial<Product>, sectionId: number): Promise<boolean> => {
    try {
      const result = await DashboardService.createProduct(productData, sectionId);
      
      if (result.success) {
        toast.success('Producto creado correctamente');
        await loadProducts(sectionId); // Recargar productos para reflejar cambios
        return true;
      } else {
        toast.error('Error al crear el producto');
        return false;
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
      toast.error('Error al crear el producto');
      return false;
    }
  }, [loadProducts]);

  /**
   * Actualiza un producto existente
   */
  const updateProduct = useCallback(async (productId: number, productData: Partial<Product>, sectionId: number): Promise<boolean> => {
    try {
      const result = await DashboardService.updateProduct(productId, productData);
      
      if (result.success) {
        toast.success('Producto actualizado correctamente');
        
        // Actualizar localmente para evitar recarga completa
        setProducts(prevProducts => {
          const sectionKey = sectionId.toString();
          if (!prevProducts[sectionKey]) return prevProducts;
          
          return {
            ...prevProducts,
            [sectionKey]: prevProducts[sectionKey].map(product => 
              product.product_id === productId ? { ...product, ...productData } : product
            )
          };
        });
        
        return true;
      } else {
        toast.error('Error al actualizar el producto');
        return false;
      }
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      toast.error('Error al actualizar el producto');
      return false;
    }
  }, []);

  /**
   * Elimina un producto
   */
  const deleteProduct = useCallback(async (productId: number, sectionId: number): Promise<boolean> => {
    try {
      const result = await DashboardService.deleteProduct(productId);
      
      if (result.success) {
        toast.success('Producto eliminado correctamente');
        
        // Eliminar producto del estado local
        setProducts(prevProducts => {
          const sectionKey = sectionId.toString();
          if (!prevProducts[sectionKey]) return prevProducts;
          
          return {
            ...prevProducts,
            [sectionKey]: prevProducts[sectionKey].filter(product => 
              product.product_id !== productId
            )
          };
        });
        
        return true;
      } else {
        toast.error('Error al eliminar el producto');
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar el producto');
      return false;
    }
  }, []);

  /**
   * Actualiza la visibilidad de un producto
   */
  const toggleProductVisibility = useCallback(async (productId: number, currentStatus: number, sectionId: number): Promise<boolean> => {
    // Nuevo estado opuesto al actual (0 -> 1, 1 -> 0)
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    setIsUpdatingVisibility(productId);
    
    try {
      const result = await DashboardService.updateProductVisibility(productId, newStatus);
      
      if (result.product) {
        // Actualizar el estado local para reflejar el cambio
        setProducts(prevProducts => {
          const sectionKey = sectionId.toString();
          if (!prevProducts[sectionKey]) return prevProducts;
          
          return {
            ...prevProducts,
            [sectionKey]: prevProducts[sectionKey].map(product => 
              product.product_id === productId ? { ...product, status: newStatus } : product
            )
          };
        });
        
        // Disparar evento de cambio de visibilidad de producto
        const customEvent = new CustomEvent('single-product-updated', {
          detail: {
            productId,
            sectionId,
            newStatus
          }
        });
        
        window.dispatchEvent(customEvent);
        
        const statusText = newStatus === 1 ? 'visible' : 'oculto';
        toast.success(`Producto ahora está ${statusText}`);
        return true;
      } else {
        toast.error('Error al cambiar visibilidad del producto');
        return false;
      }
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error);
      toast.error('Error al cambiar visibilidad del producto');
      return false;
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, []);

  /**
   * Reordena los productos de una sección
   */
  const reorderProducts = useCallback(async (sectionId: number, updatedProducts: Product[]): Promise<boolean> => {
    try {
      // Asegurarnos de que los productos tienen órdenes actualizados
      const productsWithOrder = updatedProducts.map((product, index) => ({
        ...product,
        display_order: index + 1
      }));
      
      const result = await DashboardService.reorderProducts(productsWithOrder);
      
      if (result.success) {
        // Actualizar el estado local con el nuevo orden
        setProducts(prevProducts => ({
          ...prevProducts,
          [sectionId]: productsWithOrder
        }));
        
        toast.success('Orden actualizado correctamente');
        return true;
      } else {
        toast.error('Error al actualizar el orden');
        return false;
      }
    } catch (error) {
      console.error('Error al reordenar productos:', error);
      toast.error('Error al actualizar el orden');
      return false;
    }
  }, []);

  /**
   * Obtiene los productos para una sección (cargando si es necesario)
   */
  const getProducts = useCallback(async (sectionId: number): Promise<Product[]> => {
    const secKey = sectionId.toString();
    
    // Si ya tenemos los productos para esta sección, devolverlos
    if (products[secKey] && loadedSections.includes(sectionId)) {
      return products[secKey];
    }
    
    // Si no, cargar los productos
    return await loadProducts(sectionId);
  }, [products, loadedSections, loadProducts]);

  return {
    // Estado
    products,
    isLoading,
    error,
    isUpdatingVisibility,
    loadedSections,
    
    // Acciones
    loadProducts,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility,
    reorderProducts
  };
};

export default useProductManagement; 
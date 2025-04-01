/**
 * Manejadores de eventos para operaciones con productos
 */

import { Product } from '@/app/types/menu';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Manejador para reordenar productos
 */
export async function handleReorderProduct(
  products: Product[],
  setProducts: (updatedProducts: Product[]) => void,
  setIsLoading?: (isLoading: boolean) => void,
  refreshProducts?: (sectionId: number) => Promise<void>,
  sourceIndex?: number, 
  destinationIndex?: number
) {
  if (!products.length) return;
  
  // Si no se proporcionan índices, no hay cambios que hacer
  if (sourceIndex === undefined || destinationIndex === undefined || sourceIndex === destinationIndex) return;
  
  if (setIsLoading) setIsLoading(true);
  
  try {
    // Realizar la reordenación localmente primero (para UI responsiva)
    const reorderedProducts = [...products];
    const [movedItem] = reorderedProducts.splice(sourceIndex, 1);
    reorderedProducts.splice(destinationIndex, 0, movedItem);
    
    // Actualizar órdenes de visualización
    const updatedProducts = reorderedProducts.map((product, index) => ({
      ...product,
      display_order: index + 1
    }));
    
    // Actualizar estado local
    setProducts(updatedProducts);
    
    // Enviar actualización al servidor
    const sectionId = products[0]?.section_id;
    
    if (!sectionId) {
      console.error('No se pudo determinar el section_id para reordenar productos');
      return;
    }
    
    await fetch('/api/products/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: updatedProducts.map(product => ({
          id: product.product_id,
          display_order: product.display_order
        }))
      }),
    });
    
    toast.success('Orden de productos actualizado');
    
    // Opcionalmente recargar productos frescos desde la API
    if (refreshProducts && sectionId) {
      await refreshProducts(sectionId);
    }
  } catch (error) {
    console.error('Error al reordenar productos:', error);
    toast.error('Error al actualizar el orden');
    
    // Restaurar orden original
    setProducts(products);
  } finally {
    if (setIsLoading) setIsLoading(false);
  }
}

/**
 * Manejador para alternar visibilidad de producto
 */
export async function toggleProductVisibility(
  productId: number,
  currentStatus: number,
  sectionId: number
) {
  const newStatus = currentStatus === 1 ? 0 : 1;
  
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar la visibilidad');
    }
    
    // Disparar un evento personalizado para que otros componentes puedan actualizarse
    window.dispatchEvent(
      new CustomEvent('single-product-updated', {
        detail: {
          productId,
          sectionId,
          newStatus
        }
      })
    );
    
    toast.success(newStatus === 1 ? 'Producto visible' : 'Producto oculto');
    return true;
  } catch (error) {
    console.error('Error al cambiar visibilidad del producto:', error);
    toast.error('No se pudo cambiar la visibilidad');
    return false;
  }
}

/**
 * Manejador para eliminar producto
 */
export async function deleteProduct(
  productId: number,
  products: Product[],
  setProducts: (updatedProducts: Product[]) => void,
  setIsDeleting?: (isDeleting: boolean) => void,
  refreshProducts?: (sectionId: number) => Promise<void>
): Promise<boolean> {
  if (setIsDeleting) setIsDeleting(true);
  
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar el producto');
    }
    
    // Actualizar el estado local
    setProducts(products.filter(product => product.product_id !== productId));
    
    // Opcionalmente recargar productos frescos desde la API
    const sectionId = products.find(p => p.product_id === productId)?.section_id;
    if (refreshProducts && sectionId) {
      await refreshProducts(sectionId);
    }
    
    toast.success('Producto eliminado correctamente');
    return true;
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    toast.error('No se pudo eliminar el producto');
    return false;
  } finally {
    if (setIsDeleting) setIsDeleting(false);
  }
}








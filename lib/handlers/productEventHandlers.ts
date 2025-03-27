/**
 * @file productEventHandlers.ts
 * @description Controladores de eventos para gestionar productos en el dashboard.
 * Este módulo contiene funciones para manejar operaciones relacionadas con productos
 * como reordenamiento, cambio de visibilidad y eliminación. Estos controladores fueron 
 * extraídos del archivo page.tsx como parte de la refactorización para reducir su tamaño.
 */

import { Product } from '@/lib/types';
import { toast } from 'react-hot-toast';
import { Dispatch, SetStateAction } from 'react';
import { Section } from '@/lib/types';

/**
 * Maneja el reordenamiento de productos mediante arrastrar y soltar.
 * Actualiza el estado local y realiza una petición a la API para persistir el cambio.
 * 
 * @param {Product[]} products - Lista actual de productos
 * @param {Function} setProducts - Función para actualizar el estado de productos
 * @param {Function} setIsUpdatingOrder - Función para actualizar el estado de carga
 * @param {Function} fetchProducts - Función para recargar los productos desde la API
 * @param {number} sourceIndex - Índice original del producto
 * @param {number} destinationIndex - Índice destino para el producto
 * @returns {Promise<void>}
 */
export const handleReorderProduct = async (
  products: Product[],
  setProducts: (products: Product[]) => void,
  setIsUpdatingOrder: (isUpdating: boolean) => void,
  fetchProducts: (sectionId: number) => Promise<void>,
  sourceIndex: number,
  destinationIndex: number
): Promise<void> => {
  if (sourceIndex === destinationIndex) return;

  const newProducts = [...products];
  const [movedProduct] = newProducts.splice(sourceIndex, 1);
  newProducts.splice(destinationIndex, 0, movedProduct);

  // Actualización optimista de la UI
  setProducts(newProducts);
  
  // Preparar datos para la API
  const reorderedProducts = newProducts.map((product, index) => ({
    product_id: product.product_id,
    display_order: index + 1
  }));

  setIsUpdatingOrder(true);
  try {
    const response = await fetch('/api/products/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products: reorderedProducts }),
    });

    if (!response.ok) {
      throw new Error('Error al reordenar los productos');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Error al reordenar los productos');
    }

    console.log('Productos reordenados correctamente');
  } catch (error) {
    console.error('Error al reordenar productos:', error);
    console.error('Error al reordenar productos. Intentando recuperar el orden original...');
    
    // Recargar productos para restaurar el orden original
    const sectionId = products[0]?.section_id;
    if (sectionId) {
      await fetchProducts(sectionId);
    }
  } finally {
    setIsUpdatingOrder(false);
  }
};

/**
 * Actualiza la visibilidad de un producto
 * 
 * @param productId - ID del producto a modificar
 * @param currentStatus - Estado actual (1 = visible, 0 = oculto)
 * @param sectionId - ID de la sección a la que pertenece el producto
 * @param categoryId - ID de la categoría a la que pertenece la sección
 * @param sections - Estado actual de las secciones y sus productos
 * @param setSections - Función para actualizar el estado de secciones
 * @returns Promise que se resuelve cuando la operación está completa
 */
export async function toggleProductVisibility(
  productId: number,
  currentStatus: number,
  sectionId: number,
  categoryId: number,
  sections: Record<string, Section[]>,
  setSections: Dispatch<SetStateAction<Record<string, Section[]>>>
): Promise<void> {
  try {
    console.log(`[DEBUG] Cambiando visibilidad de producto ${productId} en sección ${sectionId} (categoría ${categoryId}): De ${currentStatus} a ${currentStatus === 1 ? 0 : 1}`);
    
    // Validar que la sección existe
    const categoryKey = categoryId.toString();
    if (!sections[categoryKey]) {
      console.error(`[ERROR] Categoría con ID ${categoryId} no encontrada`);
      toast.error(`No se encontró la categoría con ID ${categoryId}`);
      return;
    }
    
    // Validar que la sección existe en la categoría
    const section = sections[categoryKey].find(s => s.section_id === sectionId);
    if (!section) {
      console.error(`[ERROR] Sección con ID ${sectionId} no encontrada en categoría ${categoryId}`);
      toast.error(`No se encontró la sección con ID ${sectionId}`);
      return;
    }
    
    // Validar que el producto existe en la sección
    const productExists = section.products?.some(p => p.product_id === productId);
    if (!productExists) {
      console.error(`[ERROR] Producto con ID ${productId} no encontrado en sección ${sectionId}`);
      toast.error(`No se encontró el producto con ID ${productId} en la sección ${sectionId}`);
      return;
    }
    
    // Nuevo estado de visibilidad (invertir el actual)
    const newVisibility = currentStatus === 1 ? 0 : 1;
    console.log(`[DEBUG] Nuevo estado: ${newVisibility}`);
    
    // Actualización optimista en UI
    setSections(prevSections => {
      const updatedSections = { ...prevSections };
      
      // Buscar la sección y actualizar el producto dentro de ella
      updatedSections[categoryKey] = prevSections[categoryKey].map(section => {
        if (section.section_id === sectionId) {
          return {
            ...section,
            products: section.products?.map(product =>
              product.product_id === productId
                ? { ...product, status: newVisibility }
                : product
            ) || []
          };
        }
        return section;
      });
      
      return updatedSections;
    });

    // Formatear el valor status para la API
    console.log(`[DEBUG] Enviando PATCH a /api/products/${productId} con status=${newVisibility}`);
    
    // Llamada a la API
    const response = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newVisibility }),
    });

    const data = await response.json();
    console.log(`[DEBUG] Respuesta API:`, data);

    if (!response.ok) {
      throw new Error(data.error || "Error al cambiar la visibilidad");
    }

    // Actualizar también el estado global de productos (productsFromHook) para refrescar la UI
    // Esta parte es crítica para que se refleje el cambio en la interfaz
    try {
      // Intentar obtener los productos actualizados desde la API
      const response = await fetch(`/api/products?section_id=${sectionId}`);
      if (response.ok) {
        const updatedProducts = await response.json();
        console.log(`[DEBUG] Productos actualizados obtenidos de la API:`, updatedProducts);
        
        // Disparar un evento personalizado para notificar la actualización
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('product-visibility-changed', { 
            detail: { 
              sectionId,
              products: updatedProducts
            } 
          }));
        }
      }
    } catch (refreshError) {
      console.error('[ERROR] Error al actualizar productos desde API:', refreshError);
    }

    toast.success(`El producto ahora está ${newVisibility === 1 ? "visible" : "oculto"}`);
  } catch (error) {
    console.error("[ERROR] Error en toggleProductVisibility:", error);
    
    // Revertir cambios en UI en caso de error
    setSections(prevSections => {
      const updatedSections = { ...prevSections };
      const categoryKey = categoryId.toString();
      
      // Buscar la sección y revertir el cambio del producto
      updatedSections[categoryKey] = prevSections[categoryKey].map(section => {
        if (section.section_id === sectionId) {
          return {
            ...section,
            products: section.products?.map(product =>
              product.product_id === productId
                ? { ...product, status: currentStatus }
                : product
            ) || []
          };
        }
        return section;
      });
      
      return updatedSections;
    });
    
    toast.error(`No se pudo cambiar la visibilidad: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Elimina un producto y actualiza el estado.
 * 
 * @param {number} productId - ID del producto a eliminar
 * @param {Product[]} products - Lista actual de productos
 * @param {Function} setProducts - Función para actualizar el estado de productos
 * @param {Function} setIsDeleting - Función para actualizar el estado de carga
 * @param {Function} fetchProducts - Función para recargar los productos desde la API
 * @returns {Promise<boolean>} - True si se eliminó correctamente, false en caso contrario
 */
export const deleteProduct = async (
  productId: number,
  products: Product[],
  setProducts: (products: Product[]) => void,
  setIsDeleting: (isDeleting: boolean) => void,
  fetchProducts: (sectionId: number) => Promise<void>
): Promise<boolean> => {
  setIsDeleting(true);
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el producto');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Error al eliminar el producto');
    }

    // Actualizar estado local eliminando el producto
    const updatedProducts = products.filter(product => product.product_id !== productId);
    setProducts(updatedProducts);
    
    console.log('Producto eliminado correctamente');
    return true;
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    console.error('Error al eliminar el producto');
    
    // Intentar recargar productos si hay un error
    const sectionId = products.find(p => p.product_id === productId)?.section_id;
    if (sectionId) {
      await fetchProducts(sectionId);
    }
    return false;
  } finally {
    setIsDeleting(false);
  }
};

/**
 * Recarga los productos de una sección desde la API.
 * 
 * @param {number} sectionId - ID de la sección
 * @param {Function} setProducts - Función para actualizar el estado de productos
 * @param {Function} setIsLoading - Función para actualizar el estado de carga
 * @returns {Promise<void>}
 */
export const reloadProducts = async (
  sectionId: number,
  setProducts: (products: Product[]) => void,
  setIsLoading: (isLoading: boolean) => void
): Promise<void> => {
  setIsLoading(true);
  try {
    const response = await fetch(`/api/products?section_id=${sectionId}`);
    if (!response.ok) {
      throw new Error('Error al cargar los productos');
    }
    
    const products = await response.json();
    setProducts(products);
  } catch (error) {
    console.error('Error al recargar productos:', error);
    console.error('Error al cargar los productos');
  } finally {
    setIsLoading(false);
  }
}; 
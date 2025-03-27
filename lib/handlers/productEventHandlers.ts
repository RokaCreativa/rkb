/**
 * @file productEventHandlers.ts
 * @description Controladores de eventos para gestionar productos en el dashboard.
 * Este módulo contiene funciones para manejar operaciones relacionadas con productos
 * como reordenamiento, cambio de visibilidad y eliminación. Estos controladores fueron 
 * extraídos del archivo page.tsx como parte de la refactorización para reducir su tamaño.
 */

import { Product } from '@/lib/types';
import { toast } from 'react-hot-toast';

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
 * Cambia la visibilidad de un producto (activo/inactivo).
 * Actualiza el estado local de forma optimista y luego persiste el cambio en la API.
 * 
 * @param {Product[]} products - Lista actual de productos
 * @param {Function} setProducts - Función para actualizar el estado de productos
 * @param {Function} setIsUpdatingVisibility - Función para actualizar el estado de carga
 * @param {number} productId - ID del producto a actualizar
 * @param {number} sectionId - ID de la sección a la que pertenece el producto
 * @returns {Promise<void>}
 */
export const toggleProductVisibility = async (
  products: Product[],
  setProducts: (updater: (prev: Record<string | number, Product[]>) => Record<string | number, Product[]>) => void,
  setIsUpdatingVisibility: (isUpdating: number | null) => void,
  productId: number,
  sectionId: number
): Promise<void> => {
  console.log("🔍 toggleProductVisibility - Iniciando toggle para producto:", productId);
  
  // Buscar el producto en el array
  const product = products.find(p => p.product_id === productId);
  console.log("🔍 toggleProductVisibility - Producto encontrado:", product);
  
  if (!product) {
    console.error("❌ toggleProductVisibility - Producto no encontrado en el array");
    return;
  }

  const currentStatus = product.status;
  const newStatus = currentStatus === 1 ? 0 : 1;
  console.log(`🔍 toggleProductVisibility - Cambiando estado de ${currentStatus} a ${newStatus}`);

  // Indicar que está procesando este producto específico
  setIsUpdatingVisibility(productId);
  console.log("🔍 toggleProductVisibility - Estado de carga actualizado para productId:", productId);
  
  // Actualización optimista de la UI
  setProducts(prev => {
    console.log("🔍 toggleProductVisibility - Estado previo:", prev);
    const result = {
      ...prev,
      [sectionId]: prev[sectionId]?.map(p => 
        p.product_id === productId 
          ? { ...p, status: newStatus } 
          : p
      ) || []
    };
    console.log("🔍 toggleProductVisibility - Nuevo estado calculado:", result);
    return result;
  });

  try {
    console.log(`🔍 toggleProductVisibility - Enviando solicitud PATCH a /api/products/${productId}`);
    console.log(`🔍 toggleProductVisibility - Cuerpo de la solicitud:`, { status: newStatus });
    
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    console.log(`🔍 toggleProductVisibility - Respuesta de API, status:`, response.status);
    const responseData = await response.json();
    console.log(`🔍 toggleProductVisibility - Datos de respuesta:`, responseData);

    if (!response.ok) {
      throw new Error(`Error al actualizar la visibilidad del producto: ${response.status} ${response.statusText}`);
    }

    toast.success(`Producto ${currentStatus === 1 ? 'desactivado' : 'activado'} correctamente`);
    console.log(`✅ toggleProductVisibility - Éxito: Producto ${productId} ahora tiene status=${newStatus}`);
  } catch (error) {
    console.error('❌ toggleProductVisibility - Error:', error);
    toast.error('Error al actualizar la visibilidad del producto');
    
    // Revertir cambio en la UI en caso de error
    setProducts(prev => {
      console.log("🔍 toggleProductVisibility - Revirtiendo cambios debido a error");
      return {
        ...prev,
        [sectionId]: prev[sectionId]?.map(p => 
          p.product_id === productId 
            ? { ...p, status: currentStatus } 
            : p
        ) || []
      };
    });
  } finally {
    // Finalizar el estado de carga
    setIsUpdatingVisibility(null);
    console.log("🔍 toggleProductVisibility - Estado de carga finalizado");
  }
};

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
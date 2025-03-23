import { useState, useCallback } from 'react';
import { Product } from '@/app/types/menu';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function useProducts(clientId: number | null) {
  const [products, setProducts] = useState<Record<number, Product[]>>({});
  const [isLoadingProducts, setIsLoadingProducts] = useState<Record<number, boolean>>({});
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);

  // Cargar productos para una sección específica
  const fetchProducts = useCallback(async (sectionId: number) => {
    if (!clientId) return;
    
    setIsLoadingProducts(prev => ({ ...prev, [sectionId]: true }));
    
    try {
      const response = await axios.get(`/api/clients/${clientId}/sections/${sectionId}/products`);
      setProducts(prev => ({ ...prev, [sectionId]: response.data }));
    } catch (error) {
      console.error('Error al cargar los productos:', error);
      toast.error('No se pudieron cargar los productos');
    } finally {
      setIsLoadingProducts(prev => ({ ...prev, [sectionId]: false }));
    }
  }, [clientId]);

  // Alternar visibilidad de un producto
  const toggleProductVisibility = useCallback(async (productId: number, currentStatus: number) => {
    if (!clientId) return;
    
    setIsUpdatingVisibility(productId);
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    try {
      await axios.patch(`/api/clients/${clientId}/products/${productId}`, {
        status: newStatus
      });
      
      // Actualizar el estado local
      setProducts(prev => {
        const updatedProducts = { ...prev };
        
        // Buscar el producto en todas las secciones y actualizarlo
        Object.keys(updatedProducts).forEach(sectionId => {
          updatedProducts[Number(sectionId)] = updatedProducts[Number(sectionId)].map(prod => 
            prod.product_id === productId ? { ...prod, status: newStatus } : prod
          );
        });
        
        return updatedProducts;
      });
      
      toast.success(newStatus === 1 ? 'Producto visible' : 'Producto oculto');
    } catch (error) {
      console.error('Error al cambiar la visibilidad:', error);
      toast.error('No se pudo cambiar la visibilidad');
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, [clientId]);

  // Crear un nuevo producto
  const createProduct = useCallback(async (sectionId: number, productData: Partial<Product>) => {
    if (!clientId) return null;
    
    try {
      const formData = new FormData();
      
      // Agregar datos básicos
      formData.append('name', productData.name || '');
      formData.append('section_id', sectionId.toString());
      formData.append('client_id', clientId.toString());
      formData.append('price', productData.price?.toString() || '0');
      
      if (productData.description) {
        formData.append('description', productData.description);
      }
      
      // Agregar imagen si existe
      if (productData.image && typeof productData.image !== 'string') {
        formData.append('image', productData.image);
      }
      
      const response = await axios.post(`/api/clients/${clientId}/products`, formData);
      
      // Actualizar estado local
      const newProduct = response.data;
      setProducts(prev => ({
        ...prev,
        [sectionId]: [...(prev[sectionId] || []), newProduct]
      }));
      
      toast.success('Producto creado correctamente');
      return newProduct;
    } catch (error) {
      console.error('Error al crear el producto:', error);
      toast.error('No se pudo crear el producto');
      return null;
    }
  }, [clientId]);

  // Actualizar un producto existente
  const updateProduct = useCallback(async (sectionId: number, productId: number, productData: Partial<Product>) => {
    if (!clientId) return false;
    
    try {
      const formData = new FormData();
      
      // Agregar datos básicos si se proporcionan
      if (productData.name !== undefined) {
        formData.append('name', productData.name);
      }
      
      if (productData.price !== undefined) {
        formData.append('price', productData.price.toString());
      }
      
      if (productData.description !== undefined) {
        formData.append('description', productData.description);
      }
      
      // Agregar imagen si existe y es un archivo (no una URL string)
      if (productData.image && typeof productData.image !== 'string') {
        formData.append('image', productData.image);
      }
      
      await axios.patch(`/api/clients/${clientId}/products/${productId}`, formData);
      
      // Actualizar estado local
      setProducts(prev => ({
        ...prev,
        [sectionId]: prev[sectionId].map(prod => 
          prod.product_id === productId 
            ? { ...prod, ...productData, image: productData.image || prod.image }
            : prod
        )
      }));
      
      toast.success('Producto actualizado correctamente');
      return true;
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      toast.error('No se pudo actualizar el producto');
      return false;
    }
  }, [clientId]);

  // Eliminar un producto
  const deleteProduct = useCallback(async (sectionId: number, productId: number) => {
    if (!clientId) return false;
    
    try {
      await axios.delete(`/api/clients/${clientId}/products/${productId}`);
      
      // Actualizar estado local
      setProducts(prev => ({
        ...prev,
        [sectionId]: prev[sectionId].filter(prod => prod.product_id !== productId)
      }));
      
      toast.success('Producto eliminado correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      toast.error('No se pudo eliminar el producto');
      return false;
    }
  }, [clientId]);

  // Reordenar productos dentro de una sección
  const reorderProduct = useCallback(async (sectionId: number, sourceIndex: number, destinationIndex: number) => {
    if (!clientId || !products[sectionId] || products[sectionId].length === 0) return;
    
    // Crear una copia del array para manipularla
    const reorderedProducts = [...products[sectionId]];
    const [movedItem] = reorderedProducts.splice(sourceIndex, 1);
    reorderedProducts.splice(destinationIndex, 0, movedItem);
    
    // Actualizar el orden de visualización en la copia
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
      // Enviar orden actualizado al servidor
      await axios.post(`/api/clients/${clientId}/products/reorder`, {
        products: updatedProducts.map(prod => ({
          product_id: prod.product_id,
          display_order: prod.display_order
        }))
      });
      
      toast.success('Orden actualizado correctamente');
    } catch (error) {
      console.error('Error al reordenar productos:', error);
      toast.error('No se pudo actualizar el orden');
      
      // Restaurar el estado original en caso de error
      setProducts(prev => ({
        ...prev,
        [sectionId]: products[sectionId]
      }));
    }
  }, [clientId, products]);

  // Limpiar productos cargados para una sección específica
  const clearProducts = useCallback((sectionId: number) => {
    setProducts(prev => {
      const updated = { ...prev };
      delete updated[sectionId];
      return updated;
    });
  }, []);

  return {
    products,
    isLoadingProducts,
    isUpdatingVisibility,
    fetchProducts,
    toggleProductVisibility,
    createProduct,
    updateProduct,
    deleteProduct,
    reorderProduct,
    clearProducts
  };
} 
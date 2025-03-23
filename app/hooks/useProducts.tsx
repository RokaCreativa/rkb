import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Product } from '../types/menu';

interface UseProductsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function useProducts(options?: UseProductsOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Cargar productos por sección
  const fetchProducts = async (sectionId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/products?section_id=${sectionId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }
      
      const data = await response.json();
      setProducts(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al cargar productos');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al cargar los productos');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Crear un nuevo producto
  const createProduct = async (productData: FormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: productData,
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el producto');
      }
      
      const newProduct = await response.json();
      
      // Actualizar la lista local de productos
      setProducts(prev => [...prev, newProduct]);
      
      toast.success('Producto creado con éxito');
      options?.onSuccess?.();
      
      return newProduct;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al crear el producto');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al crear el producto');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar un producto existente
  const updateProduct = async (productData: FormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const productId = productData.get('product_id');
      
      if (!productId) {
        throw new Error('ID de producto no proporcionado');
      }
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: productData,
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }
      
      const updatedProduct = await response.json();
      
      // Actualizar la lista local de productos
      setProducts(prev => 
        prev.map(product => 
          product.product_id === updatedProduct.product_id 
            ? updatedProduct 
            : product
        )
      );
      
      toast.success('Producto actualizado con éxito');
      options?.onSuccess?.();
      
      return updatedProduct;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al actualizar el producto');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al actualizar el producto');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar un producto
  const deleteProduct = async (productId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }
      
      // Actualizar la lista local de productos
      setProducts(prev => prev.filter(product => product.product_id !== productId));
      
      toast.success('Producto eliminado con éxito');
      options?.onSuccess?.();
      
      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al eliminar el producto');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al eliminar el producto');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar la visibilidad de un producto
  const toggleProductVisibility = async (productId: number, currentStatus: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          status: currentStatus === 1 ? 0 : 1
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la visibilidad');
      }
      
      const updatedProduct = await response.json();
      
      // Actualizar la lista local de productos
      setProducts(prev => 
        prev.map(product => 
          product.product_id === productId 
            ? { ...product, status: currentStatus === 1 ? 0 : 1 } 
            : product
        )
      );
      
      toast.success('Estado actualizado correctamente');
      options?.onSuccess?.();
      
      return updatedProduct;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al actualizar la visibilidad');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al actualizar el estado');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar el orden de los productos mediante drag and drop
  const reorderProducts = async (products: Product[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Actualizar los display_order de todos los productos reordenados
      const reorderedProducts = products.map((product, index) => ({
        ...product,
        display_order: index + 1,
      }));
      
      // Actualizar el estado local inmediatamente para mejor UX
      setProducts(reorderedProducts);
      
      // Enviar los cambios al servidor
      const updatePromises = reorderedProducts.map(product => 
        fetch(`/api/products/${product.product_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            display_order: product.display_order,
            name: product.name,
            section_id: product.section_id,
            client_id: product.client_id,
            image: product.image || null,
            status: product.status,
            price: product.price,
            description: product.description || null
          }),
        })
      );
      
      await Promise.all(updatePromises);
      toast.success('Orden de productos actualizado');
      options?.onSuccess?.();
      
      return reorderedProducts;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al reordenar productos');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al actualizar el orden de los productos');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility,
    reorderProducts
  };
} 
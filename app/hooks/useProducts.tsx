import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Product } from '../types/menu';

interface UseProductsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function useProducts(options?: UseProductsOptions) {
  const [products, setProducts] = useState<Record<string, Product[]>>({});
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
      // Guardar en el estado como un objeto con la sectionId como clave
      setProducts(prev => ({
        ...prev,
        [sectionId]: data
      }));
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
      const sectionId = productData.get('section_id') as string;
      
      if (!sectionId) {
        throw new Error('ID de sección no proporcionado');
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: productData,
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el producto');
      }
      
      const newProduct = await response.json();
      
      // Actualizar la lista local de productos
      setProducts(prev => {
        const sectionProducts = prev[sectionId] || [];
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
      const productId = productData.get('product_id') as string;
      const sectionId = productData.get('section_id') as string;
      
      if (!productId) {
        throw new Error('ID de producto no proporcionado');
      }
      
      if (!sectionId) {
        throw new Error('ID de sección no proporcionado');
      }
      
      const response = await fetch(`/api/products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: parseInt(productId),
          name: productData.get('name'),
          price: parseFloat(productData.get('price') as string),
          description: productData.get('description') || '',
          client_id: parseInt(productData.get('client_id') as string),
          // Manejar la imagen separadamente si es un archivo
          image: productData.get('image') instanceof File ? null : productData.get('image')
        }),
      });
      
      // Si hay un archivo de imagen, enviarlo en una petición separada
      let updatedImage = null;
      const imageFile = productData.get('image');
      if (imageFile instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append('product_id', productId);
        imageFormData.append('image', imageFile);
        
        const imageResponse = await fetch('/api/products/upload-image', {
          method: 'POST',
          body: imageFormData,
        });
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          updatedImage = imageData.image;
        }
      }
      
      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }
      
      const updatedProduct = await response.json();
      
      // Si se actualizó la imagen en una petición separada, añadirla al producto actualizado
      if (updatedImage) {
        updatedProduct.image = updatedImage;
      }
      
      // Actualizar la lista local de productos
      setProducts(prev => {
        if (!prev[sectionId]) return prev;
        
        return {
          ...prev,
          [sectionId]: prev[sectionId].map(product => 
            product.product_id === parseInt(productId) 
              ? updatedProduct 
              : product
          )
        };
      });
      
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
  const deleteProduct = async (productId: number, sectionId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/products`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: productId })
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }
      
      // Actualizar la lista local de productos
      setProducts(prev => {
        if (!prev[sectionId]) return prev;
        
        return {
          ...prev,
          [sectionId]: prev[sectionId].filter(product => product.product_id !== productId)
        };
      });
      
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
  const toggleProductVisibility = async (productId: number, currentStatus: number, sectionId: number) => {
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
      setProducts(prev => {
        if (!prev[sectionId]) return prev;
        
        return {
          ...prev,
          [sectionId]: prev[sectionId].map(product => 
            product.product_id === productId 
              ? { ...product, status: currentStatus === 1 ? 0 : 1 } 
              : product
          )
        };
      });
      
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
  const reorderProducts = async (productsToReorder: Product[], sectionId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Actualizar los display_order de todos los productos reordenados
      const reorderedProducts = productsToReorder.map((product, index) => ({
        ...product,
        display_order: index + 1,
      }));
      
      // Actualizar el estado local inmediatamente para mejor UX
      setProducts(prev => ({
        ...prev,
        [sectionId]: reorderedProducts
      }));
      
      // Enviar los cambios al servidor
      const updatePromises = reorderedProducts.map(product => 
        fetch(`/api/products`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            product_id: product.product_id,
            display_order: product.display_order
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
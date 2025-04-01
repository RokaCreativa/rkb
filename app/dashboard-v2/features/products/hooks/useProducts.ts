import { useEffect } from 'react';
import { useDashboardStore } from '../../../core/store/useDashboardStore';
import { apiClient } from '../../../infrastructure/api/apiClient';
import { Product } from '../../../core/types';

export const useProducts = (sectionId: number) => {
  const {
    products,
    setProducts,
    setLoading,
    setError,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useDashboardStore();

  // Cargar productos cuando cambie la sección
  useEffect(() => {
    const loadProducts = async () => {
      if (!sectionId) return;

      try {
        setLoading(true);
        const data = await apiClient.getProducts(sectionId);
        setProducts(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [sectionId, setProducts, setLoading, setError]);

  const handleCreateProduct = async (product: Omit<Product, 'product_id'>) => {
    try {
      setLoading(true);
      const newProduct = await apiClient.createProduct(product);
      addProduct(newProduct);
      return newProduct;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear el producto');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      setLoading(true);
      const updatedProduct = await apiClient.updateProduct(product);
      updateProduct(updatedProduct);
      return updatedProduct;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar el producto');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      setLoading(true);
      await apiClient.deleteProduct(productId);
      deleteProduct(productId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar el producto');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos por sección
  const sectionProducts = products.filter(product => product.section_id === sectionId);

  return {
    products: sectionProducts,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  };
}; 
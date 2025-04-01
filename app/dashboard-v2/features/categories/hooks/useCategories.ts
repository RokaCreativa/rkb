import { useEffect } from 'react';
import { useDashboardStore } from '../../../core/store/useDashboardStore';
import { apiClient } from '../../../infrastructure/api/apiClient';
import { Category } from '../../../core/types';

export const useCategories = () => {
  const {
    categories,
    setCategories,
    setLoading,
    setError,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useDashboardStore();

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getCategories();
        setCategories(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al cargar las categorías');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [setCategories, setLoading, setError]);

  const handleCreateCategory = async (category: Omit<Category, 'category_id'>) => {
    try {
      setLoading(true);
      const newCategory = await apiClient.createCategory(category);
      addCategory(newCategory);
      return newCategory;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear la categoría');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    try {
      setLoading(true);
      const updatedCategory = await apiClient.updateCategory(category);
      updateCategory(updatedCategory);
      return updatedCategory;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar la categoría');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      setLoading(true);
      await apiClient.deleteCategory(categoryId);
      deleteCategory(categoryId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar la categoría');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  };
}; 
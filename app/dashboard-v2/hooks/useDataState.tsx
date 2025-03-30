"use client";

import { useState, useCallback, useEffect } from 'react';
import { Category, Section, Product, Client } from '@/app/types/menu';
import { toast } from 'react-hot-toast';
import useCategories from '@/app/hooks/useCategories';
import useSections from '@/app/hooks/useSections';
import useProducts from '@/app/hooks/useProducts';

/**
 * Hook personalizado para gestionar los datos y las operaciones del dashboard
 */
export default function useDataState(clientId: number | null = null) {
  // Estados de datos principales
  const [client, setClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(true);
  const [isSectionsLoading, setIsSectionsLoading] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Integración con hooks específicos de la aplicación
  const { 
    categories: categoriesFromHook,
    isLoadingCategories,
    fetchCategories: fetchCategoriesHook,
    toggleCategoryVisibility: toggleCategoryVisibilityHook,
    deleteCategory: deleteCategoryHook
  } = useCategories(clientId || client?.id || null);
  
  const {
    sections: sectionsFromHook,
    fetchSections: fetchSectionsHook,
    deleteSection: deleteSectionHook,
    updateSection
  } = useSections(clientId || client?.id || null);
  
  const {
    products: productsFromHook,
    fetchProducts: fetchProductsHook,
    deleteProduct,
    updateProduct,
    toggleProductVisibility
  } = useProducts({
    onSuccess: () => {
      // Podemos usar este callback para acciones adicionales tras operaciones exitosas
    }
  });
  
  // Cargar datos del cliente
  const fetchClientData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/client');
      if (!response.ok) {
        throw new Error(`Error al cargar datos del cliente: ${response.status} ${response.statusText}`);
      }
      
      const clientData = await response.json();
      setClient(clientData);
      return clientData;
    } catch (error) {
      console.error('Error en fetchClientData:', error);
      setError('Error al cargar datos del cliente');
      toast.error('No se pudieron cargar los datos del cliente');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Cargar categorías (con soporte para paginación)
  const fetchCategories = useCallback(async (options?: { page?: number; limit?: number }) => {
    // Evitar cargas duplicadas si ya estamos usando el hook
    if (categoriesFromHook && categoriesFromHook.length > 0) {
      console.log('Datos ya cargados, evitando recarga duplicada');
      return categoriesFromHook;
    }
    
    try {
      setIsLoading(true);
      let url = '/api/categories';
      
      // Añadir parámetros de paginación si se proporcionan
      if (options?.page || options?.limit) {
        const params = new URLSearchParams();
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        url = `${url}?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al cargar categorías: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setCategories(data);
      return data;
    } catch (error) {
      console.error('Error en fetchCategories:', error);
      setError('Error al cargar categorías');
      toast.error('No se pudieron cargar las categorías');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [categoriesFromHook]);
  
  // Cargar secciones para una categoría específica
  const fetchSectionsByCategory = useCallback(async (categoryId: number) => {
    // Validación básica
    if (!categoryId) {
      console.warn("fetchSectionsByCategory: Se llamó sin categoryId válido");
      return [];
    }
    
    // Siempre mostramos log para depuración
    console.log(`Cargando secciones para categoría ${categoryId}...`);
    
    try {
      setIsSectionsLoading(true);
      const response = await fetch(`/api/sections?category_id=${categoryId}`);
      if (!response.ok) {
        throw new Error(`Error al cargar secciones: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Secciones cargadas para categoría ${categoryId}:`, data.length);
      
      // Actualizar el estado global
      setSections(prev => ({
        ...prev,
        [categoryId]: data
      }));
      
      return data;
    } catch (error) {
      console.error('Error en fetchSectionsByCategory:', error);
      setError('Error al cargar secciones');
      toast.error('No se pudieron cargar las secciones');
      throw error;
    } finally {
      setIsSectionsLoading(false);
    }
  }, []);
  
  // Cargar productos para una sección específica
  const fetchProductsBySection = useCallback(async (sectionId: number) => {
    // Si la sección no existe o ya tenemos cargados sus productos, evitar carga duplicada
    if (!sectionId || (products[sectionId] && products[sectionId].length > 0)) {
      return products[sectionId] || [];
    }
    
    try {
      const response = await fetch(`/api/products?section_id=${sectionId}`);
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }
      
      const data = await response.json();
      setProducts(prev => ({
        ...prev,
        [sectionId]: data
      }));
      
      return data;
    } catch (error) {
      console.error('Error en fetchProductsBySection:', error);
      setError('Error al cargar productos');
      toast.error('No se pudieron cargar los productos');
      throw error;
    }
  }, [products]);
  
  // Alternar visibilidad de una categoría
  const toggleCategoryVisibility = useCallback(async (categoryId: number, currentStatus: number) => {
    if (!client?.id) return;
    
    setIsUpdatingVisibility(categoryId);
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    try {
      // Si disponemos del hook específico, usarlo
      if (toggleCategoryVisibilityHook) {
        await toggleCategoryVisibilityHook(categoryId, currentStatus);
        return;
      }
      
      // Si no, implementación tradicional
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la visibilidad');
      }
      
      // Actualizar la categoría en el estado local
      setCategories(prev => prev.map(cat => 
        cat.category_id === categoryId ? { ...cat, status: newStatus } : cat
      ));
      
      toast.success(newStatus === 1 ? 'Categoría visible' : 'Categoría oculta');
    } catch (error) {
      console.error('Error al cambiar visibilidad de categoría:', error);
      toast.error('No se pudo cambiar la visibilidad');
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, [client?.id, toggleCategoryVisibilityHook]);
  
  // Función para eliminar una categoría
  const handleDeleteCategory = useCallback(async (categoryId: number): Promise<boolean> => {
    if (!client?.id) return false;
    
    try {
      // Si disponemos del hook específico, usarlo
      if (deleteCategoryHook) {
        return await deleteCategoryHook(categoryId);
      }
      
      // Si no, implementación tradicional
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la categoría');
      }
      
      // Actualizar el estado local para eliminar la categoría
      setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
      
      toast.success('Categoría eliminada correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      toast.error('No se pudo eliminar la categoría');
      return false;
    }
  }, [client?.id, deleteCategoryHook]);
  
  // Reordenar categorías mediante drag and drop
  const reorderCategory = useCallback(async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex || !categories.length) return;
    
    setIsUpdatingOrder(true);
    
    // Realizar la reordenación localmente primero (para UI responsiva)
    const reorderedCategories = [...categories];
    const [movedItem] = reorderedCategories.splice(sourceIndex, 1);
    reorderedCategories.splice(destinationIndex, 0, movedItem);
    
    // Actualizar órdenes de visualización
    const updatedCategories = reorderedCategories.map((category, index) => ({
      ...category,
      display_order: index + 1
    }));
    
    // Actualizar estado local
    setCategories(updatedCategories);
    
    try {
      // Enviar actualización al servidor
      await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: updatedCategories.map(cat => ({
            id: cat.category_id,
            display_order: cat.display_order
          }))
        }),
      });
      
      toast.success('Orden actualizado correctamente');
    } catch (error) {
      console.error('Error al reordenar categorías:', error);
      toast.error('Error al actualizar el orden');
      
      // Restaurar el orden original en caso de error
      setCategories(categories);
    } finally {
      setIsUpdatingOrder(false);
    }
  }, [categories]);
  
  // Efecto para cargar datos del cliente al inicializar el hook
  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId, fetchClientData]);
  
  return {
    // Estados
    client,
    categories: categoriesFromHook && categoriesFromHook.length > 0 ? categoriesFromHook : categories,
    sections: sectionsFromHook || sections,
    products: productsFromHook || products,
    isLoading: isLoading || isLoadingCategories,
    isSectionsLoading,
    isUpdatingVisibility,
    isUpdatingOrder,
    error,
    
    // Acciones
    setClient,
    setCategories,
    setSections,
    setProducts,
    setIsLoading,
    setIsSectionsLoading,
    setIsUpdatingVisibility,
    setIsUpdatingOrder,
    setError,
    
    // Funciones de carga de datos
    fetchClientData,
    fetchCategories,
    fetchSectionsByCategory,
    fetchProductsBySection,
    
    // Funciones de actualización
    toggleCategoryVisibility,
    deleteCategory: handleDeleteCategory,
    reorderCategory,
    deleteSection: deleteSectionHook,
    updateSection,
    toggleProductVisibility,
    deleteProduct,
    updateProduct
  };
} 
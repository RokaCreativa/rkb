"use client";

import { useState, useCallback, useEffect } from 'react';
import { Category } from '@/app/types/menu';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function useCategories(clientId: number | null) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);

  // Cargar categorías desde la API
  const fetchCategories = useCallback(async () => {
    if (!clientId) return;
    
    setIsLoadingCategories(true);
    try {
      const response = await axios.get(`/api/clients/${clientId}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error al cargar las categorías:', error);
      toast.error('No se pudieron cargar las categorías');
    } finally {
      setIsLoadingCategories(false);
    }
  }, [clientId]);

  // Cargar categorías al iniciar o cambiar el clientId
  useEffect(() => {
    if (clientId) {
      fetchCategories();
    }
  }, [clientId, fetchCategories]);

  // Alternar visibilidad de una categoría
  const toggleCategoryVisibility = useCallback(async (categoryId: number, currentStatus: number) => {
    if (!clientId) return;
    
    setIsUpdatingVisibility(categoryId);
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    try {
      await axios.patch(`/api/clients/${clientId}/categories/${categoryId}`, {
        status: newStatus
      });
      
      setCategories(prev => prev.map(cat => 
        cat.category_id === categoryId ? { ...cat, status: newStatus } : cat
      ));
      
      toast.success(newStatus === 1 ? 'Categoría visible' : 'Categoría oculta');
    } catch (error) {
      console.error('Error al cambiar la visibilidad:', error);
      toast.error('No se pudo cambiar la visibilidad');
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, [clientId]);

  // Crear una nueva categoría
  const createCategory = useCallback(async (categoryData: Partial<Category>) => {
    if (!clientId) return null;
    
    try {
      const formData = new FormData();
      
      // Agregar datos básicos
      formData.append('name', categoryData.name || '');
      formData.append('client_id', clientId.toString());
      
      // Agregar imagen si existe
      if (categoryData.image && typeof categoryData.image !== 'string') {
        formData.append('image', categoryData.image);
      }
      
      // Agregar status si existe
      if (categoryData.status !== undefined) {
        formData.append('status', categoryData.status ? '1' : '0');
      }
      
      console.log('Enviando datos a API:', {
        endpoint: '/api/categories',
        clientId,
        name: categoryData.name,
        hasImage: !!categoryData.image,
        imageType: categoryData.image ? typeof categoryData.image : null
      });
      
      // Registrar el contenido del FormData para depuración
      console.log('FormData enviado a la API:');
      for (const pair of formData.entries()) {
        console.log(`- ${pair[0]}: ${typeof pair[1] === 'object' ? 'File object' : pair[1]}`);
      }
      
      const response = await axios.post(`/api/categories`, formData);
      
      // Actualizar estado local
      const newCategory = response.data;
      setCategories(prev => [...prev, newCategory]);
      
      toast.success('Categoría creada correctamente');
      return newCategory;
    } catch (error: any) {
      console.error('Error al crear la categoría:', error);
      
      // Intentar extraer más detalles del error
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'No se pudo crear la categoría';
      
      // Registrar detalles técnicos para depuración
      if (error.response) {
        console.error('Detalles del error de respuesta:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('Error de solicitud (no se recibió respuesta):', error.request);
      }
      
      toast.error(errorMessage);
      return null;
    }
  }, [clientId]);

  // Actualizar una categoría existente
  const updateCategory = useCallback(async (categoryId: number, categoryData: Partial<Category>) => {
    if (!clientId) return false;
    
    try {
      const formData = new FormData();
      
      // Agregar datos básicos si se proporcionan
      if (categoryData.name !== undefined) {
        formData.append('name', categoryData.name);
      }
      
      // Agregar imagen si existe y es un archivo (no una URL string)
      if (categoryData.image && typeof categoryData.image !== 'string') {
        formData.append('image', categoryData.image);
      }
      
      // Agregar status si se proporciona
      if (categoryData.status !== undefined) {
        formData.append('status', categoryData.status ? '1' : '0');
      }
      
      console.log('Actualizando categoría:', {
        endpoint: `/api/categories/${categoryId}`,
        categoryId,
        clientId,
        data: {
          name: categoryData.name,
          hasImage: !!categoryData.image,
          imageType: categoryData.image ? typeof categoryData.image : null,
          status: categoryData.status
        }
      });
      
      // Registrar el contenido del FormData para depuración
      console.log('FormData enviado a la API para actualización:');
      for (const pair of formData.entries()) {
        console.log(`- ${pair[0]}: ${typeof pair[1] === 'object' ? 'File object' : pair[1]}`);
      }
      
      await axios.patch(`/api/categories/${categoryId}`, formData);
      
      // Actualizar estado local
      setCategories(prev => prev.map(cat => 
        cat.category_id === categoryId 
          ? { ...cat, ...categoryData, image: categoryData.image || cat.image } 
          : cat
      ));
      
      toast.success('Categoría actualizada correctamente');
      return true;
    } catch (error: any) {
      console.error('Error al actualizar la categoría:', error);
      
      // Intentar extraer más detalles del error
      const errorMessage = error.response?.data?.error || 
                           error.message || 
                           'No se pudo actualizar la categoría';
      
      // Registrar detalles técnicos para depuración
      if (error.response) {
        console.error('Detalles del error de respuesta:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('Error de solicitud (no se recibió respuesta):', error.request);
      }
      
      toast.error(errorMessage);
      return false;
    }
  }, [clientId]);

  // Eliminar una categoría
  const deleteCategory = useCallback(async (categoryId: number) => {
    if (!clientId) return false;
    
    try {
      console.log('Eliminando categoría:', {
        endpoint: `/api/categories/${categoryId}`,
        categoryId,
        clientId
      });
      
      await axios.delete(`/api/categories/${categoryId}`);
      
      // Actualizar estado local
      setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
      
      toast.success('Categoría eliminada correctamente');
      return true;
    } catch (error: any) {
      console.error('Error al eliminar la categoría:', error);
      
      // Intentar extraer más detalles del error
      const errorMessage = error.response?.data?.error || 
                           error.message || 
                           'No se pudo eliminar la categoría';
      
      // Registrar detalles técnicos para depuración
      if (error.response) {
        console.error('Detalles del error de respuesta:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('Error de solicitud (no se recibió respuesta):', error.request);
      }
      
      toast.error(errorMessage);
      return false;
    }
  }, [clientId]);

  // Reordenar categorías
  const reorderCategory = useCallback(async (sourceIndex: number, destinationIndex: number) => {
    if (!clientId || categories.length === 0) return;
    
    // Crear una copia del array para manipularla
    const reorderedCategories = [...categories];
    const [movedItem] = reorderedCategories.splice(sourceIndex, 1);
    reorderedCategories.splice(destinationIndex, 0, movedItem);
    
    // Actualizar el orden de visualización en la copia
    const updatedCategories = reorderedCategories.map((cat, index) => ({
      ...cat,
      display_order: index + 1
    }));
    
    // Actualizar estado local inmediatamente para UI responsiva
    setCategories(updatedCategories);
    
    try {
      // Enviar orden actualizado al servidor
      await axios.post(`/api/clients/${clientId}/categories/reorder`, {
        categories: updatedCategories.map(cat => ({
          category_id: cat.category_id,
          display_order: cat.display_order
        }))
      });
      
      toast.success('Orden actualizado correctamente');
    } catch (error) {
      console.error('Error al reordenar categorías:', error);
      toast.error('No se pudo actualizar el orden');
      
      // Restaurar el estado original en caso de error
      setCategories(categories);
    }
  }, [clientId, categories]);

  // Alternar expansión de categorías
  const toggleCategoryExpansion = useCallback((categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  return {
    categories,
    isLoadingCategories,
    expandedCategories,
    isUpdatingVisibility,
    fetchCategories,
    toggleCategoryVisibility,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategory,
    toggleCategoryExpansion
  };
} 
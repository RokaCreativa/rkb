"use client";

/**
 * @fileoverview Hook para gestionar las categorías del menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { useState, useCallback, useMemo } from 'react';
import { Category, CategoryState, CategoryActions } from '@/app/dashboard-v2/types';
import { Client } from '@/app/types/menu';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

/**
 * Hook para gestionar las categorías del menú
 * 
 * Proporciona funciones para cargar, crear, actualizar y eliminar categorías,
 * además de manejar estados relacionados como carga y errores.
 * 
 * @returns Funciones y estados para la gestión de categorías
 */
export default function useCategoryManagement() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);

  /**
   * Carga los datos del cliente actual
   */
  const fetchClientData = useCallback(async () => {
    try {
      // En desarrollo, comprobar primero si tenemos los datos en sessionStorage
      if (process.env.NODE_ENV === 'development') {
        const sessionKey = 'client_data_cache';
        const storedData = sessionStorage.getItem(sessionKey);

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('📋 Usando datos de cliente almacenados en sessionStorage');
          setClient(parsedData);
          return parsedData;
        }
      }

      setIsLoading(true);

      // Determinar qué ID de cliente usar
      const clientId = session?.user?.client_id || 3; // Usar 3 como cliente de prueba si no hay sesión
      console.log(`🔍 Obteniendo datos del cliente ID=${clientId}...`);

      const clientData = await fetch(`/api/client?id=${clientId}`);
      const clientJson = await clientData.json();

      // Guardar en sessionStorage para desarrollo
      if (process.env.NODE_ENV === 'development') {
        sessionStorage.setItem('client_data_cache', JSON.stringify(clientJson));
        console.log('💾 Datos de cliente guardados en sessionStorage');
      }

      setClient(clientJson);
      setIsLoading(false);
      return clientJson;
    } catch (err) {
      console.error('Error fetching client data:', err);
      setError('Error al cargar los datos del cliente');
      setIsLoading(false);
      return null;
    }
  }, [session]);

  /**
   * Carga todas las categorías del cliente actual
   */
  const fetchCategories = useCallback(async () => {
    try {
      // Eliminar el cache temporalmente para asegurar los datos frescos
      if (process.env.NODE_ENV === 'development') {
        sessionStorage.removeItem('categories_data_cache');
      }

      setIsLoading(true);
      setError(null); // Limpiar errores previos

      // Determinar qué ID de cliente usar
      const clientId = session?.user?.client_id || 3; // Usar 3 como cliente de prueba si no hay sesión
      console.log(`🔍 Obteniendo categorías del cliente ID=${clientId}...`);

      const response = await fetch(`/api/categories?client_id=${clientId}`);

      if (!response.ok) {
        throw new Error(`Error en la respuesta de la API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data)) {
        console.error('Formato de datos incorrecto recibido de la API:', data);
        throw new Error('Formato de datos incorrecto recibido de la API');
      }

      // Asegurar que los datos sean consistentes
      const cleanData = data.map(category => ({
        ...category,
        category_id: Number(category.category_id), // Asegurar que category_id sea número
        image: category.image || null, // Asegurar que image sea string | null (nunca undefined)
        status: Number(category.status), // Asegurar que status sea número
        display_order: Number(category.display_order || 0), // Asegurar que display_order sea número
        client_id: Number(category.client_id), // Asegurar que client_id sea número
        sections_count: Number(category.sections_count || 0), // Incluir contador total
        visible_sections_count: Number(category.visible_sections_count || 0) // Incluir contador visible
      }));

      console.log(`✅ Obtenidas ${cleanData.length} categorías del cliente ID=${clientId}`);

      // Guardar en sessionStorage para desarrollo
      if (process.env.NODE_ENV === 'development') {
        sessionStorage.setItem('categories_data_cache', JSON.stringify(cleanData));
        console.log('💾 Datos de categorías guardados en sessionStorage');
      }

      // Actualizar el estado local
      setCategories(cleanData);
      setIsLoading(false);
      return cleanData;
    } catch (err) {
      console.error('❌ Error cargando categorías:', err);
      setError('Error al cargar las categorías');
      setIsLoading(false);
      toast.error('Error al cargar las categorías');
      return [];
    }
  }, [session]);

  /**
   * Crea una nueva categoría
   * 
   * @param formData Datos de la nueva categoría
   * @returns Promise con la categoría creada o null en caso de error
   */
  const createCategory = useCallback(async (formData: FormData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al crear la categoría');
      }

      const newCategory = await response.json();

      // Actualizar el estado local con la nueva categoría
      setCategories(prevCategories => [...prevCategories, newCategory]);

      toast.success('Categoría creada correctamente');
      setIsLoading(false);
      return newCategory;
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Error al crear la categoría');
      toast.error('Error al crear la categoría');
      setIsLoading(false);
      return null;
    }
  }, []);

  /**
   * Actualiza una categoría existente
   * 
   * @param formData Datos actualizados de la categoría
   * @param categoryId ID de la categoría a actualizar
   * @returns Promise con la categoría actualizada o null en caso de error
   */
  const updateCategory = useCallback(async (formData: FormData, categoryId: number) => {
    try {
      setIsLoading(true);
      formData.append('id', categoryId.toString());

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la categoría');
      }

      const updatedCategory = await response.json();

      // Actualizar el estado local con la categoría actualizada
      setCategories(prevCategories =>
        prevCategories.map(category =>
          category.category_id === categoryId ? updatedCategory : category
        )
      );

      toast.success('Categoría actualizada correctamente');
      setIsLoading(false);
      return updatedCategory;
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Error al actualizar la categoría');
      toast.error('Error al actualizar la categoría');
      setIsLoading(false);
      return null;
    }
  }, []);

  /**
   * Elimina una categoría
   * 
   * @param categoryId ID de la categoría a eliminar
   * @returns Promise con resultado booleano de la operación
   */
  const deleteCategory = useCallback(async (categoryId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la categoría');
      }

      // Actualizar el estado local eliminando la categoría
      setCategories(prevCategories =>
        prevCategories.filter(category => category.category_id !== categoryId)
      );

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Error al eliminar la categoría');
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Actualiza la visibilidad de una categoría
   * 
   * @param categoryId ID de la categoría
   * @param newStatus Nuevo estado de visibilidad (0 o 1)
   * @returns Promise con resultado booleano de la operación
   */
  const toggleCategoryVisibility = useCallback(async (categoryId: number, newStatus: number) => {
    setIsUpdatingVisibility(categoryId);
    try {
      const response = await fetch(`/api/categories/${categoryId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar la visibilidad');
      }

      const updatedCategory = await response.json();

      setCategories(prev =>
        prev.map(cat =>
          cat.category_id === categoryId
            ? { ...cat, status: updatedCategory.status }
            : cat
        )
      );
      toast.success('Visibilidad actualizada');
      return true;
    } catch (err) {
      console.error('Error toggling visibility:', err);
      toast.error('Error al cambiar la visibilidad');
      return false;
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, []);

  return useMemo(() => ({
    categories,
    isLoading,
    error,
    client,
    isUpdatingVisibility,
    fetchClientData,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryVisibility,
    setCategories,
  }), [
    categories,
    isLoading,
    error,
    client,
    isUpdatingVisibility,
    fetchClientData,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryVisibility
  ]);
} 
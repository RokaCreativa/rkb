"use client";

/**
 * @fileoverview Hook para gestionar las categorías del menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { useState, useCallback } from 'react';
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

  /**
   * Carga los datos del cliente actual
   */
  const fetchClientData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!session || !session.user || !session.user.client_id) {
        throw new Error('No hay sesión o ID de cliente');
      }

      const clientData = await fetch(`/api/client?id=${session.user.client_id}`);
      const clientJson = await clientData.json();
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
      setIsLoading(true);
      if (!session || !session.user || !session.user.client_id) {
        throw new Error('No hay sesión o ID de cliente');
      }

      const response = await fetch(`/api/categories?client_id=${session.user.client_id}`);
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setCategories(data);
      } else {
        throw new Error('Formato de datos incorrecto');
      }
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Error al cargar las categorías');
      setIsLoading(false);
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
   * @param currentStatus Estado actual de visibilidad
   * @returns Promise con resultado booleano de la operación
   */
  const toggleCategoryVisibility = useCallback(async (categoryId: number, currentStatus: number) => {
    try {
      // Actualización optimista en UI
      const newStatus = currentStatus === 1 ? 0 : 1;
      
      setCategories(prevCategories =>
        prevCategories.map(cat => {
          if (cat.category_id === categoryId) {
            return { ...cat, status: newStatus };
          }
          return cat;
        })
      );
      
      // Enviar actualización al servidor
      const response = await fetch(`/api/categories/${categoryId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la visibilidad');
      }
      
      return true;
    } catch (err) {
      console.error('Error toggling category visibility:', err);
      
      // Revertir cambio en caso de error
      setCategories(prevCategories =>
        prevCategories.map(cat => {
          if (cat.category_id === categoryId) {
            return { ...cat, status: currentStatus };
          }
          return cat;
        })
      );
      
      toast.error('Error al cambiar la visibilidad de la categoría');
      return false;
    }
  }, []);

  return {
    categories,
    setCategories,
    isLoading,
    error,
    client,
    fetchClientData,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryVisibility
  };
} 
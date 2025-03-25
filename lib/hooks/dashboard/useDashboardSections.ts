"use client";

/**
 * @fileoverview Hook para gestionar secciones en el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 * 
 * Este hook proporciona funcionalidades para gestionar secciones,
 * incluyendo creación, actualización, eliminación y cambio de visibilidad.
 */

import { useState, useCallback } from 'react';
import { Section, SectionWithFileUpload } from '@/app/types/menu';
import { toast } from 'react-hot-toast';
import axios from 'axios';

/**
 * Opciones de configuración para el hook de secciones
 */
interface UseDashboardSectionsOptions {
  /** Función a ejecutar cuando una operación tiene éxito */
  onSuccess?: () => void;
  /** Función a ejecutar cuando una operación falla */
  onError?: (error: Error) => void;
}

/**
 * Hook para gestionar secciones en el dashboard
 * 
 * Proporciona funcionalidades para:
 * - Cargar secciones de una categoría específica
 * - Crear nuevas secciones
 * - Actualizar secciones existentes
 * - Eliminar secciones
 * - Cambiar visibilidad de secciones
 * - Reordenar secciones mediante drag and drop
 * 
 * @param options - Opciones de configuración para el hook
 * @returns Objeto con secciones y funciones para gestionarlas
 */
export default function useDashboardSections(options?: UseDashboardSectionsOptions) {
  // Estado para almacenar secciones organizadas por categoría
  const [sections, setSections] = useState<Record<number, Section[]>>({});
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<Error | null>(null);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);

  /**
   * Carga las secciones de una categoría específica
   * @param categoryId - ID de la categoría cuyas secciones se desean cargar
   * @param clientId - ID del cliente propietario
   */
  const fetchSections = useCallback(async (categoryId: number, clientId: number) => {
    if (!clientId) return [];
    
    setIsLoading(prev => ({ ...prev, [categoryId]: true }));
    setError(null);
    
    try {
      const response = await axios.get(`/api/clients/${clientId}/categories/${categoryId}/sections`);
      
      setSections(prev => ({ ...prev, [categoryId]: response.data }));
      
      options?.onSuccess?.();
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al cargar secciones');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al cargar las secciones');
      return [];
    } finally {
      setIsLoading(prev => ({ ...prev, [categoryId]: false }));
    }
  }, [options]);

  /**
   * Crea una nueva sección
   * @param categoryId - ID de la categoría a la que pertenecerá la sección
   * @param clientId - ID del cliente propietario
   * @param sectionData - Datos de la nueva sección
   * @returns La sección creada o null si hay un error
   */
  const createSection = useCallback(async (categoryId: number, clientId: number, sectionData: Partial<SectionWithFileUpload>) => {
    if (!clientId) return null;
    
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Agregar datos básicos
      formData.append('name', sectionData.name || '');
      formData.append('category_id', categoryId.toString());
      formData.append('client_id', clientId.toString());
      
      // Agregar imagen si existe
      if (sectionData.image && typeof sectionData.image !== 'string') {
        formData.append('image', sectionData.image);
      }
      
      const response = await axios.post(`/api/clients/${clientId}/sections`, formData);
      
      // Actualizar estado local
      const newSection = response.data;
      setSections(prev => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] || []), newSection]
      }));
      
      toast.success('Sección creada correctamente');
      options?.onSuccess?.();
      
      return newSection;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al crear la sección');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al crear la sección');
      return null;
    }
  }, [options]);

  /**
   * Actualiza una sección existente
   * @param categoryId - ID de la categoría a la que pertenece la sección
   * @param sectionId - ID de la sección a actualizar
   * @param sectionData - Datos actualizados de la sección
   * @returns true si la actualización tuvo éxito, false en caso contrario
   */
  const updateSection = useCallback(async (categoryId: number, sectionId: number, sectionData: Partial<SectionWithFileUpload>) => {
    setError(null);
    
    try {
      // Verificar si hay una imagen para subir (es un archivo)
      const hasImageFile = sectionData.image && typeof sectionData.image !== 'string';
      let updatedImageUrl = null;
      
      // Si hay un archivo de imagen, usamos FormData
      if (hasImageFile) {
        const formData = new FormData();
        formData.append('section_id', sectionId.toString());
        
        if (sectionData.name !== undefined) {
          formData.append('name', sectionData.name);
        }
        
        // Agregar la imagen al FormData
        formData.append('image', sectionData.image as File);
        
        // Enviar todo en una sola solicitud con el tipo de contenido correcto
        const response = await axios.put(`/api/sections`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Obtener la URL de la imagen actualizada desde la respuesta
        updatedImageUrl = response.data.image;
      } else {
        // Si no hay imagen nueva, enviar como JSON normal
        const requestData = {
          section_id: sectionId,
          name: sectionData.name,
        };
        
        const response = await axios.put(`/api/sections`, requestData);
        
        // Mantener la URL de imagen existente
        updatedImageUrl = response.data.image;
      }
      
      // Actualizar estado local con datos precisos de la respuesta
      setSections(prev => {
        const updated = { ...prev };
        
        // Verificar que la categoría existe en el estado antes de intentar actualizar
        if (updated[categoryId] && Array.isArray(updated[categoryId])) {
          updated[categoryId] = updated[categoryId].map(sec => {
            if (sec.section_id === sectionId) {
              // Crear una sección actualizada con el tipo correcto y la nueva URL de imagen
              const updatedSection: Section = {
                ...sec,
                name: sectionData.name !== undefined ? sectionData.name : sec.name,
                image: updatedImageUrl // Usar la URL recibida de la API
              };
              
              return updatedSection;
            }
            return sec;
          });
        }
        
        return updated;
      });
      
      toast.success('Sección actualizada correctamente');
      options?.onSuccess?.();
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al actualizar la sección');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al actualizar la sección');
      return false;
    }
  }, [options]);

  /**
   * Elimina una sección
   * @param categoryId - ID de la categoría a la que pertenece la sección
   * @param sectionId - ID de la sección a eliminar
   * @returns true si la eliminación tuvo éxito, false en caso contrario
   */
  const deleteSection = useCallback(async (categoryId: number, sectionId: number) => {
    setError(null);
    
    try {
      await axios.delete(`/api/sections?section_id=${sectionId}`);
      
      // Actualizar estado local
      setSections(prev => {
        const updated = { ...prev };
        
        // Verificar que la categoría existe en el estado antes de intentar filtrar
        if (updated[categoryId] && Array.isArray(updated[categoryId])) {
          updated[categoryId] = updated[categoryId].filter(sec => sec.section_id !== sectionId);
        }
        
        return updated;
      });
      
      toast.success('Sección eliminada correctamente');
      options?.onSuccess?.();
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al eliminar la sección');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al eliminar la sección');
      return false;
    }
  }, [options]);

  /**
   * Cambia la visibilidad de una sección
   * @param sectionId - ID de la sección
   * @param clientId - ID del cliente propietario
   * @param currentStatus - Estado actual de visibilidad (1 = visible, 0 = oculto)
   * @returns true si la operación tuvo éxito, false en caso contrario
   */
  const toggleSectionVisibility = useCallback(async (sectionId: number, clientId: number, currentStatus: number) => {
    if (!clientId) return false;
    
    setIsUpdatingVisibility(sectionId);
    setError(null);
    
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    try {
      await axios.patch(`/api/clients/${clientId}/sections/${sectionId}`, {
        status: newStatus
      });
      
      // Actualizar el estado local
      setSections(prev => {
        const updatedSections = { ...prev };
        
        // Buscar la sección en todas las categorías y actualizarla
        Object.keys(updatedSections).forEach(categoryId => {
          updatedSections[Number(categoryId)] = updatedSections[Number(categoryId)].map(sec => 
            sec.section_id === sectionId ? { ...sec, status: newStatus } : sec
          );
        });
        
        return updatedSections;
      });
      
      toast.success(newStatus === 1 ? 'Sección visible' : 'Sección oculta');
      options?.onSuccess?.();
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al cambiar visibilidad');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al cambiar la visibilidad');
      return false;
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, [options]);

  /**
   * Reordena secciones mediante drag and drop
   * @param categoryId - ID de la categoría 
   * @param clientId - ID del cliente propietario
   * @param sourceIndex - Índice de origen
   * @param destinationIndex - Índice de destino
   * @returns true si la operación tuvo éxito, false en caso contrario
   */
  const reorderSections = useCallback(async (categoryId: number, clientId: number, sourceIndex: number, destinationIndex: number) => {
    if (!clientId || !sections[categoryId] || sections[categoryId].length === 0) return false;
    if (sourceIndex === destinationIndex) return true;
    
    // Crear una copia del array para manipularla
    const reorderedSections = [...sections[categoryId]];
    const [movedItem] = reorderedSections.splice(sourceIndex, 1);
    reorderedSections.splice(destinationIndex, 0, movedItem);
    
    // Actualizar el orden de visualización en la copia
    const updatedSections = reorderedSections.map((sec, index) => ({
      ...sec,
      display_order: index + 1
    }));
    
    // Actualizar estado local inmediatamente para UI responsiva
    setSections(prev => ({
      ...prev,
      [categoryId]: updatedSections
    }));
    
    try {
      // Enviar orden actualizado al servidor
      await axios.post(`/api/clients/${clientId}/sections/reorder`, {
        sections: updatedSections.map(sec => ({
          section_id: sec.section_id,
          display_order: sec.display_order
        }))
      });
      
      options?.onSuccess?.();
      return true;
    } catch (err) {
      // Revertir cambios en caso de error
      setSections(prev => ({
        ...prev,
        [categoryId]: sections[categoryId]
      }));
      
      const error = err instanceof Error ? err : new Error('Error desconocido al reordenar');
      setError(error);
      options?.onError?.(error);
      toast.error('Error al reordenar las secciones');
      return false;
    }
  }, [sections, options]);

  return {
    sections,
    isLoading,
    error,
    isUpdatingVisibility,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
    toggleSectionVisibility,
    reorderSections
  };
} 
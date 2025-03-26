/**
 * Controladores de eventos para secciones
 * 
 * Este módulo contiene funciones extraídas de page.tsx para gestionar
 * los eventos relacionados con secciones en el dashboard.
 * Parte del plan de refactorización para reducir el tamaño de page.tsx.
 *
 * @module sectionEventHandlers
 */

import { toast } from 'react-hot-toast';
import { Section } from '@/lib/types';

/**
 * Maneja el reordenamiento de secciones mediante drag and drop
 * 
 * @param sections - Lista actual de secciones
 * @param sourceIndex - Índice de origen del elemento arrastrado
 * @param destinationIndex - Índice de destino donde se suelta
 * @param setSections - Función para actualizar el estado de secciones
 * @param setIsLoading - Función para controlar el estado de carga
 * @returns Promise que se resuelve cuando la operación está completa
 */
export const handleReorderSection = async (
  sections: Section[],
  sourceIndex: number,
  destinationIndex: number,
  setSections: (updater: (prev: Record<number, Section[]>) => Record<number, Section[]>) => void,
  categoryId: number,
  setIsLoading: (isLoading: boolean) => void
) => {
  // Crear una copia del array de secciones
  const reorderedSections = [...sections];
  
  // Realizar el reordenamiento localmente
  const [removed] = reorderedSections.splice(sourceIndex, 1);
  reorderedSections.splice(destinationIndex, 0, removed);
  
  // Actualizar el estado local inmediatamente para feedback visual
  setSections(prev => ({
    ...prev,
    [categoryId]: reorderedSections
  }));
  
  try {
    // Indicar que está procesando
    setIsLoading(true);
    
    // Actualizar los display_order de todas las secciones reordenadas
    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      display_order: index + 1
    }));
    
    // Preparar datos para la API
    const updateData = updatedSections.map(section => ({
      id: section.section_id,
      display_order: section.display_order
    }));
    
    // Llamar a la API para guardar los cambios
    const response = await fetch('/api/sections/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections: updateData })
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el orden de secciones');
    }
    
    toast.success('Orden de secciones actualizado');
  } catch (error) {
    console.error('Error al reordenar secciones:', error);
    toast.error('Error al actualizar el orden de las secciones');
    
    // Volver a cargar las secciones en caso de error
    await reloadSections(categoryId, sections => 
      setSections(prev => ({ ...prev, [categoryId]: sections }))
    );
  } finally {
    setIsLoading(false);
  }
};

/**
 * Actualiza la visibilidad de una sección
 * 
 * @param sectionId - ID de la sección a modificar
 * @param currentStatus - Estado actual (1 = visible, 0 = oculto)
 * @param setIsUpdatingVisibility - Función para controlar el estado de carga
 * @param setSections - Función para actualizar el estado de secciones
 * @param categoryId - ID de la categoría a la que pertenece la sección
 * @returns Promise que se resuelve cuando la operación está completa
 */
export const toggleSectionVisibility = async (
  sectionId: number,
  currentStatus: number,
  setIsUpdatingVisibility: (id: number | null) => void,
  setSections: (updater: (prev: Record<number, Section[]>) => Record<number, Section[]>) => void,
  categoryId: number
) => {
  try {
    // Indicar que está procesando esta sección específica
    setIsUpdatingVisibility(sectionId);
    
    // Optimistic UI update
    setSections(prev => ({
      ...prev,
      [categoryId]: prev[categoryId]?.map(section => 
        section.section_id === sectionId 
          ? { ...section, status: section.status === 1 ? 0 : 1 } 
          : section
      ) || []
    }));
    
    // Realizar la llamada a la API
    const response = await fetch(`/api/sections/${sectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: currentStatus === 1 ? 0 : 1 })
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar la visibilidad');
    }
    
    // Mostrar notificación de éxito
    toast.success(`Sección ${currentStatus === 1 ? 'oculta' : 'visible'}`);
  } catch (error) {
    console.error('Error al cambiar visibilidad de sección:', error);
    toast.error('Error al actualizar la sección');
    
    // Revertir el cambio en caso de error
    setSections(prev => ({
      ...prev,
      [categoryId]: prev[categoryId]?.map(section => 
        section.section_id === sectionId 
          ? { ...section, status: currentStatus } 
          : section
      ) || []
    }));
  } finally {
    // Finalizar el estado de carga
    setIsUpdatingVisibility(null);
  }
};

/**
 * Elimina una sección
 * 
 * @param sectionId - ID de la sección a eliminar
 * @param setSections - Función para actualizar el estado de secciones
 * @param categoryId - ID de la categoría a la que pertenece la sección
 * @returns Promise que se resuelve cuando la operación está completa
 */
export const deleteSection = async (
  sectionId: number,
  setSections: (updater: (prev: Record<number, Section[]>) => Record<number, Section[]>) => void,
  categoryId: number
) => {
  try {
    // Optimistic UI update
    setSections(prev => ({
      ...prev,
      [categoryId]: prev[categoryId]?.filter(section => section.section_id !== sectionId) || []
    }));
    
    // Realizar la llamada a la API
    const response = await fetch(`/api/sections/${sectionId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar la sección');
    }
    
    toast.success('Sección eliminada correctamente');
  } catch (error) {
    console.error('Error al eliminar sección:', error);
    toast.error('Error al eliminar la sección');
    
    // Recargar datos en caso de error
    await reloadSections(categoryId, sections => 
      setSections(prev => ({ ...prev, [categoryId]: sections }))
    );
  }
};

/**
 * Función auxiliar para recargar secciones desde la API
 * 
 * @param categoryId - ID de la categoría para la que recargar secciones
 * @param setSections - Función para actualizar el estado de secciones
 * @returns Promise que se resuelve con las secciones cargadas
 */
const reloadSections = async (
  categoryId: number,
  setSections: (sections: Section[]) => void
) => {
  try {
    const response = await fetch(`/api/categories/${categoryId}/sections`);
    if (!response.ok) {
      throw new Error('Error al recargar secciones');
    }
    const data = await response.json();
    setSections(data);
    return data;
  } catch (err) {
    console.error('Error al recargar secciones:', err);
    throw err;
  }
}; 
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
 * Maneja el reordenamiento de secciones mediante arrastrar y soltar
 * @param sections - La lista actual de secciones
 * @param setSections - Función para actualizar el estado de las secciones
 * @param reorderedSections - Las secciones con el nuevo orden
 * @returns Promise<void>
 */
export const handleReorderSection = async (
  sections: Section[],
  setSections: React.Dispatch<React.SetStateAction<Section[]>>,
  reorderedSections: Section[]
): Promise<void> => {
  try {
    // Actualizar el estado localmente para una respuesta inmediata de la UI
    setSections(reorderedSections);

    // Preparar datos para enviar a la API
    const sectionsForApi = reorderedSections.map((section, index) => ({
      id: section.section_id,
      display_order: index + 1,
    }));

    // Enviar los cambios al servidor
    const response = await fetch('/api/sections/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sections: sectionsForApi }),
    });

    // Manejar respuesta con error
    if (!response.ok) {
      console.error('Error al reordenar secciones:', response.status);
      // Revertir a los datos originales si hay un error
      setSections(sections);
      toast.error('Error al reordenar secciones. Por favor, inténtalo de nuevo.');
      return;
    }

    toast.success('Secciones reordenadas correctamente');
  } catch (error) {
    console.error('Error al reordenar secciones:', error);
    // Revertir a los datos originales si hay un error
    setSections(sections);
    toast.error('Error al reordenar secciones. Por favor, inténtalo de nuevo.');
  }
};

/**
 * Cambia la visibilidad de una sección
 * @param sectionId - ID de la sección a actualizar
 * @param currentStatus - Estado actual (1 = visible, 0 = oculto)
 * @param setIsUpdatingVisibility - Función para controlar el estado de carga
 * @param setSections - Función para actualizar el estado de las secciones
 * @param categoryId - ID de la categoría a la que pertenece la sección
 * @returns Promise<void>
 */
export const toggleSectionVisibility = async (
  sectionId: number,
  currentStatus: number,
  setIsUpdatingVisibility: (id: number | null) => void,
  setSections: (updater: (prev: Record<string | number, Section[]>) => Record<string | number, Section[]>) => void,
  categoryId: number
): Promise<void> => {
  try {
    // Indicar que está procesando esta sección específica
    setIsUpdatingVisibility(sectionId);
    
    // Nuevo estado: invertir el actual
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    // Actualización optimista de la UI
    setSections(prev => ({
      ...prev,
      [categoryId]: prev[categoryId]?.map(section => 
        section.section_id === sectionId
          ? { ...section, status: newStatus } 
          : section
      ) || []
    }));

    // Enviar la actualización al servidor
    const response = await fetch(`/api/sections/${sectionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    // Manejar respuesta con error
    if (!response.ok) {
      throw new Error(`Error al actualizar la visibilidad: ${response.status} ${response.statusText}`);
    }

    toast.success(`Sección ${currentStatus === 1 ? 'ocultada' : 'mostrada'} correctamente`);
  } catch (error) {
    console.error('Error al cambiar visibilidad de la sección:', error);
    toast.error('Error al cambiar la visibilidad de la sección');
    
    // Revertir a los datos originales si hay un error
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
 * @param sectionId - ID de la sección a eliminar
 * @param sections - Lista actual de secciones
 * @param setSections - Función para actualizar el estado de las secciones
 * @returns Promise<void>
 */
export const deleteSection = async (
  sectionId: number,
  sections: Section[],
  setSections: React.Dispatch<React.SetStateAction<Section[]>>
): Promise<void> => {
  try {
    // Actualizar optimistamente el UI
    const updatedSections = sections.filter((section) => section.section_id !== sectionId);
    setSections(updatedSections);

    // Enviar la eliminación al servidor
    const response = await fetch(`/api/sections/${sectionId}`, {
      method: 'DELETE',
    });

    // Manejar respuesta con error
    if (!response.ok) {
      console.error('Error al eliminar la sección:', response.status);
      // Si falla, recargar las secciones para asegurar datos correctos
      reloadSections(setSections);
      toast.error('Error al eliminar la sección. Por favor, inténtalo de nuevo.');
      return;
    }

    toast.success('Sección eliminada correctamente');
  } catch (error) {
    console.error('Error al eliminar la sección:', error);
    // Si falla, recargar las secciones para asegurar datos correctos
    reloadSections(setSections);
    toast.error('Error al eliminar la sección. Por favor, inténtalo de nuevo.');
  }
};

/**
 * Recarga las secciones desde la API
 * @param setSections - Función para actualizar el estado de las secciones
 * @returns Promise<void>
 */
export const reloadSections = async (
  setSections: React.Dispatch<React.SetStateAction<Section[]>>
): Promise<void> => {
  try {
    const response = await fetch('/api/sections');
    if (!response.ok) {
      throw new Error('Error al cargar secciones');
    }
    const data = await response.json();
    setSections(data);
  } catch (error) {
    console.error('Error al recargar secciones:', error);
    toast.error('Error al recargar datos. Por favor, actualiza la página.');
  }
}; 
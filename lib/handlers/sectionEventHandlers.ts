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
import { Dispatch, SetStateAction } from 'react';

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
 * Actualiza la visibilidad de una sección
 * 
 * @param sectionId - ID de la sección a modificar
 * @param currentStatus - Estado actual (1 = visible, 0 = oculto)
 * @param categoryId - ID de la categoría a la que pertenece la sección
 * @param sections - Estado actual de las secciones organizadas por categoría
 * @param setSections - Función para actualizar el estado de secciones
 * @returns Promise que se resuelve cuando la operación está completa
 */
export async function toggleSectionVisibility(
  sectionId: number,
  currentStatus: number,
  categoryId: number,
  sections: Record<string, Section[]>,
  setSections: Dispatch<SetStateAction<Record<string, Section[]>>>
): Promise<void> {
  try {
    console.log(`[DEBUG] Cambiando visibilidad de sección ${sectionId} en categoría ${categoryId}: De ${currentStatus} a ${currentStatus === 1 ? 0 : 1}`);
    
    // Validar que la sección existe en la categoría
    const categoryKey = categoryId.toString();
    const sectionExists = sections[categoryKey]?.some(section => section.section_id === sectionId);
    
    if (!sectionExists) {
      console.error(`[ERROR] Sección con ID ${sectionId} no encontrada en categoría ${categoryId}`);
      toast.error(`No se encontró la sección con ID ${sectionId}`);
      return;
    }
    
    // Nuevo estado de visibilidad (invertir el actual)
    const newVisibility = currentStatus === 1 ? 0 : 1;
    console.log(`[DEBUG] Nuevo estado: ${newVisibility}`);
    
    // Actualización optimista en UI
    setSections(prevSections => {
      const updatedSections = { ...prevSections };
      updatedSections[categoryKey] = prevSections[categoryKey].map(section =>
        section.section_id === sectionId
          ? { ...section, status: newVisibility }
          : section
      );
      return updatedSections;
    });

    // Formatear el valor status para la API
    console.log(`[DEBUG] Enviando PATCH a /api/sections/${sectionId} con status=${newVisibility}`);
    
    // Llamada a la API
    const response = await fetch(`/api/sections/${sectionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newVisibility }),
    });

    const data = await response.json();
    console.log(`[DEBUG] Respuesta API:`, data);

    if (!response.ok) {
      throw new Error(data.error || "Error al cambiar la visibilidad");
    }

    toast.success(`La sección ahora está ${newVisibility === 1 ? "visible" : "oculta"}`);
  } catch (error) {
    console.error("[ERROR] Error en toggleSectionVisibility:", error);
    
    // Revertir cambios en UI en caso de error
    setSections(prevSections => {
      const updatedSections = { ...prevSections };
      updatedSections[categoryId.toString()] = prevSections[categoryId.toString()].map(section =>
        section.section_id === sectionId
          ? { ...section, status: currentStatus }
          : section
      );
      return updatedSections;
    });
    
    toast.error(`No se pudo cambiar la visibilidad: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Elimina una sección
 * @param sectionId - ID de la sección a eliminar
 * @param setSections - Función para actualizar el estado de las secciones
 * @param categoryId - ID de la categoría a la que pertenece la sección
 * @returns Promise<void>
 */
export const deleteSection = async (
  sectionId: number,
  setSections: (updater: (prev: Record<string | number, Section[]>) => Record<string | number, Section[]>) => void,
  categoryId: number
): Promise<void> => {
  try {
    // Actualizar optimistamente el UI
    setSections(prev => ({
      ...prev,
      [categoryId]: prev[categoryId]?.filter((section) => section.section_id !== sectionId) || []
    }));

    // Enviar la eliminación al servidor
    const response = await fetch(`/api/sections/${sectionId}`, {
      method: 'DELETE',
    });

    // Manejar respuesta con error
    if (!response.ok) {
      console.error('Error al eliminar la sección:', response.status);
      // Si falla, revertir el cambio optimista
      toast.error('Error al eliminar la sección. Por favor, inténtalo de nuevo.');
      return;
    }

    toast.success('Sección eliminada correctamente');
  } catch (error) {
    console.error('Error al eliminar la sección:', error);
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
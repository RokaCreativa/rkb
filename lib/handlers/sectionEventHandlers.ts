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
import { Section } from '@/app/types/menu';
import { Dispatch, SetStateAction } from 'react';

/**
 * Maneja el reordenamiento de secciones mediante arrastrar y soltar
 * @param sections - La lista actual de secciones
 * @param setSections - Función para actualizar el estado de las secciones
 * @param reorderedSections - Las secciones con el nuevo orden
 * @returns Promise<void>
 */
export async function handleReorderSection(
  sections: Section[],
  setSections: (updatedSections: Section[]) => void,
  updatedSections?: Section[]
) {
  if (!sections.length) return;
  
  // Si no se proporciona updatedSections, no hay cambios que hacer
  if (!updatedSections) return;
  
  try {
    // Actualizar estado local primero para feedback inmediato
    setSections(updatedSections);
    
    // Enviar actualización al servidor
    await fetch('/api/sections/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sections: updatedSections.map(section => ({
          id: section.section_id,
          display_order: section.display_order
        }))
      }),
    });
    
    toast.success('Orden de secciones actualizado');
  } catch (error) {
    console.error('Error al reordenar secciones:', error);
    toast.error('Error al actualizar el orden');
    
    // Restaurar orden original
    setSections(sections);
  }
}

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
  setSections: Dispatch<SetStateAction<Record<string, Section[]>>>,
  setIsUpdatingVisibility?: Dispatch<SetStateAction<number | null>>
) {
  if (setIsUpdatingVisibility) setIsUpdatingVisibility(sectionId);
  const newStatus = currentStatus === 1 ? 0 : 1;
  
  try {
    const response = await fetch(`/api/sections/${sectionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar la visibilidad');
    }
    
    // Actualizar la sección en el estado local
    setSections(prev => {
      const updated = { ...prev };
      const categoryKey = categoryId.toString();
      
      if (updated[categoryKey]) {
        updated[categoryKey] = updated[categoryKey].map(section => 
          section.section_id === sectionId ? { ...section, status: newStatus } : section
        );
      }
      
      return updated;
    });
    
    toast.success(newStatus === 1 ? 'Sección visible' : 'Sección oculta');
  } catch (error) {
    console.error('Error al cambiar visibilidad de sección:', error);
    toast.error('No se pudo cambiar la visibilidad');
  } finally {
    if (setIsUpdatingVisibility) setIsUpdatingVisibility(null);
  }
}

/**
 * Elimina una sección
 * @param sectionId - ID de la sección a eliminar
 * @param setSections - Función para actualizar el estado de las secciones
 * @param categoryId - ID de la categoría a la que pertenece la sección
 * @returns Promise<void>
 */
export async function deleteSection(
  sectionId: number,
  setSections: Dispatch<SetStateAction<Record<string, Section[]>>>,
  categoryId: number,
  setIsDeletingSection?: Dispatch<SetStateAction<boolean>>
): Promise<boolean> {
  if (setIsDeletingSection) setIsDeletingSection(true);
  
  try {
    const response = await fetch(`/api/sections/${sectionId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar la sección');
    }
    
    // Actualizar el estado local
    setSections(prev => {
      const updated = { ...prev };
      const categoryKey = categoryId.toString();
      
      if (updated[categoryKey]) {
        updated[categoryKey] = updated[categoryKey].filter(section => section.section_id !== sectionId);
      }
      
      return updated;
    });
    
    toast.success('Sección eliminada correctamente');
    return true;
  } catch (error) {
    console.error('Error al eliminar sección:', error);
    toast.error('No se pudo eliminar la sección');
    return false;
  } finally {
    if (setIsDeletingSection) setIsDeletingSection(false);
  }
}

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
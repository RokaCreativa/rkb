"use client";

/**
 * @fileoverview Hook para gestionar las secciones del menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { useState, useCallback } from 'react';
import { Section } from '@/app/types/menu';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { DashboardService } from '@/lib/services/dashboardService';

/**
 * Hook para gestionar las secciones del menú
 * 
 * Proporciona funcionalidad para listar, crear, editar, eliminar y
 * cambiar visibilidad de secciones en el menú.
 * 
 * @returns Objeto con funciones y estado para gestionar secciones
 */
export default function useSectionManagement() {
  const { data: session } = useSession();
  const [sections, setSections] = useState<{ [key: number]: Section[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga las secciones de una categoría específica
   * 
   * @param categoryId ID de la categoría
   * @returns Promise con las secciones cargadas
   */
  const fetchSectionsByCategory = useCallback(async (categoryId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/sections?category_id=${categoryId}`);
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        // Actualizamos solo las secciones de esta categoría
        setSections(prev => ({
          ...prev,
          [categoryId]: data
        }));
      } else {
        throw new Error('Formato de datos incorrecto');
      }
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error fetching sections:', err);
      setError('Error al cargar las secciones');
      setIsLoading(false);
      return [];
    }
  }, []);

  /**
   * Crea una nueva sección
   * 
   * @param formData Datos de la nueva sección
   * @param categoryId ID de la categoría a la que pertenece
   * @returns Promise con la sección creada o null en caso de error
   */
  const createSection = useCallback(async (formData: FormData, categoryId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sections', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al crear la sección');
      }
      
      const newSection = await response.json();
      
      // Actualizamos el estado local con la nueva sección
      setSections(prev => {
        const categorySections = [...(prev[categoryId] || []), newSection];
        return {
          ...prev,
          [categoryId]: categorySections
        };
      });
      
      toast.success('Sección creada correctamente');
      setIsLoading(false);
      return newSection;
    } catch (err) {
      console.error('Error creating section:', err);
      setError('Error al crear la sección');
      toast.error('Error al crear la sección');
      setIsLoading(false);
      return null;
    }
  }, []);

  /**
   * Actualiza una sección existente
   * 
   * @param formData Datos actualizados de la sección
   * @param sectionId ID de la sección a actualizar
   * @param categoryId ID de la categoría a la que pertenece
   * @returns Promise con la sección actualizada o null en caso de error
   */
  const updateSection = useCallback(async (formData: FormData, sectionId: number, categoryId: number) => {
    try {
      setIsLoading(true);
      formData.append('id', sectionId.toString());
      
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la sección');
      }
      
      const updatedSection = await response.json();
      
      // Actualizamos el estado local con la sección actualizada
      setSections(prev => {
        const categorySections = prev[categoryId] || [];
        const updatedSections = categorySections.map(section =>
          section.section_id === sectionId ? updatedSection : section
        );
        
        return {
          ...prev,
          [categoryId]: updatedSections
        };
      });
      
      toast.success('Sección actualizada correctamente');
      setIsLoading(false);
      return updatedSection;
    } catch (err) {
      console.error('Error updating section:', err);
      setError('Error al actualizar la sección');
      toast.error('Error al actualizar la sección');
      setIsLoading(false);
      return null;
    }
  }, []);

  /**
   * Elimina una sección
   * 
   * @param sectionId ID de la sección a eliminar
   * @param categoryId ID de la categoría a la que pertenece
   * @returns Promise con resultado booleano de la operación
   */
  const deleteSection = useCallback(async (sectionId: number, categoryId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la sección');
      }
      
      // Actualizamos el estado local eliminando la sección
      setSections(prev => {
        const categorySections = prev[categoryId] || [];
        const updatedSections = categorySections.filter(
          section => section.section_id !== sectionId
        );
        
        return {
          ...prev,
          [categoryId]: updatedSections
        };
      });
      
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error deleting section:', err);
      setError('Error al eliminar la sección');
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Actualiza la visibilidad de una sección
   * 
   * @param sectionId ID de la sección
   * @param currentStatus Estado actual de visibilidad
   * @returns Promise con resultado booleano de la operación
   */
  const toggleSectionVisibility = useCallback(async (sectionId: number, currentStatus: number) => {
    try {
      setIsUpdatingVisibility(sectionId);
      
      // Actualización optimista en UI
      const newStatus = currentStatus === 1 ? 0 : 1;
      
      // Buscar la categoría a la que pertenece esta sección
      let categoryId: number | null = null;
      for (const [catId, sectionsList] of Object.entries(sections)) {
        if (sectionsList.some(s => s.section_id === sectionId)) {
          categoryId = parseInt(catId);
          break;
        }
      }
      
      if (!categoryId) {
        throw new Error('No se encontró la categoría para esta sección');
      }
      
      // Actualizar el estado local
      setSections(prev => {
        const categorySections = prev[categoryId!] || [];
        const updatedSections = categorySections.map(section => {
          if (section.section_id === sectionId) {
            return { ...section, status: newStatus };
          }
          return section;
        });
        
        return {
          ...prev,
          [categoryId!]: updatedSections
        };
      });
      
      // Enviar actualización al servidor
      const response = await fetch(`/api/sections/${sectionId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la visibilidad');
      }
      
      setIsUpdatingVisibility(null);
      return true;
    } catch (err) {
      console.error('Error toggling section visibility:', err);
      setIsUpdatingVisibility(null);
      
      // Si ocurre un error, revertimos el cambio en el estado local
      if (typeof sectionId === 'number') {
        // Buscar la categoría a la que pertenece esta sección
        let categoryId: number | null = null;
        for (const [catId, sectionsList] of Object.entries(sections)) {
          if (sectionsList.some(s => s.section_id === sectionId)) {
            categoryId = parseInt(catId);
            break;
          }
        }
        
        if (categoryId) {
          setSections(prev => {
            const categorySections = prev[categoryId!] || [];
            const updatedSections = categorySections.map(section => {
              if (section.section_id === sectionId) {
                return { ...section, status: currentStatus };
              }
              return section;
            });
            
            return {
              ...prev,
              [categoryId!]: updatedSections
            };
          });
        }
      }
      
      toast.error('Error al cambiar la visibilidad de la sección');
      return false;
    }
  }, [sections]);

  /**
   * Reordena las secciones
   * @param {Section[]} updatedSections - Lista completa de secciones reordenadas
   */
  const reorderSections = async (updatedSections: Section[]) => {
    setIsLoading(true);
    try {
      const result = await DashboardService.reorderSections(updatedSections);
      if (result.success) {
        // Actualizar el estado local
        const categoryId = updatedSections[0]?.category_id;
        if (categoryId) {
          setSections(prev => ({
            ...prev,
            [categoryId]: updatedSections
          }));
        }
        toast.success("Secciones reordenadas correctamente");
      } else {
        toast.error("Error al reordenar secciones");
      }
    } catch (error) {
      console.error("Error al reordenar secciones:", error);
      toast.error("Error al reordenar secciones");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sections,
    setSections,
    isLoading,
    isUpdatingVisibility,
    error,
    fetchSectionsByCategory,
    createSection,
    updateSection,
    deleteSection,
    toggleSectionVisibility,
    reorderSections
  };
} 
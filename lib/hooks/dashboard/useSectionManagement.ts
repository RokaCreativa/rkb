/**
 * @file useSectionManagement.ts
 * @description Hook personalizado para la gestión de secciones en el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @created 2024-03-29
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Section } from '@/app/types/menu';
import { DashboardService } from '@/lib/services/dashboardService';

/**
 * Interface para almacenar las secciones organizadas por categoría
 */
interface SectionsByCategory {
  [categoryId: string]: Section[];
}

/**
 * Hook personalizado para gestionar el estado y operaciones de secciones
 * 
 * @returns Objeto con estado y funciones para gestionar secciones
 */
export const useSectionManagement = () => {
  // Estado para las secciones (organizadas por categoría)
  const [sections, setSections] = useState<SectionsByCategory>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [loadedCategories, setLoadedCategories] = useState<number[]>([]);

  /**
   * Carga las secciones para una categoría específica
   */
  const loadSections = useCallback(async (categoryId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await DashboardService.fetchSections(categoryId);
      
      // Actualizar las secciones para esta categoría
      setSections(prev => ({
        ...prev,
        [categoryId]: result.sections || []
      }));
      
      // Marcar esta categoría como cargada
      setLoadedCategories(prev => 
        prev.includes(categoryId) ? prev : [...prev, categoryId]
      );
      
      return result.sections || [];
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Error al cargar secciones');
      toast.error('Error al cargar las secciones');
      console.error('Error al cargar secciones:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crea una nueva sección para una categoría
   */
  const createSection = useCallback(async (sectionData: Partial<Section>, categoryId: number): Promise<boolean> => {
    try {
      const result = await DashboardService.createSection(sectionData, categoryId);
      
      if (result.success) {
        toast.success('Sección creada correctamente');
        await loadSections(categoryId); // Recargar secciones para reflejar cambios
        return true;
      } else {
        toast.error('Error al crear la sección');
        return false;
      }
    } catch (error) {
      console.error('Error al crear sección:', error);
      toast.error('Error al crear la sección');
      return false;
    }
  }, [loadSections]);

  /**
   * Actualiza una sección existente
   */
  const updateSection = useCallback(async (sectionId: number, sectionData: Partial<Section>, categoryId: number): Promise<boolean> => {
    try {
      const result = await DashboardService.updateSection(sectionId, sectionData);
      
      if (result.success) {
        toast.success('Sección actualizada correctamente');
        
        // Actualizar localmente para evitar recarga completa
        setSections(prevSections => {
          const categoryKey = categoryId.toString();
          if (!prevSections[categoryKey]) return prevSections;
          
          return {
            ...prevSections,
            [categoryKey]: prevSections[categoryKey].map(section => 
              section.section_id === sectionId ? { ...section, ...sectionData } : section
            )
          };
        });
        
        return true;
      } else {
        toast.error('Error al actualizar la sección');
        return false;
      }
    } catch (error) {
      console.error('Error al actualizar sección:', error);
      toast.error('Error al actualizar la sección');
      return false;
    }
  }, []);

  /**
   * Elimina una sección
   */
  const deleteSection = useCallback(async (sectionId: number, categoryId: number): Promise<boolean> => {
    try {
      const result = await DashboardService.deleteSection(sectionId);
      
      if (result.success) {
        toast.success('Sección eliminada correctamente');
        
        // Eliminar sección del estado local
        setSections(prevSections => {
          const categoryKey = categoryId.toString();
          if (!prevSections[categoryKey]) return prevSections;
          
          return {
            ...prevSections,
            [categoryKey]: prevSections[categoryKey].filter(section => 
              section.section_id !== sectionId
            )
          };
        });
        
        return true;
      } else {
        toast.error('Error al eliminar la sección');
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar sección:', error);
      toast.error('Error al eliminar la sección');
      return false;
    }
  }, []);

  /**
   * Actualiza la visibilidad de una sección
   */
  const toggleSectionVisibility = useCallback(async (sectionId: number, currentStatus: number, categoryId: number): Promise<boolean> => {
    // Nuevo estado opuesto al actual (0 -> 1, 1 -> 0)
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    setIsUpdatingVisibility(sectionId);
    
    try {
      const result = await DashboardService.updateSectionVisibility(sectionId, newStatus);
      
      if (result.section) {
        // Actualizar el estado local para reflejar el cambio
        setSections(prevSections => {
          const categoryKey = categoryId.toString();
          if (!prevSections[categoryKey]) return prevSections;
          
          return {
            ...prevSections,
            [categoryKey]: prevSections[categoryKey].map(section => 
              section.section_id === sectionId ? { ...section, status: newStatus } : section
            )
          };
        });
        
        const statusText = newStatus === 1 ? 'visible' : 'oculta';
        toast.success(`Sección ahora está ${statusText}`);
        return true;
      } else {
        toast.error('Error al cambiar visibilidad de la sección');
        return false;
      }
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error);
      toast.error('Error al cambiar visibilidad de la sección');
      return false;
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, []);

  /**
   * Reordena las secciones de una categoría
   */
  const reorderSections = useCallback(async (categoryId: number, updatedSections: Section[]): Promise<boolean> => {
    try {
      // Asegurarnos de que las secciones tienen órdenes actualizados
      const sectionsWithOrder = updatedSections.map((section, index) => ({
        ...section,
        display_order: index + 1
      }));
      
      const result = await DashboardService.reorderSections(sectionsWithOrder);
      
      if (result.success) {
        // Actualizar el estado local con el nuevo orden
        setSections(prevSections => ({
          ...prevSections,
          [categoryId]: sectionsWithOrder
        }));
        
        toast.success('Orden actualizado correctamente');
        return true;
      } else {
        toast.error('Error al actualizar el orden');
        return false;
      }
    } catch (error) {
      console.error('Error al reordenar secciones:', error);
      toast.error('Error al actualizar el orden');
      return false;
    }
  }, []);

  /**
   * Obtiene las secciones para una categoría (cargando si es necesario)
   */
  const getSections = useCallback(async (categoryId: number): Promise<Section[]> => {
    const catKey = categoryId.toString();
    
    // Si ya tenemos las secciones para esta categoría, devolverlas
    if (sections[catKey] && loadedCategories.includes(categoryId)) {
      return sections[catKey];
    }
    
    // Si no, cargar las secciones
    return await loadSections(categoryId);
  }, [sections, loadedCategories, loadSections]);

  /**
   * Actualiza los contadores de secciones para una categoría
   */
  const updateSectionCounters = useCallback((categoryId: number): { total: number, visible: number } => {
    const catKey = categoryId.toString();
    const categorySections = sections[catKey] || [];
    
    const total = categorySections.length;
    const visible = categorySections.filter(section => section.status === 1).length;
    
    return { total, visible };
  }, [sections]);

  return {
    // Estado
    sections,
    isLoading,
    error,
    isUpdatingVisibility,
    loadedCategories,
    
    // Acciones
    loadSections,
    getSections,
    createSection,
    updateSection,
    deleteSection,
    toggleSectionVisibility,
    reorderSections,
    updateSectionCounters
  };
};

export default useSectionManagement; 
import { useState, useCallback, useEffect } from 'react';
import { Section } from '@/app/types/menu';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function useSections(clientId: number | null) {
  const [sections, setSections] = useState<Record<number, Section[]>>({});
  const [isLoadingSections, setIsLoadingSections] = useState<Record<number, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);

  // Cargar secciones para una categoría específica
  const fetchSections = useCallback(async (categoryId: number) => {
    if (!clientId) return;
    
    setIsLoadingSections(prev => ({ ...prev, [categoryId]: true }));
    
    try {
      const response = await axios.get(`/api/clients/${clientId}/categories/${categoryId}/sections`);
      setSections(prev => ({ ...prev, [categoryId]: response.data }));
    } catch (error) {
      console.error('Error al cargar las secciones:', error);
      toast.error('No se pudieron cargar las secciones');
    } finally {
      setIsLoadingSections(prev => ({ ...prev, [categoryId]: false }));
    }
  }, [clientId]);

  // Alternar visibilidad de una sección
  const toggleSectionVisibility = useCallback(async (sectionId: number, currentStatus: number) => {
    if (!clientId) return;
    
    setIsUpdatingVisibility(sectionId);
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
    } catch (error) {
      console.error('Error al cambiar la visibilidad:', error);
      toast.error('No se pudo cambiar la visibilidad');
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, [clientId]);

  // Crear una nueva sección
  const createSection = useCallback(async (categoryId: number, sectionData: Partial<Section>) => {
    if (!clientId) return null;
    
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
      return newSection;
    } catch (error) {
      console.error('Error al crear la sección:', error);
      toast.error('No se pudo crear la sección');
      return null;
    }
  }, [clientId]);

  // Actualizar una sección existente
  const updateSection = useCallback(async (categoryId: number, sectionId: number, sectionData: Partial<Section>) => {
    if (!clientId) return false;
    
    try {
      const formData = new FormData();
      
      // Agregar datos básicos si se proporcionan
      if (sectionData.name !== undefined) {
        formData.append('name', sectionData.name);
      }
      
      // Agregar imagen si existe y es un archivo (no una URL string)
      if (sectionData.image && typeof sectionData.image !== 'string') {
        formData.append('image', sectionData.image);
      }
      
      await axios.patch(`/api/clients/${clientId}/sections/${sectionId}`, formData);
      
      // Actualizar estado local
      setSections(prev => ({
        ...prev,
        [categoryId]: prev[categoryId].map(sec => 
          sec.section_id === sectionId 
            ? { ...sec, ...sectionData, image: sectionData.image || sec.image }
            : sec
        )
      }));
      
      toast.success('Sección actualizada correctamente');
      return true;
    } catch (error) {
      console.error('Error al actualizar la sección:', error);
      toast.error('No se pudo actualizar la sección');
      return false;
    }
  }, [clientId]);

  // Eliminar una sección
  const deleteSection = useCallback(async (categoryId: number, sectionId: number) => {
    if (!clientId) return false;
    
    try {
      await axios.delete(`/api/clients/${clientId}/sections/${sectionId}`);
      
      // Actualizar estado local
      setSections(prev => ({
        ...prev,
        [categoryId]: prev[categoryId].filter(sec => sec.section_id !== sectionId)
      }));
      
      toast.success('Sección eliminada correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar la sección:', error);
      toast.error('No se pudo eliminar la sección');
      return false;
    }
  }, [clientId]);

  // Reordenar secciones dentro de una categoría
  const reorderSection = useCallback(async (categoryId: number, sourceIndex: number, destinationIndex: number) => {
    if (!clientId || !sections[categoryId] || sections[categoryId].length === 0) return;
    
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
      
      toast.success('Orden actualizado correctamente');
    } catch (error) {
      console.error('Error al reordenar secciones:', error);
      toast.error('No se pudo actualizar el orden');
      
      // Restaurar el estado original en caso de error
      setSections(prev => ({
        ...prev,
        [categoryId]: sections[categoryId]
      }));
    }
  }, [clientId, sections]);

  // Alternar expansión de secciones
  const toggleSectionExpansion = useCallback((sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Limpiar secciones cargadas para una categoría específica
  const clearSections = useCallback((categoryId: number) => {
    setSections(prev => {
      const updated = { ...prev };
      delete updated[categoryId];
      return updated;
    });
  }, []);

  return {
    sections,
    isLoadingSections,
    expandedSections,
    isUpdatingVisibility,
    fetchSections,
    toggleSectionVisibility,
    createSection,
    updateSection,
    deleteSection,
    reorderSection,
    toggleSectionExpansion,
    clearSections
  };
} 
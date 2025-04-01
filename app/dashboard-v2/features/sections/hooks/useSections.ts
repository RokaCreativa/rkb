import { useEffect } from 'react';
import { useDashboardStore } from '../../../core/store/useDashboardStore';
import { apiClient } from '../../../infrastructure/api/apiClient';
import { Section } from '../../../core/types';

export const useSections = (categoryId: number) => {
  const {
    sections,
    setSections,
    setLoading,
    setError,
    addSection,
    updateSection,
    deleteSection,
  } = useDashboardStore();

  // Cargar secciones cuando cambie la categoría
  useEffect(() => {
    const loadSections = async () => {
      if (!categoryId) return;

      try {
        setLoading(true);
        const data = await apiClient.getSections(categoryId);
        setSections(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al cargar las secciones');
      } finally {
        setLoading(false);
      }
    };

    loadSections();
  }, [categoryId, setSections, setLoading, setError]);

  const handleCreateSection = async (section: Omit<Section, 'section_id'>) => {
    try {
      setLoading(true);
      const newSection = await apiClient.createSection(section);
      addSection(newSection);
      return newSection;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear la sección');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSection = async (section: Section) => {
    try {
      setLoading(true);
      const updatedSection = await apiClient.updateSection(section);
      updateSection(updatedSection);
      return updatedSection;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar la sección');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    try {
      setLoading(true);
      await apiClient.deleteSection(sectionId);
      deleteSection(sectionId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar la sección');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Filtrar secciones por categoría
  const categorySections = sections.filter(section => section.category_id === categoryId);

  return {
    sections: categorySections,
    handleCreateSection,
    handleUpdateSection,
    handleDeleteSection,
  };
}; 
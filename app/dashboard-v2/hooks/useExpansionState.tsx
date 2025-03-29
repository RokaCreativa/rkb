"use client";

import { useState, useCallback } from 'react';

/**
 * Hook personalizado para gestionar el estado de expansión de categorías y secciones
 * Centraliza la lógica de expansión/colapso de elementos en el dashboard
 */
export default function useExpansionState() {
  // Estados para el seguimiento de elementos expandidos
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  
  // Estados para el seguimiento de cargas en progreso
  const [loadingSections, setLoadingSections] = useState<Record<number, boolean>>({});
  const [loadingProducts, setLoadingProducts] = useState<Record<number, boolean>>({});
  
  // Estado para la imagen expandida (preview)
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  // Función para alternar la expansión de una categoría
  const toggleCategoryExpansion = useCallback((categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);
  
  // Función para alternar la expansión de una sección
  const toggleSectionExpansion = useCallback((sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);
  
  // Función para establecer el estado de carga de las secciones de una categoría
  const setLoadingSectionsForCategory = useCallback((categoryId: number, isLoading: boolean) => {
    setLoadingSections(prev => ({
      ...prev,
      [categoryId]: isLoading
    }));
  }, []);
  
  // Función para establecer el estado de carga de los productos de una sección
  const setLoadingProductsForSection = useCallback((sectionId: number, isLoading: boolean) => {
    setLoadingProducts(prev => ({
      ...prev,
      [sectionId]: isLoading
    }));
  }, []);
  
  return {
    // Estados
    expandedCategories,
    expandedSections,
    loadingSections,
    loadingProducts,
    expandedImage,
    
    // Acciones
    setExpandedCategories,
    setExpandedSections,
    setLoadingSections,
    setLoadingProducts,
    setExpandedImage,
    
    // Funciones
    toggleCategoryExpansion,
    toggleSectionExpansion,
    setLoadingSectionsForCategory,
    setLoadingProductsForSection
  };
} 
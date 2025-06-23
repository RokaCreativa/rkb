"use client";

import { useState, useCallback } from 'react';
import { Category, Section } from '@/app/types/menu';
import { ViewType } from '../../types/dashboard';

/**
 * Hook personalizado para gestionar el estado de navegación y vistas en el dashboard móvil
 * Este hook centraliza la lógica de navegación entre las diferentes vistas del dashboard móvil
 */
export default function useMobileViewState() {
  // Estado de la vista actual ('CATEGORIES', 'SECTIONS', 'PRODUCTS')
  const [currentView, setCurrentView] = useState<ViewType>('CATEGORIES');

  // Estados para los elementos seleccionados
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Función para navegar a la vista de categorías
  const navigateToCategories = useCallback(() => {
    setCurrentView('CATEGORIES');
    setSelectedCategory(null);
    setSelectedSection(null);
  }, []);

  // Función para navegar a la vista de secciones de una categoría
  const navigateToSections = useCallback((category: Category) => {
    setSelectedCategory(category);
    setSelectedCategoryId(category.category_id);
    setCurrentView('SECTIONS');
    setSelectedSection(null);
    // Log para depuración
    console.log('Navegando a secciones para categoría:', category.name);
  }, []);

  // Función para navegar a la vista de productos de una sección
  const navigateToProducts = useCallback((section: Section) => {
    setSelectedSection(section);
    setCurrentView('PRODUCTS');
  }, []);

  // Función para navegar hacia atrás
  const navigateBack = useCallback(() => {
    if (currentView === 'PRODUCTS') {
      setCurrentView('SECTIONS');
      setSelectedSection(null);
    } else if (currentView === 'SECTIONS') {
      setCurrentView('CATEGORIES');
      setSelectedCategory(null);
      setSelectedCategoryId(null);
    }
  }, [currentView]);

  return {
    // Estados
    currentView,
    selectedCategory,
    selectedSection,
    selectedCategoryId,

    // Acciones
    setCurrentView,
    setSelectedCategory,
    setSelectedSection,
    setSelectedCategoryId,

    // Funciones de navegación
    navigateToCategories,
    navigateToSections,
    navigateToProducts,
    navigateBack
  };
} 
"use client";

/**
 * @fileoverview Hook para gestionar la navegación entre vistas del dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 * 
 * Este hook proporciona funcionalidades para gestionar la navegación
 * entre las diferentes vistas del dashboard (categorías, secciones, productos)
 */

import { useState, useCallback } from 'react';
import { Category, Section } from '@/app/types/menu';

/**
 * Tipo para las diferentes vistas disponibles en el dashboard
 */
export type DashboardView = 'categories' | 'sections' | 'products';

/**
 * Hook para gestionar la navegación en el dashboard
 * 
 * Proporciona funcionalidades para:
 * - Cambiar entre las vistas de categorías, secciones y productos
 * - Mantener el estado de la categoría y sección seleccionadas
 * - Navegar hacia atrás en la jerarquía de vistas
 * 
 * @returns Objeto con estado y funciones para gestionar la navegación
 */
export default function useDashboardNavigation() {
  // Vista actual: categorías, secciones o productos
  const [currentView, setCurrentView] = useState<DashboardView>('categories');
  
  // Elementos seleccionados
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  /**
   * Navega a la vista de categorías
   * Reinicia las selecciones de categoría y sección
   */
  const navigateToCategories = useCallback(() => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSelectedSection(null);
  }, []);

  /**
   * Navega a la vista de secciones de una categoría
   * @param category - Categoría seleccionada
   */
  const navigateToSections = useCallback((category: Category) => {
    setCurrentView('sections');
    setSelectedCategory(category);
    setSelectedSection(null);
  }, []);

  /**
   * Navega a la vista de productos de una sección
   * @param section - Sección seleccionada
   */
  const navigateToProducts = useCallback((section: Section) => {
    setCurrentView('products');
    setSelectedSection(section);
  }, []);

  /**
   * Navega hacia atrás en la jerarquía de vistas
   * - De productos a secciones
   * - De secciones a categorías
   */
  const navigateBack = useCallback(() => {
    if (currentView === 'products' && selectedCategory) {
      // Volver de productos a secciones
      setCurrentView('sections');
      setSelectedSection(null);
    } else if (currentView === 'sections') {
      // Volver de secciones a categorías
      setCurrentView('categories');
      setSelectedCategory(null);
    }
  }, [currentView, selectedCategory]);

  return {
    // Estado actual
    currentView,
    selectedCategory,
    selectedSection,
    
    // Funciones para navegar
    navigateToCategories,
    navigateToSections,
    navigateToProducts,
    navigateBack,
    
    // Setters directos (por si se necesitan)
    setCurrentView,
    setSelectedCategory,
    setSelectedSection
  };
} 
 
/**
 * @file useDashboardState.ts
 * @description Hook para gestionar el estado de la UI del dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @created 2024-03-29
 */

import { useState, useCallback } from 'react';
import { Category, Section } from '@/app/types/menu';

// Tipo para las diferentes vistas del dashboard
type DashboardView = 'categories' | 'sections' | 'products';

/**
 * Tipo para un elemento de breadcrumb
 */
interface BreadcrumbItem {
  label: string;
  href?: string;
  current: boolean;
}

/**
 * Hook personalizado para gestionar el estado de la UI del dashboard
 * 
 * @returns Objeto con estado y funciones para gestionar la UI
 */
export const useDashboardState = () => {
  // Estado principal de navegación
  const [currentView, setCurrentView] = useState<DashboardView>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  
  // Estado para expandir/contraer elementos
  const [expandedCategories, setExpandedCategories] = useState<{[key: number]: boolean}>({});
  const [expandedSections, setExpandedSections] = useState<{[key: number]: boolean}>({});
  
  // Estado para modales
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Estado para modo de reordenamiento
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);

  /**
   * Navega a la vista de categorías
   */
  const navigateToCategories = useCallback(() => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSelectedSection(null);
  }, []);

  /**
   * Navega a la vista de secciones para una categoría específica
   */
  const navigateToSections = useCallback((category: Category) => {
    setCurrentView('sections');
    setSelectedCategory(category);
    setSelectedSection(null);
  }, []);

  /**
   * Navega a la vista de productos para una sección específica
   */
  const navigateToProducts = useCallback((section: Section, category: Category) => {
    setCurrentView('products');
    setSelectedCategory(category);
    setSelectedSection(section);
  }, []);

  /**
   * Alterna la expansión de una categoría
   */
  const toggleCategoryExpansion = useCallback((categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  /**
   * Alterna la expansión de una sección
   */
  const toggleSectionExpansion = useCallback((sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  /**
   * Alterna el modo de reordenamiento
   */
  const toggleReorderMode = useCallback(() => {
    setIsReorderModeActive(prev => !prev);
  }, []);

  /**
   * Obtiene los elementos de breadcrumb según la vista actual
   */
  const getBreadcrumbItems = useCallback((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard', current: currentView === 'categories' }
    ];

    if (selectedCategory) {
      items.push({
        label: selectedCategory.name,
        href: currentView === 'sections' ? undefined : `/dashboard/sections?category=${selectedCategory.category_id}`,
        current: currentView === 'sections'
      });
    }

    if (selectedSection) {
      items.push({
        label: selectedSection.name,
        current: currentView === 'products'
      });
    }

    return items;
  }, [currentView, selectedCategory, selectedSection]);

  /**
   * Maneja el clic en una categoría
   */
  const handleCategoryClick = useCallback((category: Category) => {
    const categoryId = category.category_id;
    
    // Si la categoría ya está expandida, navegar a la vista de secciones
    if (expandedCategories[categoryId]) {
      navigateToSections(category);
    } else {
      // Si no está expandida, expandirla
      toggleCategoryExpansion(categoryId);
    }
  }, [expandedCategories, navigateToSections, toggleCategoryExpansion]);

  /**
   * Maneja el clic en una sección
   */
  const handleSectionClick = useCallback((section: Section) => {
    if (!selectedCategory) return;
    
    const sectionId = section.section_id;
    
    // Si la sección ya está expandida, navegar a la vista de productos
    if (expandedSections[sectionId]) {
      navigateToProducts(section, selectedCategory);
    } else {
      // Si no está expandida, expandirla
      toggleSectionExpansion(sectionId);
    }
  }, [expandedSections, navigateToProducts, selectedCategory, toggleSectionExpansion]);

  return {
    // Estado de navegación
    currentView,
    selectedCategory,
    selectedSection,
    
    // Estado de expansión
    expandedCategories,
    expandedSections,
    
    // Estado de modales
    isNewCategoryModalOpen,
    setIsNewCategoryModalOpen,
    isNewSectionModalOpen,
    setIsNewSectionModalOpen,
    isNewProductModalOpen,
    setIsNewProductModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    
    // Estado de reordenamiento
    isReorderModeActive,
    
    // Acciones de navegación
    navigateToCategories,
    navigateToSections,
    navigateToProducts,
    
    // Acciones de UI
    toggleCategoryExpansion,
    toggleSectionExpansion,
    toggleReorderMode,
    getBreadcrumbItems,
    handleCategoryClick,
    handleSectionClick
  };
};

export default useDashboardState; 
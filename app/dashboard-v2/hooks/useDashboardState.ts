"use client";

/**
 * @fileoverview Hook principal para la gestión del estado del dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { useCallback } from 'react';
import { 
  DashboardState, 
  DashboardActions, 
  Category, 
  Section, 
  Product 
} from '@/app/dashboard-v2/types';
import useCategoryManagement from './useCategoryManagement';
import useSectionManagement from './useSectionManagement';
import useProductManagement from './useProductManagement';

/**
 * Hook principal que combina todos los hooks de dominio para la gestión del estado del dashboard
 * 
 * Proporciona un punto único de acceso a todas las funciones y estados necesarios
 * para gestionar categorías, secciones y productos en el dashboard.
 * 
 * @returns Funciones y estados para la gestión completa del dashboard
 */
export default function useDashboardState() {
  // Obtener hooks de dominio
  const categoryHook = useCategoryManagement();
  const sectionHook = useSectionManagement();
  const productHook = useProductManagement();
  
  // Gestión de errores combinados
  const error = categoryHook.error || sectionHook.error || productHook.error;
  
  // Estado de carga combinado
  const isLoading = categoryHook.isLoading || sectionHook.isLoading || productHook.isLoading;
  
  // Estado de actualización de visibilidad combinado
  const isUpdatingVisibility = sectionHook.isUpdatingVisibility || productHook.isUpdatingVisibility;
  
  // Exposición de funciones y estados
  return {
    // Estado del cliente
    client: categoryHook.client,
    
    // Estado de categorías
    categories: categoryHook.categories,
    setCategories: categoryHook.setCategories,
    
    // Estado de secciones
    sections: sectionHook.sections,
    setSections: sectionHook.setSections,
    
    // Estado de productos
    products: productHook.products,
    setProducts: productHook.setProducts,
    
    // Estados compartidos
    isLoading,
    isUpdatingVisibility,
    error,
    
    // Funciones del cliente
    fetchClientData: categoryHook.fetchClientData,
    
    // Funciones de categorías
    fetchCategories: categoryHook.fetchCategories,
    createCategory: categoryHook.createCategory,
    updateCategory: categoryHook.updateCategory,
    deleteCategory: categoryHook.deleteCategory,
    toggleCategoryVisibility: categoryHook.toggleCategoryVisibility,
    
    // Funciones de secciones
    fetchSectionsByCategory: sectionHook.fetchSectionsByCategory,
    createSection: sectionHook.createSection,
    updateSection: sectionHook.updateSection,
    deleteSection: sectionHook.deleteSection,
    toggleSectionVisibility: sectionHook.toggleSectionVisibility,
    
    // Funciones de productos
    fetchProductsBySection: productHook.fetchProductsBySection,
    createProduct: productHook.createProduct,
    updateProduct: productHook.updateProduct,
    deleteProduct: productHook.deleteProduct,
    toggleProductVisibility: productHook.toggleProductVisibility
  };
} 
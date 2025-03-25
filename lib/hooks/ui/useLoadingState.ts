"use client";

/**
 * @fileoverview Hook para gestionar los estados de carga y actualización
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este hook proporciona funcionalidades para gestionar los estados de carga
 * y actualización en la interfaz de usuario, mejorando la experiencia del usuario
 * al proporcionar feedback visual durante las operaciones asíncronas.
 */

import { useState, useCallback } from 'react';

/**
 * Hook que proporciona estados y funciones para gestionar estados de carga
 * 
 * Este hook gestiona:
 * - Estados de carga de listas (categorías, secciones, productos)
 * - Estados de carga durante las operaciones CRUD
 * - Estados de expansión de elementos en listas
 * 
 * @returns Objeto con estados y funciones para gestionar estados de carga
 */
export default function useLoadingState() {
  // Estados de carga generales
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados de carga específicos
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState<Record<number, boolean>>({});
  const [isLoadingProducts, setIsLoadingProducts] = useState<Record<number, boolean>>({});
  
  // Estados de actualización
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  
  // Estados de expansión
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  
  // Manejo de carga general
  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);
  
  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  // Manejo de carga de categorías
  const startLoadingCategories = useCallback(() => {
    setIsLoadingCategories(true);
  }, []);
  
  const stopLoadingCategories = useCallback(() => {
    setIsLoadingCategories(false);
  }, []);
  
  // Manejo de carga de secciones
  const startLoadingSections = useCallback((categoryId: number) => {
    setIsLoadingSections(prev => ({
      ...prev,
      [categoryId]: true
    }));
  }, []);
  
  const stopLoadingSections = useCallback((categoryId: number) => {
    setIsLoadingSections(prev => ({
      ...prev,
      [categoryId]: false
    }));
  }, []);
  
  // Manejo de carga de productos
  const startLoadingProducts = useCallback((sectionId: number) => {
    setIsLoadingProducts(prev => ({
      ...prev,
      [sectionId]: true
    }));
  }, []);
  
  const stopLoadingProducts = useCallback((sectionId: number) => {
    setIsLoadingProducts(prev => ({
      ...prev,
      [sectionId]: false
    }));
  }, []);
  
  // Manejo de estados de expansión
  const toggleCategoryExpansion = useCallback((categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);
  
  const toggleSectionExpansion = useCallback((sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);
  
  // Manejo de modo de reordenamiento
  const toggleReorderMode = useCallback(() => {
    setIsReorderMode(prev => !prev);
  }, []);
  
  return {
    // Estados de carga generales
    isLoading,
    setIsLoading,
    startLoading,
    stopLoading,
    
    // Estados de carga específicos
    isLoadingCategories,
    setIsLoadingCategories,
    startLoadingCategories,
    stopLoadingCategories,
    
    isLoadingSections,
    setIsLoadingSections,
    startLoadingSections,
    stopLoadingSections,
    
    isLoadingProducts,
    setIsLoadingProducts,
    startLoadingProducts,
    stopLoadingProducts,
    
    // Estados de actualización
    isUpdatingVisibility,
    setIsUpdatingVisibility,
    
    // Estados de reordenamiento
    isReorderMode,
    setIsReorderMode,
    toggleReorderMode,
    
    // Estados de expansión
    expandedCategories,
    setExpandedCategories,
    toggleCategoryExpansion,
    
    expandedSections,
    setExpandedSections,
    toggleSectionExpansion
  };
} 
"use client";

/**
 * @fileoverview Hook para gestionar el estado de la interfaz del dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este hook centraliza todo el estado de la UI del dashboard, incluyendo:
 * - Navegación entre vistas (categorías, secciones, productos)
 * - Estado de los modales (apertura/cierre)
 * - Elementos seleccionados para operaciones CRUD
 */

import { useState, useCallback } from 'react';
import { Category, Section, Product } from '@/app/types/menu';

/**
 * Tipos de vistas disponibles en el dashboard
 */
export type ViewType = 'categories' | 'sections' | 'products';

/**
 * Hook para gestionar el estado de la interfaz del dashboard
 * 
 * Este hook proporciona:
 * - Control de navegación entre vistas
 * - Gestión de modales
 * - Selección de elementos para operaciones
 * 
 * @returns Objeto con estados y funciones para gestionar la UI
 */
export default function useUIState() {
  // =============================================
  // Estado de navegación
  // =============================================
  
  /**
   * Vista actual del dashboard
   */
  const [currentView, setCurrentView] = useState<ViewType>('categories');
  
  /**
   * Categoría seleccionada actualmente
   */
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  /**
   * Sección seleccionada actualmente
   */
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  
  // =============================================
  // Estados de modales
  // =============================================
  
  // Modales de categoría
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  
  // Modales de sección
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] = useState(false);
  
  // Modales de producto
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  
  // =============================================
  // Elementos seleccionados para operaciones
  // =============================================
  
  // Categorías
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  
  // Secciones
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
  
  // Productos
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  
  // =============================================
  // Funciones de navegación
  // =============================================
  
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
  
  // =============================================
  // Manejadores para modales de categorías
  // =============================================
  
  /**
   * Abre el modal para crear una nueva categoría
   */
  const handleNewCategory = useCallback(() => {
    setIsNewCategoryModalOpen(true);
  }, []);
  
  /**
   * Abre el modal para editar una categoría
   * @param category - Categoría a editar
   */
  const handleEditCategory = useCallback((category: Category) => {
    setCategoryToEdit(category);
    setIsEditCategoryModalOpen(true);
  }, []);
  
  /**
   * Abre el modal para eliminar una categoría
   * @param categoryId - ID de la categoría a eliminar
   */
  const handleDeleteCategory = useCallback((categoryId: number) => {
    setCategoryToDelete(categoryId);
    setIsDeleteCategoryModalOpen(true);
  }, []);
  
  // =============================================
  // Manejadores para modales de secciones
  // =============================================
  
  /**
   * Abre el modal para crear una nueva sección
   */
  const handleNewSection = useCallback(() => {
    setIsNewSectionModalOpen(true);
  }, []);
  
  /**
   * Abre el modal para editar una sección
   * @param section - Sección a editar
   */
  const handleEditSection = useCallback((section: Section) => {
    setSectionToEdit(section);
    setIsEditSectionModalOpen(true);
  }, []);
  
  /**
   * Abre el modal para eliminar una sección
   * @param sectionId - ID de la sección a eliminar
   */
  const handleDeleteSection = useCallback((sectionId: number) => {
    setSectionToDelete(sectionId);
    setIsDeleteSectionModalOpen(true);
  }, []);
  
  // =============================================
  // Manejadores para modales de productos
  // =============================================
  
  /**
   * Abre el modal para crear un nuevo producto
   */
  const handleNewProduct = useCallback(() => {
    setIsNewProductModalOpen(true);
  }, []);
  
  /**
   * Abre el modal para editar un producto
   * @param product - Producto a editar
   */
  const handleEditProduct = useCallback((product: Product) => {
    setProductToEdit(product);
    setIsEditProductModalOpen(true);
  }, []);
  
  /**
   * Abre el modal para eliminar un producto
   * @param productId - ID del producto a eliminar
   */
  const handleDeleteProduct = useCallback((productId: number) => {
    setProductToDelete(productId);
    setIsDeleteProductModalOpen(true);
  }, []);
  
  /**
   * Cierra todos los modales y limpia los estados de selección
   */
  const resetModalStates = useCallback(() => {
    // Cerrar todos los modales
    setIsNewCategoryModalOpen(false);
    setIsEditCategoryModalOpen(false);
    setIsDeleteCategoryModalOpen(false);
    
    setIsNewSectionModalOpen(false);
    setIsEditSectionModalOpen(false);
    setIsDeleteSectionModalOpen(false);
    
    setIsNewProductModalOpen(false);
    setIsEditProductModalOpen(false);
    setIsDeleteProductModalOpen(false);
    
    // Resetear elementos seleccionados
    setCategoryToEdit(null);
    setCategoryToDelete(null);
    
    setSectionToEdit(null);
    setSectionToDelete(null);
    
    setProductToEdit(null);
    setProductToDelete(null);
  }, []);
  
  return {
    // Estados de navegación
    currentView,
    selectedCategory,
    selectedSection,
    
    // Estados de modales de categoría
    isNewCategoryModalOpen,
    isEditCategoryModalOpen,
    isDeleteCategoryModalOpen,
    
    // Estados de modales de sección
    isNewSectionModalOpen,
    isEditSectionModalOpen,
    isDeleteSectionModalOpen,
    
    // Estados de modales de producto
    isNewProductModalOpen,
    isEditProductModalOpen,
    isDeleteProductModalOpen,
    
    // Elementos seleccionados - categorías
    categoryToEdit,
    categoryToDelete,
    
    // Elementos seleccionados - secciones
    sectionToEdit,
    sectionToDelete,
    
    // Elementos seleccionados - productos
    productToEdit,
    productToDelete,
    
    // Setters para estados de modales - categorías
    setIsNewCategoryModalOpen,
    setIsEditCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    
    // Setters para estados de modales - secciones
    setIsNewSectionModalOpen,
    setIsEditSectionModalOpen,
    setIsDeleteSectionModalOpen,
    
    // Setters para estados de modales - productos
    setIsNewProductModalOpen,
    setIsEditProductModalOpen,
    setIsDeleteProductModalOpen,
    
    // Funciones de navegación
    navigateToCategories,
    navigateToSections,
    navigateToProducts,
    navigateBack,
    
    // Manejadores para modales de categorías
    handleNewCategory,
    handleEditCategory,
    handleDeleteCategory,
    
    // Manejadores para modales de secciones
    handleNewSection,
    handleEditSection,
    handleDeleteSection,
    
    // Manejadores para modales de productos
    handleNewProduct,
    handleEditProduct,
    handleDeleteProduct,
    
    // Función utilitaria
    resetModalStates
  };
} 
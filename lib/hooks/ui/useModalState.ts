"use client";

/**
 * @fileoverview Hook para gestionar los estados de modales del dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este hook proporciona funcionalidades para gestionar los estados de los
 * modales en toda la aplicación, optimizando la lógica de UI.
 */

import { useState, useCallback } from 'react';
import { Category, Section, Product } from '@/app/types/menu';

/**
 * Hook que proporciona estados y funciones para gestionar modales
 * 
 * Este hook gestiona:
 * - Estados de apertura/cierre de modales
 * - Elementos seleccionados para editar o eliminar
 * - Funciones para abrir modales con elementos específicos
 * - Función para resetear todos los estados de modales
 * 
 * @returns Objeto con estados y funciones para gestionar modales
 */
export default function useModalState() {
  // Estados para modales de categoría
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  
  // Estados para modales de sección
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
  
  // Estados para modales de producto
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  
  // Manejadores para categorías
  const handleNewCategory = useCallback(() => {
    setIsNewCategoryModalOpen(true);
  }, []);
  
  const handleEditCategory = useCallback((category: Category) => {
    setCategoryToEdit(category);
    setIsEditCategoryModalOpen(true);
  }, []);
  
  const handleDeleteCategory = useCallback((categoryId: number) => {
    setCategoryToDelete(categoryId);
    setIsDeleteCategoryModalOpen(true);
  }, []);
  
  // Manejadores para secciones
  const handleNewSection = useCallback(() => {
    setIsNewSectionModalOpen(true);
  }, []);
  
  const handleEditSection = useCallback((section: Section) => {
    setSectionToEdit(section);
    setIsEditSectionModalOpen(true);
  }, []);
  
  const handleDeleteSection = useCallback((sectionId: number) => {
    setSectionToDelete(sectionId);
    setIsDeleteSectionModalOpen(true);
  }, []);
  
  // Manejadores para productos
  const handleNewProduct = useCallback(() => {
    setIsNewProductModalOpen(true);
  }, []);
  
  const handleEditProduct = useCallback((product: Product) => {
    setProductToEdit(product);
    setIsEditProductModalOpen(true);
  }, []);
  
  const handleDeleteProduct = useCallback((productId: number) => {
    setProductToDelete(productId);
    setIsDeleteProductModalOpen(true);
  }, []);
  
  // Resetear estados de modales
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
    // Estados de modales de categoría
    isNewCategoryModalOpen,
    isEditCategoryModalOpen,
    isDeleteCategoryModalOpen,
    categoryToEdit,
    categoryToDelete,
    setIsNewCategoryModalOpen,
    setIsEditCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    
    // Estados de modales de sección
    isNewSectionModalOpen,
    isEditSectionModalOpen,
    isDeleteSectionModalOpen,
    sectionToEdit,
    sectionToDelete,
    setIsNewSectionModalOpen,
    setIsEditSectionModalOpen,
    setIsDeleteSectionModalOpen,
    
    // Estados de modales de producto
    isNewProductModalOpen,
    isEditProductModalOpen,
    isDeleteProductModalOpen,
    productToEdit,
    productToDelete,
    setIsNewProductModalOpen,
    setIsEditProductModalOpen,
    setIsDeleteProductModalOpen,
    
    // Manejadores
    handleNewCategory,
    handleEditCategory,
    handleDeleteCategory,
    
    handleNewSection,
    handleEditSection,
    handleDeleteSection,
    
    handleNewProduct,
    handleEditProduct,
    handleDeleteProduct,
    
    // Función para resetear estados
    resetModalStates
  };
} 
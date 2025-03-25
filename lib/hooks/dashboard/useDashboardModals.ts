"use client";

/**
 * @fileoverview Hook para gestionar los estados de modales del dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 * 
 * Este hook proporciona funcionalidades para gestionar los estados de los
 * modales en el dashboard, optimizando la lógica de UI.
 */

import { useState, useCallback } from 'react';
import { Category, Section, Product } from '@/app/types/menu';

/**
 * Hook que proporciona estados y funciones para gestionar modales del dashboard
 * 
 * Este hook gestiona:
 * - Estados de apertura/cierre de modales para CRUD de categorías, secciones y productos
 * - Elementos seleccionados para editar o eliminar
 * - Funciones para abrir modales con elementos específicos
 * - Función para resetear todos los estados de modales
 * 
 * @returns Objeto con estados y funciones para gestionar modales
 */
export default function useDashboardModals() {
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
  /**
   * Abre el modal para crear una nueva categoría
   */
  const openNewCategoryModal = useCallback(() => {
    setIsNewCategoryModalOpen(true);
  }, []);
  
  /**
   * Abre el modal para editar una categoría
   * @param category Categoría a editar
   */
  const openEditCategoryModal = useCallback((category: Category) => {
    setCategoryToEdit(category);
    setIsEditCategoryModalOpen(true);
  }, []);
  
  /**
   * Abre el modal para confirmar eliminación de categoría
   * @param categoryId ID de la categoría a eliminar
   */
  const openDeleteCategoryModal = useCallback((categoryId: number) => {
    setCategoryToDelete(categoryId);
    setIsDeleteCategoryModalOpen(true);
  }, []);
  
  // Manejadores para secciones
  /**
   * Abre el modal para crear una nueva sección
   */
  const openNewSectionModal = useCallback(() => {
    setIsNewSectionModalOpen(true);
  }, []);
  
  /**
   * Abre el modal para editar una sección
   * @param section Sección a editar
   */
  const openEditSectionModal = useCallback((section: Section) => {
    setSectionToEdit(section);
    setIsEditSectionModalOpen(true);
  }, []);
  
  /**
   * Abre el modal para confirmar eliminación de sección
   * @param sectionId ID de la sección a eliminar
   */
  const openDeleteSectionModal = useCallback((sectionId: number) => {
    setSectionToDelete(sectionId);
    setIsDeleteSectionModalOpen(true);
  }, []);
  
  // Manejadores para productos
  /**
   * Abre el modal para crear un nuevo producto
   */
  const openNewProductModal = useCallback(() => {
    setIsNewProductModalOpen(true);
  }, []);
  
  /**
   * Abre el modal para editar un producto
   * @param product Producto a editar
   */
  const openEditProductModal = useCallback((product: Product) => {
    setProductToEdit(product);
    setIsEditProductModalOpen(true);
  }, []);
  
  /**
   * Abre el modal para confirmar eliminación de producto
   * @param productId ID del producto a eliminar
   */
  const openDeleteProductModal = useCallback((productId: number) => {
    setProductToDelete(productId);
    setIsDeleteProductModalOpen(true);
  }, []);
  
  /**
   * Cierra todos los modales y resetea sus estados
   */
  const closeAllModals = useCallback(() => {
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
    setCategoryToEdit,
    setCategoryToDelete,
    
    // Estados de modales de sección
    isNewSectionModalOpen,
    isEditSectionModalOpen,
    isDeleteSectionModalOpen,
    sectionToEdit,
    sectionToDelete,
    setIsNewSectionModalOpen,
    setIsEditSectionModalOpen,
    setIsDeleteSectionModalOpen,
    setSectionToEdit,
    setSectionToDelete,
    
    // Estados de modales de producto
    isNewProductModalOpen,
    isEditProductModalOpen,
    isDeleteProductModalOpen,
    productToEdit,
    productToDelete,
    setIsNewProductModalOpen,
    setIsEditProductModalOpen,
    setIsDeleteProductModalOpen,
    setProductToEdit,
    setProductToDelete,
    
    // Manejadores para abrir modales
    openNewCategoryModal,
    openEditCategoryModal,
    openDeleteCategoryModal,
    
    openNewSectionModal,
    openEditSectionModal,
    openDeleteSectionModal,
    
    openNewProductModal,
    openEditProductModal,
    openDeleteProductModal,
    
    // Función para cerrar todos los modales
    closeAllModals
  };
}
 
"use client";

import { useState, useCallback } from 'react';
import { Category, Section, Product } from '@/app/types/menu';

/**
 * Hook personalizado para gestionar el estado de los modales en el dashboard
 * Centraliza la gestión de visibilidad y datos para todos los modales
 */
export default function useModalState() {
  // Modales de categorías
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: number, name: string } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  
  // Campos para edición de categoría
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  
  // Modales de secciones
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<{ id: number, name: string } | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
  
  // Modales de productos
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{ id: number, name: string } | null>(null);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  
  // Función para abrir el modal de nueva categoría
  const openNewCategoryModal = useCallback(() => {
    setIsNewCategoryModalOpen(true);
  }, []);
  
  // Función para abrir el modal de edición de categoría
  const openEditCategoryModal = useCallback((category: Category) => {
    setEditingCategory({
      id: category.category_id,
      name: category.name
    });
    setEditCategoryName(category.name);
    setEditImagePreview(category.image || null);
    setIsEditCategoryModalOpen(true);
  }, []);
  
  // Función para abrir el modal de confirmación de eliminación de categoría
  const openDeleteCategoryModal = useCallback((categoryId: number) => {
    setCategoryToDelete(categoryId);
    setIsDeleteCategoryModalOpen(true);
  }, []);
  
  // Función para abrir el modal de nueva sección
  const openNewSectionModal = useCallback(() => {
    setIsNewSectionModalOpen(true);
  }, []);
  
  // Función para abrir el modal de edición de sección
  const openEditSectionModal = useCallback((section: Section) => {
    setEditingSection({
      id: section.section_id,
      name: section.name
    });
    setIsEditSectionModalOpen(true);
  }, []);
  
  // Función para abrir el modal de confirmación de eliminación de sección
  const openDeleteSectionModal = useCallback((sectionId: number) => {
    setSectionToDelete(sectionId);
    setIsDeleteSectionModalOpen(true);
  }, []);
  
  // Función para abrir el modal de nuevo producto
  const openNewProductModal = useCallback(() => {
    setIsNewProductModalOpen(true);
  }, []);
  
  // Función para abrir el modal de edición de producto
  const openEditProductModal = useCallback((product: Product) => {
    setEditingProduct({
      id: product.product_id,
      name: product.name
    });
    setIsEditProductModalOpen(true);
  }, []);
  
  // Función para abrir el modal de confirmación de eliminación de producto
  const openDeleteProductModal = useCallback((productId: number) => {
    setProductToDelete(productId);
    setIsDeleteProductModalOpen(true);
  }, []);
  
  // Función para cerrar todos los modales y restablecer estados
  const closeAllModals = useCallback(() => {
    // Cerrar modales de categorías
    setIsNewCategoryModalOpen(false);
    setIsEditCategoryModalOpen(false);
    setIsDeleteCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryToDelete(null);
    
    // Limpiar campos de edición
    setEditCategoryName('');
    setEditCategoryImage(null);
    setEditImagePreview(null);
    
    // Cerrar modales de secciones
    setIsNewSectionModalOpen(false);
    setIsEditSectionModalOpen(false);
    setIsDeleteSectionModalOpen(false);
    setEditingSection(null);
    setSectionToDelete(null);
    
    // Cerrar modales de productos
    setIsNewProductModalOpen(false);
    setIsEditProductModalOpen(false);
    setIsDeleteProductModalOpen(false);
    setEditingProduct(null);
    setProductToDelete(null);
  }, []);
  
  return {
    // Estados de modales de categorías
    isNewCategoryModalOpen,
    isEditCategoryModalOpen,
    isDeleteCategoryModalOpen,
    editingCategory,
    categoryToDelete,
    editCategoryName,
    editCategoryImage,
    editImagePreview,
    
    // Estados de modales de secciones
    isNewSectionModalOpen,
    isEditSectionModalOpen,
    isDeleteSectionModalOpen,
    editingSection,
    sectionToDelete,
    
    // Estados de modales de productos
    isNewProductModalOpen,
    isEditProductModalOpen,
    isDeleteProductModalOpen,
    editingProduct,
    productToDelete,
    
    // Acciones para modales de categorías
    setIsNewCategoryModalOpen,
    setIsEditCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    setEditingCategory,
    setCategoryToDelete,
    setEditCategoryName,
    setEditCategoryImage,
    setEditImagePreview,
    
    // Acciones para modales de secciones
    setIsNewSectionModalOpen,
    setIsEditSectionModalOpen,
    setIsDeleteSectionModalOpen,
    setEditingSection,
    setSectionToDelete,
    
    // Acciones para modales de productos
    setIsNewProductModalOpen,
    setIsEditProductModalOpen,
    setIsDeleteProductModalOpen,
    setEditingProduct,
    setProductToDelete,
    
    // Funciones
    openNewCategoryModal,
    openEditCategoryModal,
    openDeleteCategoryModal,
    openNewSectionModal,
    openEditSectionModal,
    openDeleteSectionModal,
    openNewProductModal,
    openEditProductModal,
    openDeleteProductModal,
    closeAllModals
  };
} 
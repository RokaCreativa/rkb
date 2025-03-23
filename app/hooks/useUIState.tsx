import { useState, useCallback } from 'react';
import { Category, Section, Product } from '@/app/types/menu';

export type ViewType = 'categories' | 'sections' | 'products';

export default function useUIState() {
  // Estado actual de la vista
  const [currentView, setCurrentView] = useState<ViewType>('categories');
  
  // Categoría y sección seleccionadas
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  
  // Estados para modales
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] = useState(false);
  
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  
  // Elementos seleccionados para editar o eliminar
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
  
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  
  // Manejadores para la navegación
  const navigateToCategories = useCallback(() => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSelectedSection(null);
  }, []);
  
  const navigateToSections = useCallback((category: Category) => {
    setCurrentView('sections');
    setSelectedCategory(category);
    setSelectedSection(null);
  }, []);
  
  const navigateToProducts = useCallback((section: Section) => {
    setCurrentView('products');
    setSelectedSection(section);
  }, []);
  
  const navigateBack = useCallback(() => {
    if (currentView === 'products' && selectedCategory) {
      setCurrentView('sections');
      setSelectedSection(null);
    } else if (currentView === 'sections') {
      setCurrentView('categories');
      setSelectedCategory(null);
    }
  }, [currentView, selectedCategory]);
  
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
    // Estados
    currentView,
    selectedCategory,
    selectedSection,
    
    // Estados de modales
    isNewCategoryModalOpen,
    isEditCategoryModalOpen,
    isDeleteCategoryModalOpen,
    
    isNewSectionModalOpen,
    isEditSectionModalOpen,
    isDeleteSectionModalOpen,
    
    isNewProductModalOpen,
    isEditProductModalOpen,
    isDeleteProductModalOpen,
    
    // Elementos seleccionados
    categoryToEdit,
    categoryToDelete,
    
    sectionToEdit,
    sectionToDelete,
    
    productToEdit,
    productToDelete,
    
    // Setters para estados de modales
    setIsNewCategoryModalOpen,
    setIsEditCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    
    setIsNewSectionModalOpen,
    setIsEditSectionModalOpen,
    setIsDeleteSectionModalOpen,
    
    setIsNewProductModalOpen,
    setIsEditProductModalOpen,
    setIsDeleteProductModalOpen,
    
    // Funciones de navegación
    navigateToCategories,
    navigateToSections,
    navigateToProducts,
    navigateBack,
    
    // Manejadores para elementos
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
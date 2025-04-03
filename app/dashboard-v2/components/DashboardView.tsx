"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TopNavbar } from "./TopNavbar";
import { Loader } from "./ui/Loader";
import { Category, Section, Product } from "@/app/types/menu";
import useDataState from "../hooks/useDataState";

// Importar nuevos componentes de vistas
import CategoryView from "./views/CategoryView";
import SectionView from "./views/SectionView";
import ProductView from "./views/ProductView";
import Breadcrumbs from "./views/Breadcrumbs";
import MobilePreview from "./views/MobilePreview";

// Importar modales
import NewCategoryModal from "./modals/NewCategoryModal";
import NewSectionModal from "./modals/NewSectionModal";
import NewProductModal from "./modals/NewProductModal";
import EditCategoryModal from "./modals/EditCategoryModal";
import EditSectionModal from "./modals/EditSectionModal";
import EditProductModal from "./modals/EditProductModal";
import DeleteCategoryModal from "./modals/DeleteCategoryModal";
import DeleteSectionModal from "./modals/DeleteSectionModal";
import DeleteProductModal from "./modals/DeleteProductModal";

// Importar tipos
import { ViewType } from "../types/dashboard";

// Constante para habilitar logs de depuración
const DEBUG = process.env.NODE_ENV === 'development';

/**
 * DashboardView - Componente principal del dashboard refactorizado
 * 
 * Este componente es responsable de:
 * 1. Mostrar la interfaz principal del dashboard
 * 2. Orquestar la navegación entre vistas (categorías, secciones, productos)
 * 3. Gestionar los estados expandidos/colapsados de categorías y secciones
 * 4. Mostrar los modales de creación, edición y eliminación
 */
export default function DashboardView() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";
  
  // IMPORTANTE: Estado para vistas - siempre al inicio de todos los useState
  const [currentView, setCurrentView] = useState<ViewType>('CATEGORIES');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Log de depuración al montar el componente
  useEffect(() => {
    if (DEBUG) {
      console.log('🔍 DashboardView montado');
      console.log('🔑 Estado de autenticación:', status);
      console.log('👤 Sesión:', session ? 'Presente' : 'No presente');
    }
  }, [session, status]);
  
  // Inicializar hook de estado para la gestión del estado global
  const {
    client,
    categories,
    sections,
    products,
    isLoading: isDataLoading,
    isUpdatingVisibility,
    error: dataError,
    setCategories,
    setSections,
    setProducts,
    toggleSectionVisibility,
    toggleProductVisibility,
    fetchSectionsByCategory,
    fetchClientData,
    fetchCategories,
    fetchProductsBySection,
    deleteCategory,
    deleteSection,
    deleteProduct
  } = useDataState();
  
  // Estados para selección y expansión
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: number]: boolean }>({});
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});
  
  // Estados para control de modales
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [showDeleteSectionModal, setShowDeleteSectionModal] = useState(false);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Category | Section | Product | null>(null);
  
  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      const loadInitialData = async () => {
        try {
          setIsLoading(true);
          await fetchClientData();
          await fetchCategories();
          setIsLoading(false);
        } catch (error) {
          setError('Error al cargar datos iniciales');
          setIsLoading(false);
        }
      };
      
      loadInitialData();
    }
  }, [isAuthenticated, fetchClientData, fetchCategories]);
  
  // Handlers para navegación
  const goToHome = useCallback(() => {
    setCurrentView('CATEGORIES');
    setSelectedCategory(null);
    setSelectedSection(null);
  }, []);

  const goToCategory = useCallback((category: Category) => {
    setCurrentView('SECTIONS');
    setSelectedCategory(category);
    setSelectedSection(null);
  }, []);

  const goToSection = useCallback((section: Section) => {
    if (section && section.section_id) {
      setCurrentView('PRODUCTS');
      setSelectedSection(section);
    }
  }, []);
  
  // Handlers para manejo de categorías
  const handleAddCategory = () => {
    setShowNewCategoryModal(true);
  };
  
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowEditCategoryModal(true);
  };
  
  const handleDeleteCategory = (category: Category) => {
    setItemToDelete(category);
    setShowDeleteCategoryModal(true);
  };
  
  const handleConfirmDeleteCategory = async () => {
    if (!itemToDelete || !('category_id' in itemToDelete)) return;
    
    try {
      await deleteCategory(itemToDelete.category_id);
      toast.success('Categoría eliminada correctamente');
      setShowDeleteCategoryModal(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar la categoría');
    }
  };
  
  // Handlers para manejo de secciones
  const handleAddSection = () => {
    setShowNewSectionModal(true);
  };
  
  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    setShowEditSectionModal(true);
  };
  
  const handleDeleteSection = (section: Section) => {
    setItemToDelete(section);
    setShowDeleteSectionModal(true);
  };
  
  const handleConfirmDeleteSection = async () => {
    if (!itemToDelete || !('section_id' in itemToDelete)) return;
    
    try {
      await deleteSection(itemToDelete.section_id);
      toast.success('Sección eliminada correctamente');
      setShowDeleteSectionModal(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar la sección');
    }
  };
  
  // Handlers para manejo de productos
  const handleAddProduct = (sectionId: number) => {
    // Buscar la sección en todas las categorías
    for (const catSections of Object.values(sections)) {
      const section = catSections.find(s => s.section_id === sectionId);
      if (section) {
        setSelectedSection(section);
        setShowNewProductModal(true);
        break;
      }
    }
  };
  
  const handleEditProduct = (product: Product) => {
    setShowEditProductModal(true);
    // Almacenamos directamente el producto en el estado
    setItemToDelete(product);
  };
  
  const handleDeleteProduct = (product: Product) => {
    setItemToDelete(product);
    setShowDeleteProductModal(true);
  };
  
  const handleConfirmDeleteProduct = async () => {
    if (!itemToDelete || !('product_id' in itemToDelete) || !selectedSection) return;
    
    try {
      await deleteProduct(itemToDelete.product_id);
      toast.success('Producto eliminado correctamente');
      setShowDeleteProductModal(false);
      setItemToDelete(null);
      
      // Actualizar la lista de productos
      if (selectedSection && selectedSection.section_id) {
        fetchProductsBySection(selectedSection.section_id);
      }
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };
  
  // Handlers para manejo de expansión
  const toggleCategoryExpansion = async (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  const handleSectionClick = async (section: Section) => {
    if (section && section.section_id) {
      setExpandedSections(prev => ({
        ...prev,
        [section.section_id]: !prev[section.section_id]
      }));
    }
  };
  
  // Renderizado condicional para estados de carga y error
  if (isLoading || isDataLoading) {
    return <Loader />;
  }
  
  if (error || dataError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">
          Error: {error || dataError}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }
  
  // Renderizado principal del dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Breadcrumbs 
            currentView={currentView}
            selectedCategory={selectedCategory}
            selectedSection={selectedSection}
            onNavigateToHome={goToHome}
            onNavigateToCategory={goToCategory}
            onNavigateToSection={goToSection}
          />
        </div>
        
        {/* Contenido principal del dashboard */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Vista de categorías */}
          {currentView === 'CATEGORIES' && (
            <CategoryView 
              categories={categories}
              expandedCategories={expandedCategories}
              isUpdatingVisibility={isUpdatingVisibility}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onCategoryClick={(category) => goToCategory(category)}
              onToggleCategoryExpansion={toggleCategoryExpansion}
              isLoading={isLoading}
            />
          )}
          
          {/* Vista de secciones */}
          {currentView === 'SECTIONS' && selectedCategory && (
            <SectionView 
              selectedCategory={selectedCategory}
              sections={sections[selectedCategory.category_id] || []}
              expandedSections={expandedSections}
              isUpdatingVisibility={isUpdatingVisibility}
              onAddSection={handleAddSection}
              onSectionClick={goToSection}
              onToggleSectionVisibility={toggleSectionVisibility}
              onEditSection={handleEditSection}
              onDeleteSection={handleDeleteSection}
              onAddProduct={handleAddProduct}
              isLoading={isLoading}
            />
          )}
          
          {/* Vista de productos */}
          {currentView === 'PRODUCTS' && selectedSection && (
            <ProductView 
              selectedSection={selectedSection}
              products={products[selectedSection.section_id] || []}
              isUpdatingVisibility={isUpdatingVisibility}
              onBackToSections={() => {
                if (selectedCategory) {
                  goToCategory(selectedCategory);
                } else {
                  goToHome();
                }
              }}
              onToggleProductVisibility={toggleProductVisibility}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>
      
      {/* Vista previa móvil */}
      {client && client.restaurant_id && (
        <MobilePreview
          restaurantId={client.restaurant_id}
        />
      )}
      
      {/* Modales */}
      {showNewCategoryModal && (
        <NewCategoryModal 
          isOpen={showNewCategoryModal}
          onClose={() => setShowNewCategoryModal(false)}
          client={client}
          setCategories={setCategories}
        />
      )}
      
      {showEditCategoryModal && selectedCategory && (
        <EditCategoryModal 
          isOpen={showEditCategoryModal}
          onClose={() => setShowEditCategoryModal(false)}
          category={selectedCategory}
          setCategories={setCategories}
        />
      )}
      
      {showDeleteCategoryModal && itemToDelete && 'category_id' in itemToDelete && (
        <DeleteCategoryModal 
          isOpen={showDeleteCategoryModal}
          onClose={() => setShowDeleteCategoryModal(false)}
          categoryId={itemToDelete.category_id}
          categoryName={itemToDelete.name || 'esta categoría'}
          onConfirm={handleConfirmDeleteCategory}
        />
      )}
      
      {showNewSectionModal && selectedCategory && (
        <NewSectionModal 
          isOpen={showNewSectionModal}
          onClose={() => setShowNewSectionModal(false)}
          categoryId={selectedCategory.category_id}
          categoryName={selectedCategory.name}
          setSections={setSections}
        />
      )}
      
      {showEditSectionModal && selectedSection && (
        <EditSectionModal 
          isOpen={showEditSectionModal}
          onClose={() => setShowEditSectionModal(false)}
          section={selectedSection}
          setSections={setSections}
        />
      )}
      
      {showDeleteSectionModal && itemToDelete && 'section_id' in itemToDelete && (
        <DeleteSectionModal 
          isOpen={showDeleteSectionModal}
          onClose={() => setShowDeleteSectionModal(false)}
          sectionId={itemToDelete.section_id}
          sectionName={itemToDelete.name || 'esta sección'}
          onConfirm={handleConfirmDeleteSection}
        />
      )}
      
      {showNewProductModal && selectedSection && (
        <NewProductModal 
          isOpen={showNewProductModal}
          onClose={() => setShowNewProductModal(false)}
          sectionId={selectedSection.section_id}
          setProducts={setProducts}
        />
      )}
      
      {showEditProductModal && itemToDelete && 'product_id' in itemToDelete && (
        <EditProductModal 
          isOpen={showEditProductModal}
          onClose={() => setShowEditProductModal(false)}
          product={itemToDelete as Product}
          setProducts={setProducts}
        />
      )}
      
      {showDeleteProductModal && itemToDelete && 'product_id' in itemToDelete && (
        <DeleteProductModal 
          isOpen={showDeleteProductModal}
          onClose={() => setShowDeleteProductModal(false)}
          productId={itemToDelete.product_id}
          productName={itemToDelete.name || 'este producto'}
          onConfirm={handleConfirmDeleteProduct}
        />
      )}
    </div>
  );
} 
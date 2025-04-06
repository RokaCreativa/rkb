"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TopNavbar } from "./TopNavbar";
import { Loader } from "../ui/Loader";
import { Category, Section, Product, Client } from "@/app/types/menu";
import useDashboardState from "../../hooks/core/useDashboardState";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { 
  adaptCategories, adaptSections, adaptProducts, adaptClient, 
  adaptCategory, adaptSection, adaptProduct,
  fromMenuCategory, fromMenuSection, fromMenuProduct,
  toPreviewCategories, toPreviewSections, toPreviewProducts,
  toPreviewCategory, toPreviewSection, toPreviewProduct,
  MenuCategory, MenuSection, MenuProduct, MenuClient,
  convertCategoriesToDashboard, convertSectionsToDashboard, convertProductsToDashboard
} from "../../types/type-adapters";
import { DashboardCategory, DashboardSection, DashboardProduct, DashboardClient } from "../../types/type-adapters";

// Importar nuevos componentes de vistas
import CategoryView from "../views/CategoryView";
import SectionView from "../views/SectionView";
import ProductView from "../views/ProductView";
import Breadcrumbs from "../views/Breadcrumbs";
import MobilePreview from "../views/MobilePreview";
import FloatingPhonePreview from "../views/FloatingPhonePreview";

// Importar modales
import NewCategoryModal from "../modals/NewCategoryModal";
import NewSectionModal from "../modals/NewSectionModal";
import NewProductModal from "../modals/NewProductModal";
import EditCategoryModal from "../modals/EditCategoryModal";
import EditSectionModal from "../modals/EditSectionModal";
import EditProductModal from "../modals/EditProductModal";
import DeleteCategoryModal from "../modals/DeleteCategoryModal";
import DeleteSectionModal from "../modals/DeleteSectionModal";
import DeleteProductModal from "../modals/DeleteProductModal";

// Importar tipos
import { ViewType } from "../../types/dashboard";

// Importar el nuevo hook useDragAndDrop
import useDragAndDrop from "../../hooks/ui/useDragAndDrop";

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
  
  // Estado local para modo sin conexión
  const [offlineMode, setOfflineMode] = useState(false);
  
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
    fetchSectionsByCategory,
    fetchClientData,
    fetchCategories,
    fetchProductsBySection,
    toggleCategoryVisibility,
    toggleSectionVisibility,
    toggleProductVisibility,
    deleteCategory,
    deleteSection,
    deleteProduct,
    createCategory,
    createSection,
    createProduct,
    updateCategory,
    updateSection,
    updateProduct
  } = useDashboardState();
  
  // Estados para selección y expansión
  const [selectedCategory, setSelectedCategory] = useState<DashboardCategory | null>(null);
  const [selectedSection, setSelectedSection] = useState<DashboardSection | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: number]: boolean }>({});
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});
  
  // Estado adicional para manejar actualizaciones locales de categorías, secciones y productos
  const [localCategories, setLocalCategories] = useState<DashboardCategory[]>([]);
  const [localSections, setLocalSections] = useState<Record<string, DashboardSection[]>>({});
  const [localProducts, setLocalProducts] = useState<Record<string, DashboardProduct[]>>({});
  
  // Sincronizar datos del hook con estado local
  useEffect(() => {
    if (categories && categories.length > 0) {
      setLocalCategories(convertCategoriesToDashboard(categories));
    }
  }, [categories]);
  
  useEffect(() => {
    if (sections) {
      setLocalSections(convertSectionsToDashboard(sections));
    }
  }, [sections]);
  
  useEffect(() => {
    if (products) {
      setLocalProducts(convertProductsToDashboard(products));
    }
  }, [products]);
  
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
  const [itemToDelete, setItemToDelete] = useState<DashboardCategory | DashboardSection | DashboardProduct | null>(null);
  
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
  
  // Verificar si estamos en modo offline cada 10 segundos
  useEffect(() => {
    const checkConnectivity = () => {
      const isOffline = !navigator.onLine;
      setOfflineMode(isOffline);
      console.log(`🌐 Estado de conexión: ${isOffline ? 'OFFLINE' : 'ONLINE'}`);
    };
    
    // Comprobar inmediatamente
    checkConnectivity();
    
    // Agregar event listeners para cambios de conectividad
    window.addEventListener('online', () => setOfflineMode(false));
    window.addEventListener('offline', () => setOfflineMode(true));
    
    // Comprobar periódicamente
    const interval = setInterval(checkConnectivity, 10000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', () => setOfflineMode(false));
      window.removeEventListener('offline', () => setOfflineMode(true));
    };
  }, []);
  
  // Agregar efecto de diagnóstico para la detección de problemas de drag and drop
  useEffect(() => {
    if (DEBUG) {
      console.log('🧪 [DRAG DEBUG] Verificando configuración de drag and drop...');
      
      // Comprobar si react-beautiful-dnd o hello-pangea/dnd está correctamente inicializado
      console.log('🔍 DragDropContext:', typeof DragDropContext, 'Disponible:', !!DragDropContext);
      
      // Registrar funciones de reordenamiento
      console.log('🔄 handleReorderCategories:', typeof handleReorderCategories, 
                  'handleReorderSections:', typeof handleReorderSections,
                  'handleReorderProducts:', typeof handleReorderProducts);
      
      // Verificar si las secciones están disponibles para el drag and drop
      console.log('📊 Secciones disponibles:', Object.keys(sections).length > 0 ? 'Sí' : 'No', 
                  'Total categorías con secciones:', Object.keys(sections).length);
      
      const totalSections = Object.values(sections).reduce((acc, secs) => acc + secs.length, 0);
      console.log('📈 Total de secciones en todas las categorías:', totalSections);
      
      console.log('🚀 Sistema de drag and drop inicializado correctamente');
    }
  }, [sections]);
  
  // Handlers para navegación
  const goToHome = useCallback(() => {
    setCurrentView('CATEGORIES');
    setSelectedCategory(null);
    setSelectedSection(null);
  }, []);

  const goToCategory = useCallback((category: MenuCategory) => {
    setSelectedCategory(fromMenuCategory(category));
    
    setExpandedCategories(prev => ({
      ...prev,
      [category.category_id]: !prev[category.category_id]
    }));
    
    if (!expandedCategories[category.category_id]) {
      fetchSectionsByCategory(category.category_id);
    }
    
    setSelectedSection(null);
  }, [expandedCategories, fetchSectionsByCategory]);

  const goToSection = useCallback(async (sectionIdOrSection: number | MenuSection) => {
    // Extraer el ID de sección según el tipo de argumento
    const sectionId = typeof sectionIdOrSection === 'number' 
      ? sectionIdOrSection 
      : sectionIdOrSection.section_id;

    console.log(`🎯 goToSection llamado con sección ID: ${sectionId}`);

    // Encontrar la sección correspondiente
    const allSections = Object.values(sections).flat();
    const sectionToSelect = allSections.find(s => s.section_id === sectionId);

    if (!sectionToSelect) {
      console.error(`❌ No se encontró la sección con ID ${sectionId}`);
      return;
    }

    // Actualizar estado de la sección seleccionada primero para evitar UI vacía
    console.log(`✅ Sección encontrada: ${sectionToSelect.name}`);
    setSelectedSection(fromMenuSection(sectionToSelect));
    
    // IMPORTANTE: alternar el estado de expansión de la sección al hacer clic
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
    
    // Obtener la categoría a la que pertenece esta sección
    const categoryId = sectionToSelect.category_id;
    if (categoryId) {
      // Expandir la categoría para asegurar que la sección es visible
      setExpandedCategories(prev => ({
        ...prev,
        [categoryId]: true
      }));
      
      // Actualizar la categoría seleccionada
      const categoryObj = categories.find(c => c.category_id === categoryId);
      if (categoryObj) {
        setSelectedCategory(fromMenuCategory(categoryObj));
      }
    }
    
    // En el modo anterior cambiábamos a vista PRODUCTS, pero ahora queremos mantener la vista de categorías
    setCurrentView('CATEGORIES');
    console.log(`🔀 Vista mantenida en CATEGORIES, sección expandida: ${sectionToSelect.name}`);

    // Preparar local state
    const sectionIdStr = sectionId.toString();
    
    // Verificar si ya tenemos productos cargados
    if (!products[sectionIdStr] || products[sectionIdStr].length === 0) {
      // NUEVA IMPLEMENTACIÓN: Primero forzar un estado vacío para mostrar el loader
      setLocalProducts(prevProducts => ({
        ...prevProducts,
        [sectionIdStr]: []
      }));

      // Mostrar notificación de carga
      toast.loading(`Cargando productos...`, { id: `loading-${sectionId}` });

      try {
        // Cargar productos forzando la recarga
        console.log(`⏳ [CRITICAL] Cargando productos para sección ${sectionId} (forzado)...`);
        
        // Llamar a fetchProductsBySection con un solo argumento (sectionId)
        const loadedProducts = await fetchProductsBySection(sectionId);
        
        // Actualizar el estado local con los productos cargados
        if (loadedProducts && loadedProducts.length > 0) {
          setLocalProducts(prev => ({
            ...prev,
            [sectionIdStr]: loadedProducts.map((p: any) => fromMenuProduct(p))
          }));
        }
        
        // Cerrar la notificación de carga
        toast.dismiss(`loading-${sectionId}`);
        
        if (loadedProducts && loadedProducts.length > 0) {
          toast.success(`${loadedProducts.length} productos cargados`);
        } else {
          console.warn(`⚠️ No se encontraron productos para la sección ${sectionId}`);
          toast.error(`No se encontraron productos para esta sección`);
        }
      } catch (error) {
        console.error(`❌ Error al cargar productos: ${error}`);
        toast.dismiss(`loading-${sectionId}`);
        toast.error(`Error al cargar productos`);
      }
    }
  }, [fetchProductsBySection, sections, setCurrentView, setSelectedSection, setExpandedSections, setSelectedCategory, categories, products, setLocalProducts]);
  
  // Handlers para manejo de categorías
  const handleAddCategory = useCallback(() => {
    setShowNewCategoryModal(true);
  }, []);
  
  const handleEditCategory = (category: DashboardCategory) => {
    setSelectedCategory(category);
    setShowEditCategoryModal(true);
  };
  
  const handleDeleteCategory = (category: DashboardCategory) => {
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
  
  const handleEditSection = (section: DashboardSection) => {
    setSelectedSection(section);
    setShowEditSectionModal(true);
  };
  
  const handleDeleteSection = (section: DashboardSection) => {
    setItemToDelete(section);
    setShowDeleteSectionModal(true);
  };
  
  const handleConfirmDeleteSection = async () => {
    if (!itemToDelete || !('section_id' in itemToDelete)) return;
    
    const categoryId = 'category_id' in itemToDelete ? itemToDelete.category_id : 0;
    
    try {
      await deleteSection(itemToDelete.section_id, categoryId);
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
        // Convertir section a DashboardSection antes de establecerlo
        setSelectedSection(fromMenuSection(section));
        setShowNewProductModal(true);
        break;
      }
    }
  };
  
  const handleEditProduct = (product: DashboardProduct) => {
    setShowEditProductModal(true);
    // Almacenamos directamente el producto en el estado
    setItemToDelete(product);
  };
  
  const handleDeleteProduct = (product: DashboardProduct) => {
    setItemToDelete(product);
    setShowDeleteProductModal(true);
  };
  
  const handleConfirmDeleteProduct = async () => {
    if (!itemToDelete || !('product_id' in itemToDelete) || !selectedSection) return;
    
    try {
      await deleteProduct(itemToDelete.product_id, selectedSection.section_id);
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
  
  // Usar el hook useDragAndDrop para obtener la funcionalidad de drag & drop centralizada
  const {
    isReorderModeActive,
    setIsReorderModeActive,
    handleGlobalDragEnd,
    handleReorderCategories,
    handleReorderSections,
    handleReorderProducts
  } = useDragAndDrop(
    localCategories,
    localSections,
    localProducts,
    setLocalCategories,
    setLocalSections,
    setLocalProducts
  );
  
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopNavbar
        clientLogo={client?.main_logo || null}
        clientName={client?.name || 'Dashboard'}
        isReorderModeActive={isReorderModeActive}
        onToggleReorderMode={() => setIsReorderModeActive(prev => !prev)}
      />
      
      {offlineMode && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 flex items-center" role="alert">
          <div className="flex-shrink-0 mr-2">
            <ExclamationTriangleIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold">Modo sin conexión</p>
            <p className="text-sm">Usando datos de demostración. Algunas funciones podrían estar limitadas.</p>
          </div>
        </div>
      )}
      
      {/* *** ENVOLVER CONTENIDO PRINCIPAL CON DragDropContext *** */}
      <DragDropContext onDragEnd={handleGlobalDragEnd}>
        <div className="container mx-auto px-4 py-6 flex-1">
          {/* Breadcrumbs y navegación */}
          <Breadcrumbs
            currentView={currentView}
            selectedCategory={selectedCategory ? adaptCategory(selectedCategory) : null}
            selectedSection={selectedSection ? adaptSection(selectedSection) : null}
            onHomeClick={goToHome}
            onCategoryClick={(category) => goToCategory(fromMenuCategory(category))}
            onSectionClick={(section) => {
              // Verificación segura del tipo de 'section'
              if (section) {
                if (typeof section === 'object' && 'section_id' in section) {
                  goToSection(section.section_id);
                } else if (typeof section === 'number') {
                  goToSection(section);
                } else {
                  console.error('Error: Tipo de sección inválido', section);
                }
              } else {
                console.error('Error: Sección indefinida');
              }
            }}
          />
          
          {/* Contenido principal */}
          <div className="w-full">
            {isLoading || isDataLoading ? (
              <Loader message="Cargando datos..." />
            ) : error || dataError ? (
              <div className="rounded-lg bg-red-50 p-4 text-red-800">
                <h3 className="text-lg font-semibold mb-2">Error</h3>
                <p>{error || dataError}</p>
              </div>
            ) : (
              <>
                {currentView === 'CATEGORIES' && (
                  <CategoryView
                    categories={adaptCategories(localCategories)}
                    sections={adaptSections(localSections)}
                    expandedCategories={expandedCategories}
                    expandedSections={expandedSections}
                    isUpdatingVisibility={isUpdatingVisibility}
                    onToggleCategoryVisibility={(categoryId, status) => {
                      setExpandedCategories(prev => ({
                        ...prev,
                        [categoryId]: !prev[categoryId]
                      }));
                      
                      if (!expandedCategories[categoryId] && (!sections[categoryId] || sections[categoryId].length === 0)) {
                        fetchSectionsByCategory(categoryId);
                      }
                    }}
                    onEditCategorySubmit={(category) => {
                      if (category.category_id) {
                        handleEditCategory(fromMenuCategory(category) as DashboardCategory);
                      }
                    }}
                    onDeleteCategorySubmit={(categoryId) => {
                      const category = localCategories.find(c => c.category_id === categoryId);
                      if (category) {
                        handleDeleteCategory(category);
                      }
                    }}
                    onAddCategorySubmit={handleAddCategory}
                    onToggleSectionVisibility={(sectionId, status) => {
                      setExpandedSections(prev => ({
                        ...prev,
                        [sectionId]: !prev[sectionId]
                      }));
                    }}
                    onEditSectionSubmit={(section) => {
                      if (section.section_id) {
                        handleEditSection(fromMenuSection(section) as DashboardSection);
                      }
                    }}
                    onDeleteSectionSubmit={(sectionId) => {
                      Object.values(localSections).flat().forEach(section => {
                        if (section.section_id === sectionId) {
                          handleDeleteSection(section);
                        }
                      });
                    }}
                    onAddSectionSubmit={(section) => {
                      if (section.category_id) {
                        setSelectedCategory(localCategories.find(c => c.category_id === section.category_id) || null);
                        handleAddSection();
                      }
                    }}
                    onSectionClick={(section) => {
                      // Verificación segura del tipo de 'section'
                      if (section) {
                        if (typeof section === 'object' && 'section_id' in section) {
                          goToSection(section.section_id);
                        } else if (typeof section === 'number') {
                          goToSection(section);
                        } else {
                          console.error('Error: Tipo de sección inválido', section);
                        }
                      } else {
                        console.error('Error: Sección indefinida');
                      }
                    }}
                    onCategoryClick={(category) => goToCategory(fromMenuCategory(category))}
                    products={adaptProducts(localProducts)}
                    onToggleProductVisibility={(productId: number, currentStatus: number, sectionId: number) => {
                      void toggleProductVisibility(productId, currentStatus, sectionId);
                    }}
                    onEditProduct={(product) => handleEditProduct(fromMenuProduct(product) as DashboardProduct)}
                    onDeleteProduct={(product) => handleDeleteProduct(fromMenuProduct(product) as DashboardProduct)}
                    onAddProductSubmit={(product) => {
                      if (product.section_id) {
                        handleAddProduct(product.section_id);
                      }
                    }}
                    isUpdatingProductVisibility={isUpdatingVisibility}
                    isReorderModeActive={isReorderModeActive}
                  />
                )}

                {/* 
                  Mantener SectionView y ProductView como vistas separadas para navegación directa, 
                  pero el flujo principal debe ser a través de expansión/colapso 
                */}
                {currentView === 'SECTIONS' && selectedCategory && (
                  <SectionView
                    sections={adaptSections(localSections)[selectedCategory.category_id] || []}
                    category={adaptCategory(selectedCategory)}
                    products={adaptProducts(localProducts)}
                    onAddSection={() => handleAddSection()}
                    onEditSection={(section) => handleEditSection(fromMenuSection(section) as DashboardSection)}
                    onDeleteSection={(section) => handleDeleteSection(fromMenuSection(section) as DashboardSection)}
                    onAddProduct={handleAddProduct}
                    onToggleSectionVisibility={toggleSectionVisibility}
                    onToggleProductVisibility={(productId: number, currentStatus: number, sectionId: number) => {
                      void toggleProductVisibility(productId, currentStatus, sectionId);
                    }}
                    onEditProduct={(product) => handleEditProduct(fromMenuProduct(product) as DashboardProduct)}
                    onDeleteProduct={(product) => handleDeleteProduct(fromMenuProduct(product) as DashboardProduct)}
                    isUpdatingVisibility={isUpdatingVisibility}
                    isUpdatingProductVisibility={isUpdatingVisibility}
                    onSectionReorder={isReorderModeActive ? handleReorderSections : undefined}
                    onProductReorder={isReorderModeActive ? 
                      (sectionId: number, sourceIndex: number, destinationIndex: number) => {
                        handleReorderProducts(sectionId, sourceIndex, destinationIndex);
                      } : undefined
                    }
                    isReorderModeActive={isReorderModeActive}
                  />
                )}

                {/* El ProductView solo se debe mostrar cuando hay una sección seleccionada y estamos en vista PRODUCTS */}
                {currentView === 'PRODUCTS' && selectedSection && (() => {
                  // Obtener el sectionId como string para acceder al objeto products
                  const sectionIdStr = selectedSection.section_id.toString();
                  
                  // Verificar el objeto products con más detalle
                  console.log(`📊 [CRITICAL] ANTES de renderizar ProductView:`, {
                    todasLasKeys: Object.keys(products),
                    tieneKeySection: sectionIdStr in products,
                    valorDirecto: products[sectionIdStr],
                    tipoDeValor: products[sectionIdStr] ? typeof products[sectionIdStr] : 'undefined',
                    esArray: Array.isArray(products[sectionIdStr]),
                    contieneDatos: products[sectionIdStr]?.length > 0
                  });
                  
                  // SOLUCIÓN TEMPORAL: Si no hay productos en el state global, cargarlos ahora
                  if (!products[sectionIdStr] || products[sectionIdStr].length === 0) {
                    console.log(`⚠️ [CRITICAL] NO hay productos en el state, intentando cargar ahora...`);
                    
                    // Este es un último recurso - idealmente no debería ser necesario
                    fetchProductsBySection(selectedSection.section_id)
                      .then(loadedProducts => {
                        console.log(`✅ Carga de emergencia completada: ${loadedProducts.length} productos`);
                      })
                      .catch(err => {
                        console.error(`❌ Error en carga de emergencia:`, err);
                      });
                  }
                  
                  // Obtener productos para esta sección - intentamos todas las opciones posibles
                  let sectionProducts: DashboardProduct[] = [];
                  
                  // Opción 1: Productos en el state global
                  if (products[sectionIdStr] && products[sectionIdStr].length > 0) {
                    sectionProducts = convertProductsToDashboard(products)[sectionIdStr] || [];
                    console.log(`✅ Usando productos del state global: ${sectionProducts.length}`);
                  } 
                  // Si no hay productos, mandamos un array vacío pero lo registramos
                  else {
                    console.log(`⚠️ [CRITICAL] No hay productos disponibles para mostrar`);
                  }
                  
                  return (
                    <>
                      {/* Debug info visible solo en desarrollo */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="p-2 mb-4 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <div className="font-bold">Debug info:</div>
                          <div>Sección: {selectedSection.name} (ID: {selectedSection.section_id})</div>
                          <div>Productos cargados: {sectionProducts.length}</div>
                          <div>Keys en state: {Object.keys(products).join(', ')}</div>
                          <div>Tiene key {sectionIdStr}: {sectionIdStr in products ? 'Sí' : 'No'}</div>
                        </div>
                      )}
                      
                      <ProductView
                        products={adaptProducts(localProducts)[selectedSection.section_id] || []}
                        sectionName={selectedSection.name || ''}
                        sectionId={selectedSection.section_id}
                        isUpdatingVisibility={isUpdatingVisibility}
                        onAddProduct={() => handleAddProduct(selectedSection.section_id)}
                        onEditProduct={(product) => handleEditProduct(fromMenuProduct(product))}
                        onDeleteProduct={(product) => handleDeleteProduct(fromMenuProduct(product))}
                        onToggleProductVisibility={(productId: number, currentStatus: number, sectionId: number) => {
                          void toggleProductVisibility(productId, currentStatus, sectionId);
                        }}
                        isLoading={!sectionProducts || sectionProducts.length === 0}
                        onProductsReorder={isReorderModeActive ? (sourceIndex: number, destinationIndex: number) => {
                          if (selectedSection) {
                            handleReorderProducts(selectedSection.section_id, sourceIndex, destinationIndex);
                          }
                        } : undefined}
                      />
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </DragDropContext> { /* Fin del DragDropContext global */ }
      
      {/* Vista previa móvil */}
      {client && (
        <FloatingPhonePreview 
          clientName={client?.name || 'RokaMenu'}
          clientLogo={client?.main_logo || ''} 
          clientMainLogo={client?.main_logo || ''}
          categories={toPreviewCategories(localCategories)}
          sections={toPreviewSections(localSections)}
          products={toPreviewProducts(localProducts)}
          selectedCategory={selectedCategory ? toPreviewCategory(selectedCategory) : null}
          selectedSection={selectedSection ? toPreviewSection(selectedSection) : null}
        />
      )}
      
      {/* Modales */}
      {showNewCategoryModal && (
        <NewCategoryModal 
          isOpen={showNewCategoryModal}
          onClose={() => setShowNewCategoryModal(false)}
          client={client}
          setCategories={categories => setLocalCategories(categories)}
        />
      )}
      
      {showEditCategoryModal && selectedCategory && (
        <EditCategoryModal 
          isOpen={showEditCategoryModal}
          onClose={() => setShowEditCategoryModal(false)}
          categoryToEdit={adaptCategory(selectedCategory)}
          client={client ? adaptClient(client) : null}
          setCategories={(updatedCategories) => {
            if (Array.isArray(updatedCategories)) {
              const dashboardCategories = updatedCategories.map(
                category => fromMenuCategory(category)
              );
              setLocalCategories(dashboardCategories);
            }
          }}
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
          setSections={(updatedSections) => {
            // Convertir las secciones de Record<string, Section[]> a Record<string, DashboardSection[]>
            if (updatedSections) {
              const convertedSections: Record<string, DashboardSection[]> = {};
              Object.entries(updatedSections).forEach(([key, sectionsArray]) => {
                convertedSections[key] = sectionsArray.map((section: any) => fromMenuSection(section));
              });
              setLocalSections(convertedSections);
            }
          }}
        />
      )}
      
      {showEditSectionModal && selectedSection && (
        <EditSectionModal 
          isOpen={showEditSectionModal}
          onClose={() => setShowEditSectionModal(false)}
          section={selectedSection}
          updateSection={async (formData, sectionId, categoryId) => {
            // Implementar la lógica para actualizar la sección
            // Esta es una implementación temporal que siempre devuelve true
            return true;
          }}
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
          setProducts={(updatedProducts) => {
            // Convertir los productos de Record<string, Product[]> a Record<string, DashboardProduct[]>
            if (updatedProducts) {
              const convertedProducts: Record<string, DashboardProduct[]> = {};
              Object.entries(updatedProducts).forEach(([key, productsArray]) => {
                convertedProducts[key] = productsArray.map((product: any) => fromMenuProduct(product));
              });
              setLocalProducts(convertedProducts);
            }
          }}
        />
      )}
      
      {showEditProductModal && itemToDelete && 'product_id' in itemToDelete && (
        <EditProductModal 
          isOpen={showEditProductModal}
          onClose={() => setShowEditProductModal(false)}
          product={itemToDelete as DashboardProduct}
          client={client ? adaptClient(client) : null}
          selectedSection={selectedSection ? adaptSection(selectedSection) : null}
          setProducts={(updatedProducts) => {
            // Convertir los productos de Record<string, Product[]> a Record<string, DashboardProduct[]>
            if (updatedProducts) {
              const convertedProducts: Record<string, DashboardProduct[]> = {};
              Object.entries(updatedProducts).forEach(([key, productsArray]) => {
                convertedProducts[key] = productsArray.map((product: any) => fromMenuProduct(product));
              });
              setLocalProducts(convertedProducts);
            }
          }}
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

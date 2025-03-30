"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import TopNavbar from '@/components/layout/TopNavbar';
import CategoryTable from '@/components/CategoryTable';
import SectionTable from '@/components/SectionTable';
import ProductTable from '@/components/ProductTable';
import Breadcrumbs from '@/components/Breadcrumbs';
import FloatingPhonePreview from '@/components/FloatingPhonePreview';
import { getImagePath } from '@/lib/imageUtils';

// Importar hooks originales
import useCategories from '@/app/hooks/useCategories';
import useSections from '@/app/hooks/useSections';
import useProducts from '@/app/hooks/useProducts';

// Importar tipos
import { Category, Section, Product, Client } from '@/app/types/menu';

// Importar iconos
import { DevicePhoneMobileIcon, PlusIcon } from '@heroicons/react/24/outline';

// Importar modales
import NewCategoryModal from './components/NewCategoryModal';
import EditCategoryModal from './components/EditCategoryModal';
import NewSectionModal from './components/NewSectionModal';
import EditSectionModal from './components/EditSectionModal';
import NewProductModal from './components/NewProductModal';
import EditProductModal from './components/EditProductModal';
import { DeleteCategoryConfirmation, DeleteSectionConfirmation, DeleteProductConfirmation } from './components/modals';

// Importar hooks personalizados
import useViewState from './hooks/useViewState';
import useModalState from './hooks/useModalState';
import useExpansionState from './hooks/useExpansionState';
import useDataState from './hooks/useDataState';

// Importar utilidades
import { getBreadcrumbItems, getCategoryTableData, getPaginatedCategories } from './utils/dashboardHelpers';

// Importar manejadores
import { deleteCategory } from '@/lib/handlers/categoryEventHandlers';

/**
 * Página principal del dashboard
 * Versión reorganizada para mejorar mantenibilidad y prevenir errores de hook
 */
export default function DashboardPage() {
  // Obtener sesión de autenticación
  const { data: session, status } = useSession();
  
  // Hook para gestionar la navegación entre vistas
  const {
    currentView,
    selectedCategory,
    selectedSection,
    selectedCategoryId,
    setCurrentView,
    setSelectedCategory,
    setSelectedSection,
    setSelectedCategoryId,
    navigateToCategories,
    navigateToSections,
    navigateToProducts,
    navigateBack
  } = useViewState();
  
  // Hook para gestionar modales
  const {
    isNewCategoryModalOpen,
    isEditCategoryModalOpen,
    isDeleteCategoryModalOpen,
    editingCategory,
    categoryToDelete,
    isNewSectionModalOpen,
    isEditSectionModalOpen,
    isDeleteSectionModalOpen,
    editingSection,
    sectionToDelete,
    isNewProductModalOpen,
    isEditProductModalOpen,
    isDeleteProductModalOpen,
    editingProduct,
    productToDelete,
    setIsNewCategoryModalOpen,
    setIsEditCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    setCategoryToDelete,
    setIsNewSectionModalOpen,
    setIsEditSectionModalOpen,
    setIsDeleteSectionModalOpen,
    setSectionToDelete,
    setIsNewProductModalOpen,
    setIsEditProductModalOpen,
    setIsDeleteProductModalOpen,
    setProductToDelete,
    openNewCategoryModal,
    openEditCategoryModal,
    openDeleteCategoryModal,
    openNewSectionModal,
    openEditSectionModal,
    openDeleteSectionModal,
    openNewProductModal,
    openEditProductModal,
    openDeleteProductModal
  } = useModalState();
  
  // Hook para gestionar estados de expansión
  const { 
    expandedCategories,
    expandedSections,
    loadingSections,
    loadingProducts,
    toggleCategoryExpansion,
    toggleSectionExpansion,
    setLoadingSectionsForCategory,
    setLoadingProductsForSection
  } = useExpansionState();
  
  // Hook para gestionar datos y operaciones
  const { 
    client,
    categories,
    sections,
    products,
    isLoading,
    isSectionsLoading,
    isUpdatingVisibility,
    error,
    setCategories,
    fetchClientData,
    fetchCategories,
    fetchSectionsByCategory,
    fetchProductsBySection,
    toggleCategoryVisibility,
    reorderCategory,
    updateSection,
    toggleProductVisibility,
    deleteProduct, 
    updateProduct,
    deleteSection
  } = useDataState();
  
  // Estado para modo de reordenamiento
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);
  
  // Estado para paginación
  const [categoryPagination, setCategoryPagination] = useState({
    enabled: false,
    page: 1,
    limit: 10
  });
  
  // Referencias para el scroll automático
  const sectionListRef = useRef<HTMLDivElement>(null);
  const productListRef = useRef<HTMLDivElement>(null);
  
  // Función para cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      if (status === 'authenticated') {
        try {
          const clientData = await fetchClientData();
          if (clientData) {
            const categoriesData = await fetchCategories();
            
            // Seleccionar la primera categoría si hay categorías disponibles
            if (categoriesData && categoriesData.length > 0) {
              setSelectedCategory(categoriesData[0]);
            }
          }
        } catch (error) {
          console.error('Error al cargar datos iniciales:', error);
        }
      }
    };
    
    loadInitialData();
  }, [status, fetchClientData, fetchCategories, setSelectedCategory]);
  
  // Efecto para cargar secciones cuando se selecciona una categoría
  useEffect(() => {
    const loadSections = async () => {
      if (selectedCategory && currentView === 'sections') {
        try {
          setLoadingSectionsForCategory(selectedCategory.category_id, true);
          await fetchSectionsByCategory(selectedCategory.category_id);
        } catch (error) {
          console.error('Error al cargar secciones:', error);
        } finally {
          setLoadingSectionsForCategory(selectedCategory.category_id, false);
        }
      }
    };
    
    loadSections();
  }, [selectedCategory, currentView, fetchSectionsByCategory, setLoadingSectionsForCategory]);
  
  // Efecto para cargar productos cuando se selecciona una sección
  useEffect(() => {
    const loadProducts = async () => {
      if (selectedSection && currentView === 'products') {
        try {
          setLoadingProductsForSection(selectedSection.section_id, true);
          await fetchProductsBySection(selectedSection.section_id);
        } catch (error) {
          console.error('Error al cargar productos:', error);
        } finally {
          setLoadingProductsForSection(selectedSection.section_id, false);
        }
      }
    };
    
    loadProducts();
  }, [selectedSection, currentView, fetchProductsBySection, setLoadingProductsForSection]);
  
  // Función para alternar el modo de reordenamiento
  const toggleReorderMode = () => {
    setIsReorderModeActive(prev => !prev);
  };
  
  // Función para manejar clic en categoría
  const handleCategoryClick = async (categoryId: number) => {
    console.log("Clic en categoría:", categoryId);
    
    // Verificar el estado actual de expansión
    const isExpanded = expandedCategories[categoryId];
    console.log(`Categoría ${categoryId} está ${isExpanded ? 'expandida' : 'colapsada'}`);
    
    // 1. Primero, actualizar el estado para reflejar inmediatamente en la UI
    toggleCategoryExpansion(categoryId);
    
    // 2. Si estamos expandiendo y no tenemos secciones, cargarlas
    if (!isExpanded) {
      console.log(`Expandiendo categoría ${categoryId}`);
      
      // Si no tenemos secciones cargadas para esta categoría, cargarlas
      if (!sections[categoryId] || sections[categoryId].length === 0) {
        console.log(`Cargando secciones para categoría ${categoryId}...`);
        
        try {
          await fetchSectionsByCategory(categoryId);
        } catch (error) {
          console.error(`Error al cargar secciones para categoría ${categoryId}:`, error);
          toast.error('Error al cargar las secciones');
        }
      }
    }
  };
  
  // Función para manejar clic en sección
  const handleSectionClick = async (sectionId: number) => {
    console.log("Clic en sección:", sectionId);
    
    // Verificar el estado actual de expansión
    const isExpanded = expandedSections[sectionId];
    console.log(`Sección ${sectionId} está ${isExpanded ? 'expandida' : 'colapsada'}`);
    
    // 1. Actualizar el estado para reflejar inmediatamente en la UI
    toggleSectionExpansion(sectionId);
    
    // 2. Si estamos expandiendo la sección, cargar sus productos
    if (!isExpanded) {
      console.log(`Expandiendo sección ${sectionId}`);
      
      // Buscar a qué categoría pertenece esta sección
      let foundCategoryId: number | null = null;
      let foundSection: Section | null = null;
      
      Object.entries(sections).forEach(([categoryId, categorySections]) => {
        const section = categorySections.find(s => s.section_id === sectionId);
        if (section) {
          foundCategoryId = parseInt(categoryId);
          foundSection = section;
        }
      });
      
      if (foundCategoryId !== null && foundSection !== null) {
        console.log(`Sección ${sectionId} pertenece a categoría ${foundCategoryId}`);
        
        // Marcar la sección como seleccionada
        setSelectedSection(foundSection);
        
        // Marcar la categoría como seleccionada
        const category = categories.find(c => c.category_id === foundCategoryId);
        if (category) {
          setSelectedCategory(category);
        }
        
        // Si no tenemos productos cargados para esta sección, cargarlos
        if (!products[sectionId] || products[sectionId].length === 0) {
          console.log(`Cargando productos para sección ${sectionId}...`);
          
          try {
            await fetchProductsBySection(sectionId);
          } catch (error) {
            console.error(`Error al cargar productos para sección ${sectionId}:`, error);
            toast.error('Error al cargar los productos');
          }
        }
      }
    }
  };
  
  // Renderizado
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  if (error) {
  return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <>
      <TopNavbar 
        isReorderModeActive={isReorderModeActive}
        onToggleReorderMode={toggleReorderMode}
      />
      <div className="max-w-6xl mx-auto pt-2">
        {/* Breadcrumbs y botón de acción */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 px-4">
          {/* Breadcrumbs */}
          <div>
            <Breadcrumbs items={getBreadcrumbItems(
              currentView,
              selectedCategory,
              selectedSection,
              {
                toCategories: navigateToCategories,
                toSections: navigateToSections, 
                toProducts: navigateToProducts,
                back: navigateBack
              }
            )} />
          </div>
              
          {/* Botón de acción según la vista */}
          <div>
            {currentView === 'categories' && (
            <div className="flex items-center">
              <button
                onClick={() => {
                    // Activar la vista previa
                  const event = new CustomEvent('toggle-preview');
                  window.dispatchEvent(event);
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <DevicePhoneMobileIcon className="h-4 w-4 mr-1" />
                Live Preview
              </button>
            </div>
            )}
            
            {currentView === 'sections' && selectedCategory && (
            <button
                onClick={() => setIsNewSectionModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
            >
                <PlusIcon className="h-4 w-4 mr-1" />
                Nueva Sección
            </button>
            )}
            
            {currentView === 'products' && selectedSection && (
                            <button
                onClick={() => setIsNewProductModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Nuevo Producto
                            </button>
                )}
                        </div>
          </div>
          
        {/* Contenido principal según la vista */}
        <div className="space-y-3" ref={sectionListRef}>
          {currentView === 'categories' && (
            <div className="w-full px-4">
              <div className="mb-4">
                <button
                  onClick={openNewCategoryModal}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Nueva Categoría
                </button>
              </div>
              
              <CategoryTable
                categories={getPaginatedCategories(categories, categoryPagination)}
                expandedCategories={expandedCategories}
                onCategoryClick={handleCategoryClick}
                onEditCategory={openEditCategoryModal}
                onDeleteCategory={(categoryId) => {
                  const category = categories.find(c => c.category_id === categoryId);
                  if (category) {
                    openDeleteCategoryModal(category);
                  }
                }}
                onToggleVisibility={toggleCategoryVisibility}
                isUpdatingVisibility={isUpdatingVisibility}
                onReorderCategory={reorderCategory}
                isReorderModeActive={isReorderModeActive}
              />
              
              {/* Secciones expandidas para categorías */}
              {categories.map(category => {
                if (!expandedCategories[category.category_id]) return null;
                
                return (
                  <div 
                    key={`expanded-category-${category.category_id}`}
                    className="mt-4 w-full pl-4 border-l-2 border-indigo-100"
                  >
                    <SectionTable 
                      sections={sections[category.category_id] || []}
                      expandedSections={expandedSections}
                      onSectionClick={handleSectionClick}
                      categoryName={category.name}
                      onToggleVisibility={(sectionId, status) => {
                        // Implementación temporal
                        console.log(`Toggle visibilidad sección ${sectionId} a ${status ? 'visible' : 'oculta'}`);
                      }}
                      isUpdatingVisibility={isUpdatingVisibility}
                      onEditSection={openEditSectionModal}
                      onDeleteSection={(sectionId) => {
                        const section = sections[category.category_id]?.find(s => s.section_id === sectionId);
                        if (section) {
                          openDeleteSectionModal(section, category.category_id);
                        }
                      }}
                      onReorderSection={(sourceIndex, destIndex) => {
                        console.log(`Reordenar sección de ${sourceIndex} a ${destIndex}`);
                      }}
                      isReorderModeActive={isReorderModeActive}
                    />
                    
                    {/* Productos expandidos para secciones */}
                    {sections[category.category_id]?.map(section => {
                      if (!expandedSections[section.section_id]) return null;
                      
                      return (
                        <div 
                          key={`expanded-section-${section.section_id}`}
                          className="mt-4 pl-4 border-l-2 border-teal-100"
                        >
                          <ProductTable 
                            products={products[section.section_id] || []}
                            sectionName={section.name}
                            onToggleVisibility={(productId, status) => {
                              // Implementación temporal
                              console.log(`Toggle visibilidad producto ${productId} a ${status ? 'visible' : 'oculto'}`);
                            }}
                            isUpdatingVisibility={isUpdatingVisibility}
                            onEditProduct={openEditProductModal}
                            onDeleteProduct={(productId) => {
                              const product = products[section.section_id]?.find(p => p.product_id === productId);
                              if (product) {
                                openDeleteProductModal(product);
                              }
                              return Promise.resolve(true);
                            }}
                            isReorderModeActive={isReorderModeActive}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
          
          {currentView === 'sections' && selectedCategory && (
            <div className="w-full px-4">
              <div className="mb-4">
                <button
                  onClick={openNewSectionModal}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Nueva Sección para {selectedCategory.name}
                </button>
              </div>
              
                {sections[selectedCategory.category_id] ? (
                  <SectionTable 
                  sections={sections[selectedCategory.category_id] || []}
                    expandedSections={expandedSections}
                    onSectionClick={handleSectionClick}
                    categoryName={selectedCategory.name}
                  onToggleVisibility={(sectionId, status) => {
                    // Implementación temporal
                    console.log(`Toggle visibilidad sección ${sectionId} a ${status ? 'visible' : 'oculta'}`);
                  }}
                  isUpdatingVisibility={isUpdatingVisibility}
                  onEditSection={openEditSectionModal}
                  onDeleteSection={(sectionId) => {
                    const section = sections[selectedCategory.category_id]?.find(s => s.section_id === sectionId);
                    if (section) {
                      openDeleteSectionModal(section, selectedCategory.category_id);
                    }
                  }}
                  onReorderSection={(sourceIndex, destIndex) => {
                    console.log(`Reordenar sección de ${sourceIndex} a ${destIndex}`);
                  }}
                  isReorderModeActive={isReorderModeActive}
                  />
                ) : (
                  <div className="flex justify-center items-center h-40 bg-white rounded-lg border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                  </div>
                )}
            </div>
          )}
          
      {currentView === 'products' && selectedCategory && selectedSection && (
            <div className="w-full px-4">
              <div className="mb-4">
                <button
                  onClick={openNewProductModal}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Nuevo Producto para {selectedSection.name}
                </button>
              </div>
              
              {products[selectedSection.section_id] ? (
                  <ProductTable 
                  products={products[selectedSection.section_id]}
                    sectionName={selectedSection.name}
                  onToggleVisibility={(productId, status) => {
                    // Implementación temporal
                    console.log(`Toggle visibilidad producto ${productId} a ${status ? 'visible' : 'oculto'}`);
                    }}
                    isUpdatingVisibility={isUpdatingVisibility}
                  onEditProduct={openEditProductModal}
                  onDeleteProduct={(productId) => {
                    const product = products[selectedSection.section_id]?.find(p => p.product_id === productId);
                    if (product) {
                      openDeleteProductModal(product);
                    }
                    return Promise.resolve(true);
                  }}
                  isReorderModeActive={isReorderModeActive}
                  />
                ) : (
                  <div className="flex justify-center items-center h-40 bg-white rounded-lg border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                  </div>
                )}
            </div>
          )}
      </div>
      </div>
      
      {/* Componente de vista previa móvil flotante */}
      <FloatingPhonePreview 
        clientName={client?.name} 
        clientLogo={client?.logo ? `/images/clients/${client.logo}` : undefined}
        categories={categories
          .filter(cat => cat.status === 1) // Solo categorías activas
          .map(cat => ({
            id: cat.category_id,
            name: cat.name,
            image: cat.image ? getImagePath(cat.image, 'categories') : undefined
          }))}
        selectedCategory={selectedCategory ? {
          id: selectedCategory.category_id,
          name: selectedCategory.name,
          image: selectedCategory.image ? getImagePath(selectedCategory.image, 'categories') : undefined
        } : null}
        selectedSection={selectedSection ? {
          id: selectedSection.section_id,
          name: selectedSection.name,
          image: selectedSection.image ? getImagePath(selectedSection.image, 'sections') : undefined
        } : null}
      />
      
      {/* Modales - Comentados temporalmente hasta que tengamos los componentes */}
      <NewCategoryModal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        client={client as any}
        setCategories={setCategories}
      />
      
      <EditCategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => setIsEditCategoryModalOpen(false)}
        categoryToEdit={editingCategory ? categories.find(c => c.category_id === editingCategory.id) || null : null}
        client={client as any}
        setCategories={setCategories}
        onSuccess={() => {
          console.log("Categoría editada con éxito");
        }}
      />
      
      {/* Modales de confirmación de eliminación */}
      <DeleteCategoryConfirmation
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => setIsDeleteCategoryModalOpen(false)}
        categoryId={categoryToDelete?.id || 0}
        categoryName={categoryToDelete?.name || ''}
        clientId={client?.id || null}
        onDeleted={(categoryId) => {
          // Actualizar estado después de eliminar
          setCategories(prev => prev.filter(c => c.category_id !== categoryId));
          toast.success('Categoría eliminada correctamente');
        }}
      />
      
      <DeleteSectionConfirmation
        isOpen={isDeleteSectionModalOpen}
        onClose={() => setIsDeleteSectionModalOpen(false)}
        sectionId={sectionToDelete?.id || 0}
        sectionName={sectionToDelete?.name || ''}
        categoryId={sectionToDelete?.categoryId || 0}
        onDeleted={(sectionId) => {
          // Actualizar estado después de eliminar
          if (sectionToDelete?.categoryId) {
            const categoryId = sectionToDelete.categoryId;
            deleteSection(categoryId, sectionId);
            toast.success('Sección eliminada correctamente');
          }
        }}
      />
      
      <DeleteProductConfirmation
        isOpen={isDeleteProductModalOpen}
        onClose={() => setIsDeleteProductModalOpen(false)}
        productId={productToDelete?.id || 0}
        productName={productToDelete?.name || ''}
        onDeleted={(productId) => {
          // Actualizar estado después de eliminar
          if (selectedSection) {
            deleteProduct(productId, selectedSection.section_id);
            toast.success('Producto eliminado correctamente');
          }
        }}
      />
    </>
  );
}

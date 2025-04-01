"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CategoryTable from "./components/CategoryTable";
import { SectionTable } from "./components/SectionTable";
import { ProductTable } from "./components/ProductTable";
import NewCategoryModal from "./components/NewCategoryModal";
import NewSectionModal from "./components/NewSectionModal";
import NewProductModal from "./components/NewProductModal";
import EditCategoryModal from "./components/EditCategoryModal";
import EditSectionModal from "./components/EditSectionModal";
import EditProductModal from "./components/EditProductModal";
import { TopNavbar } from "./components/TopNavbar";
import { Breadcrumbs, getBreadcrumbItems } from "./components/Breadcrumbs";
import { FloatingPhonePreview } from "./components/FloatingPhonePreview";
import { useTogglePreview } from "./components/hooks/useTogglePreview";
import { Loader } from "./components/ui/Loader";
import { PhonePreview } from "./components/PhonePreview";
import { CategoryList } from "./components/CategoryList";
import { Category, Section, Product } from "@/app/types/menu";
import useDataState from "./hooks/useDataState";
import { getImagePath, handleImageError, getClientLogoPath, getMainLogoPath } from "@/app/dashboard-v2/utils/imageUtils";
import { PlusIcon } from "@heroicons/react/24/outline";

// Añadir console.log para depuración
const DEBUG = process.env.NODE_ENV === 'development';

// Modificamos para incluir propiedades necesarias para los nuevos componentes
interface DashboardSection extends Section {
  id?: number; // Para compatibilidad con los nuevos componentes
  visible?: boolean;
}

// Type for the phone preview components
interface CategoryPreview {
  id: number;
  name: string;
  image: string | undefined;
}

interface SectionPreview {
  id: number;
  name: string;
  image: string | undefined;
}

// Add these interfaces for modals
interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: number;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: number;
}

interface NewSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: number;
}

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: number;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit: Category | null;
  client: any;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: DashboardSection;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  client?: any;  // Make optional
  selectedSection?: any;  // Make optional
  setProducts?: any;  // Make optional
}

// Fix client object type
interface Client {
  id: number;
  name: string;
  logo?: string;
  main_logo?: string | null;
  logoCompany?: string; // Añadido para compatibilidad
  logoMain?: string | null; // Añadido para compatibilidad
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Debug logs
  useEffect(() => {
    if (DEBUG) {
      console.log('🔍 DashboardPage montado');
      console.log('🔑 Estado de autenticación:', status);
      console.log('👤 Sesión:', session ? 'Presente' : 'No presente');
    }
  }, [session, status]);
  
  // Initialize useDataState hook for state management
  const { 
    client,
    categories,
    sections,
    isLoading: isDataLoading,
    isUpdatingVisibility,
    error: dataError,
    setCategories,
    setSections,
    toggleSectionVisibility: toggleSectionVisibilityFromHook,
    fetchSectionsByCategory,
    fetchClientData,
    fetchCategories
  } = useDataState();
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<DashboardSection | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: number]: boolean }>({});
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});
  const [showRedirectMessage, setShowRedirectMessage] = useState(true);
  const [loadingSections, setLoadingSections] = useState<{ [key: number]: boolean }>({});
  const togglePreview = useTogglePreview();

  // Estado para el modo de reordenación
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);
  
  // Estado para vistas
  const [currentView, setCurrentView] = useState<'categories' | 'sections' | 'products'>('categories');
  
  // Hooks para controlar los modals
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [sectionToEdit, setSectionToEdit] = useState<DashboardSection | null>(null);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);
  
  // Productos para la sección seleccionada
  const [products, setProducts] = useState<any[]>([]);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (DEBUG) console.log('🔄 Checking authentication status:', status);
    
    if (status === "authenticated") {
      // Data loading is now handled by useDataState hook
      if (DEBUG) console.log('✅ Usuario autenticado, cargando datos...');
      
      // Iniciar la carga de datos del cliente y las categorías
      const loadInitialData = async () => {
        try {
          if (DEBUG) console.log('⏳ Cargando datos iniciales...');
          await fetchClientData();
          await fetchCategories();
          if (DEBUG) console.log('✅ Datos iniciales cargados con éxito');
        } catch (error) {
          console.error('❌ Error cargando datos iniciales:', error);
          setError('Error al cargar los datos iniciales');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadInitialData();
    } else if (status === "unauthenticated") {
      if (DEBUG) console.log('❌ Usuario no autenticado, redirigiendo...');
      setIsLoading(false);
      router.push('/login');
    }
  }, [status, fetchClientData, fetchCategories, router]);

  // Manejar clic en categoría
  const handleCategoryClick = async (category: Category) => {
    try {
      console.log(`Clic en categoría: ${category.name} (${category.category_id})`);
      
      // Actualizar la categoría seleccionada
      setSelectedCategory(category);
      
      // IMPORTANTE: Cambiar a la vista de secciones
      setCurrentView('sections');
      
      const categoryId = category.category_id;
      
      // Siempre cargar las secciones para asegurar datos actualizados
      console.log(`Cargando secciones para categoría: ${categoryId}`);
      setLoadingSections(prev => ({ ...prev, [categoryId]: true }));
      
      try {
        const response = await fetch(`/api/sections?category_id=${categoryId}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log(`API respondió con ${data.length} secciones para categoría ${categoryId}`);
        
        // Normalizar los datos de las secciones
        const normalizedSections = data.map((s: any) => ({
          section_id: s.id,
          id: s.id, // Para compatibilidad con nuevos componentes
          name: s.name,
          image: s.image,
          order: s.order,
          visible: s.visible !== false, // Por defecto visible
          status: s.visible !== false ? 1 : 0, // Convertir a formato numérico para compatibilidad
          category_id: categoryId // Asegurarse de que la sección tenga referencia a su categoría
        }));
        
        setSections(prev => ({ ...prev, [categoryId]: normalizedSections }));
        console.log(`Secciones cargadas para categoría ${categoryId}: ${normalizedSections.length}`);
      } catch (error) {
        console.error(`Error cargando secciones para categoría ${categoryId}:`, error);
        // En caso de error, asegurarnos que se sigue mostrando cualquier dato que ya tuviéramos
      } finally {
        setLoadingSections(prev => ({ ...prev, [categoryId]: false }));
      }
      
      // También expandir la categoría
      setExpandedCategories(prev => ({
        ...prev,
        [category.category_id]: true
      }));
    } catch (err: any) {
      console.error('Error general en handleCategoryClick:', err);
      setError(err.message || 'Error al cargar secciones');
    }
  };

  // Manejar clic en sección
  const handleSectionClick = (section: DashboardSection) => {
    console.log(`Clic en sección: ${section.name} (${section.section_id})`);
    setSelectedSection(section);
    setCurrentView('products');
    // Aquí se cargarían los productos de esta sección
    setProducts([
      { id: 1, name: 'Producto 1', price: 9.99, order: 1, image: null, visible: true },
      { id: 2, name: 'Producto 2', price: 12.99, order: 2, image: null, visible: true },
      { id: 3, name: 'Producto 3', price: 15.99, order: 3, image: null, visible: false }
    ]);
  };

  // Funciones para manejar acciones en categorías, secciones y productos
  const toggleCategoryVisibility = (categoryId: number) => {
    // Implementación de ejemplo
    console.log(`Toggle visibility for category: ${categoryId}`);
    setCategories(prev => 
      prev.map(cat => 
        cat.category_id === categoryId ? { ...cat, status: cat.status === 0 ? 1 : 0 } : cat
      )
    );
  };

  const toggleSectionVisibility = async (sectionId: number, status: number) => {
    console.log(`Toggle visibility for section: ${sectionId} to ${status}`);
    // Use the hook's function
    await toggleSectionVisibilityFromHook(sectionId, status);
  };

  const handleDeleteSection = (section: Section, categoryId: number) => {
    console.log(`Delete section: ${section.section_id} from category ${categoryId}`);
    // Implementation here
    if (selectedCategory) {
      setSections(prev => ({
          ...prev,
        [categoryId]: prev[categoryId].filter(s => s.section_id !== section.section_id)
        }));
      }
    };

  const toggleProductVisibility = async (productId: number, status: number): Promise<void> => {
    // Implementación de ejemplo
    console.log(`Toggle visibility for product: ${productId}`);
    setProducts(prev => 
      prev.map(prod => 
        prod.id === productId ? { ...prod, status } : prod
      )
    );
  };

  const handleDeleteProduct = async (productId: number): Promise<boolean> => {
    // Implementation here
    console.log(`Delete product: ${productId}`);
    setProducts(prev => prev.filter(p => p.id !== productId));
    return true; // Return true to indicate success
  };

  const reorderCategories = (reorderedCategories: Category[]) => {
    // Implementación de ejemplo
    console.log('Reordering categories', reorderedCategories);
    setCategories(reorderedCategories);
  };

  const reorderSections = (reorderedSections: DashboardSection[]) => {
    // Implementación de ejemplo
    console.log('Reordering sections', reorderedSections);
    if (selectedCategory) {
      setSections(prev => ({
        ...prev,
        [selectedCategory.category_id]: reorderedSections
      }));
    }
  };

  const reorderProducts = (reorderedProducts: any[]) => {
    // Implementación de ejemplo
    console.log('Reordering products', reorderedProducts);
    setProducts(reorderedProducts);
  };

  // Función para volver a la vista de categorías
  const resetView = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSelectedSection(null);
  };

  // Preparar breadcrumbs usando la función de utilidad
  const breadcrumbs = getBreadcrumbItems(
    currentView,
    selectedCategory,
    selectedSection,
    {
      goToCategories: resetView,
      goToSections: handleCategoryClick,
      goToProducts: handleSectionClick
    }
  );
  
  // Handlers para modals
  const handleAddCategory = () => {
    setShowNewCategoryModal(true);
  };

  const handleAddSection = () => {
    setShowNewSectionModal(true);
  };

  const handleAddProduct = () => {
    setShowNewProductModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    setShowEditCategoryModal(true);
  };

  const handleEditSection = (section: DashboardSection) => {
    setSectionToEdit(section);
    setShowEditSectionModal(true);
  };

  const handleEditProduct = (product: any) => {
    setProductToEdit(product);
    setShowEditProductModal(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    // Implementar lógica de eliminación
    console.log("Delete category:", categoryId);
  };

  // Manejar estados de carga y error
  if (isLoading || isDataLoading) {
    if (DEBUG) console.log('⏳ Mostrando pantalla de carga...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || dataError) {
    if (DEBUG) console.log('❌ Error detectado:', error || dataError);
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <p>Error: {error || dataError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TopNavbar con botón para reordenar */}
      <TopNavbar 
        isReorderModeActive={isReorderModeActive}
        onToggleReorderMode={() => setIsReorderModeActive(!isReorderModeActive)}
      />
      
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Barra superior con botón de vista previa */}
        <div className="flex justify-between items-center mb-6">
          <div>
            {/* Navegación simple como en el original */}
            <Breadcrumbs items={breadcrumbs} />
          </div>
          <div>
            <button
              type="button"
              onClick={togglePreview}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Live Preview
            </button>
          </div>
        </div>
        
        {/* Contenedor con efectos de transición para las vistas */}
        <div className="transition-opacity duration-300 ease-in-out">
          {/* Vista de categorías */}
          {currentView === 'categories' && (
            <div className="animate-fade-in">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="sr-only">Categorías</h2>
                <div></div> {/* Spacer */}
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Añadir categoría
                </button>
              </div>
              
              <CategoryTable
                categories={categories}
                expandedCategories={expandedCategories}
                onCategoryClick={handleCategoryClick}
                onEditCategory={(category: Category) => handleEditCategory(category)}
                onDeleteCategory={handleDeleteCategory}
                onToggleCategoryVisibility={(categoryId: number, currentStatus: number) => {
                  console.log(`Toggle visibility for category: ${categoryId} to status: ${currentStatus}`);
                  const category = categories.find(c => c.category_id === categoryId);
                  if (category) {
                    // Update category status
                    setCategories(prev => 
                      prev.map(cat => 
                        cat.category_id === categoryId ? { ...cat, status: currentStatus } : cat
                      )
                    );
                  }
                }}
                isUpdatingVisibility={isUpdatingVisibility}
                sections={sections}
                expandedSections={expandedSections}
                onAddSection={(categoryId: number) => {
                  const category = categories.find(c => c.category_id === categoryId);
                  if (category) {
                    setSelectedCategory(category);
                    setShowNewSectionModal(true);
                  }
                }}
                onSectionClick={(sectionId) => {
                  // Buscar la sección con este ID
                  let section = null;
                  let foundCategory = null;
                  
                  Object.entries(sections).forEach(([categoryId, sectionList]) => {
                    const foundSection = sectionList.find(s => s.section_id === sectionId);
                    if (foundSection) {
                      section = foundSection;
                      foundCategory = categories.find(c => c.category_id === parseInt(categoryId));
                    }
                  });
                  
                  if (section && foundCategory) {
                    setSelectedCategory(foundCategory);
                    setSelectedSection(section);
                    handleSectionClick(section);
                  }
                }}
                onToggleSectionVisibility={toggleSectionVisibility}
                onEditSection={handleEditSection}
                onDeleteSection={(section: Section) => handleDeleteSection(section, section.category_id || 0)}
                onAddProduct={(sectionId: number) => {
                  // Buscar la sección con este ID
                  let section = null;
                  let foundCategory = null;
                  
                  Object.entries(sections).forEach(([categoryId, sectionList]) => {
                    const foundSection = sectionList.find(s => s.section_id === sectionId);
                    if (foundSection) {
                      section = foundSection;
                      foundCategory = categories.find(c => c.category_id === parseInt(categoryId));
                    }
                  });
                  
                  if (section) {
                    setSelectedSection(section);
                    setShowNewProductModal(true);
                  }
                }}
              />
            </div>
          )}
          
          {/* Vista de secciones */}
          {currentView === 'sections' && selectedCategory && (
            <div className="animate-fade-in">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Secciones de {selectedCategory.name}
                </h2>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Añadir sección
                </button>
              </div>
              
              {loadingSections[selectedCategory.category_id] ? (
                <div className="flex justify-center items-center py-8">
                  <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : sections && sections[selectedCategory.category_id] && sections[selectedCategory.category_id].length > 0 ? (
                <SectionTable 
                  sections={sections[selectedCategory.category_id] || []}
                  onEditSection={handleEditSection}
                  onDeleteSection={(section) => handleDeleteSection(section, selectedCategory.category_id)}
                  onToggleSectionVisibility={toggleSectionVisibility}
                  categoryId={selectedCategory.category_id}
                  isUpdatingVisibility={isUpdatingVisibility}
                  onSectionClick={(sectionId) => {
                    // Buscar la sección con este ID
                    let section = null;
                    let foundCategory = null;
                    
                    Object.entries(sections).forEach(([categoryId, sectionList]) => {
                      const foundSection = sectionList.find(s => s.section_id === sectionId);
                      if (foundSection) {
                        section = foundSection;
                        foundCategory = categories.find(c => c.category_id === parseInt(categoryId));
                      }
                    });
                    
                    if (section && foundCategory) {
                      setSelectedCategory(foundCategory);
                      setSelectedSection(section);
                      handleSectionClick(section);
                    }
                  }}
                  onAddProduct={(sectionId: number) => {
                    // Buscar la sección con este ID
                    let section = null;
                    let foundCategory = null;
                    
                    Object.entries(sections).forEach(([categoryId, sectionList]) => {
                      const foundSection = sectionList.find(s => s.section_id === sectionId);
                      if (foundSection) {
                        section = foundSection;
                        foundCategory = categories.find(c => c.category_id === parseInt(categoryId));
                      }
                    });
                    
                    if (section) {
                      setSelectedSection(section);
                      setShowNewProductModal(true);
                    }
                  }}
                />
              ) : (
                <div className="bg-white shadow rounded-md p-6 text-center">
                  <p className="text-gray-500">No hay secciones disponibles para esta categoría.</p>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Añadir primera sección
                  </button>
                </div>
              )}
            </div>
          )}
           
          {/* Vista de productos */}
          {currentView === 'products' && selectedCategory && selectedSection && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Productos de {selectedSection.name}</h1>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Añadir producto
                </button>
              </div>
              
              <ProductTable
                products={products[selectedSection.section_id] || []}
                sectionName={selectedSection.name}
                onEditProduct={handleEditProduct}
                onDeleteProduct={async (productId: number) => {
                  console.log("Delete product:", productId);
                  return true; // Simular eliminación exitosa
                }}
                onToggleVisibility={async (productId: number, status: number) => {
                  console.log(`Toggle visibility for product: ${productId} to ${status}`);
                  // Implementar actualización real cuando sea necesario
                }}
                isUpdatingVisibility={null}
                isReorderModeActive={isReorderModeActive}
                onReorderProduct={(productId: number, direction: 'up' | 'down') => {
                  console.log(`Reorder product: ${productId} ${direction}`);
                }}
              />
            </div>
          )}
        </div>
      </main>
      
      {/* Modals para creación */}
      {showNewCategoryModal && (
      <NewCategoryModal
          isOpen={true}
          onClose={() => setShowNewCategoryModal(false)}
        client={client as any}
        setCategories={setCategories}
      />
      )}
      
      {showNewSectionModal && selectedCategory && (
        <NewSectionModal 
          isOpen={true}
          onClose={() => setShowNewSectionModal(false)} 
          categoryId={selectedCategory.category_id}
        />
      )}
      
      {showNewProductModal && selectedSection && (
        <NewProductModal 
          isOpen={true}
          onClose={() => setShowNewProductModal(false)} 
          sectionId={selectedSection.section_id}
        />
      )}

      {/* Modals para edición */}
      {showEditCategoryModal && categoryToEdit && (
      <EditCategoryModal
          isOpen={true}
        onClose={() => {
              setShowEditCategoryModal(false);
              setCategoryToEdit(null);
        }}
          categoryToEdit={categoryToEdit}
          client={client}
        setCategories={setCategories}
        />
      )}
      
      {showEditSectionModal && sectionToEdit && (
        <EditSectionModal 
          isOpen={true}
        onClose={() => {
              setShowEditSectionModal(false);
              setSectionToEdit(null);
            }} 
          section={sectionToEdit}
        />
      )}
      
      {showEditProductModal && productToEdit && (
      <EditProductModal
          isOpen={true}
        onClose={() => {
              setShowEditProductModal(false);
              setProductToEdit(null);
        }}
          product={productToEdit}
        client={client as any}
        selectedSection={selectedSection}
          setProducts={setProducts as any}
        />
      )}

      {/* Componente de vista previa flotante */}
      <FloatingPhonePreview 
        clientName={client?.name} 
        clientLogo={client?.logo ? getClientLogoPath(client.logo) : undefined}
        clientMainLogo={client?.main_logo ? getMainLogoPath(client.main_logo) : undefined}
        categories={categories
          .filter(cat => cat.status === 1)
          .map(cat => ({
            id: cat.category_id,
            category_id: cat.category_id,
            name: cat.name,
            image: cat.image ? getImagePath(cat.image, 'categories') : undefined,
            sections: sections[cat.category_id]?.filter(sec => sec.status === 1).map(sec => ({
              id: sec.section_id,
              name: sec.name,
              image: sec.image ? getImagePath(sec.image, 'sections') : undefined
            })) || []
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
    </div>
  );
}

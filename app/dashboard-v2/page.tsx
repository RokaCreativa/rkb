"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CategoryTable } from "./components/CategoryTable";
import { SectionTable } from "./components/SectionTable";
import { ProductTable } from "./components/ProductTable";
import NewCategoryModal from "./components/NewCategoryModal";
import NewSectionModal from "./components/NewSectionModal";
import NewProductModal from "./components/NewProductModal";
import EditCategoryModal from "./components/EditCategoryModal";
import EditSectionModal from "./components/EditSectionModal";
import EditProductModal from "./components/EditProductModal";
import { TopNavbar } from "./components/TopNavbar";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { FloatingPhonePreview } from "./components/FloatingPhonePreview";
import { useTogglePreview } from "./components/hooks/useTogglePreview";
import { Loader } from "../components/ui/loader";
import { PhonePreview } from "./components/PhonePreview";
import { CategoryList } from "./components/CategoryList";
import { Category, Section, Product } from "@/app/types/menu";
import useDataState from "./hooks/useDataState";

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
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
    fetchSectionsByCategory
  } = useDataState();
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<DashboardSection | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: number]: boolean }>({});
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
    if (status === "authenticated") {
      // Data loading is now handled by useDataState hook
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      setIsLoading(false);
      console.log("Usuario no autenticado, redirigiendo...");
    }
  }, [status]);

  // Manejar clic en categoría
  const handleCategoryClick = async (category: Category) => {
    try {
      console.log(`Clic en categoría: ${category.name} (${category.category_id})`);
      
      // Usar el ID para expandir/contraer
    setExpandedCategories(prev => ({
      ...prev,
        [category.category_id]: !prev[category.category_id]
      }));
      
      // Actualizar la categoría seleccionada
            setSelectedCategory(category);
      setSelectedSection(null);
      
      setCurrentView('sections');
      
      const categoryId = category.category_id;
      
      if (!sections[categoryId] || sections[categoryId].length === 0) {
        console.log(`Cargando secciones para categoría: ${categoryId}`);
        setLoadingSections(prev => ({ ...prev, [categoryId]: true }));
        
        const response = await fetch(`/api/sections?categoryId=${categoryId}`);
        
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
          visible: s.visible !== false // Por defecto visible
        }));
        
        setSections(prev => ({ ...prev, [categoryId]: normalizedSections }));
        setLoadingSections(prev => ({ ...prev, [categoryId]: false }));
        
        console.log(`Secciones cargadas para categoría ${categoryId}: ${normalizedSections.length}`);
        } else {
        console.log(`Usando secciones ya cargadas (${sections[categoryId].length}) para categoría: ${categoryId}`);
      }
    } catch (err: any) {
      console.error('Error loading sections:', err);
      setLoadingSections(prev => ({ ...prev, [selectedCategory?.category_id || 0]: false }));
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

  // Preparar breadcrumbs según la vista actual
  const breadcrumbs = [
    { id: 'dashboard', name: 'Dashboard', current: currentView === 'categories', onClick: resetView },
  ];
  
  if (selectedCategory) {
    breadcrumbs.push({ 
        id: `category-${selectedCategory.category_id}`, 
        name: selectedCategory.name, 
      current: currentView === 'sections', 
      onClick: () => handleCategoryClick(selectedCategory)
    });
  }
  
  if (selectedSection) {
    breadcrumbs.push({ 
        id: `section-${selectedSection.section_id}`, 
        name: selectedSection.name, 
      current: currentView === 'products', 
      onClick: () => handleSectionClick(selectedSection)
    });
  }

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || dataError) {
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
              Vista previa
              </button>
            </div>
        </div>

        {/* Vista de categorías */}
        {currentView === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
            <button
                type="button"
                onClick={handleAddCategory}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Añadir categoría
            </button>
          </div>
          
              <CategoryTable
              categories={categories}
                expandedCategories={expandedCategories}
                onCategoryClick={handleCategoryClick}
              onEditCategory={(category) => handleEditCategory(category)}
                onDeleteCategory={handleDeleteCategory}
              onToggleVisibility={(categoryId, status) => {
                console.log(`Toggle visibility for category: ${categoryId} to status: ${status}`);
                const category = categories.find(c => c.category_id === categoryId);
                if (category) {
                  // Update category status
                  setCategories(prev => 
                    prev.map(cat => 
                      cat.category_id === categoryId ? { ...cat, status } : cat
                    )
                  );
                }
              }}
              isUpdatingVisibility={null}
              onReorderCategory={(categoryId, direction) => {
                // Simple implementation that updates the order
                const index = categories.findIndex(c => c.category_id === categoryId);
                if (index === -1) return;
                
                const newCategories = [...categories];
                
                if (direction === 'up' && index > 0) {
                  // Swap with previous item
                  [newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]];
                } else if (direction === 'down' && index < categories.length - 1) {
                  // Swap with next item
                  [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
                }
                
                setCategories(newCategories);
              }}
              isReorderModeActive={isReorderModeActive}
              onReloadSections={(categoryId) => {
                const category = categories.find(c => c.category_id === categoryId);
                if (category) {
                  // Force reload sections for this category
                  handleCategoryClick(category);
                }
              }}
            />
            </div>
          )}
          
        {/* Vista de secciones */}
          {currentView === 'sections' && selectedCategory && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Secciones de {selectedCategory.name}</h1>
              <button
                type="button"
                onClick={handleAddSection}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Añadir sección
              </button>
            </div>
            
                  <SectionTable 
              sections={sections[selectedCategory.category_id] || []}
              onEditSection={handleEditSection}
                    onDeleteSection={handleDeleteSection}
              onToggleSectionVisibility={toggleSectionVisibility}
              categoryId={selectedCategory.category_id}
              isUpdatingVisibility={isUpdatingVisibility}
                  />
            </div>
          )}
          
        {/* Vista de productos */}
      {currentView === 'products' && selectedCategory && selectedSection && (
          <div>
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
              products={products}
                    sectionName={selectedSection.name}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleVisibility={toggleProductVisibility}
              isUpdatingVisibility={null}
              isReorderModeActive={isReorderModeActive}
              onReorderProduct={(productId, direction) => {
                // Simple implementation for product reordering
                const index = products.findIndex(p => p.id === productId);
                if (index === -1) return;
                
                const newProducts = [...products];
                
                if (direction === 'up' && index > 0) {
                  [newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]];
                } else if (direction === 'down' && index < products.length - 1) {
                  [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];
                }
                
                setProducts(newProducts);
              }}
            />
                  </div>
                )}
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
        clientName={client?.name || 'RokaMenu'}
        clientLogo={client?.logo || '/images/placeholder.png'}
        clientMainLogo={client?.main_logo as string | undefined || undefined}
        categories={categories.map(c => ({
            id: c.category_id,
            name: c.name,
          image: c.image || undefined
        }))}
        selectedCategory={selectedCategory ? {
          id: selectedCategory.category_id,
          name: selectedCategory.name,
          image: selectedCategory.image || undefined
        } : null}
        selectedSection={selectedSection ? {
          id: selectedSection.section_id,
          name: selectedSection.name,
          image: selectedSection.image || undefined
        } : null}
      />
    </div>
  );
}

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
    fetchCategories,
    fetchProductsBySection
  } = useDataState();
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<DashboardSection | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: number]: boolean }>({});
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});
  
  // Estado para secciones con productos cargados (para debug y optimización)
  const [loadedProductSections, setLoadedProductSections] = useState<{ [key: number]: boolean }>({});
  
  const [showRedirectMessage, setShowRedirectMessage] = useState(true);
  const [loadingSections, setLoadingSections] = useState<{ [key: number]: boolean }>({});
  const [loadingProducts, setLoadingProducts] = useState<{ [key: number]: boolean }>({});
  const togglePreview = useTogglePreview();
  
  // Estado local para almacenar las secciones de categorías expandidas
  const [expandedCategorySections, setExpandedCategorySections] = useState<{ [key: number]: Section[] }>({});
  
  // Estado local para almacenar los productos de secciones expandidas
  // ⚠️ IMPORTANTE: Seguimos el mandamiento crítico de estado dual (local/global)
  const [expandedSectionProducts, setExpandedSectionProducts] = useState<{ [key: number]: Product[] }>({});

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
          
          // Evitar cargar datos si ya tenemos categorías
          if (categories.length > 0) {
            if (DEBUG) console.log('✅ Ya hay categorías cargadas, evitando recarga');
            setIsLoading(false);
            return;
          }
          
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
  }, [status, fetchClientData, fetchCategories, router, categories]);

  // Efecto para cargar secciones de categorías expandidas
  useEffect(() => {
    // Verificar si hay categorías expandidas
    const expandedCategoryIds = Object.entries(expandedCategories)
      .filter(([_, isExpanded]) => isExpanded)
      .map(([id]) => parseInt(id));
    
    if (expandedCategoryIds.length === 0) return;
    
    // Para cada categoría expandida, verificar si necesitamos cargar sus secciones
    expandedCategoryIds.forEach(categoryId => {
      if (!sections[categoryId] || sections[categoryId].length === 0) {
        console.log(`Cargando secciones para categoría expandida ${categoryId}`);
        fetchSectionsByCategory(categoryId);
      }
    });
    
  }, [expandedCategories, sections, fetchSectionsByCategory]);

  /**
   * Maneja el clic en una categoría
   * 
   * Este es un método CRÍTICO que:
   * 1. Expande/colapsa la categoría seleccionada
   * 2. Carga las secciones de la categoría si no están cargadas
   * 3. Actualiza el estado para mostrar las secciones inmediatamente
   * 
   * IMPORTANTE: Siempre expandimos la categoría (no alternamos) para garantizar
   * consistencia en la experiencia de usuario
   * 
   * @param category - El objeto Category completo que fue clickeado
   */
  const handleCategoryClick = async (category: Category) => {
    console.log(`Clic en categoría: ${category.name} (${category.category_id})`);
    const categoryId = category.category_id;
    
    // Expandir la categoría seleccionada (no alternar, siempre expandir)
    console.log(`Expandiendo categoría: ${categoryId}`);
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: true
    }));
    
    // Solo cargamos secciones si no tenemos datos en el estado local o global
    const sectionsLoaded = expandedCategorySections[categoryId] || sections[categoryId];
    
    if (!sectionsLoaded) {
      console.log(`Cargando secciones directamente para categoría ${categoryId}`);
      setLoadingSections(prev => ({
        ...prev,
        [categoryId]: true
      }));
      
      try {
        // 1. Llamar a la API para obtener las secciones de esta categoría
        const response = await fetch(`/api/sections?category_id=${categoryId}`);
        const data = await response.json();
        
        if (data && Array.isArray(data.sections)) {
          // 2. Procesar las secciones recibidas para asegurar formato correcto
          const processedSections = data.sections.map((section: any) => ({
            ...section,
            section_id: section.section_id,
            id: section.section_id,
            name: section.name,
            image: section.image,
            status: typeof section.status === 'boolean' ? (section.status ? 1 : 0) : section.status,
            display_order: section.display_order,
            category_id: section.category_id,
            products_count: section.products_count || 0,
            visible_products_count: section.visible_products_count || 0
          }));
          
          console.log(`API respondió con ${processedSections.length} secciones para categoría ${categoryId}`);
          
          // 3. Actualizar el estado GLOBAL para coordinación con otros componentes
          console.log(`Actualizando estado global de secciones: ${JSON.stringify({[categoryId]: processedSections.length})}`);
          setSections(prev => {
            const newSections = { ...prev };
            newSections[categoryId] = processedSections;
            return newSections;
          });
          
          // 4. CRUCIAL: También guardar en estado local para renderizado inmediato
          setExpandedCategorySections(prev => {
            const newSections = { ...prev };
            newSections[categoryId] = processedSections;
            console.log("Guardando secciones en estado local:", processedSections.length);
            return newSections;
          });
        }
      } catch (error) {
        console.error(`Error al cargar secciones para categoría ${categoryId}:`, error);
      } finally {
        // 5. Siempre finalizar el estado de carga
        setLoadingSections(prev => ({
          ...prev,
          [categoryId]: false
        }));
      }
    } else {
      console.log(`Secciones ya cargadas para categoría ${categoryId}, no es necesario recargar`);
    }
  };

  /**
   * Maneja el clic en una sección
   * 
   * Este es un método CRÍTICO que:
   * 1. Establece la sección seleccionada
   * 2. Cambia la vista a productos
   * 3. Carga los productos de esta sección si no están cargados
   * 4. Actualiza AMBOS estados (global y local) para mostrar productos inmediatamente
   * 
   * Sigue el MANDAMIENTO CRÍTICO de gestión de estado dual (local/global)
   * 
   * @param section - El objeto Section completo que fue clickeado
   */
  const handleSectionClick = async (section: DashboardSection) => {
    console.log(`Clic en sección: ${section.name} (${section.section_id})`);
    
    // Actualizar la sección seleccionada pero sin cambiar de vista
    setSelectedSection(section);
    const sectionId = section.section_id;
    
    // MODIFICACIÓN CRÍTICA: Expandir/colapsar la sección en lugar de cambiar de vista
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
    
    console.log(`Estado de expansión para sección ${sectionId}: ${!expandedSections[sectionId] ? 'Expandiendo' : 'Colapsando'}`);
    
    // Si estamos expandiendo la sección, cargar los productos si no están cargados
    if (!expandedSections[sectionId]) {
      console.log(`🔍 DEBUG - Expandiendo sección ${sectionId} (${section.name})`);
      // Verificar si necesitamos cargar productos
      const productsLoaded = expandedSectionProducts[sectionId] || products[sectionId] || loadedProductSections[sectionId];
      
      console.log(`🔍 DEBUG - ¿Productos ya cargados para sección ${sectionId}?`, !!productsLoaded);
      console.log(`🔍 DEBUG - Estado actual:`, {
        expandedSectionProducts: !!expandedSectionProducts[sectionId],
        globalProducts: !!products[sectionId],
        loadedProductSections: !!loadedProductSections[sectionId]
      });
      
      if (!productsLoaded) {
        console.log(`Cargando productos para sección ${sectionId}...`);
        
        // Mostrar indicador de carga
        setLoadingProducts(prev => ({
          ...prev,
          [sectionId]: true
        }));
        
        try {
          // Usar la función mejorada de useDataState que actualiza ambos estados
          await fetchProductsBySection(sectionId, (loadedProducts) => {
            // Esta función actualiza el estado LOCAL inmediatamente
            setExpandedSectionProducts(prev => ({
              ...prev,
              [sectionId]: loadedProducts
            }));
            
            // Marcar esta sección como cargada para evitar recargas innecesarias
            setLoadedProductSections(prev => ({
              ...prev,
              [sectionId]: true
            }));
            
            console.log(`✅ Estado local actualizado con ${loadedProducts.length} productos`);
          });
        } catch (error) {
          console.error(`Error al cargar productos para sección ${sectionId}:`, error);
        } finally {
          // Quitar indicador de carga
          setLoadingProducts(prev => ({
            ...prev,
            [sectionId]: false
          }));
        }
      } else {
        console.log(`Productos ya cargados para sección ${sectionId}, usando datos en caché`);
      }
    }
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
    currentView === 'products' ? 'categories' : currentView, // Mantener siempre en categories para mostrar todo en la misma vista
    selectedCategory,
    selectedSection,
    {
      goToCategories: resetView,
      goToSections: handleCategoryClick,
      goToProducts: (section) => {
        console.log("Breadcrumb: Expandiendo sección desde breadcrumb", section.name);
        // En lugar de cambiar de vista, expandir la sección
        handleSectionClick(section);
        
        // Asegurar que la categoría también esté expandida
        if (section.category_id) {
          const category = categories.find(c => c.category_id === section.category_id);
          if (category) {
            console.log("Breadcrumb: Expandiendo categoría desde breadcrumb", category.name);
            setExpandedCategories(prev => ({
              ...prev,
              [category.category_id]: true
            }));
          }
        }
      }
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
  if (isLoading && isDataLoading) {
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
                  
                  Object.entries(sections).forEach(([categoryId, sectionList]) => {
                    const foundSection = sectionList.find(s => s.section_id === sectionId);
                    if (foundSection) {
                      section = foundSection;
                    }
                  });
                  
                  if (section) {
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
              
              {/* Secciones expandidas para categorías */}
              <div className="space-y-6">
                {/* 
                  IMPORTANTE: Secciones para categorías expandidas
                  =================================================
                  Aquí mostramos las secciones de cada categoría expandida.
                  El proceso es:
                  
                  1. Iteramos sobre todas las categorías
                  2. Solo procesamos las que están expandidas (expandedCategories[category.category_id] = true)
                  3. Obtenemos las secciones del estado LOCAL primero (respuesta inmediata) o 
                     del estado GLOBAL como respaldo
                  4. Mostramos un indicador de carga, las secciones, o un mensaje si no hay secciones
                */}
                {categories.map(category => {
                  // Solo mostrar si la categoría está expandida
                  if (!expandedCategories[category.category_id]) return null;
                  
                  console.log(`Renderizando categoría expandida: ${category.name} (${category.category_id})`);
                  console.log("Estado global de sections:", JSON.stringify(sections));
                  console.log("Estado local de sections:", JSON.stringify(expandedCategorySections));
                  
                  // Debug: Verificar si tenemos secciones para esta categoría
                  // Priorizar el estado local de secciones (más inmediato) sobre el estado global (más retrasado)
                  const categoryId = category.category_id;
                  const sectionsList = expandedCategorySections[categoryId] || sections[categoryId] || [];
                  const hasSections = sectionsList && sectionsList.length > 0;
                  
                  console.log(`¿Tiene secciones la categoría ${category.category_id}?`, hasSections);
                  console.log(`Número de secciones para categoría ${category.category_id}:`, sectionsList?.length || 0);
                  
                  if (hasSections) {
                    console.log(`Secciones para categoría ${category.category_id}:`, 
                              sectionsList.map((s: Section) => `${s.name} (${s.section_id})`).join(', '));
                  }
                  
                  return (
                    <div 
                      key={`expanded-category-${category.category_id}`}
                      id={`category-${category.category_id}`}
                      className="mt-4 w-full pl-4 border-l-4 border-indigo-100"
                    >
                      <div className="bg-blue-50 py-4 px-6 rounded-md shadow-sm border border-blue-100">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-indigo-800">{category.name}</h3>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory(category);
                              handleAddSection();
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                            Añadir sección
                          </button>
                        </div>
                        
                        {/* 
                          Estados de contenido de secciones:
                          1. Cargando: Mostramos spinner
                          2. Con secciones: Mostramos tabla de secciones
                          3. Sin secciones: Mostramos mensaje y botón de añadir
                        */}
                        {loadingSections[category.category_id] ? (
                          <div className="flex justify-center items-center py-8">
                            <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        ) : hasSections ? (
                          <div>
                            {/* Debug info solo en desarrollo */}
                            {DEBUG && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-3 text-xs">
                                <p>Debug: Categoría {category.category_id} tiene {sectionsList.length} secciones</p>
                                <p>Secciones: {sectionsList.map((s: Section) => s.name).join(', ')}</p>
                                <p>Fuente: {expandedCategorySections[categoryId] ? 'Estado local' : 'Estado global'}</p>
                              </div>
                            )}
                            <SectionTable 
                              sections={sectionsList}
                              onEditSection={handleEditSection}
                              onDeleteSection={(section) => handleDeleteSection(section, category.category_id)}
                              onToggleSectionVisibility={toggleSectionVisibility}
                              categoryId={category.category_id}
                              isUpdatingVisibility={isUpdatingVisibility}
                              onSectionClick={(sectionId) => {
                                const section = sectionsList.find(s => s.section_id === sectionId);
                                if (section) {
                                  handleSectionClick(section);
                                }
                              }}
                              onAddProduct={(sectionId) => {
                                const section = sectionsList.find(s => s.section_id === sectionId);
                                if (section) {
                                  setSelectedSection(section);
                                  setShowNewProductModal(true);
                                }
                              }}
                            />
                            
                            {/* Productos para secciones expandidas */}
                            <div className="space-y-4 mt-4">
                              {sectionsList.map((section: Section) => {
                                // Solo mostrar si la sección está expandida
                                if (!expandedSections[section.section_id]) return null;
                                
                                console.log(`🔍 DEBUG - Renderizando sección expandida: ${section.name} (${section.section_id})`);
                                
                                // Obtener productos para esta sección
                                const sectionId = section.section_id;
                                const productsList = expandedSectionProducts[sectionId] || products[sectionId] || [];
                                const hasProducts = productsList && productsList.length > 0;
                                
                                console.log(`🔍 DEBUG - Productos para sección ${sectionId}:`, 
                                          hasProducts ? productsList.map(p => p.name).join(', ') : 'ninguno');
                                
                                return (
                                  <div 
                                    key={`expanded-section-${sectionId}`}
                                    id={`section-${sectionId}`}
                                    className="pl-4 border-l-4 border-green-100"
                                  >
                                    <div className="bg-green-50 py-4 px-6 rounded-md shadow-sm border border-green-100">
                                      <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-md font-medium text-green-800">{section.name}</h4>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedSection(section);
                                            setShowNewProductModal(true);
                                          }}
                                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                          <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                          Añadir producto
                                        </button>
                                      </div>
                                      
                                      {/* Estados posibles: cargando, con productos, sin productos */}
                                      {loadingProducts[sectionId] ? (
                                        <div className="flex justify-center items-center py-6">
                                          <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                        </div>
                                      ) : hasProducts ? (
                                        <ProductTable
                                          products={productsList.map(p => ({
                                            ...p,
                                            id: p.product_id,
                                            product_id: p.product_id,
                                            name: p.name || '',
                                            price: p.price || 0,
                                            image: p.image || null,
                                            status: typeof p.status === 'boolean' ? (p.status ? 1 : 0) : (p.status || 0)
                                          })) as any[]}
                                          sectionName={section.name}
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
                                      ) : (
                                        <div className="bg-white shadow rounded-md p-6 text-center">
                                          <p className="text-gray-500">No hay productos disponibles para esta sección.</p>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedSection(section);
                                              setShowNewProductModal(true);
                                            }}
                                            className="mt-4 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                          >
                                            <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                            Añadir primer producto
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white shadow rounded-md p-6 text-center">
                            <p className="text-gray-500">No hay secciones disponibles para esta categoría.</p>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategory(category);
                                handleAddSection();
                              }}
                              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                              Añadir primera sección
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
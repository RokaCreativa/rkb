"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
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
import { toast } from "react-hot-toast";
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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
    fetchProductsBySection,
    deleteCategory,
    deleteSection
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
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [sectionToEdit, setSectionToEdit] = useState<DashboardSection | null>(null);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);
  
  // Productos para la sección seleccionada
  const [products, setProducts] = useState<any[]>([]);

  // Estado para submits
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Añadir estos estados
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [categoryNameToDelete, setCategoryNameToDelete] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estado para el modal de eliminación de sección
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  
  // Estado para el modal de eliminación de producto
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [productNameToDelete, setProductNameToDelete] = useState<string>('');
  const [sectionIdOfProductToDelete, setSectionIdOfProductToDelete] = useState<number | null>(null);

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

  /**
   * Función para eliminar una sección
   * @param section Sección a eliminar
   * @param categoryId ID de la categoría a la que pertenece
   */
  const handleDeleteSection = (section: Section, categoryId: number) => {
    // Guardar la sección que se va a eliminar
    setSectionToDelete(section);
    
    // Abrir el modal de confirmación
    setIsDeleteSectionModalOpen(true);
  };
  
  const handleConfirmDeleteSection = async () => {
    if (!sectionToDelete) return;
    
    try {
      // Mostrar indicador de carga
      toast.loading("Eliminando sección...", { id: "delete-section" });
      
      const response = await fetch(`/api/sections/${sectionToDelete.section_id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la sección');
      }
      
      // Actualizar el estado local
      setSections(prev => {
        const updated = { ...prev };
        // Si existe la categoría en el estado, filtrar la sección eliminada
        if (sectionToDelete && sectionToDelete.category_id && updated[sectionToDelete.category_id]) {
          updated[sectionToDelete.category_id] = updated[sectionToDelete.category_id].filter(
            s => s.section_id !== sectionToDelete.section_id
          );
        }
        return updated;
      });
      
      // Actualizar también el estado local expandedCategorySections si existe
      setExpandedCategorySections(prev => {
        const updated = { ...prev };
        // Si existe la categoría en el estado, filtrar la sección eliminada
        if (sectionToDelete && sectionToDelete.category_id && updated[sectionToDelete.category_id]) {
          updated[sectionToDelete.category_id] = updated[sectionToDelete.category_id].filter(
            s => s.section_id !== sectionToDelete.section_id
          );
        }
        return updated;
      });
      
      // Cerrar el modal
      setIsDeleteSectionModalOpen(false);
      setSectionToDelete(null);
      
      // Mostrar mensaje de éxito
      toast.success("Sección eliminada correctamente", { id: "delete-section" });
    } catch (error) {
      console.error('Error al eliminar sección:', error);
      toast.error("Error al eliminar la sección", { id: "delete-section" });
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
    try {
      // Buscar el producto en las secciones para obtener su nombre
      let productName = '';
      let sectionId = null;
      
      // Buscar en todas las secciones el producto con el ID proporcionado
      for (const [sectionIdStr, sectionProducts] of Object.entries(products)) {
        const product = sectionProducts.find((p: Product) => p.product_id === productId);
        if (product) {
          productName = product.name || '';
          sectionId = parseInt(sectionIdStr, 10);
          break;
        }
      }
      
      // Guardar la información del producto para el modal
      setProductToDelete(productId);
      setProductNameToDelete(productName);
      setSectionIdOfProductToDelete(sectionId);
      
      // Abrir el modal de confirmación
      setIsDeleteProductModalOpen(true);
      
      // Este método ahora solo prepara el modal, no realiza la eliminación
        return true;
    } catch (error) {
      console.error('Error al preparar la eliminación del producto:', error);
      toast.error('Error al intentar eliminar el producto');
      return false;
    }
  };
  
  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // Mostrar indicador de carga
      toast.loading("Eliminando producto...", { id: "delete-product" });
      
      const response = await fetch(`/api/products/${productToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }
      
      // Actualizar el estado local de productos
      if (sectionIdOfProductToDelete) {
        setProducts(prev => {
          const updated = { ...prev };
          const sectionIdStr = sectionIdOfProductToDelete.toString();
          // @ts-ignore - Sabemos que la estructura de datos es correcta aquí
          if (updated[sectionIdStr]) {
            // @ts-ignore - Sabemos que la estructura de datos es correcta aquí
            updated[sectionIdStr] = updated[sectionIdStr].filter(
              // @ts-ignore - Filtramos por product_id que sabemos existe
              p => p.product_id !== productToDelete
            );
          }
          return updated;
        });
      }
      
      // Cerrar el modal
      setIsDeleteProductModalOpen(false);
      setProductToDelete(null);
      setProductNameToDelete('');
      setSectionIdOfProductToDelete(null);
      
      // Mostrar mensaje de éxito
      toast.success("Producto eliminado correctamente", { id: "delete-product" });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error("Error al eliminar el producto", { id: "delete-product" });
    } finally {
      setIsDeleting(false);
    }
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
    console.log("Delete category:", categoryId);
    setCategoryToDelete(categoryId);
    setIsDeleteCategoryModalOpen(true);
  };

  // Añadir función para confirmar la eliminación
  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteCategory(categoryToDelete);
      if (success) {
        // Si está expandida, quitarla del estado de expandidas
        if (expandedCategories[categoryToDelete]) {
          setExpandedCategories(prev => {
            const updated = { ...prev };
            delete updated[categoryToDelete];
            return updated;
          });
        }
        
        // Filtrar la categoría del estado local
        setCategories(prev => prev.filter(cat => cat.category_id !== categoryToDelete));
        
        // Cerrar el modal
        setIsDeleteCategoryModalOpen(false);
        setCategoryToDelete(null);
      }
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Maneja la creación de una nueva categoría
   */
  const handleCreateCategory = async (values: { name: string; image: File | null; status: number; display_order: number | null; }) => {
    setIsSubmitting(true);
    setShowNewCategoryModal(false); // Cerrar el modal inmediatamente para mejor UX
    
    // Primero mostrar un toast indicando que se está creando
    toast.loading("Creando categoría...", { id: "create-category" });
    
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      if (values.image) {
        formData.append('image', values.image);
      }
      formData.append('status', values.status.toString());
      if (values.display_order !== null) {
        formData.append('display_order', values.display_order.toString());
      }
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Actualizar el estado de categorías con la nueva
      setCategories(prev => [...prev, {
        ...data,
        category_id: data.category_id,
        name: data.name,
        status: typeof data.status === 'boolean' ? (data.status ? 1 : 0) : data.status,
        display_order: data.display_order || prev.length + 1,
        sections_count: 0,
        visible_sections_count: 0
      }]);
      
      // Mostrar mensaje de éxito visible
      toast.success(`Categoría "${values.name}" creada correctamente`, { id: "create-category", duration: 3000 });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      toast.error("Error al crear la categoría", { id: "create-category" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Maneja la edición de una sección
   */
  const handleUpdateSection = async (values: { 
    section_id: number; 
    name: string; 
    image: File | null; 
    status: number; 
    display_order: number | null;
    category_id: number;
    existingImage?: string;
  }) => {
    setIsSubmitting(true);
    setShowEditSectionModal(false); // Cerrar modal inmediatamente
    
    // Mostrar toast de carga
    toast.loading("Actualizando sección...", { id: "update-section" });
    
    try {
      const formData = new FormData();
      formData.append('section_id', values.section_id.toString());
      formData.append('name', values.name);
      if (values.image) {
        formData.append('image', values.image);
      } else if (values.existingImage) {
        formData.append('existingImage', values.existingImage);
      }
      formData.append('status', values.status.toString());
      if (values.display_order !== null) {
        formData.append('display_order', values.display_order.toString());
      }
      formData.append('category_id', values.category_id.toString());
      
      const response = await fetch('/api/sections', {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const updatedSection = await response.json();
      
      // Actualizar AMBOS estados (global y local) para evitar refresco completo
      // 1. Actualizar el estado global de sections
      setSections(prev => {
        const updated = { ...prev };
        if (updated[values.category_id]) {
          updated[values.category_id] = updated[values.category_id].map(section => 
            section.section_id === values.section_id ? {
              ...section,
              name: updatedSection.name,
              image: updatedSection.image,
              status: typeof updatedSection.status === 'boolean' ? 
                (updatedSection.status ? 1 : 0) : updatedSection.status,
              display_order: updatedSection.display_order || section.display_order
            } : section
          );
        }
        return updated;
      });
      
      // 2. Actualizar también el estado local expandedCategorySections si existe
      if (expandedCategorySections[values.category_id]) {
        setExpandedCategorySections(prev => {
          const updated = { ...prev };
          if (updated[values.category_id]) {
            updated[values.category_id] = updated[values.category_id].map(section => 
              section.section_id === values.section_id ? {
                ...section,
                name: updatedSection.name,
                image: updatedSection.image,
                status: typeof updatedSection.status === 'boolean' ? 
                  (updatedSection.status ? 1 : 0) : updatedSection.status,
                display_order: updatedSection.display_order || section.display_order
              } : section
            );
          }
          return updated;
        });
      }
      
      // Actualizar la sección seleccionada si es la misma que estamos editando
      if (selectedSection && selectedSection.section_id === values.section_id) {
        setSelectedSection({
          ...selectedSection,
          name: updatedSection.name,
          image: updatedSection.image,
          status: typeof updatedSection.status === 'boolean' ? 
            (updatedSection.status ? 1 : 0) : updatedSection.status,
          display_order: updatedSection.display_order || selectedSection.display_order
        });
      }
      
      // Mostrar mensaje de éxito visible - Eliminar este toast puede evitar la duplicación
      // de mensajes ya que la API probablemente ya está mostrando uno
      toast.dismiss("update-section");
    } catch (error) {
      console.error('Error al actualizar sección:', error);
      toast.error("Error al actualizar la sección", { id: "update-section" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar el modal de edición de sección
  const renderEditSectionModal = () => {
    if (!showEditSectionModal || !sectionToEdit) return null;

  return (
      <EditSectionModal 
        isOpen={true}
        onClose={() => {
          setShowEditSectionModal(false);
          setSectionToEdit(null);
        }}
        section={sectionToEdit}
      />
    );
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
      
      {renderEditSectionModal()}
      
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
      
      {/* Modal de confirmación para eliminar categoría */}
      <Transition.Root show={isDeleteCategoryModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => setIsDeleteCategoryModalOpen(false)}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Eliminar categoría
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {(() => {
                          const categoryToDeleteData = categories.find(cat => cat.category_id === categoryToDelete);
                          return `¿Estás seguro de que deseas eliminar la categoría "${categoryToDeleteData?.name}"? Esta acción no se puede deshacer. Se eliminarán todas las secciones y productos asociados a esta categoría.`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleConfirmDeleteCategory}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Eliminando...
                      </span>
                    ) : (
                      'Eliminar'
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsDeleteCategoryModalOpen(false)}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      
      {/* Modal de confirmación para eliminar sección */}
      <Transition.Root show={isDeleteSectionModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => setIsDeleteSectionModalOpen(false)}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Eliminar sección
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar la sección "{sectionToDelete?.name}"? Todos los productos asociados también serán eliminados.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleConfirmDeleteSection}
                  >
                    Eliminar
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setIsDeleteSectionModalOpen(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      
      {/* Modal de confirmación para eliminar producto */}
      <Transition.Root show={isDeleteProductModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => setIsDeleteProductModalOpen(false)}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Eliminar producto
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar el producto "{productNameToDelete}"? Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleConfirmDeleteProduct}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setIsDeleteProductModalOpen(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
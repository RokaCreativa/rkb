"use client";

import { useState, useEffect, Fragment, useRef, useCallback } from 'react';
import { EyeIcon, PlusIcon, ChevronDownIcon, PencilIcon, XMarkIcon, TrashIcon, ArrowUpTrayIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { PhonePreview } from '@/components/PhonePreview';
import FloatingPhonePreview from '@/components/FloatingPhonePreview';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Dialog, Transition, Disclosure } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { getImagePath, handleImageError } from '@/lib/imageUtils';
import MenuSectionProducts from '@/components/MenuSectionProducts';
import ContentPanel from '@/components/ContentPanel';
import CollapsiblePreview from '@/components/CollapsiblePreview';
import CategoryTable from '@/components/CategoryTable';
import SectionTable from '@/components/SectionTable';
import ProductTable from '@/components/ProductTable';
import Breadcrumbs from '@/components/Breadcrumbs';
import TopNavbar from '@/components/layout/TopNavbar';
import useSections from '@/app/hooks/useSections';
import useProducts from '@/app/hooks/useProducts';
// Importar los componentes de modal que hemos creado
import DeleteSectionModal from './components/DeleteSectionModal';
import DeleteProductModal from './components/DeleteProductModal';
// Importar los tipos desde el archivo centralizado
import { Category, Section, Product, Client } from '@/app/types/menu';
import EditProductModal from './components/EditProductModal';
import NewCategoryModal from './components/NewCategoryModal';
import EditSectionModal from './components/EditSectionModal';
import NewSectionModal from './components/NewSectionModal';
import NewProductModal from './components/NewProductModal';
import { PrismaClient } from '@prisma/client';
import EditCategoryModal from './components/EditCategoryModal';
// Importar los nuevos componentes de confirmación
import { DeleteCategoryConfirmation, DeleteSectionConfirmation, DeleteProductConfirmation } from './components/modals';
// Importar los nuevos componentes de acción
import { CategoryActions, SectionActions, ProductActions, BackButton } from './components/actions';
import Pagination from '@/components/ui/Pagination';

// Importar los controladores de eventos extraídos
import { 
  handleReorderCategory, 
  toggleCategoryVisibility, 
  deleteCategory as deleteCategoryExtracted 
} from '@/lib/handlers/categoryEventHandlers';
import { 
  handleReorderSection, 
  toggleSectionVisibility as toggleSectionVisibilityExtracted, 
  deleteSection as deleteSectionExtracted 
} from '@/lib/handlers/sectionEventHandlers';
import { 
  handleReorderProduct, 
  toggleProductVisibility as toggleProductVisibilityExtracted, 
  deleteProduct as deleteProductExtracted 
} from '@/lib/handlers/productEventHandlers';

// Interfaces para FloatingPhonePreview
interface FloatingPhoneCategory {
  id: number;
  category_id?: number;
  name: string;
  image?: string;
  sections?: FloatingPhoneSection[];
}

interface FloatingPhoneSection {
  id: number;
  name: string;
  image?: string;
  products?: FloatingPhoneProduct[];
}

interface FloatingPhoneProduct {
  id: number;
  name: string;
  price: string | number;
  description?: string;
  image?: string;
}

// Extender la interfaz Client para incluir la propiedad id
interface DashboardClient extends Client {
  id: number;
  logo?: string | null;
  name: string;
  main_logo: string | null;
}

/**
 * Función auxiliar que enriquece las categorías con información sobre sus secciones
 * Calcula el número total de secciones y cuántas están visibles para cada categoría
 * 
 * @param categories - Lista de categorías a procesar
 * @param sections - Mapa de secciones por ID de categoría
 * @returns Lista de categorías con datos adicionales sobre sus secciones
 */
function getCategoryTableData(categories: Category[], sections: Record<string | number, Section[]>) {
  return categories.map(category => {
    // Obtener las secciones para esta categoría (o un array vacío si no hay ninguna)
    const categorySections = sections[category.category_id] || [];
    
    // Contar cuántas secciones están visibles (status = 1)
    const visibleSections = categorySections.filter(section => section.status === 1);
    
    // Devolver la categoría con información adicional
    return {
      ...category,
      sections_count: categorySections.length,
      visible_sections_count: visibleSections.length
    };
  });
}

/**
 * Función auxiliar para obtener las categorías paginadas
 * Filtra las categorías según la configuración de paginación actual
 * 
 * @param allCategories - Lista completa de categorías
 * @param pagination - Configuración de paginación (habilitada, página, límite)
 * @returns Lista filtrada de categorías según la paginación
 */
function getPaginatedCategories(allCategories: Category[], pagination: { enabled: boolean, page: number, limit: number }) {
  // Si la paginación está deshabilitada, mostrar todas las categorías
  if (!pagination.enabled) {
    return allCategories;
  }
  
  // Calcular índices para el slice
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  
  // Devolver solo las categorías de la página actual
  return allCategories.slice(startIndex, endIndex);
}

// ----- FUNCIONES DE API -----

/**
 * Obtiene datos del cliente autenticado
 * 
 * @returns Promise con los datos del cliente
 * Actualizado: 23-03-2025 (UTC+0 - Londres)
 */
async function fetchClientData() {
  try {
    const response = await fetch('/api/client');
    
    if (!response.ok) {
      throw new Error(`Error al cargar datos del cliente: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en fetchClientData:', error);
    throw error; // Re-lanzar para manejar en el componente
  }
}

/**
 * Obtiene las categorías del cliente autenticado
 * 
 * @param options - Opciones de paginación (page y limit)
 * @returns Promise con las categorías o un objeto con datos paginados y metadatos
 * @example
 * // Sin paginación - obtiene todas las categorías
 * const allCategories = await fetchCategories();
 * // Con paginación - obtiene página específica
 * const pagedCategories = await fetchCategories({ page: 2, limit: 10 });
 */
async function fetchCategories(options?: { page?: number; limit?: number }) {
  let url = '/api/categories';
  
  // Añadir parámetros de paginación si se proporcionan
  if (options?.page || options?.limit) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    url = `${url}?${params.toString()}`;
  }
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error al cargar las categorías: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en fetchCategories:', error);
    throw error; // Re-lanzar para manejar en el componente
  }
}

/**
 * Obtiene las secciones para una categoría específica
 * 
 * @param categoryId - ID de la categoría
 * @returns Promise con las secciones
 * Actualizado: 23-03-2025 (UTC+0 - Londres)
 */
async function fetchSections(categoryId: number) {
  const response = await fetch(`/api/sections?category_id=${categoryId}`);
  if (!response.ok) throw new Error('Error al cargar secciones');
  return await response.json();
}

/**
 * Obtiene los productos para una sección específica
 * 
 * @param sectionId - ID de la sección
 * @returns Promise con los productos
 * Actualizado: 23-03-2025 (UTC+0 - Londres)
 */
async function fetchProducts(sectionId: number) {
  const response = await fetch(`/api/products?section_id=${sectionId}`);
  if (!response.ok) throw new Error('Error al cargar productos');
  return await response.json();
}

// ----- FUNCIONES DE API PARA CATEGORÍAS -----

/**
 * Actualiza el orden de una categoría
 * 
 * @param categoryId - ID de la categoría
 * @param newDisplayOrder - Nuevo orden de visualización
 * @returns Promise con la categoría actualizada
 * Actualizado: 23-03-2025 (UTC+0 - Londres)
 */
async function updateCategoryOrder(categoryId: number, newDisplayOrder: number) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ display_order: newDisplayOrder }),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el orden');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar el orden de la categoría:', error);
    throw error;
  }
}

/**
 * Actualiza la visibilidad de una categoría
 * 
 * @param categoryId - ID de la categoría
 * @param newStatus - Nuevo estado de visibilidad (0 o 1)
 * @returns Promise con la categoría actualizada
 * Actualizado: 23-03-2025 (UTC+0 - Londres)
 */
async function updateCategoryVisibility(categoryId: number, newStatus: number) {
  try {
    console.log(`DEBUG: Actualizando visibilidad de categoría ${categoryId} a ${newStatus}`);
    
    // Cambiar para usar el endpoint principal con método PUT en lugar de la URL con ID
    const response = await fetch('/api/categories', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category_id: categoryId,
        status: newStatus
      }),
    });
    
    console.log('DEBUG: Respuesta recibida, status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DEBUG: Error en respuesta:', errorData);
      throw new Error('Error al actualizar la visibilidad');
    }
    
    const data = await response.json();
    console.log('DEBUG: Datos recibidos:', data);
    return data;
  } catch (error) {
    console.error('Error al actualizar la visibilidad de la categoría:', error);
    throw error;
  }
}

/**
 * Elimina una categoría
 * 
 * @param categoryId - ID de la categoría a eliminar
 * @returns Promise con la respuesta de la API
 * Actualizado: 23-03-2025 (UTC+0 - Londres)
 */
async function deleteCategory(categoryId: number) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar la categoría');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
    throw error;
  }
}

// ----- OTRAS FUNCIONES DE API -----

/**
 * Crea un nuevo cliente
 * 
 * @param clientData - Datos del cliente en formato FormData
 * @returns Promise con el cliente creado
 * Actualizado: 23-03-2025 (UTC+0 - Londres)
 */
async function createClient(clientData: FormData) {
  const response = await fetch('/api/client', {
    method: 'POST',
    body: clientData
  });
  if (!response.ok) throw new Error('Error al crear cliente');
  return await response.json();
}

// ----- FUNCIONES DE API PARA SECCIONES -----

/**
 * Actualiza la visibilidad de una sección
 * 
 * @param sectionId - ID de la sección
 * @param newStatus - Nuevo estado de visibilidad (0 o 1)
 * @returns Promise con la sección actualizada
 * Actualizado: 23-03-2025 (UTC+0 - Londres)
 */
async function updateSectionVisibility(sectionId: number, newStatus: number) {
  try {
    console.log(`DEBUG: Actualizando visibilidad de sección ${sectionId} a ${newStatus}`);
    
    const response = await fetch('/api/sections', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        section_id: sectionId,
        status: newStatus
      }),
    });
    
    console.log('DEBUG: Respuesta recibida, status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DEBUG: Error en respuesta:', errorData);
      throw new Error('Error al actualizar la visibilidad');
    }
    
    const data = await response.json();
    console.log('DEBUG: Datos recibidos:', data);
    return data;
  } catch (error) {
    console.error('Error al actualizar la visibilidad de la sección:', error);
    throw error;
  }
}

// ----- FUNCIONES DE API PARA PRODUCTOS -----

/**
 * Actualiza la visibilidad de un producto
 * 
 * @param productId - ID del producto
 * @param newStatus - Nuevo estado de visibilidad (0 o 1)
 * @returns Promise con el producto actualizado
 * Actualizado: 23-03-2025 (UTC+0 - Londres)
 */
async function updateProductVisibility(productId: number, newStatus: number) {
  try {
    console.log(`DEBUG: Actualizando visibilidad de producto ${productId} a ${newStatus}`);
    
    const response = await fetch('/api/products', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        status: newStatus
      }),
    });
    
    console.log('DEBUG: Respuesta recibida, status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DEBUG: Error en respuesta:', errorData);
      throw new Error('Error al actualizar la visibilidad');
    }
    
    const data = await response.json();
    console.log('DEBUG: Datos recibidos:', data);
    return data;
  } catch (error) {
    console.error('Error al actualizar la visibilidad del producto:', error);
    throw error;
  }
}

// ... [resto de funciones API existentes]

// ----- COMPONENTE PRINCIPAL -----

/**
 * Página principal del dashboard
 * Gestiona la visualización y edición de categorías, secciones y productos
 * 
 * Actualizado: 23-03-2025 (UTC+0 - Londres)
 */
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<DashboardClient | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [loadingSections, setLoadingSections] = useState<Record<number, boolean>>({});
  const [loadingProducts, setLoadingProducts] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ id: number, name: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'categories' | 'sections' | 'products'>('categories');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
  const [isDeletingSection, setIsDeletingSection] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  
  // Estados para edición de sección
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<{ id: number; name: string } | null>(null);
  
  // Estados para edición de producto
  const [editingProduct, setEditingProduct] = useState<{ id: number; name: string } | null>(null);

  // Referencias para el scroll automático
  const sectionListRef = useRef<HTMLDivElement>(null);
  const productListRef = useRef<HTMLDivElement>(null);

  // Obtener las funciones de useSections y useProducts a nivel del componente
  const { 
    sections: hookSections, 
    fetchSections: fetchSectionsHook, 
    deleteSection: deleteSectionHook,
    updateSection
  } = useSections(client?.id || null);

  const { 
    products: productsFromHook, 
    fetchProducts: fetchProductsHook, 
    deleteProduct, 
    updateProduct,
    toggleProductVisibility 
  } = useProducts({
    onSuccess: () => {
      // Refrescar datos si es necesario
      if (selectedSection) {
        fetchProductsHook(selectedSection.section_id);
      }
    }
  });

  // Estados para paginación de categorías
  const [categoryPagination, setCategoryPagination] = useState({
    page: 1,
    limit: 10,
    enabled: false // Por defecto, cargar todas las categorías sin paginación
  });
  
  // Estado para metadatos de paginación
  const [categoryPaginationMeta, setCategoryPaginationMeta] = useState<{
    total: number;
    totalPages: number;
  } | null>(null);

  // ----- MANEJADORES DE EVENTOS -----

  // Función para reordenar las categorías
  const handleCategoryReorder = useCallback(async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    
    await handleReorderCategory(
      categories,
      sourceIndex,
      destinationIndex,
      (updatedCategories) => setCategories(updatedCategories),
      (isLoading) => setIsLoading(isLoading)
    );
  }, [categories]);
  
  // Función para reordenar secciones (drag and drop)
  const handleReorderSectionAdapter = async (sourceIndex: number, destinationIndex: number) => {
    if (!selectedCategory) return;
    
    await handleReorderSection(
      sections[selectedCategory.category_id] || [],
      sourceIndex,
      destinationIndex,
      setSections,
      selectedCategory.category_id,
      setIsLoading
    );
  };

  // Función para reordenar productos (drag and drop)
  const handleReorderProductAdapter = async (sourceIndex: number, destinationIndex: number) => {
    if (!selectedSection) return;
    
    await handleReorderProduct(
      products[selectedSection.section_id] || [],
      (updatedProducts) => {
        // Usar una conversión explícita para resolver el problema de tipos entre lib y app
        setProducts(prev => ({
          ...prev,
          [selectedSection.section_id]: updatedProducts as any
        }));
      },
      setIsLoading,
      async (sectionId: number) => {
        try {
          const productsData = await fetchProducts(sectionId);
          setProducts(prev => ({
            ...prev,
            [sectionId]: productsData
          }));
        } catch (err) {
          console.error('Error al recargar productos:', err);
        }
      },
      sourceIndex,
      destinationIndex
    );
  };

  // ----- EFECTOS -----
  
  // Efecto para precargar datos cuando se cargan las categorías
  useEffect(() => {
    if (categories.length > 0 && !isLoading) {
      console.log("Optimizando la carga de datos para el dashboard...");
      
      // Seleccionar la primera categoría automáticamente si no hay ninguna seleccionada
      if (!selectedCategory && categories.length > 0) {
        setSelectedCategory(categories[0]);
      }
      
      // En lugar de precargar todo, cargamos solo lo necesario
      // Las secciones y productos se cargarán a demanda al hacer clic
      console.log("Configurado para carga bajo demanda de secciones y productos.");
    }
  }, [categories, isLoading, selectedCategory]);

  // Efecto para cargar datos iniciales al autenticarse
  /**
   * Flujo de datos para paginación:
   * 1. El estado categoryPagination controla cómo se cargan los datos
   * 2. Cuando categoryPagination.enabled = true:
   *   - Se envían parámetros page y limit a la API 
   *   - API devuelve sólo los datos de la página actual y metadata
   *   - Se actualizan los estados: categories y categoryPaginationMeta
   * 3. Cuando categoryPagination.enabled = false:
   *   - Se cargan todos los datos sin paginación
   *   - Se almacenan en categories sin metadata de paginación
   * 4. Los cambios en categoryPagination (por UI) desencadenan 
   *    este efecto para recargar datos con la nueva configuración
   */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Cargar datos del cliente primero
        let clientData;
        try {
          clientData = await fetchClientData();
          console.log("Datos del cliente cargados correctamente:", clientData);
          setClient(clientData);
        } catch (clientError) {
          console.error("Error específico al cargar cliente:", clientError);
          toast.error("No se pudieron cargar los datos del cliente");
          // Continuar con otras operaciones
        }
        
        // Cargar categorías, con paginación si está habilitada
        try {
          const options = categoryPagination.enabled 
            ? { page: categoryPagination.page, limit: categoryPagination.limit } 
            : undefined;
          
          const result = await fetchCategories(options);
          console.log("Categorías cargadas:", result);
          
          // Manejar la respuesta según su formato
          if (categoryPagination.enabled && result && typeof result === 'object' && 'data' in result && 'meta' in result) {
            // Respuesta paginada
            setCategories(result.data);
            setCategoryPaginationMeta({
              total: result.meta.total,
              totalPages: result.meta.lastPage
            });
            
            // Seleccionar la primera categoría si hay alguna
            if (result.data && result.data.length > 0) {
              setSelectedCategory(result.data[0]);
            }
          } else {
            // Respuesta normal (array)
            setCategories(result);
            setCategoryPaginationMeta(null);
            
            // Seleccionar la primera categoría si hay alguna
            if (result && result.length > 0) {
              setSelectedCategory(result[0]);
            }
          }
        } catch (categoriesError) {
          console.error("Error específico al cargar categorías:", categoriesError);
          toast.error("No se pudieron cargar las categorías");
          // Continuar con otras operaciones
        }
        
        if (clientData && clientData.main_logo) {
          console.log("Logo principal:", clientData.main_logo);
          console.log("Logo URL completa:", `/images/main_logo/${clientData.main_logo}`);
        }
        
      } catch (err: any) {
        // Error general en caso de fallos no capturados en los bloques anteriores
        setError(err.message || 'Error desconocido al cargar datos');
        console.error('Error general al cargar datos:', err);
        toast.error('No se pudieron cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Mantener la condición de autenticación
    if (status === 'authenticated') loadData();
  }, [status, categoryPagination]);

  /**
   * Maneja el clic en una categoría
   * Carga las secciones para esa categoría si no están ya cargadas 
   * y alterna el estado de expansión
   * 
   * @param categoryId - ID de la categoría seleccionada
   */
  const handleCategoryClick = async (categoryId: number) => {
    console.log("Clic en categoría:", categoryId);
    
    // Verificar el estado actual de expansión
    const isExpanded = expandedCategories[categoryId];
    console.log(`Categoría ${categoryId} está ${isExpanded ? 'expandida' : 'colapsada'}`);
    
    // 1. Primero, actualizar el estado para reflejar inmediatamente en la UI
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !isExpanded
    }));
    
    // 2. Si estamos expandiendo y no tenemos secciones, cargarlas
    if (!isExpanded) {
      console.log(`Expandiendo categoría ${categoryId}`);
      
      // Si no tenemos secciones cargadas para esta categoría, cargarlas
      if (!sections[categoryId] || sections[categoryId].length === 0) {
        console.log(`Cargando secciones para categoría ${categoryId}...`);
        
        // Indicar que estamos cargando secciones para esta categoría
        setLoadingSections(prev => ({
          ...prev,
          [categoryId]: true
        }));
        
        try {
          // Cargar secciones desde la API
          const sectionsData = await fetchSections(categoryId);
          console.log(`Secciones cargadas para categoría ${categoryId}:`, sectionsData);
          
          // Actualizar el estado con las secciones cargadas
          setSections(prev => ({
            ...prev,
            [categoryId]: sectionsData
          }));
          
          // Opcionalmente, también seleccionar esta categoría para la navegación
          const category = categories.find(c => c.category_id === categoryId);
          if (category) {
            setSelectedCategory(category);
          }
        } catch (error) {
          console.error(`Error al cargar secciones para categoría ${categoryId}:`, error);
          toast.error('Error al cargar las secciones');
        } finally {
          // Finalizar el estado de carga
          setLoadingSections(prev => ({
            ...prev,
            [categoryId]: false
          }));
        }
      } else {
        console.log(`Ya tenemos secciones cargadas para categoría ${categoryId}:`, sections[categoryId]);
      }
    } else {
      console.log(`Colapsando categoría ${categoryId}`);
    }
  };
  
  /**
   * Maneja el clic en una sección
   * Carga los productos para esa sección si no están ya cargados
   * y alterna el estado de expansión
   * 
   * @param sectionId - ID de la sección seleccionada
   */
  const handleSectionClick = async (sectionId: number) => {
    console.log("Clic en sección:", sectionId);
    
    // Verificar el estado actual de expansión
    const isExpanded = expandedSections[sectionId];
    console.log(`Sección ${sectionId} está ${isExpanded ? 'expandida' : 'colapsada'}`);
    
    // 1. Actualizar el estado para reflejar inmediatamente en la UI
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !isExpanded
    }));

    // 2. Si estamos expandiendo y no tenemos productos, cargarlos
    if (!isExpanded) {
      console.log(`Expandiendo sección ${sectionId}`);
      
      // Buscar a qué categoría pertenece esta sección
      let foundCategoryId: number | null = null;
      let foundSection: Section | null = null;
      
      // Recorrer todas las categorías para encontrar la que contiene esta sección
      Object.entries(sections).forEach(([categoryId, categorySections]) => {
        const section = categorySections.find(s => s.section_id === sectionId);
        if (section) {
          foundCategoryId = parseInt(categoryId);
          foundSection = section;
        }
      });
      
      // Si encontramos la sección y su categoría
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
          
          // Indicar que estamos cargando
          setLoadingProducts(prev => ({
            ...prev,
            [sectionId]: true
          }));
          
          try {
            // Cargar productos desde la API o hook
            await fetchProductsHook(sectionId);
            console.log(`Productos cargados para sección ${sectionId}`);
          } catch (error) {
            console.error(`Error al cargar productos para sección ${sectionId}:`, error);
            toast.error('Error al cargar los productos');
          } finally {
            // Finalizar el estado de carga
            setLoadingProducts(prev => ({
              ...prev,
              [sectionId]: false
            }));
          }
        } else {
          console.log(`Ya tenemos productos cargados para sección ${sectionId}:`, products[sectionId]);
        }
      } else {
        console.error(`No se pudo encontrar a qué categoría pertenece la sección ${sectionId}`);
      }
    } else {
      console.log(`Colapsando sección ${sectionId}`);
    }
  };

  // Funciones para la navegación entre vistas
  const navigateToCategory = (categoryId: number) => {
    const category = categories.find(c => c.category_id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setCurrentView('sections');
      
      // Cargar secciones si no están cargadas
      if (!sections[categoryId]) {
        handleCategoryClick(categoryId);
      }
    }
  };
  
  const navigateToSection = (sectionId: number) => {
    if (!selectedCategory) return;
    
    const section = sections[selectedCategory.category_id]?.find(s => s.section_id === sectionId);
    if (section) {
      setSelectedSection(section);
      setCurrentView('products');
      
      // Cargar productos si no están cargados
      if (!products[sectionId]) {
        handleSectionClick(sectionId);
      }
    }
  };
  
  const navigateBack = () => {
    if (currentView === 'products') {
      setCurrentView('sections');
      setSelectedProduct(null);
    } else if (currentView === 'sections') {
      setCurrentView('categories');
      setSelectedSection(null);
    }
  };

  // Función para actualizar la visibilidad de una categoría
  const handleToggleCategoryVisibility = useCallback(async (categoryId: number, currentStatus: number) => {
    await toggleCategoryVisibility(
      categoryId,
      currentStatus,
      setIsUpdatingVisibility,
      setCategories
    );
  }, []);

  // Función para actualizar la visibilidad de una sección
  const toggleSectionVisibility = useCallback(async (sectionId: number, currentStatus: number) => {
    if (!selectedCategory) return;
    
    await toggleSectionVisibilityExtracted(
      sectionId,
      currentStatus,
      (id) => setIsUpdatingVisibility(id),
      setSections,
      selectedCategory.category_id
    );
  }, [selectedCategory]);

  // Función para actualizar la visibilidad de un producto
  const handleToggleProductVisibility = useCallback(async (productId: number, currentStatus: number) => {
    if (!selectedSection) return;
    
    const currentProducts = products[selectedSection.section_id] || [];
    
    await toggleProductVisibilityExtracted(
      currentProducts,
      (updater) => {
        setProducts(prev => ({
          ...prev,
          [selectedSection.section_id]: updater(currentProducts)
        }));
      },
      (isUpdating) => {
        setIsUpdatingVisibility(isUpdating ? productId : null);
      },
      productId
    );
  }, [selectedSection, products, setIsUpdatingVisibility, setProducts]);

  // ----- RENDERIZADO -----
  
  // Mostrar indicador de carga mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    )
  }

  // Mostrar mensaje de error si hay alguno
  if (error) {
  return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  // Función para editar una categoría
  const handleEditCategory = (category: Category) => {
    setEditingCategory({
      id: category.category_id,
      name: category.name
    });
    setEditCategoryName(category.name);
    setEditImagePreview(category.image ? getImagePath(category.image, 'categories') : null);
    setIsEditModalOpen(true);
  };

  // Función para eliminar una categoría
  const handleDeleteCategory = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };
  
  // Generar items para el componente de breadcrumbs
  const getBreadcrumbItems = () => {
    const items = [
      { 
        id: 'categories', 
        name: 'Categorías', 
        onClick: () => setCurrentView('categories'), 
        current: currentView === 'categories' 
      }
    ];
    
    if (currentView === 'sections' && selectedCategory) {
      items.push({ 
        id: `category-${selectedCategory.category_id}`, 
        name: selectedCategory.name, 
        onClick: () => {}, 
        current: true 
      });
    }
    
    if (currentView === 'products' && selectedCategory && selectedSection) {
      items.push({ 
        id: `category-${selectedCategory.category_id}`, 
        name: selectedCategory.name, 
        onClick: () => navigateBack(), 
        current: false 
      });
      
      items.push({ 
        id: `section-${selectedSection.section_id}`, 
        name: selectedSection.name, 
        onClick: () => {}, 
        current: true 
      });
    }
    
    return items;
  };

  // Función para alternar el modo de reordenamiento
  const toggleReorderMode = () => {
    setIsReorderModeActive(prev => !prev);
  };

  // Función para crear una nueva sección
  const handleCreateSection = async (newSection: any) => {
      // Actualizar el estado local para incluir la nueva sección
      setSections(prev => ({
        ...prev,
      [selectedCategory!.category_id]: [
        ...(prev[selectedCategory!.category_id] || []),
          newSection
        ]
      }));
      
      // Si es la primera sección, establecerla como seleccionada
    if ((sections[selectedCategory!.category_id] || []).length === 0) {
        setSelectedSection(newSection);
        await fetchProductsHook(newSection.section_id);
      }
      
      // Mostrar mensaje de éxito
      toast.success('Sección creada con éxito');
  };
  
  // Función para crear un nuevo producto
  const handleCreateProduct = async (newProduct: any) => {
      // Actualizar el estado local para incluir el nuevo producto
      setProducts(prev => ({
        ...prev,
      [selectedSection!.section_id]: [
        ...(prev[selectedSection!.section_id] || []),
          newProduct
        ]
      }));
      
      // Mostrar mensaje de éxito
      toast.success('Producto creado con éxito');
  };

  // Función para editar una sección
  const handleEditSection = (section: Section) => {
    setEditingSection({
      id: section.section_id,
      name: section.name
    });
            setIsEditSectionModalOpen(true);
  };

  // Función para eliminar una sección
  const handleDeleteSection = (sectionId: number) => {
    setSectionToDelete(sectionId);
    setIsDeleteSectionModalOpen(true);
  };
  
  // Función para editar un producto
  const handleEditProduct = (product: Product) => {
    setEditingProduct({
      id: product.product_id,
      name: product.name
    });
    setIsEditProductModalOpen(true);
  };

  // Función para eliminar un producto (abre el modal de confirmación)
  const handleDeleteProduct = (productId: number) => {
    // Buscar el nombre del producto para mostrarlo en la ventana de confirmación
    let productName = '';
    if (selectedSection) {
      const product = products[selectedSection.section_id.toString()]?.find(p => p.product_id === productId);
      productName = product?.name || '';
    }
    
    // Guardar el ID del producto a eliminar y abrir el modal
    setProductToDelete(productId);
    setIsDeleteProductModalOpen(true);
  };

  // Crear un adaptador para la función deleteProduct que coincida con la interfaz esperada
  const deleteProductAdapter = async (productId: number): Promise<boolean> => {
    if (!selectedSection) return false;
    
    const currentProducts = products[selectedSection.section_id] || [];
    
    return await deleteProductExtracted(
      productId,
      currentProducts,
      (updatedProducts) => {
        setProducts(prev => ({
          ...prev,
          [selectedSection.section_id]: updatedProducts
        }));
      },
      (isDeleting) => {
        setIsDeletingProduct(isDeleting);
      },
      async (sectionId) => {
        try {
          const productsData = await fetchProducts(sectionId);
          setProducts(prev => ({
            ...prev,
            [sectionId]: productsData
          }));
        } catch (err) {
          console.error('Error al recargar productos:', err);
        }
      }
    );
  };

  // Implementación local de deleteSection
  const deleteSection = async (sectionId: number): Promise<boolean> => {
    if (!selectedCategory) return false;
    
    await deleteSectionExtracted(
      sectionId,
      setSections,
      selectedCategory.category_id
    );
    
    return true;
  };

  /**
   * Maneja el cambio de página en la lista de categorías
   * Actualiza el estado de paginación y desencadena una nueva carga de datos
   * 
   * @param page - Número de página a la que navegar (comienza en 1)
   */
  const handleCategoryPageChange = (page: number) => {
    setCategoryPagination(prev => ({
      ...prev,
      page
    }));
  };
  
  /**
   * Maneja el cambio de tamaño de página en categorías
   * Actualiza el límite de elementos por página y reinicia a la primera página
   * 
   * @param limit - Nuevo número de elementos por página
   */
  const handleCategoryPageSizeChange = (limit: number) => {
    setCategoryPagination(prev => ({
      ...prev,
      limit,
      page: 1 // Resetear a primera página
    }));
  };
  
  /**
   * Activa o desactiva la paginación de categorías
   * Cuando se activa, se cargan los datos con paginación desde la API
   * Cuando se desactiva, se cargan todos los datos sin paginación
   */
  const toggleCategoryPagination = () => {
    setCategoryPagination(prev => ({
      ...prev,
      enabled: !prev.enabled,
      page: 1 // Resetear a primera página
    }));
  };
  
  /**
   * Obtiene las categorías de la página actual
   * Con la implementación actual, simplemente devuelve todas las categorías
   * ya que el filtrado se hace en la API cuando la paginación está habilitada
   * 
   * @returns Array de categorías para mostrar en la UI
   */
  const getCurrentPageCategories = () => {
    // Ya sea con paginación habilitada (datos ya filtrados por API) o no (todos los datos),
    // simplemente devolvemos el array de categorías actual
    return categories;
  };

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
            <Breadcrumbs items={getBreadcrumbItems()} />
          </div>
              
          {/* Botón de acción según la vista */}
          <div>
            {currentView === 'categories' && (
            <div className="flex items-center">
              <button
                onClick={() => {
                  // Activar la vista previa (esta función activa el FloatingPhonePreview)
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
              <CategoryActions onNewCategory={() => setIsNewCategoryModalOpen(true)} />
              <CategoryTable 
                categories={getCategoryTableData(
                  getPaginatedCategories(categories, categoryPagination),
                  sections
                )}
                expandedCategories={expandedCategories}
                onCategoryClick={handleCategoryClick}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                onToggleVisibility={handleToggleCategoryVisibility}
                isUpdatingVisibility={isUpdatingVisibility}
                onReorderCategory={handleCategoryReorder}
                paginationEnabled={categoryPagination.enabled}
                currentPage={categoryPagination.page}
                itemsPerPage={categoryPagination.limit}
                totalCategories={categoryPaginationMeta?.total || categories.length}
                onPageChange={page => setCategoryPagination(prev => ({...prev, page}))}
                onPageSizeChange={pageSize => setCategoryPagination(prev => ({...prev, limit: pageSize}))}
              />

              {/* Secciones expandidas para categorías (cuando está en vista de categorías) */}
              {currentView === 'categories' && categories.map(category => {
                if (!expandedCategories[category.category_id]) return null;
                
                return (
                  <div 
                    key={`expanded-category-${category.category_id}`}
                    id={`category-${category.category_id}`}
                    className="mt-4 w-full pl-4 border-l-2 border-indigo-100"
                  >
                    <SectionTable 
                      sections={sections[category.category_id]?.map(s => ({
                        ...s,
                        image: s.image || null,
                        display_order: s.display_order || 0
                      })) || []}
                      expandedSections={expandedSections}
                      onSectionClick={handleSectionClick}
                      categoryName={category.name}
                      onToggleVisibility={toggleSectionVisibility}
                      isUpdatingVisibility={isUpdatingVisibility}
                      onEditSection={(section) => handleEditSection(section as unknown as Section)}
                      onDeleteSection={handleDeleteSection}
                      onReorderSection={handleReorderSectionAdapter}
                    />
                    
                    {/* Productos expandidos para secciones */}
                    {sections[category.category_id]?.map(section => {
                      if (!expandedSections[section.section_id]) return null;
                      
                      return (
                        <div 
                          key={`expanded-section-${section.section_id}`}
                          id={`section-${section.section_id}`}
                          className="mt-4 pl-4 border-l-2 border-teal-100"
                        >
                          <ProductTable 
                            products={productsFromHook[section.section_id] || []}
                            sectionName={section.name}
                            onToggleVisibility={handleToggleProductVisibility}
                            isUpdatingVisibility={isUpdatingVisibility}
                            onEditProduct={(productToEdit) => {
                              handleEditProduct(productToEdit as unknown as Product);
                            }}
                            onDeleteProduct={deleteProductAdapter}
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
              <SectionActions 
                categoryName={selectedCategory.name}
                onNewSection={() => setIsNewSectionModalOpen(true)} 
              />
              {sections[selectedCategory.category_id] ? (
                <SectionTable 
                  sections={sections[selectedCategory.category_id]?.map(s => ({
                    ...s,
                    image: s.image || null,
                    display_order: s.display_order || 0
                  })) || []}
                  expandedSections={expandedSections}
                  onSectionClick={handleSectionClick}
                  categoryName={selectedCategory.name}
                  onToggleVisibility={toggleSectionVisibility}
                  isUpdatingVisibility={isUpdatingVisibility}
                  onEditSection={(section) => handleEditSection(section as unknown as Section)}
                  onDeleteSection={handleDeleteSection}
                  onReorderSection={handleReorderSectionAdapter}
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
              <ProductActions 
                sectionName={selectedSection.name}
                onNewProduct={() => setIsNewProductModalOpen(true)}
              />
              {productsFromHook[selectedSection.section_id] ? (
                <ProductTable 
                  products={productsFromHook[selectedSection.section_id]}
                  onBackClick={navigateBack}
                  sectionName={selectedSection.name}
                  onEditProduct={(productToEdit) => {
                    handleEditProduct(productToEdit as unknown as Product);
                  }}
                  onDeleteProduct={deleteProductAdapter}
                  onToggleVisibility={handleToggleProductVisibility}
                  isUpdatingVisibility={isUpdatingVisibility}
                  onReorderProduct={(sourceIndex, destinationIndex) => {
                    // Implementar reordenamiento de productos
                    console.log('Reordenar productos', sourceIndex, destinationIndex);
                  }}
                />
              ) : (
                <div className="flex justify-center items-center h-40 bg-white rounded-lg border border-gray-200">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
          )}
      </div>
      
        {/* Modal para crear categoría */}
      <NewCategoryModal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        client={client as any}
        setCategories={setCategories}
      />
      
      <DeleteCategoryConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        categoryId={categoryToDelete || 0}
        categoryName={categories.find(c => c.category_id === categoryToDelete)?.name || ''}
        onDeleted={(categoryId) => {
          // Actualizar el estado local para eliminar la categoría
          setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
        }}
      />
      
      <EditCategoryModal
          isOpen={isEditModalOpen}
        onClose={() => {
            setIsEditModalOpen(false);
            setEditingCategory(null);
        }}
          categoryToEdit={editingCategory ? categories.find(c => c.category_id === editingCategory.id) || null : null}
        client={client as any}
        setCategories={setCategories}
        onSuccess={() => {
            // Recargar las categorías después de editar
            console.log("Recargando categorías después de editar...");
            fetch('/api/categories')
              .then(response => {
                if (!response.ok) throw new Error('Error al cargar categorías');
                return response.json();
              })
              .then(data => {
                console.log("Datos de categorías actualizados:", data);
                setCategories(data);
              })
              .catch(err => {
                console.error("Error al recargar categorías:", err);
              });
          }}
        />

        {/* Modal para eliminar sección */}
      <DeleteSectionConfirmation
        isOpen={isDeleteSectionModalOpen}
        onClose={() => {
          setIsDeleteSectionModalOpen(false);
          setSectionToDelete(null);
        }}
        sectionId={sectionToDelete || 0}
        sectionName={sectionToDelete && selectedCategory ? 
          (sections[selectedCategory.category_id.toString()]?.find(s => s.section_id === sectionToDelete)?.name || '') : 
          ''}
        onDeleted={async (sectionId: number) => {
          if (selectedCategory) {
            await deleteSectionExtracted(
              sectionId,
              setSections,
              selectedCategory.category_id
            );
          }
        }}
      />
      
        {/* Modal para editar producto */}
      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => {
          setIsEditProductModalOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct as any}
        client={client as any}
        selectedSection={selectedSection}
        setProducts={setProducts}
        onSuccess={() => {
          // Recargar los productos después de editar
          if (selectedSection) {
            console.log("Recargando productos después de editar producto...");
            fetch(`/api/products?section_id=${selectedSection.section_id}`)
              .then(response => {
                if (!response.ok) throw new Error('Error al cargar productos');
                return response.json();
              })
              .then(productData => {
                console.log("Datos de productos actualizados:", productData);
                setProducts(prev => ({
                  ...prev,
                  [selectedSection.section_id]: productData
                }));
              })
              .catch(err => {
                console.error("Error al recargar productos:", err);
              });
          }
        }}
      />
      
        {/* Modal para editar sección */}
        {isEditSectionModalOpen && (
      <EditSectionModal
        isOpen={isEditSectionModalOpen}
            onClose={() => setIsEditSectionModalOpen(false)}
            sectionToEdit={editingSection ? sections[selectedCategory?.category_id || 0]?.find(s => s.section_id === editingSection.id) || null : null}
        clientId={client?.id || null}
        selectedCategory={selectedCategory}
        onSuccess={() => {
              // Recargar las secciones de la categoría actual utilizando fetch directamente en lugar
              // de la función fetchSections para garantizar datos frescos
          if (selectedCategory) {
                console.log("Recargando secciones después de editar...");
                // Usar fetch directamente para obtener los datos más recientes
                fetch(`/api/sections?category_id=${selectedCategory.category_id}`)
                  .then(response => {
                    if (!response.ok) throw new Error('Error al cargar secciones');
                    return response.json();
                  })
              .then(data => {
                    console.log("Datos de secciones actualizados:", data);
                    // Actualizar el estado con los datos frescos
                setSections(prev => ({
                  ...prev,
                      [selectedCategory.category_id]: data
                    }));
                    
                    // Si también hay una sección seleccionada, recargar sus productos
                    if (selectedSection) {
                      console.log("Recargando productos después de editar...");
                      fetch(`/api/products?section_id=${selectedSection.section_id}`)
                        .then(response => {
                          if (!response.ok) throw new Error('Error al cargar productos');
                          return response.json();
                        })
                        .then(productData => {
                          console.log("Datos de productos actualizados:", productData);
                setProducts(prev => ({
                  ...prev,
                            [selectedSection.section_id]: productData
                }));
              })
                        .catch(err => {
                          console.error("Error al recargar productos:", err);
                        });
                    }
                  })
                  .catch(err => {
                    console.error("Error al recargar secciones:", err);
                  });
          }
        }}
      />
        )}

        {/* Modal de nueva sección */}
        <NewSectionModal
          isOpen={isNewSectionModalOpen}
          onClose={() => setIsNewSectionModalOpen(false)}
          client={client as any}
        selectedCategory={selectedCategory}
        setSections={setSections}
      />
      
        {/* Modal de nuevo producto */}
      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        client={client as any}
        selectedSection={selectedSection}
        setProducts={setProducts}
      />
      </div>
      
      {/* Componente de vista previa móvil flotante */}
      <FloatingPhonePreview 
        clientName={client?.name} 
        clientLogo={client?.logo ? `/images/clients/${client.logo}` : undefined}
        clientMainLogo={client?.main_logo ? `/images/main_logo/${client.main_logo}` : undefined}
        categories={categories
          .filter(cat => cat.status === 1) // Solo categorías activas
          .map(cat => ({
            id: cat.category_id,
            category_id: cat.category_id,
            name: cat.name,
            image: cat.image ? getImagePath(cat.image, 'categories') : undefined,
            sections: sections[cat.category_id]?.filter(sec => sec.status === 1).map(sec => ({
              id: sec.section_id,
              name: sec.name,
              image: sec.image || undefined
            })) || []
          })) as FloatingPhoneCategory[]}
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
      
      {/* Modal para confirmar eliminación de producto */}
      <DeleteProductConfirmation
        isOpen={isDeleteProductModalOpen}
        onClose={() => {
          setIsDeleteProductModalOpen(false);
          setProductToDelete(null);
        }}
        productId={productToDelete || 0}
        productName={productToDelete && selectedSection ? 
          (products[selectedSection.section_id.toString()]?.find(p => p.product_id === productToDelete)?.name || '') : 
          ''}
        deleteProduct={deleteProductAdapter}
        onDeleted={(productId: number) => {
          // Actualizar el estado local para eliminar el producto
          if (selectedSection) {
            const sectionId = selectedSection.section_id.toString();
                setProducts(prev => ({
                  ...prev,
              [sectionId]: prev[sectionId].filter(product => product.product_id !== productId)
                }));
          }
        }}
      />
    </>
  );
}

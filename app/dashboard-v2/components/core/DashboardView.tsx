"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TopNavbar } from "./TopNavbar";
import { Loader } from "../ui/Loader";
import { Category, Section, Product } from "@/app/types/menu";
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
  convertCategoriesToDashboard, convertSectionsToDashboard, convertProductsToDashboard,
  fromMenuClient
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
import DeleteModal from "../modals/DeleteModal";

// Importar tipos
import { ViewType } from "../../types/dashboard";

// Importar el nuevo hook useDragAndDrop
import useDragAndDrop from "../../hooks/ui/useDragAndDrop";

// Tipos
import {
  adaptDomainCategoriesToMenu,
  adaptDomainSectionsToMenu,
  adaptDomainProductsToMenu
} from '@/app/dashboard-v2/types/type-adapters';

// Importar los tipos unificados
import {
  UnifiedCategory,
  UnifiedSection,
  UnifiedProduct,
  asMenuCategory,
  asMenuSection,
  asMenuProduct,
  asMenuSections,
  asMenuProducts,
  asDomainCategory,
  asDomainSection,
  asDomainProduct
} from '@/app/dashboard-v2/types/common';

// Importar el componente DragIndicator
import DragIndicator from '../ui/DragIndicator';

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
  const [currentView, setCurrentView] = useState<ViewType>("CATEGORIES");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado local para modo sin conexión
  const [offlineMode, setOfflineMode] = useState(false);

  // useRef para controlar si ya hemos cargado datos iniciales
  const initialDataLoadedRef = useRef(false);

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
      try {
        // Usamos adaptDomainCategoriesToMenu para asegurar compatibilidad de tipos
        const menuCategories = adaptDomainCategoriesToMenu(categories);
        setLocalCategories(menuCategories as any as DashboardCategory[]);
      } catch (error) {
        console.error("Error al adaptar categorías:", error);
      }
    }
  }, [categories]);

  useEffect(() => {
    if (sections) {
      try {
        // Usamos adaptDomainSectionsToMenu para asegurar compatibilidad de tipos
        const menuSections = adaptDomainSectionsToMenu(sections);
        setLocalSections(menuSections as any as Record<string, DashboardSection[]>);

        // DEBUG: Log para verificar la adaptación de secciones
        console.log(`🔍 DEBUG - Estado 'sections' actualizado:`,
          Object.keys(sections).length, "categorías con secciones",
          "Total secciones:", Object.values(sections).flat().length);
        console.log(`🔍 DEBUG - Estado 'localSections' después de adaptación:`,
          Object.keys(menuSections).length, "categorías con secciones",
          "¿Son diferentes los objetos?", menuSections !== sections);
      } catch (error) {
        console.error("Error al adaptar secciones:", error);
      }
    }
  }, [sections]);

  useEffect(() => {
    if (products) {
      try {
        // Usamos adaptDomainProductsToMenu para asegurar compatibilidad de tipos
        const menuProducts = adaptDomainProductsToMenu(products as any);
        setLocalProducts(menuProducts as any as Record<string, DashboardProduct[]>);
      } catch (error) {
        console.error("Error al adaptar productos:", error);
      }
    }
  }, [products]);

  // Añadir useEffect para sincronizar las secciones cuando se cargan
  useEffect(() => {
    if (sections && Object.keys(sections).length > 0) {
      console.log("🔄 Sincronizando secciones desde useDashboardState con localSections", sections);

      // Convertir las secciones a formato compatible con el estado local
      const adaptedSections: Record<string, DashboardSection[]> = {};

      Object.entries(sections).forEach(([categoryId, categorySections]) => {
        if (Array.isArray(categorySections) && categorySections.length > 0) {
          // Tiparlo explícitamente para evitar errores de TypeScript
          const typedSections = categorySections as Section[];
          adaptedSections[categoryId] = typedSections.map((section: Section) => fromMenuSection(section));
        }
      });

      // Actualizar el estado local si hay secciones adaptadas
      if (Object.keys(adaptedSections).length > 0) {
        setLocalSections(prev => ({
          ...prev,
          ...adaptedSections
        }));
        console.log("✅ Estado local de secciones actualizado:", adaptedSections);
      }
    }
  }, [sections]); // Esta dependencia asegura que se ejecute cuando sections cambie

  // Estados para control de modales
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEntityType, setDeleteEntityType] = useState<'category' | 'section' | 'product'>('category');
  const [itemToDelete, setItemToDelete] = useState<DashboardCategory | DashboardSection | DashboardProduct | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (typeof window === 'undefined') return; // No ejecutar en SSR

    // Forzar la carga de datos nuevos en cada inicio
    sessionStorage.removeItem('dashboard_initial_load_complete');
    sessionStorage.removeItem('dashboard_client_data');
    sessionStorage.removeItem('dashboard_categories_data');
    sessionStorage.removeItem('client_data_cache');
    sessionStorage.removeItem('categories_data_cache');

    console.log('🔄 Iniciando carga inicial de datos...');

    // Función para cargar datos con reintentos limitados
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Paso 1: Cargar datos del cliente
        const clientData = await fetchClientData();
        if (!clientData) {
          throw new Error('No se pudo cargar la información del cliente');
        }

        // Paso 2: Cargar categorías
        const categoriesData = await fetchCategories();
        if (!categoriesData || categoriesData.length === 0) {
          console.warn('⚠️ No se encontraron categorías o hubo un error al cargarlas');
        } else {
          console.log(`✅ Cargadas ${categoriesData.length} categorías`);
        }

        // Marcar como cargado para no repetir
        sessionStorage.setItem('dashboard_initial_load_complete', 'true');
        console.log('✅ Carga inicial completada y registrada en sessionStorage');

        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error en carga inicial:', error);
        setIsLoading(false);
        setError('Error al cargar datos iniciales');

        // Intentar mostrar un toast de error para mejor feedback
        toast.error('Error al cargar los datos. Por favor, recarga la página.');
      }
    };

    // Ejecutar la carga después de un pequeño delay para evitar race conditions
    const timer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(timer);

    // Dependencias vacías para que solo se ejecute al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // Guardar la categoría seleccionada
    setSelectedCategory(fromMenuCategory(category));
    console.log(`🎯 Seleccionada categoría: ${category.name} (ID: ${category.category_id})`);

    // Alternar expansión de la categoría
    setExpandedCategories(prev => ({
      ...prev,
      [category.category_id]: !prev[category.category_id]
    }));

    // DEBUG: Log para verificar el estado actual de expansión
    console.log(`🔍 DEBUG - Estado expandedCategories para categoría ${category.category_id}:`,
      expandedCategories[category.category_id] ? "Expandida" : "Colapsada",
      "-> Cambiará a:",
      !expandedCategories[category.category_id] ? "Expandida" : "Colapsada");

    // Si la categoría se está expandiendo (no estaba expandida antes), 
    // cargar sus secciones si aún no están cargadas
    if (!expandedCategories[category.category_id]) {
      console.log(`📂 Expandiendo categoría ${category.name}, verificando secciones...`);

      // Verificar si ya hay secciones cargadas para esta categoría
      const hasSections = sections[category.category_id] && sections[category.category_id].length > 0;

      // DEBUG: Log para verificar las secciones actuales
      console.log(`🔍 DEBUG - Secciones actuales para categoría ${category.category_id}:`,
        hasSections ? `${sections[category.category_id].length} secciones cargadas` : "No hay secciones cargadas",
        sections[category.category_id] || []);

      if (!hasSections) {
        console.log(`🔄 No hay secciones cargadas para categoría ${category.category_id}, cargando...`);
        toast.loading(`Cargando secciones...`, { id: `loading-cat-${category.category_id}` });

        fetchSectionsByCategory(category.category_id)
          .then(loadedSections => {
            console.log(`✅ Cargadas ${loadedSections.length} secciones para categoría ${category.name}`);
            toast.dismiss(`loading-cat-${category.category_id}`);

            if (loadedSections && loadedSections.length > 0) {
              toast.success(`${loadedSections.length} secciones cargadas`);

              // Actualizar el estado local inmediatamente después de cargar
              const sectionsCopy = [...loadedSections]; // Crear una copia para evitar mutaciones
              const adaptedSections = {
                [category.category_id]: sectionsCopy.map((section: any) => fromMenuSection(section))
              };

              // Actualizar localSections con las secciones recién cargadas
              setLocalSections(prev => ({
                ...prev,
                ...adaptedSections
              }));

              // DEBUG: Log para verificar las secciones después de cargarlas
              console.log(`🔍 DEBUG - Secciones después de cargar para categoría ${category.category_id}:`,
                loadedSections,
                "Estado actual del objeto sections:", sections);
            }
          })
          .catch(error => {
            console.error(`❌ Error cargando secciones:`, error);
            toast.dismiss(`loading-cat-${category.category_id}`);
            toast.error(`Error al cargar secciones`);
          });
      } else {
        console.log(`✅ Ya hay ${sections[category.category_id].length} secciones cargadas para categoría ${category.name}`);

        // DEBUG: Inspeccionar el contenido de las secciones cargadas
        console.log(`🔍 DEBUG - Contenido detallado de las secciones para categoría ${category.category_id}:`,
          JSON.stringify(sections[category.category_id].slice(0, 3)), // Mostrar las 3 primeras secciones para no saturar el log
          "Tipos de datos:",
          sections[category.category_id].map((s: Section) => typeof s));
      }
    }

    // Limpiar la selección de sección
    setSelectedSection(null);

    // Mantener la vista actual en categorías
    setCurrentView('CATEGORIES');
  }, [expandedCategories, fetchSectionsByCategory, sections, setLocalSections]);

  const goToSection = useCallback(async (sectionIdOrSection: number | MenuSection) => {
    // Extraer el ID de sección según el tipo de argumento
    const sectionId = typeof sectionIdOrSection === 'number'
      ? sectionIdOrSection
      : sectionIdOrSection.section_id;

    console.log(`🎯 goToSection llamado con sección ID: ${sectionId}`);

    // Verificar primero el ID de sección con logging detallado
    if (!sectionId) {
      console.error('❌ ID de sección inválido:', sectionIdOrSection);
      return;
    }

    // Expandir la búsqueda para encontrar la sección en todas las fuentes posibles
    // 1. Buscar en el estado global sections
    const allSections = Object.values(sections).flat();
    console.log(`🔍 Buscando sección ${sectionId} entre ${allSections.length} secciones globales`);

    // 2. Buscar también en el estado local localSections para mayor seguridad
    const allLocalSections = Object.values(localSections).flat();
    console.log(`🔍 Buscando sección ${sectionId} entre ${allLocalSections.length} secciones locales`);

    // Intentar encontrar la sección en cualquiera de las dos fuentes
    let sectionToSelect = allSections.find(s => s.section_id === sectionId);

    if (!sectionToSelect) {
      // Si no se encuentra en el estado global, intentar en el estado local
      sectionToSelect = allLocalSections.find(s => s.section_id === sectionId);
      console.log(`🔍 Buscando en secciones locales: ${sectionToSelect ? 'Encontrada' : 'No encontrada'}`);
    }

    // Si aún no encontramos la sección, intentar cargarla explícitamente
    if (!sectionToSelect) {
      console.warn(`⚠️ No se encontró la sección con ID ${sectionId} en memoria, intentando cargar por API...`);
      toast.loading(`Cargando información de sección...`, { id: `loading-section-${sectionId}` });

      try {
        // Hacer una petición específica para obtener los datos de esta sección
        const response = await fetch(`/api/sections/${sectionId}`);

        if (response.ok) {
          const sectionData = await response.json();

          if (sectionData && sectionData.section_id) {
            sectionToSelect = sectionData;
            console.log(`✅ Sección ${sectionId} cargada exitosamente desde API:`, sectionData);
            toast.dismiss(`loading-section-${sectionId}`);
            toast.success(`Sección cargada correctamente`);

            // Si tenemos la categoría, cargar todas las secciones de esa categoría
            if (sectionData.category_id) {
              fetchSectionsByCategory(sectionData.category_id);
            }
          }
        } else {
          throw new Error(`Error al cargar la sección: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Error cargando sección ${sectionId}:`, error);
        toast.dismiss(`loading-section-${sectionId}`);
        toast.error(`Error al cargar la sección`);
        return;
      }
    }

    // Si aún no tenemos la sección después de todos los intentos, mostrar error y salir
    if (!sectionToSelect) {
      console.error(`❌ No se encontró la sección con ID ${sectionId} después de todos los intentos`);
      toast.error(`No se pudo encontrar la sección`);
      return;
    }

    // A partir de aquí tenemos la sección confirmada
    console.log(`✅ Sección encontrada: ${sectionToSelect.name}`);

    // Actualizar estado de la sección seleccionada
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
      } else {
        console.warn(`⚠️ No se encontró la categoría ${categoryId} para esta sección`);
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

        console.log(`✅ Productos cargados para sección ${sectionId}:`, loadedProducts?.length || 0);

        // Actualizar el estado local con los productos cargados
        if (loadedProducts && loadedProducts.length > 0) {
          setLocalProducts(prev => ({
            ...prev,
            [sectionIdStr]: loadedProducts.map((p: any) => fromMenuProduct(p))
          }));

          console.log(`✅ Estado local de productos actualizado para sección ${sectionId}`);
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
    } else {
      console.log(`ℹ️ Ya hay ${products[sectionIdStr].length} productos cargados para esta sección`);
    }
  }, [fetchProductsBySection, sections, localSections, setCurrentView, setSelectedSection, setExpandedSections, setSelectedCategory, categories, products, setLocalProducts, fetchSectionsByCategory]);

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
    setDeleteEntityType('category');
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!itemToDelete || !('category_id' in itemToDelete)) return;

    try {
      await deleteCategory(itemToDelete.category_id);
      toast.success('Categoría eliminada correctamente');
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar la categoría');
    }
  };

  // Handlers para manejo de secciones
  const handleAddSection = (categoryId: number) => {
    setShowNewSectionModal(true);
  };

  const handleEditSection = (section: DashboardSection) => {
    setSelectedSection(section);
    setShowEditSectionModal(true);
  };

  const handleDeleteSection = (section: DashboardSection) => {
    setItemToDelete(section);
    setDeleteEntityType('section');
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteSection = async () => {
    if (!itemToDelete || !('section_id' in itemToDelete)) return;

    const categoryId = 'category_id' in itemToDelete ? itemToDelete.category_id : 0;

    try {
      await deleteSection(itemToDelete.section_id, categoryId);
      toast.success('Sección eliminada correctamente');
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar la sección');
    }
  };

  // Handlers para manejo de productos
  const handleAddProduct = (sectionId: number) => {
    // Buscar la sección en todas las categorías
    for (const catSections of Object.values(sections)) {
      const section = catSections.find((s: Section) => s.section_id === sectionId);
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
    setDeleteEntityType('product');
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!itemToDelete || !('product_id' in itemToDelete) || !selectedSection) return;

    try {
      await deleteProduct(itemToDelete.product_id);
      toast.success('Producto eliminado correctamente');
      setShowDeleteModal(false);
      setItemToDelete(null);

      // Actualizar la lista de productos
      if (selectedSection && selectedSection.section_id) {
        fetchProductsBySection(selectedSection.section_id);
      }
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  // Obtener funciones de arrastrar y soltar
  const {
    isReorderModeActive,
    isDragging,
    handleDragEnd,
    handleDragStart,
    handleDragUpdate,
    handleReorderCategories,
    handleReorderSections,
    handleReorderProducts,
    toggleReorderMode,
    registerDragHandle
  } = useDragAndDrop(
    localCategories as any,  // Usamos 'as any' para resolver problema de compatibilidad temporal
    localSections as any,    // Usamos 'as any' para resolver problema de compatibilidad temporal
    localProducts as any,    // Usamos 'as any' para resolver problema de compatibilidad temporal
    setLocalCategories as any, // Usamos 'as any' para resolver problema de compatibilidad temporal
    setLocalSections as any,   // Usamos 'as any' para resolver problema de compatibilidad temporal
    setLocalProducts as any    // Usamos 'as any' para resolver problema de compatibilidad temporal
  );

  // Diagnóstico extensivo para verificar la inicialización del hook
  useEffect(() => {
    console.log('🔍 [DRAG DEBUG] Inicialización de useDragAndDrop:', {
      handleGlobalDragEndExists: typeof handleReorderCategories === 'function',
      handleReorderCategoriesExists: typeof handleReorderCategories === 'function',
      handleReorderSectionsExists: typeof handleReorderSections === 'function',
      handleReorderProductsExists: typeof handleReorderProducts === 'function',
      isReorderModeActive,
      isDragging,
      categoriesCount: localCategories?.length || 0
    });
  }, [
    handleReorderCategories,
    handleReorderSections,
    handleReorderProducts,
    isReorderModeActive,
    isDragging,
    localCategories
  ]);

  // Activar el modo de reordenamiento por defecto
  useEffect(() => {
    console.log("🔄 Estado inicial de isReorderModeActive:", isReorderModeActive);
    if (!isReorderModeActive) {
      console.log("🔄 Activando modo de reordenamiento automáticamente");
      // Activar inmediatamente para evitar problemas de sincronización
      toggleReorderMode();
      console.log("✅ Modo de reordenamiento activado");
    }
  }, []);  // Solo ejecutar una vez al montar el componente

  // HANDLERS PARA VISIBILIDAD CON RECARGA DE DATOS
  // Estos handlers envuelven las funciones de los hooks para asegurar que
  // los datos se recarguen después de una actualización, manteniendo los contadores
  // y estados visuales sincronizados.

  const handleToggleCategoryVisibility = async (categoryId: number, currentStatus: number) => {
    await toggleCategoryVisibility(categoryId, currentStatus);
    fetchCategories(); // Recargar todas las categorías para actualizar contadores.
  };

  const handleToggleSectionVisibility = async (sectionId: number, categoryId: number, currentStatus: number) => {
    await toggleSectionVisibility(sectionId, categoryId, currentStatus);
    fetchCategories(); // Recargar categorías para actualizar 'visible_sections_count'.
  };

  const handleToggleProductVisibility = async (productId: number, currentStatus: number) => {
    if (selectedSection) {
      await toggleProductVisibility(productId, currentStatus);
      fetchSectionsByCategory(selectedSection.category_id); // Recargar secciones para actualizar 'visible_products_count'.
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopNavbar
        clientLogo={client?.main_logo || null}
        clientName={client?.name || 'Dashboard'}
        isReorderModeActive={isReorderModeActive}
        onToggleReorderMode={toggleReorderMode}
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
      <DragDropContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdate}
      >
        <div className="container mx-auto px-4 py-6 flex-1">
          {/* Breadcrumbs y navegación */}
          <Breadcrumbs
            currentView={currentView}
            selectedCategory={selectedCategory ? adaptCategory(selectedCategory) : null}
            selectedSection={selectedSection ? adaptSection(selectedSection) : null}
            onHomeClick={goToHome}
            onCategoryClick={(category) => goToCategory(fromMenuCategory(category))}
            onSectionClick={(section) => {
              if (section) {
                // Usar una conversión de tipo más específica y segura
                if (typeof section === 'object') {
                  // Extraer section_id con verificación de seguridad para evitar errores
                  const sectionId = 'section_id' in section ?
                    (section as { section_id: number }).section_id :
                    ('id' in section ? (section as { id: number }).id : undefined);

                  if (sectionId) {
                    goToSection(sectionId);
                  }
                } else if (typeof section === 'number') {
                  // Si section es directamente un número (ID), usar ese valor
                  goToSection(section);
                }
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
                    onToggleCategoryVisibility={handleToggleCategoryVisibility}
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
                        handleAddSection(section.category_id);
                      }
                    }}
                    onSectionClick={(section) => {
                      if (section) {
                        // Usar una conversión de tipo más específica y segura
                        if (typeof section === 'object') {
                          // Extraer section_id con verificación de seguridad para evitar errores
                          const sectionId = 'section_id' in section ?
                            (section as { section_id: number }).section_id :
                            ('id' in section ? (section as { id: number }).id : undefined);

                          if (sectionId) {
                            goToSection(sectionId);
                          }
                        } else if (typeof section === 'number') {
                          // Si section es directamente un número (ID), usar ese valor
                          goToSection(section);
                        }
                      }
                    }}
                    onCategoryClick={(category) => goToCategory(fromMenuCategory(category))}
                    products={adaptProducts(localProducts)}
                    onToggleProductVisibility={(productId: number, currentStatus: number) => {
                      void handleToggleProductVisibility(productId, currentStatus);
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
                    onSectionsReorder={(categoryId, sourceIndex, destinationIndex) => {
                      console.log('🔄 [CategoryView] Llamando a handleReorderCategories desde onSectionsReorder:', {
                        categoryId, sourceIndex, destinationIndex
                      });

                      // Caso especial: si todos los parámetros son -1, es una señal para alternar
                      // el modo de reordenamiento desde el botón en CategoryView
                      if (categoryId === -1 && sourceIndex === -1 && destinationIndex === -1) {
                        console.log('🔄 Alternando modo de reordenamiento desde CategoryView');
                        toggleReorderMode();
                        return;
                      }

                      // Para categorías, ignoramos el categoryId y usamos directamente los índices
                      handleReorderCategories(sourceIndex, destinationIndex);
                    }}
                    onProductReorder={(sectionId, sourceIndex, destinationIndex) =>
                      handleReorderProducts(sectionId, sourceIndex, destinationIndex)
                    }
                  />
                )}

                {/* 
                  Mantener SectionView y ProductView como vistas separadas para navegación directa, 
                  pero el flujo principal debe ser a través de expansión/colapso 
                */}
                {currentView === 'SECTIONS' && selectedCategory && (
                  <SectionView
                    selectedCategory={asMenuCategory(selectedCategory)}
                    sections={asMenuSections({ [selectedCategory.category_id]: sections[selectedCategory.category_id] || [] })[selectedCategory.category_id] || []}
                    onBackToCategories={goToHome}
                    onAddSection={(categoryId) => handleAddSection(categoryId || selectedCategory.category_id)}
                    onSectionClick={(section) => {
                      if (section) {
                        const sectionObj = section as unknown as Section;
                        if (sectionObj && sectionObj.section_id) {
                          goToSection(sectionObj.section_id);
                        }
                      }
                    }}
                    onToggleSectionVisibility={(sectionId, currentStatus) => {
                      try {
                        handleToggleSectionVisibility(sectionId, selectedCategory.category_id, currentStatus);
                        return;
                      } catch (error) {
                        console.error("Error al cambiar visibilidad de sección:", error);
                        return;
                      }
                    }}
                    onEditSection={(section) => handleEditSection(fromMenuSection(section as any) as DashboardSection)}
                    onDeleteSection={(sectionId) => handleDeleteSection({ section_id: sectionId } as any)}
                    isUpdatingVisibility={isUpdatingVisibility as number | null}
                    products={adaptProducts(localProducts)}
                    categoryName={selectedCategory.name}
                    categoryId={selectedCategory.category_id}
                    expandedSections={expandedSections}
                    isReorderModeActive={isReorderModeActive}
                    onAddProduct={(sectionId) => handleAddProduct(sectionId)}
                    onEditProduct={(product) => handleEditProduct(fromMenuProduct(product) as DashboardProduct)}
                    onDeleteProduct={(product) => handleDeleteProduct(fromMenuProduct(product) as DashboardProduct)}
                    onToggleProductVisibility={handleToggleProductVisibility}
                    isUpdatingProductVisibility={isUpdatingVisibility}
                    onSectionReorder={(categoryId, sourceIndex, destIndex) => handleReorderSections(categoryId, sourceIndex, destIndex)}
                    onProductReorder={(sectionId, sourceIndex, destIndex) => handleReorderProducts(sectionId, sourceIndex, destIndex)}
                    isLoading={isLoading || isDataLoading}
                  />
                )}

                {/* El ProductView solo se debe mostrar cuando hay una sección seleccionada y estamos en vista PRODUCTS */}
                {currentView === 'PRODUCTS' && selectedSection && selectedCategory && (() => {
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
                        onToggleProductVisibility={handleToggleProductVisibility}
                        isLoading={!sectionProducts || sectionProducts.length === 0}
                        onProductsReorder={isReorderModeActive ? handleReorderProducts : undefined}
                      />
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </DragDropContext> { /* Fin del DragDropContext global */}

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
          client={client ? fromMenuClient(client) : null}
          setCategories={((updatedCategories: any) => {
            if (Array.isArray(updatedCategories)) {
              const dashboardCategories = updatedCategories.map(
                category => fromMenuCategory(category)
              );
              setLocalCategories(dashboardCategories);
            }
          })}
        />
      )}

      {showEditCategoryModal && selectedCategory && (
        <EditCategoryModal
          isOpen={showEditCategoryModal}
          onClose={() => setShowEditCategoryModal(false)}
          categoryToEdit={adaptCategory(selectedCategory)}
          client={client ? fromMenuClient(client) : null}
          setCategories={(updatedCategories: any) => {
            if (Array.isArray(updatedCategories)) {
              const dashboardCategories = updatedCategories.map(
                category => fromMenuCategory(category)
              );
              setLocalCategories(dashboardCategories);
            }
          }}
        />
      )}

      {showDeleteModal && itemToDelete && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          entityType={deleteEntityType}
          entityId={
            deleteEntityType === 'category' && 'category_id' in itemToDelete
              ? itemToDelete.category_id
              : deleteEntityType === 'section' && 'section_id' in itemToDelete
                ? itemToDelete.section_id
                : deleteEntityType === 'product' && 'product_id' in itemToDelete
                  ? itemToDelete.product_id
                  : 0
          }
          entityName={itemToDelete.name || `este ${deleteEntityType === 'category' ? 'categoría' : deleteEntityType === 'section' ? 'sección' : 'producto'}`}
          deleteFunction={
            deleteEntityType === 'category'
              ? deleteCategory
              : deleteEntityType === 'section'
                ? deleteSection
                : deleteProduct
          }
          deleteArgs={
            deleteEntityType === 'section' && 'category_id' in itemToDelete
              ? [itemToDelete.category_id]
              : []
          }
          onDeleteSuccess={() => {
            // Actualizar la lista correspondiente después de eliminar
            if (deleteEntityType === 'category') {
              fetchCategories();
            } else if (deleteEntityType === 'section' && selectedCategory) {
              fetchSectionsByCategory(selectedCategory.category_id);
            } else if (deleteEntityType === 'product' && selectedSection) {
              fetchProductsBySection(selectedSection.section_id);
            }
          }}
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
          client={client ? fromMenuClient(client) : null}
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

      {/* Indicador de arrastre para mejorar experiencia móvil */}
      <DragIndicator
        entityName={
          currentView === "CATEGORIES"
            ? 'categoría'
            : currentView === "SECTIONS"
              ? 'sección'
              : 'producto'
        }
      />

    </div>
  );
} 

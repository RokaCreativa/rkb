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
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

// Importar nuevos componentes de vistas
import CategoryView from "./views/CategoryView";
import SectionView from "./views/SectionView";
import ProductView from "./views/ProductView";
import Breadcrumbs from "./views/Breadcrumbs";
import MobilePreview from "./views/MobilePreview";
import FloatingPhonePreview from "./views/FloatingPhonePreview";

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
  
  // NUEVO: Estado explícito para controlar el modo de reordenamiento global
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);
  
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

  const goToCategory = useCallback((category: Category) => {
    setSelectedCategory(category);
    
    setExpandedCategories(prev => ({
      ...prev,
      [category.category_id]: !prev[category.category_id]
    }));
    
    if (!expandedCategories[category.category_id]) {
      fetchSectionsByCategory(category.category_id);
    }
    
    setSelectedSection(null);
  }, [expandedCategories, fetchSectionsByCategory]);

  const goToSection = useCallback(async (sectionIdOrSection: number | Section) => {
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
    setSelectedSection(sectionToSelect);
    
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
        setSelectedCategory(categoryObj);
      }
    }
    
    // En el modo anterior cambiábamos a vista PRODUCTS, pero ahora queremos mantener la vista de categorías
    // setCurrentView('PRODUCTS');
    setCurrentView('CATEGORIES');
    console.log(`🔀 Vista mantenida en CATEGORIES, sección expandida: ${sectionToSelect.name}`);

    // Preparar local state
    const sectionIdStr = sectionId.toString();
    
    // Verificar si ya tenemos productos cargados
    if (!products[sectionIdStr] || products[sectionIdStr].length === 0) {
      // NUEVA IMPLEMENTACIÓN: Primero forzar un estado vacío para mostrar el loader
      setProducts(prevProducts => ({
        ...prevProducts,
        [sectionIdStr]: []
      }));

      // Mostrar notificación de carga
      toast.loading(`Cargando productos...`, { id: `loading-${sectionId}` });

      try {
        // Cargar productos forzando la recarga
        console.log(`⏳ [CRITICAL] Cargando productos para sección ${sectionId} (forzado)...`);
        
        // IMPORTANTE: Este método ahora devuelve una promesa que se resuelve con los productos cargados
        const loadedProducts = await fetchProductsBySection(
          sectionId, 
          true,  // Forzar recarga
          // Función para actualizar estado local inmediatamente
          (freshProducts) => {
            console.log(`✨ [CRITICAL] Callback recibió ${freshProducts.length} productos frescos`);
            
            // Forzar actualización del estado global
            setProducts(prev => ({
              ...prev,
              [sectionIdStr]: freshProducts // Asignar productos nuevos a la sección
            }));
          }
        );
        
        // Cerrar la notificación de carga
        toast.dismiss(`loading-${sectionId}`);
        
        if (loadedProducts && loadedProducts.length > 0) {
          toast.success(`${loadedProducts.length} productos cargados`);
          
          // Forzar otra actualización del estado para asegurar que la UI se refresca
          setProducts(currentProducts => {
            // Verificar si realmente necesitamos actualizar
            if (currentProducts[sectionIdStr]?.length !== loadedProducts.length) {
              console.log(`🔄 [CRITICAL] Forzando actualización final de UI con ${loadedProducts.length} productos`);
              return {
                ...currentProducts,
                [sectionIdStr]: loadedProducts
              };
            }
            return currentProducts;
          });
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
  }, [fetchProductsBySection, sections, setCurrentView, setProducts, setSelectedSection, setExpandedSections, setSelectedCategory, categories]);
  
  // Handlers para manejo de categorías
  const handleAddCategory = useCallback(() => {
    setShowNewCategoryModal(true);
  }, []);
  
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
  
  // Handlers para manejo de expansión
  const toggleCategoryExpansion = async (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
    
    if (!expandedCategories[categoryId] && (!sections[categoryId] || sections[categoryId].length === 0)) {
      await fetchSectionsByCategory(categoryId);
    }
  };
  
  const handleSectionClick = useCallback((sectionId: number) => {
    // Buscar la sección correspondiente
    const allSections = Object.values(sections).flat();
    const section = allSections.find(s => s.section_id === sectionId);
    
    if (section) {
      toggleSectionVisibility(sectionId, section.status);
    }
  }, [sections, toggleSectionVisibility]);
  
  // Manejador para reordenar productos dentro de una sección
  const handleReorderProducts = async (sectionId: number, sourceIndex: number, destinationIndex: number) => {
    console.log(`🔄 Reordenando producto en sección ${sectionId} de índice ${sourceIndex} a ${destinationIndex}`);
    
    try {
      // Obtener los productos de la sección específica del estado
      const sectionProducts = products[sectionId] || [];
      if (sectionProducts.length === 0) {
        console.error(`No hay productos en la sección ${sectionId} para reordenar`);
        return false;
      }
      
      // Obtener solo los productos visibles (status 1) de esa sección
      const visibleProducts = sectionProducts.filter(prod => prod.status === 1);
      if (visibleProducts.length === 0) {
        console.error(`No hay productos visibles en la sección ${sectionId} para reordenar`);
        return false;
      }
      
      // Crear una copia del array de visibles para manipular
      const updatedVisibleProducts = [...visibleProducts];
      
      // Mover el producto de la posición origen a la posición destino dentro de visibles
      const [movedProduct] = updatedVisibleProducts.splice(sourceIndex, 1);
      updatedVisibleProducts.splice(destinationIndex, 0, movedProduct);
      
      // Actualizar el display_order de todos los productos visibles
      const visibleWithOrder = updatedVisibleProducts.map((product, index) => ({
        ...product,
        display_order: index + 1
      }));
      
      console.log("Productos visibles reordenados:", visibleWithOrder.map(p => `${p.name} (${p.display_order})`));
      
      // Combinar con los no visibles para obtener el array final de la sección
      const nonVisibleProducts = sectionProducts.filter(prod => prod.status !== 1);
      const finalSectionProducts = [...visibleWithOrder, ...nonVisibleProducts];
      
      // Llamar a la API para guardar el nuevo orden de los visibles
      const response = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          products: visibleWithOrder.map(p => ({ 
            id: p.product_id, 
            order: p.display_order 
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al reordenar productos en la API');
      }
      
      // Actualizar el estado local con el array final de la sección
      setProducts(prev => ({
        ...prev,
        [sectionId]: finalSectionProducts
      }));
      
      toast.success('Productos reordenados correctamente');
      return true;
    } catch (error) {
      console.error(`Error al reordenar productos en sección ${sectionId}:`, error);
      toast.error('Error al reordenar productos');
      return false;
    }
  };
  
  // Manejador para reordenar categorías
  const handleReorderCategories = async (sourceIndex: number, destinationIndex: number) => {
    console.log(`🔄 Reordenando categoría de índice ${sourceIndex} a ${destinationIndex}`);
    
    try {
      // Obtener solo las categorías visibles (status 1)
      const visibleCategories = categories.filter(cat => cat.status === 1);
      
      if (visibleCategories.length === 0) {
        console.error("No hay categorías visibles para reordenar");
        return false;
      }
      
      // Crear una copia del array para manipular
      const updatedCategories = [...visibleCategories];
      
      // Mover la categoría de la posición origen a la posición destino
      const [movedCategory] = updatedCategories.splice(sourceIndex, 1);
      updatedCategories.splice(destinationIndex, 0, movedCategory);
      
      // Actualizar el display_order de todas las categorías
      const categoriesWithUpdatedOrder = updatedCategories.map((category, index) => ({
        ...category,
        display_order: index + 1
      }));
      
      console.log("Categorías reordenadas:", categoriesWithUpdatedOrder.map(c => `${c.name} (${c.display_order})`));
      
      // Llamar a la API para guardar el nuevo orden
      const response = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          categories: categoriesWithUpdatedOrder.map(c => ({ 
            id: c.category_id, 
            order: c.display_order 
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al reordenar categorías');
      }
      
      // Actualizar el estado local combinando categorías visibles actualizadas con no visibles sin cambios
      const nonVisibleCategories = categories.filter(cat => cat.status !== 1);
      const allUpdatedCategories = [...categoriesWithUpdatedOrder, ...nonVisibleCategories];
      
      setCategories(allUpdatedCategories);
      
      toast.success('Categorías reordenadas correctamente');
      return true;
    } catch (error) {
      console.error('Error al reordenar categorías:', error);
      toast.error('Error al reordenar categorías');
      return false;
    }
  };
  
  // Manejador para reordenar secciones dentro de una categoría
  const handleReorderSections = async (categoryId: number, sourceIndex: number, destinationIndex: number) => {
    console.log(`🔄 Reordenando sección de categoría ${categoryId} desde índice ${sourceIndex} a ${destinationIndex}`);
    
    try {
      // Obtener la categoría por ID en lugar de usar selectedCategory
      const targetCategory = categories.find(cat => cat.category_id === categoryId);
      if (!targetCategory) {
        console.error(`No se encontró la categoría con ID ${categoryId}`);
        return false;
      }
      
      // Obtener solo las secciones visibles (status 1) de esa categoría
      const currentCategorySections = sections[categoryId] || [];
      const visibleSections = currentCategorySections.filter(sec => sec.status === 1);
      if (visibleSections.length === 0) {
        console.error(`No hay secciones visibles para reordenar en categoría ${categoryId}`);
        return false;
      }
      
      // Crear una copia del array de visibles para manipular
      const updatedVisibleSections = [...visibleSections];
      
      // Mover la sección de la posición origen a la posición destino
      const [movedSection] = updatedVisibleSections.splice(sourceIndex, 1);
      updatedVisibleSections.splice(destinationIndex, 0, movedSection);
      
      // Actualizar el display_order de todas las secciones visibles
      const visibleWithOrder = updatedVisibleSections.map((section, index) => ({
        ...section,
        display_order: index + 1
      }));
      
      console.log(`Secciones visibles reordenadas en categoría ${categoryId}:`, 
        visibleWithOrder.map(s => `${s.name} (${s.display_order})`));
      
      // Combinar con las no visibles para obtener el array final de la categoría
      const nonVisibleSections = currentCategorySections.filter(sec => sec.status !== 1);
      const finalCategorySections = [...visibleWithOrder, ...nonVisibleSections];
      
      // Llamar a la API para guardar el nuevo orden
      const response = await fetch('/api/sections/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sections: visibleWithOrder.map(s => ({ 
            id: s.section_id, 
            order: s.display_order 
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al reordenar secciones en la API');
      }
      
      // Actualizar el estado local con el array final de la categoría
      setSections(prev => ({
        ...prev,
        [categoryId]: finalCategorySections
      }));
      
      toast.success('Secciones reordenadas correctamente');
      return true;
    } catch (error) {
      console.error(`Error al reordenar secciones en categoría ${categoryId}:`, error);
      toast.error('Error al reordenar secciones');
      return false;
    }
  };
  
  // *** NUEVA FUNCIÓN GLOBAL ON DRAG END ***
  const handleGlobalDragEnd = (result: DropResult) => {
    const { source, destination, type, draggableId } = result;

    // NUEVO: Log detallado en CONSOLA para depuración
    console.warn("🚨 === DRAG AND DROP DETECTADO === 🚨", { 
      source, 
      destination, 
      type,
      draggableId,
      sourceDroppableId: source?.droppableId,
      destinationDroppableId: destination?.droppableId,
      completeResult: JSON.stringify(result)
    });

    console.log("🌍 Global Drag End - DETALLADO", { 
      source, 
      destination, 
      type,
      draggableId,
      sourceDroppableId: source?.droppableId,
      destinationDroppableId: destination?.droppableId,
      completeResult: JSON.stringify(result)
    });

    // Salir si no hay destino o no se movió
    if (!destination || !source) {
      console.log("⚠️ Drag cancelado (sin destino o sin origen)");
      return;
    }
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      console.log("⚠️ Posición no cambió");
      return;
    }

    try {
      // Lógica para distintos tipos de elementos
      switch (type) {
        case "CATEGORY":
          if (handleReorderCategories) {
            console.log("📊 Reordenando categorías:", { source: source.index, destination: destination.index });
            handleReorderCategories(source.index, destination.index);
            toast.success("Categoría reordenada con éxito");
          } else {
            console.error("❌ Error: handleReorderCategories no está disponible");
          }
          break;
        case "SECTION":
          {
            const sourceId = source.droppableId.split("-")[2]; // sections-category-ID
            const destId = destination.droppableId.split("-")[2];
            
            console.log("📋 Reordenando secciones:", { 
              categoryId: sourceId, 
              source: source.index, 
              destination: destination.index,
              mismaCategoria: sourceId === destId
            });

            if (sourceId === destId && handleReorderSections) {
              handleReorderSections(parseInt(sourceId), source.index, destination.index);
              toast.success("Sección reordenada con éxito");
            } else {
              console.error("❌ Cambio entre categorías no soportado o handleReorderSections no disponible");
            }
          }
          break;
        case "PRODUCT":
          {
            const sourceId = source.droppableId.split("-")[2]; // products-section-ID
            const destId = destination.droppableId.split("-")[2];
            
            console.log("🍔 Reordenando productos:", { 
              sectionId: sourceId, 
              source: source.index, 
              destination: destination.index,
              mismaSeccion: sourceId === destId
            });

            if (sourceId === destId && handleReorderProducts) {
              handleReorderProducts(parseInt(sourceId), source.index, destination.index);
              toast.success("Producto reordenado con éxito");
            } else {
              console.error("❌ Cambio entre secciones no soportado o handleReorderProducts no disponible");
            }
          }
          break;
        default:
          console.error("❓ Tipo desconocido:", type);
      }
    } catch (error) {
      console.error("❌ Error al reordenar:", error);
      toast.error("Error al reordenar. Inténtalo de nuevo.");
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
            selectedCategory={selectedCategory}
            selectedSection={selectedSection}
            onHomeClick={goToHome}
            onCategoryClick={goToCategory}
            onSectionClick={goToSection}
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
                    categories={categories}
                    sections={sections}
                    expandedCategories={expandedCategories}
                    expandedSections={expandedSections}
                    isUpdatingVisibility={isUpdatingVisibility}
                    onToggleCategoryVisibility={(categoryId, status) => toggleCategoryExpansion(categoryId)}
                    onEditCategorySubmit={(category) => {
                      if (category.category_id) {
                        handleEditCategory(category as Category);
                      }
                    }}
                    onDeleteCategorySubmit={(categoryId) => {
                      const category = categories.find(c => c.category_id === categoryId);
                      if (category) {
                        handleDeleteCategory(category);
                      }
                    }}
                    onAddCategorySubmit={handleAddCategory}
                    onToggleSectionVisibility={(sectionId, status) => handleSectionClick(sectionId)}
                    onEditSectionSubmit={(section) => {
                      if (section.section_id) {
                        handleEditSection(section as Section);
                      }
                    }}
                    onDeleteSectionSubmit={(sectionId) => {
                      Object.values(sections).flat().forEach(section => {
                        if (section.section_id === sectionId) {
                          handleDeleteSection(section);
                        }
                      });
                    }}
                    onAddSectionSubmit={(section) => {
                      if (section.category_id) {
                        setSelectedCategory(categories.find(c => c.category_id === section.category_id) || null);
                        handleAddSection();
                      }
                    }}
                    onSectionClick={goToSection}
                    onCategoryClick={goToCategory}
                    products={products}
                    onToggleProductVisibility={(productId: number, currentStatus: number, sectionId: number) => {
                      void toggleProductVisibility(productId, currentStatus, sectionId);
                    }}
                    onEditProduct={(product) => handleEditProduct(product)}
                    onDeleteProduct={(product) => handleDeleteProduct(product)}
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
                    sections={sections[selectedCategory.category_id] || []}
                    category={selectedCategory}
                    products={products}
                    onAddSection={() => handleAddSection()}
                    onEditSection={handleEditSection}
                    onDeleteSection={handleDeleteSection}
                    onAddProduct={handleAddProduct}
                    onToggleSectionVisibility={toggleSectionVisibility}
                    onToggleProductVisibility={(productId: number, currentStatus: number, sectionId: number) => {
                      void toggleProductVisibility(productId, currentStatus, sectionId);
                    }}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={handleDeleteProduct}
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
                    fetchProductsBySection(selectedSection.section_id, true)
                      .then(loadedProducts => {
                        console.log(`✅ Carga de emergencia completada: ${loadedProducts.length} productos`);
                      })
                      .catch(err => {
                        console.error(`❌ Error en carga de emergencia:`, err);
                      });
                  }
                  
                  // Obtener productos para esta sección - intentamos todas las opciones posibles
                  let sectionProducts: Product[] = [];
                  
                  // Opción 1: Productos en el state global
                  if (products[sectionIdStr] && products[sectionIdStr].length > 0) {
                    sectionProducts = products[sectionIdStr];
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
                        products={sectionProducts}
                        sectionName={selectedSection.name || ''}
                        sectionId={selectedSection.section_id}
                        isUpdatingVisibility={isUpdatingVisibility}
                        onAddProduct={() => handleAddProduct(selectedSection.section_id)}
                        onEditProduct={handleEditProduct}
                        onDeleteProduct={handleDeleteProduct}
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
          categories={categories}
          sections={sections}
          products={products}
          selectedCategory={selectedCategory}
          selectedSection={selectedSection}
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
          categoryToEdit={selectedCategory}
          client={client}
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
          setSections={setSections}
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
          setProducts={setProducts}
        />
      )}
      
      {showEditProductModal && itemToDelete && 'product_id' in itemToDelete && (
        <EditProductModal 
          isOpen={showEditProductModal}
          onClose={() => setShowEditProductModal(false)}
          product={itemToDelete as Product}
          client={client}
          selectedSection={selectedSection}
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

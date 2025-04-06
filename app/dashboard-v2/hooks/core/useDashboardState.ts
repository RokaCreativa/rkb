"use client";

/**
 * @fileoverview Hook principal para la gestión del estado del dashboard
 * @author RokaMenu Team
 * @version 1.1.0
 * @updated 2024-06-15
 * 
 * Este hook implementa el patrón Facade (Fachada), proporcionando una interfaz unificada
 * para interactuar con todos los hooks específicos de cada dominio. Actúa como un punto
 * central de acceso para toda la funcionalidad del dashboard.
 * 
 * Principios de diseño:
 * 1. Centralización: Proporciona un único punto de acceso a toda la funcionalidad
 * 2. Simplicidad: Simplifica el uso de hooks de dominio complejos
 * 3. Desacoplamiento: Reduce las dependencias directas entre componentes y hooks de dominio
 * 4. Coordinación: Coordina las interacciones entre diferentes dominios
 * 
 * Diagrama de funcionamiento:
 * 
 * +-------------------+     +-----------------------+
 * |    Componentes    |---->|   useDashboardState   |
 * | (Views, UI, etc.) |<----|  (Hook Fachada/Core)  |
 * +-------------------+     +-----------------------+
 *                                |       |       |
 *                +---------------+       |       +----------------+
 *                |                       |                        |
 * +---------------------+  +----------------------+  +----------------------+
 * | useCategoryManage.  |  |  useSectionManage.   |  |  useProductManage.  |
 * | (Hook de Categoría) |  |  (Hook de Sección)   |  |  (Hook de Producto) |
 * +---------------------+  +----------------------+  +----------------------+
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  DashboardState, 
  DashboardActions,
  Category,
  Section,
  Product,
  Client,
  ViewType
} from '@/app/dashboard-v2/types';
import useCategoryManagement from '../domain/category/useCategoryManagement';
import useSectionManagement from '../domain/section/useSectionManagement';
import useProductManagement from '../domain/product/useProductManagement';

/**
 * Hook principal para gestionar todo el estado del dashboard.
 * 
 * Actúa como una fachada que integra y coordina todos los hooks de dominio específicos,
 * proporcionando una interfaz unificada para los componentes. Los componentes solo necesitan
 * interactuar con este hook, en lugar de tener que gestionar múltiples hooks de dominio.
 * 
 * @param clientId - ID opcional del cliente actual
 * @returns Objeto con todos los estados y funciones necesarios para la gestión del dashboard
 * 
 * @example
 * // Uso básico en componentes
 * const dashboard = useDashboardState();
 * 
 * // Cargar datos iniciales
 * useEffect(() => {
 *   dashboard.fetchClientData();
 *   dashboard.fetchCategories();
 * }, []);
 * 
 * // Manejo de eventos
 * const handleCategoryClick = (category) => {
 *   dashboard.handleCategoryClick(category);
 * };
 */
export default function useDashboardState(clientId?: number) {
  // Estados compartidos por todos los dominios
  /**
   * La vista actual que se muestra en el dashboard
   * Valores posibles: 'CATEGORIES', 'SECTIONS', 'PRODUCTS'
   */
  const [currentView, setCurrentView] = useState<ViewType>('CATEGORIES');
  
  /**
   * La categoría seleccionada actualmente
   * Se utiliza para cargar secciones relacionadas y como contexto para diversas operaciones
   */
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  /**
   * La sección seleccionada actualmente
   * Se utiliza para cargar productos relacionados y como contexto para diversas operaciones
   */
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  
  /**
   * Registro de categorías expandidas
   * Formato: { 1: true, 2: false, ... } donde la clave es el ID de la categoría
   * y el valor es un booleano que indica si está expandida (true) o colapsada (false)
   */
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  
  /**
   * Registro de secciones expandidas
   * Formato: { 1: true, 2: false, ... } donde la clave es el ID de la sección
   * y el valor es un booleano que indica si está expandida (true) o colapsada (false)
   */
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  
  /**
   * Indica si el modo de reordenamiento está activo
   * Cuando está activo, los elementos pueden ser arrastrados para cambiar su orden
   */
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);
  
  // Integrar hooks específicos de dominio
  /**
   * Hook para la gestión de categorías
   * Proporciona funcionalidades específicas para categorías como crear, actualizar, eliminar, etc.
   */
  const categoryManagement = useCategoryManagement();
  
  /**
   * Hook para la gestión de secciones
   * Proporciona funcionalidades específicas para secciones como crear, actualizar, eliminar, etc.
   */
  const sectionManagement = useSectionManagement();
  
  /**
   * Hook para la gestión de productos
   * Proporciona funcionalidades específicas para productos como crear, actualizar, eliminar, etc.
   */
  const productManagement = useProductManagement();
  
  // Extracción de estados comunes para simplificar acceso
  /**
   * Información del cliente actual
   * Se extrae de categoryManagement.client para facilitar el acceso desde los componentes
   */
  const client = categoryManagement.client;
  
  /**
   * Lista de categorías disponibles
   * Se extrae de categoryManagement.categories para facilitar el acceso desde los componentes
   */
  const categories = categoryManagement.categories;
  
  /**
   * Mapa de secciones agrupadas por ID de categoría
   * Se extrae de sectionManagement.sections para facilitar el acceso desde los componentes
   */
  const sections = sectionManagement.sections;
  
  /**
   * Mapa de productos agrupados por ID de sección
   * Se extrae de productManagement.products para facilitar el acceso desde los componentes
   */
  const products = productManagement.products;
  
  // Estado de carga consolidado
  /**
   * Indica si cualquiera de los hooks de dominio está cargando datos
   * Se consolida a partir de los estados de carga de todos los hooks de dominio
   */
  const isLoading = categoryManagement.isLoading || 
                   sectionManagement.isLoading || 
                   productManagement.isLoading;
  
  // Consolidar el estado de actualización de visibilidad
  /**
   * Indica qué elemento está actualizando su visibilidad (si hay alguno)
   * Se consolida a partir de los estados de visibilidad de todos los hooks de dominio
   */
  const isUpdatingVisibility = categoryManagement.isUpdatingVisibility || 
                              sectionManagement.isUpdatingVisibility || 
                              productManagement.isUpdatingVisibility;
  
  // Consolidar errores
  /**
   * Mensaje de error actual (si hay alguno)
   * Se consolida a partir de los estados de error de todos los hooks de dominio
   */
  const error = categoryManagement.error || 
                sectionManagement.error || 
                productManagement.error;
  
  /**
   * Carga los datos del cliente actual desde el servidor.
   * 
   * Esta función delega la carga al hook de categorías y proporciona
   * información de registro para seguimiento y depuración.
   * 
   * @returns Promise con datos del cliente o null en caso de error
   * 
   * @example
   * // Cargar datos del cliente al iniciar
   * useEffect(() => {
   *   fetchClientData();
   * }, []);
   */
  const fetchClientData = useCallback(async () => {
    console.log('🔄 Iniciando carga de datos del cliente...');
    try {
      // Delegamos la carga a categoryManagement.fetchClientData
      const clientData = await categoryManagement.fetchClientData();
      
      // Verificamos si se obtuvieron datos
      if (!clientData) {
        throw new Error('No se pudieron cargar los datos del cliente');
      }
      
      console.log('✅ Datos del cliente cargados correctamente:', clientData?.business_name || clientData?.name);
      return clientData;
    } catch (error) {
      console.error('❌ Error en fetchClientData:', error);
      toast.error('No se pudieron cargar los datos del cliente');
      return null;
    }
  }, [categoryManagement]);

  /**
   * Cambia el estado de expansión de una categoría (expandir/colapsar).
   * 
   * @param categoryId - ID de la categoría cuyo estado de expansión se cambiará
   * 
   * @example
   * // Expandir o colapsar una categoría al hacer clic en un botón
   * <button onClick={() => toggleCategoryExpansion(category.category_id)}>
   *   {expandedCategories[category.category_id] ? 'Colapsar' : 'Expandir'}
   * </button>
   */
  const toggleCategoryExpansion = useCallback((categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  /**
   * Cambia el estado de expansión de una sección (expandir/colapsar).
   * 
   * @param sectionId - ID de la sección cuyo estado de expansión se cambiará
   * 
   * @example
   * // Expandir o colapsar una sección al hacer clic en un botón
   * <button onClick={() => toggleSectionExpansion(section.section_id)}>
   *   {expandedSections[section.section_id] ? 'Colapsar' : 'Expandir'}
   * </button>
   */
  const toggleSectionExpansion = useCallback((sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  /**
   * Maneja el clic en una categoría, cambiando la selección y cargando sus secciones.
   * 
   * Esta función tiene múltiples responsabilidades:
   * 1. Establece la categoría seleccionada
   * 2. Cambia el estado de expansión de la categoría
   * 3. Carga las secciones asociadas si la categoría se está expandiendo
   * 
   * @param category - Objeto de categoría en la que se ha hecho clic
   * 
   * @example
   * // Manejar clic en una categoría
   * <CategoryItem category={category} onClick={handleCategoryClick} />
   */
  const handleCategoryClick = useCallback(async (category: Category) => {
    // Actualizar la categoría seleccionada
    setSelectedCategory(category);
    
    // Cambiar estado de expansión
    toggleCategoryExpansion(category.category_id);
    
    // Si la categoría se está expandiendo (no estaba expandida antes) y no se han cargado sus secciones, cargarlas
    if (!expandedCategories[category.category_id]) {
      await sectionManagement.fetchSectionsByCategory(category.category_id);
    }
  }, [expandedCategories, sectionManagement, toggleCategoryExpansion]);

  /**
   * Maneja el clic en una sección, cambiando la selección y cargando sus productos.
   * 
   * Esta función tiene múltiples responsabilidades:
   * 1. Establece la sección seleccionada
   * 2. Cambia el estado de expansión de la sección
   * 3. Carga los productos asociados si la sección se está expandiendo
   * 
   * @param section - Objeto de sección en la que se ha hecho clic
   * 
   * @example
   * // Manejar clic en una sección
   * <SectionItem section={section} onClick={handleSectionClick} />
   */
  const handleSectionClick = useCallback((section: Section) => {
    // Actualizar la sección seleccionada
    setSelectedSection(section);
    
    // Cambiar estado de expansión
    toggleSectionExpansion(section.section_id);
    
    // Si la sección se está expandiendo (no estaba expandida antes), cargar sus productos
    if (!expandedSections[section.section_id]) {
      productManagement.fetchProductsBySection(section.section_id);
    }
  }, [expandedSections, productManagement, toggleSectionExpansion]);

  /**
   * Activa o desactiva el modo de reordenamiento de elementos.
   * 
   * Cuando el modo de reordenamiento está activo, los elementos pueden
   * ser arrastrados y soltados para cambiar su orden.
   * 
   * @example
   * // Botón para activar/desactivar modo de reordenamiento
   * <button onClick={toggleReorderMode}>
   *   {isReorderModeActive ? 'Salir del modo reordenamiento' : 'Reordenar elementos'}
   * </button>
   */
  const toggleReorderMode = useCallback(() => {
    setIsReorderModeActive(prev => !prev);
  }, []);

  // Combinar toda la funcionalidad en un único objeto de retorno
  // Esto implementa el patrón Facade, proporcionando una interfaz unificada
  return {
    // Estados
    currentView,          // Estado de la vista actual (CATEGORIES, SECTIONS, PRODUCTS)
    client,               // Información del cliente actual
    categories,           // Lista de categorías
    sections,             // Mapa de secciones por categoría
    products,             // Mapa de productos por sección
    selectedCategory,     // Categoría seleccionada actualmente
    selectedSection,      // Sección seleccionada actualmente
    expandedCategories,   // Registro de qué categorías están expandidas
    expandedSections,     // Registro de qué secciones están expandidas
    isReorderModeActive,  // Si el modo de reordenamiento está activo
    
    // Estados de carga y error
    isLoading,            // Si hay alguna operación de carga en curso
    isSectionsLoading: sectionManagement.isLoading,  // Si se están cargando secciones
    isProductsLoading: productManagement.isLoading,  // Si se están cargando productos
    isUpdatingVisibility, // ID del elemento que está actualizando visibilidad (o null)
    error,                // Mensaje de error (si hay alguno)
    
    // Funciones compartidas
    setCurrentView,       // Cambiar la vista actual
    setSelectedCategory,  // Cambiar la categoría seleccionada
    setSelectedSection,   // Cambiar la sección seleccionada
    setExpandedCategories, // Actualizar registro de categorías expandidas
    setExpandedSections,  // Actualizar registro de secciones expandidas
    toggleCategoryExpansion, // Expandir/colapsar una categoría
    toggleSectionExpansion,  // Expandir/colapsar una sección
    toggleReorderMode,    // Activar/desactivar modo de reordenamiento
    handleCategoryClick,  // Manejar clic en una categoría
    handleSectionClick,   // Manejar clic en una sección
    
    // Funciones de categoría (delegadas a categoryManagement)
    fetchClientData,                     // Cargar datos del cliente
    fetchCategories: categoryManagement.fetchCategories,        // Cargar todas las categorías
    createCategory: categoryManagement.createCategory,          // Crear nueva categoría
    updateCategory: categoryManagement.updateCategory,          // Actualizar categoría existente
    deleteCategory: categoryManagement.deleteCategory,          // Eliminar categoría
    toggleCategoryVisibility: categoryManagement.toggleCategoryVisibility, // Cambiar visibilidad de categoría
    
    // Funciones de sección (delegadas a sectionManagement)
    fetchSectionsByCategory: sectionManagement.fetchSectionsByCategory, // Cargar secciones de una categoría
    createSection: sectionManagement.createSection,             // Crear nueva sección
    updateSection: sectionManagement.updateSection,             // Actualizar sección existente
    deleteSection: sectionManagement.deleteSection,             // Eliminar sección
    toggleSectionVisibility: sectionManagement.toggleSectionVisibility, // Cambiar visibilidad de sección
    
    // Funciones de producto (delegadas a productManagement)
    fetchProductsBySection: productManagement.fetchProductsBySection, // Cargar productos de una sección
    createProduct: productManagement.createProduct,             // Crear nuevo producto
    updateProduct: productManagement.updateProduct,             // Actualizar producto existente
    deleteProduct: productManagement.deleteProduct,             // Eliminar producto
    toggleProductVisibility: productManagement.toggleProductVisibility // Cambiar visibilidad de producto
  };
}
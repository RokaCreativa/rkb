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
import { 
  Category, 
  Client, 
  DashboardState
} from '@/app/dashboard-v2/types';
import { toast } from 'react-hot-toast';
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
export default function useDashboardState() {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [categorySections, setCategorySections] = useState<Record<string, any>>({});
  const [sectionsProducts, setSectionsProducts] = useState<Record<string, any>>({});
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
  
  // Hooks de gestión
  const categoryManagement = useCategoryManagement();
  const sectionManagement = useSectionManagement();
  const productManagement = useProductManagement();

  // Cargar datos del cliente (información básica)
  const fetchClientData = useCallback(async () => {
    try {
      // Forzar recarga ignorando la caché
      sessionStorage.removeItem('dashboard_client_data');
      
      console.log('🔄 Cargando datos del cliente...');
    setIsLoading(true);

      // Usar categoryManagement para cargar los datos del cliente
      const clientData = await categoryManagement.fetchClientData();
      
      if (clientData) {
        // Almacenar en sessionStorage para desarrollo
        sessionStorage.setItem('dashboard_client_data', JSON.stringify(clientData));
        setClient(clientData);
        setIsLoading(false);
        console.log('✅ Datos del cliente cargados correctamente');
        return clientData;
      } else {
        throw new Error('No se pudo cargar la información del cliente');
      }
    } catch (err) {
      console.error('❌ Error al cargar datos del cliente:', err);
      toast.error('Error al cargar los datos del cliente');
      setIsLoading(false);
    return null;
    }
  }, [categoryManagement]);

  // Cargar categorías del cliente
  const fetchCategories = useCallback(async () => {
    try {
      // Comprobar si ya tenemos datos en sessionStorage para desarrollo
      const sessionKey = 'dashboard_categories_data';
      const storedData = sessionStorage.getItem(sessionKey);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('Usando categorías almacenadas en sesión');
        setCategories(parsedData);
        return parsedData;
      }
      
      console.log('Cargando categorías...');
      setIsLoading(true);
      
      const categoriesData = await categoryManagement.fetchCategories();
      
      if (categoriesData && categoriesData.length > 0) {
        // Almacenar en sessionStorage para desarrollo
        sessionStorage.setItem(sessionKey, JSON.stringify(categoriesData));
        setCategories(categoriesData);
        setIsLoading(false);
        console.log('Categorías cargadas correctamente');
        return categoriesData;
      } else {
        console.warn('No se encontraron categorías');
      setIsLoading(false);
        return [];
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      toast.error('Error al cargar las categorías');
      setIsLoading(false);
      return [];
    }
  }, [categoryManagement]);

  // Devolver objeto con estados y funciones
  return {
    // Estados
    client,
    categories,
    sections: categorySections,
    products: sectionsProducts,
    isLoading,
    isUpdatingVisibility: categoryManagement.isUpdatingVisibility || 
                          sectionManagement.isUpdatingVisibility || 
                          productManagement.isUpdatingVisibility,
    error: categoryManagement.error || 
           sectionManagement.error || 
           productManagement.error,
    
    // Funciones
    fetchClientData,
    fetchCategories,
    fetchSectionsByCategory: sectionManagement.fetchSectionsByCategory,
    fetchProductsBySection: productManagement.fetchProductsBySection,
    
    // Operaciones CRUD
    createCategory: categoryManagement.createCategory,
    updateCategory: categoryManagement.updateCategory,
    deleteCategory: categoryManagement.deleteCategory,
    toggleCategoryVisibility: categoryManagement.toggleCategoryVisibility,
    
    createSection: sectionManagement.createSection,
    updateSection: sectionManagement.updateSection,
    deleteSection: sectionManagement.deleteSection,
    toggleSectionVisibility: sectionManagement.toggleSectionVisibility,
    
    createProduct: productManagement.createProduct,
    updateProduct: productManagement.updateProduct,
    deleteProduct: productManagement.deleteProduct,
    toggleProductVisibility: productManagement.toggleProductVisibility
  };
}
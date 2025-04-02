"use client";

import { useState, useCallback, useEffect } from 'react';
import { Category, Section, Product, Client } from '@/app/types/menu';
import { toast } from 'react-hot-toast';
import useCategories from '@/app/hooks/useCategories';
import useSections from '@/app/hooks/useSections';
import useProducts from '@/app/hooks/useProducts';

interface DataState {
  categories: Category[];
  sections: Record<number, Section[]>;
  products: Record<number, Product[]>;
  expandedCategories: Record<number, boolean>;
  expandedSections: Record<number, boolean>;
  selectedCategory: Category | null;
  selectedSection: Section | null;
  selectedProduct: Product | null;
}

/**
 * Hook personalizado para gestionar los datos y las operaciones del dashboard
 */
export default function useDataState(clientId: number | null = null) {
  // Estados de datos principales
  const [client, setClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<{ [key: number]: Section[] }>({});
  const [products, setProducts] = useState<{ [key: number]: Product[] }>({});
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(true);
  const [isSectionsLoading, setIsSectionsLoading] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado de UI
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  
  // Selección actual
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Integración con hooks específicos de la aplicación
  const { 
    categories: categoriesFromHook,
    isLoadingCategories,
    fetchCategories: fetchCategoriesHook,
    toggleCategoryVisibility: toggleCategoryVisibilityHook,
    deleteCategory: deleteCategoryHook
  } = useCategories(clientId || client?.id || null);
  
  const {
    sections: sectionsFromHook,
    fetchSections: fetchSectionsHook,
    deleteSection: deleteSectionHook,
    updateSection
  } = useSections(clientId || client?.id || null);
  
  const {
    products: productsFromHook,
    fetchProducts: fetchProductsHook,
    deleteProduct,
    updateProduct,
    toggleProductVisibility
  } = useProducts({
    onSuccess: () => {
      // Podemos usar este callback para acciones adicionales tras operaciones exitosas
    }
  });
  
  // Cargar datos del cliente
  const fetchClientData = useCallback(async () => {
    setIsLoading(true);
    console.log('🔄 Iniciando carga de datos del cliente...');
    try {
      const response = await fetch('/api/client');
      if (!response.ok) {
        throw new Error(`Error al cargar datos del cliente: ${response.status} ${response.statusText}`);
      }
      
      const clientData = await response.json();
      console.log('✅ Datos del cliente cargados correctamente:', clientData?.business_name || clientData?.name);
      setClient(clientData);
      return clientData;
    } catch (error) {
      console.error('❌ Error en fetchClientData:', error);
      setError('Error al cargar datos del cliente');
      toast.error('No se pudieron cargar los datos del cliente');
      throw error;
    } finally {
      console.log('🏁 Finalizando fetchClientData, estableciendo isLoading=false');
      setIsLoading(false);
    }
  }, []);
  
  // Cargar categorías (con soporte para paginación)
  const fetchCategories = useCallback(async (options?: { page?: number; limit?: number }) => {
    // Evitar cargas duplicadas si ya tenemos datos
    if (categories.length > 0) {
      console.log('📦 Categorías ya cargadas, evitando recarga duplicada');
      return categories;
    }

    // Evitar cargas duplicadas si ya estamos usando el hook
    if (categoriesFromHook && categoriesFromHook.length > 0) {
      console.log('📦 Usando categorías del hook, evitando recarga duplicada');
      setCategories(categoriesFromHook);
      return categoriesFromHook;
    }
    
    console.log('🔄 Iniciando carga de categorías...');
    setIsLoading(true);
    
    try {
      let url = '/api/categories';
      
      // Añadir parámetros de paginación si se proporcionan
      if (options?.page || options?.limit) {
        const params = new URLSearchParams();
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        url = `${url}?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al cargar categorías: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Se cargaron ${data.length} categorías`);
      
      setCategories(data);
      return data;
    } catch (error) {
      console.error('❌ Error en fetchCategories:', error);
      setError('Error al cargar categorías');
      toast.error('No se pudieron cargar las categorías');
      throw error;
    } finally {
      console.log('🏁 Finalizando fetchCategories, estableciendo isLoading=false');
      setIsLoading(false);
    }
  }, [categories, categoriesFromHook]);
  
  /**
   * Encuentra el ID de la categoría a la que pertenece una sección
   * 
   * Busca en todas las categorías para encontrar aquella que contiene la sección especificada.
   * Esta función es útil para mantener la relación jerárquica entre categorías y secciones.
   * 
   * @param sectionId - ID de la sección para la que queremos encontrar su categoría
   * @returns El ID de la categoría si se encuentra, o null si no se encuentra
   */
  const findCategoryIdForSection = useCallback((sectionId: number): number | null => {
    for (const [categoryId, categorySections] of Object.entries(sections)) {
      if (categorySections.some(s => s.section_id === sectionId)) {
        return parseInt(categoryId);
      }
    }
    return null;
  }, [sections]);
  
  /**
   * Carga las secciones de una categoría específica
   * 
   * FUNCIÓN CRÍTICA: Esta función obtiene todas las secciones de una categoría desde la API
   * y las almacena en el estado global. Incluye validaciones y transformaciones importantes.
   * 
   * El proceso paso a paso es:
   * 1. Verificar si ya tenemos las secciones en caché para evitar carga innecesaria
   * 2. Hacer la petición a la API si es necesario
   * 3. Procesar y normalizar los datos recibidos
   * 4. Actualizar el estado con las secciones recibidas
   * 
   * @param categoryId - ID de la categoría para la que queremos cargar secciones
   * @returns Promise que se resuelve cuando la operación termina
   */
  const fetchSectionsByCategory = useCallback(
    async (categoryId: number) => {
      // PASO 1: Validaciones básicas
      if (!categoryId) {
        console.error("❌ ID de categoría inválido:", categoryId);
        return;
      }

      console.log(`🔄 Cargando secciones para categoría ${categoryId}...`);
      
      // PASO 2: Verificar si ya tenemos las secciones en caché
      // Esto es crucial para evitar llamadas API innecesarias
      if (sections[categoryId] && sections[categoryId].length > 0) {
        console.log(`📦 Secciones ya cargadas para categoría ${categoryId}, evitando recarga`);
        setIsLoading(false);
        return;
      }

      try {
        // PASO 3: Hacer la petición a la API
        const response = await fetch(`/api/sections?category_id=${categoryId}`);
        
        if (!response.ok) {
          throw new Error(`Error al cargar secciones: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`🔎 Respuesta API para secciones (categoría ${categoryId}):`, data);
        
        // PASO 4: Determinar el formato de la respuesta y extraer secciones
        // La API puede devolver:
        // 1. Un array directo de secciones
        // 2. Un objeto con una propiedad "sections" que contiene el array
        // 3. Un objeto con propiedad "data" (para respuestas paginadas)
        
        let sectionsData: any[] = [];
        
        if (Array.isArray(data)) {
          // Caso 1: La respuesta es un array directo
          sectionsData = data;
          console.log(`✅ Formato de respuesta: Array directo con ${sectionsData.length} secciones`);
        } else if (data && data.sections && Array.isArray(data.sections)) {
          // Caso 2: La respuesta tiene formato { sections: [...] }
          sectionsData = data.sections;
          console.log(`✅ Formato de respuesta: Objeto con propiedad 'sections', contiene ${sectionsData.length} secciones`);
        } else if (data && data.data && Array.isArray(data.data)) {
          // Caso 3: La respuesta tiene formato paginado { data: [...], meta: {...} }
          sectionsData = data.data;
          console.log(`✅ Formato de respuesta: Objeto paginado con propiedad 'data', contiene ${sectionsData.length} secciones`);
        } else {
          // Ningún formato reconocido
          console.error(`❌ Formato de respuesta desconocido para secciones:`, data);
          throw new Error(`Formato de respuesta inválido para secciones de categoría ${categoryId}`);
        }
        
        // PASO 5: Procesar y normalizar secciones
        // Esto asegura que todos los datos tengan el formato correcto
        const processedSections = sectionsData.map((section: any) => ({
          ...section,
          // Normalizar ID para asegurar consistencia
          section_id: section.section_id,
          id: section.section_id,
          
          // Normalizar estado: API puede devolver boolean o numérico
          // Convertimos siempre a numérico (0/1) para el frontend
          status: typeof section.status === 'boolean' 
            ? (section.status ? 1 : 0) 
            : section.status,
            
          // Otros campos críticos
          category_id: section.category_id,
          products_count: section.products_count || 0,
          visible_products_count: section.visible_products_count || 0
        }));
        
        // PASO 6: Registrar detalles para depuración
        console.log(`✅ Se cargaron ${processedSections.length} secciones para categoría ${categoryId}`);
        if (processedSections.length > 0) {
          console.log(`Estructura de la primera sección: ${JSON.stringify(processedSections[0])}`);
          console.log(`Datos completos de secciones: ${JSON.stringify(processedSections.slice(0, 2))}`);
        }
        
        // PASO 7: Actualizar contador de secciones para la categoría
        if (categories.length > 0) {
          setCategories(currentCategories => 
            currentCategories.map(category => 
              category.category_id === categoryId
                ? { 
                    ...category, 
                    sections_count: processedSections.length,
                    visible_sections_count: processedSections.filter((s: Section) => s.status === 1).length
                  }
                : category
            )
          );
        }
        
        // PASO 8: Actualizar estado de secciones
        console.log(`🔄 Actualizando estado de secciones para categoría ${categoryId}: ${processedSections.map((s: Section) => s.name).join(', ')}`);
        setSections(prevSections => {
          const newSections = { ...prevSections };
          newSections[categoryId] = processedSections;
          
          // Debug crítico para verificar el objeto antes y después
          console.log(`🔍 DEBUG - Estado ANTES de actualizar:`, JSON.stringify(Object.keys(prevSections)));
          console.log(`🔍 DEBUG - Estado DESPUÉS de actualizar:`, JSON.stringify(Object.keys(newSections)));
          console.log(`🔍 DEBUG - ¿Contiene la categoría ${categoryId}?`, newSections.hasOwnProperty(categoryId));
          console.log(`🔍 DEBUG - Valor para categoryId ${categoryId}:`, newSections[categoryId]?.length || 0);
          
          console.log(`✅ Estado de secciones actualizado: ${JSON.stringify(Object.keys(newSections).map(k => `${k}: ${newSections[parseInt(k)]?.length || 0}`))}`);
          console.log(`Secciones para categoría ${categoryId}: ${processedSections.length}`);
          return newSections;
        });
        
        // PASO 9: Verificar que las secciones se guardaron correctamente
        setTimeout(() => {
          console.log(`🔍 DEBUG - Verificando después de actualizar, secciones para categoría ${categoryId}:`, 
                      sections[categoryId]?.length || 0);
        }, 500);
        
        // PASO 10: Finalizar estado de carga
        setIsLoading(false);
        
      } catch (error) {
        console.error(`❌ Error cargando secciones para categoría ${categoryId}:`, error);
        setError(`Error al cargar secciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        setIsLoading(false);
      }
    },
    [categories, sections, setCategories, setSections, setIsLoading, setError]
  );
  
  // Funciones de ayuda
  /**
   * Carga los productos de una sección específica
   * 
   * FUNCIÓN CRÍTICA: Esta función obtiene todos los productos de una sección desde la API
   * y los almacena tanto en el estado global como en un estado local para renderizado inmediato.
   * Implementa el patrón de "estado dual" (local/global) siguiendo el MANDAMIENTO CRÍTICO.
   * 
   * El proceso paso a paso es:
   * 1. Verificar si ya tenemos los productos en caché para evitar carga innecesaria
   * 2. Hacer la petición a la API si es necesario
   * 3. Procesar y normalizar los datos recibidos
   * 4. Actualizar AMBOS estados (global y local) con los productos recibidos
   * 5. Actualizar contadores en la sección correspondiente
   * 
   * @param sectionId - ID de la sección para la que queremos cargar productos
   * @param updateLocalState - Función opcional para actualizar el estado local inmediatamente
   * @returns Promise con los productos cargados
   */
  const fetchProductsBySection = useCallback(async (
    sectionId: number, 
    updateLocalState?: (products: Product[]) => void
  ) => {
    // PASO 1: Validaciones básicas
    if (!sectionId) {
      console.error("❌ ID de sección no válido");
      return [];
    }
    
    // PASO 2: Verificar si ya tenemos los productos en caché
    if (products[sectionId] && products[sectionId].length > 0) {
      console.log(`📦 Productos ya cargados para sección ${sectionId}, evitando recarga`);
      
      // Si nos proporcionaron una función para actualizar estado local, la llamamos con datos de caché
      if (updateLocalState) {
        console.log(`🔄 Actualizando estado local con productos en caché`);
        updateLocalState(products[sectionId]);
      }
      
      return products[sectionId];
    }
    
    console.log(`🔄 Cargando productos para sección ${sectionId}...`);
    
    try {
      // PASO 3: Hacer la petición a la API
      const response = await fetch(`/api/products?section_id=${sectionId}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // PASO 4: Procesar y normalizar productos
      // Aseguramos formato correcto y consistente para todos los campos
      const processedProducts = data.map((product: any) => ({
        ...product,
        // Normalizar IDs
        product_id: product.product_id,
        id: product.product_id,
        
        // Normalizar estado: API puede devolver boolean o numérico
        status: typeof product.status === 'boolean' 
          ? (product.status ? 1 : 0) 
          : product.status,
          
        // Asegurar que section_id está presente
        section_id: sectionId,
        
        // Normalizar precio si es necesario
        price: product.price !== null ? parseFloat(product.price) : 0,
        
        // Asegurar que display_order está presente
        display_order: product.display_order || 0
      }));
      
      console.log(`✅ Se cargaron ${processedProducts.length} productos para sección ${sectionId}`);
      
      // Verificar resultados para depuración
      if (processedProducts.length > 0) {
        console.log("Primeros productos:", processedProducts.slice(0, 2));
      }
      
      // PASO 5: Actualizar estado GLOBAL con los productos cargados
      setProducts(prev => {
        const updatedProducts = { ...prev };
        updatedProducts[sectionId] = processedProducts;
        return updatedProducts;
      });
      
      // PASO 6: Actualizar estado LOCAL si nos proporcionaron la función
      if (updateLocalState) {
        console.log(`🔄 Actualizando estado local con ${processedProducts.length} productos`);
        updateLocalState(processedProducts);
      }
      
      // PASO 7: Actualizar sección con conteos de productos
      const foundCategoryId = findCategoryIdForSection(sectionId);
      if (foundCategoryId !== null) {
        const visibleProductsCount = processedProducts.filter((p: Product) => p.status === 1).length;
        
        setSections(prev => {
          const updated = { ...prev };
          if (updated[foundCategoryId]) {
            updated[foundCategoryId] = updated[foundCategoryId].map(s => 
              s.section_id === sectionId 
                ? {
                    ...s,
                    products_count: processedProducts.length,
                    visible_products_count: visibleProductsCount
                  } 
                : s
            );
          }
          return updated;
        });
      }
      
      // PASO 8: Verificar integridad de datos y registrar para depuración
      const productNames = processedProducts.map((p: Product) => p.name);
      console.log(`Nombres de productos recibidos para sección ${sectionId}:`, 
                productNames.length > 0 ? productNames.join(", ") : "No hay productos");
      
      return processedProducts;
    } catch (error) {
      console.error(`❌ Error al cargar productos para sección ${sectionId}:`, error);
      toast.error("Error al cargar los productos");
      return [];
    }
  }, [products, setSections, findCategoryIdForSection]);
  
  // Funciones de manejo de UI
  const handleCategoryClick = useCallback(async (category: Category) => {
    const categoryId = category.category_id;
    console.log(`👆 Clic en categoría: ${category.name} (${categoryId})`);
    
    // Actualizar selección primero
    setSelectedCategory(category);
    
    // Cargar secciones si no están cargadas
    if (!sections[categoryId] || sections[categoryId].length === 0) {
      await fetchSectionsByCategory(categoryId);
    }
    
    // Toggle estado de expansión después de cargar
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
    
  }, [expandedCategories, fetchSectionsByCategory, sections]);
  
  const handleSectionClick = useCallback(async (sectionId: number) => {
    console.log(`👆 Clic en sección ID: ${sectionId}`);
    
    // Toggle estado de expansión
    const isCurrentlyExpanded = expandedSections[sectionId];
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !isCurrentlyExpanded
    }));
    
    // Buscar la sección y su categoría
    const categoryId = findCategoryIdForSection(sectionId);
    if (!categoryId) {
      console.error("❌ No se pudo encontrar la categoría para esta sección");
      return;
    }
    
    // Encontrar el objeto sección
    const section = sections[categoryId]?.find(s => s.section_id === sectionId);
    if (!section) {
      console.error("❌ No se pudo encontrar la sección");
      return;
    }
    
    // Actualizar selección
    setSelectedSection(section);
    
    // Si estamos expandiendo y no tenemos productos, cargarlos
    if (!isCurrentlyExpanded && (!products[sectionId] || products[sectionId].length === 0)) {
      await fetchProductsBySection(sectionId);
    } else {
      console.log(`Productos ya cargados para sección ${sectionId}:`, products[sectionId]?.length || 0);
    }
  }, [expandedSections, fetchProductsBySection, findCategoryIdForSection, products, sections]);
  
  // Funciones para cambiar visibilidad
  const toggleCategoryVisibility = useCallback(async (categoryId: number, currentStatus: number) => {
    setIsUpdatingVisibility(categoryId);
    
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      
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
      
      if (!response.ok) {
        throw new Error('Error al actualizar la visibilidad');
      }
      
      // Actualizar estado local
      setCategories(prev => 
        prev.map(cat => 
          cat.category_id === categoryId ? { ...cat, status: newStatus } : cat
        )
      );
      
      toast.success(newStatus === 1 ? 'Categoría visible' : 'Categoría oculta');
    } catch (error) {
      console.error('❌ Error al cambiar visibilidad:', error);
      toast.error('No se pudo cambiar la visibilidad');
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, []);
  
  const toggleSectionVisibility = useCallback(async (sectionId: number, currentStatus: number) => {
    setIsUpdatingVisibility(sectionId);
    
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      
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
      
      if (!response.ok) {
        throw new Error('Error al actualizar la visibilidad');
      }
      
      // Actualizar estado local
      setSections(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(categoryId => {
          updated[parseInt(categoryId)] = updated[parseInt(categoryId)]?.map(section => 
            section.section_id === sectionId ? { ...section, status: newStatus } : section
          ) || [];
        });
        return updated;
      });
      
      toast.success(newStatus === 1 ? 'Sección visible' : 'Sección oculta');
    } catch (error) {
      console.error('❌ Error al cambiar visibilidad de sección:', error);
      toast.error('No se pudo cambiar la visibilidad');
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, []);
  
  // Función para eliminar una categoría
  const handleDeleteCategory = useCallback(async (categoryId: number): Promise<boolean> => {
    if (!client?.id) return false;
    
    try {
      // Si disponemos del hook específico, usarlo
      if (deleteCategoryHook) {
        return await deleteCategoryHook(categoryId);
      }
      
      // Si no, implementación tradicional
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la categoría');
      }
      
      // Actualizar el estado local para eliminar la categoría
      setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
      
      toast.success('Categoría eliminada correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      toast.error('No se pudo eliminar la categoría');
      return false;
    }
  }, [client?.id, deleteCategoryHook]);
  
  // Reordenar categorías mediante drag and drop
  const reorderCategory = useCallback(async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex || !categories.length) return;
    
    setIsUpdatingOrder(true);
    
    // Realizar la reordenación localmente primero (para UI responsiva)
    const reorderedCategories = [...categories];
    const [movedItem] = reorderedCategories.splice(sourceIndex, 1);
    reorderedCategories.splice(destinationIndex, 0, movedItem);
    
    // Actualizar órdenes de visualización
    const updatedCategories = reorderedCategories.map((category, index) => ({
      ...category,
      display_order: index + 1
    }));
    
    // Actualizar estado local
    setCategories(updatedCategories);
    
    try {
      // Enviar actualización al servidor
      await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: updatedCategories.map(cat => ({
            id: cat.category_id,
            display_order: cat.display_order
          }))
        }),
      });
      
      toast.success('Orden actualizado correctamente');
    } catch (error) {
      console.error('Error al reordenar categorías:', error);
      toast.error('Error al actualizar el orden');
      
      // Restaurar el orden original en caso de error
      setCategories(categories);
    } finally {
      setIsUpdatingOrder(false);
    }
  }, [categories]);
  
  // Efecto para cargar datos del cliente al inicializar el hook
  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId, fetchClientData]);
  
  return {
    // Estados
    client,
    categories: categoriesFromHook && categoriesFromHook.length > 0 ? categoriesFromHook : categories,
    sections,
    products: productsFromHook || products,
    isLoading: isLoading || isLoadingCategories,
    isSectionsLoading,
    isUpdatingVisibility,
    isUpdatingOrder,
    error,
    
    // Acciones
    setClient,
    setCategories,
    setSections,
    setProducts,
    setIsLoading,
    setIsSectionsLoading,
    setIsUpdatingVisibility,
    setIsUpdatingOrder,
    setError,
    
    // Funciones de carga de datos
    fetchClientData,
    fetchCategories,
    fetchSectionsByCategory,
    fetchProductsBySection,
    
    // Funciones de UI y eventos
    handleCategoryClick,
    handleSectionClick,
    
    // Funciones de actualización
    toggleCategoryVisibility,
    toggleSectionVisibility,
    deleteCategory: handleDeleteCategory,
    reorderCategory,
    deleteSection: deleteSectionHook,
    updateSection,
    toggleProductVisibility,
    deleteProduct,
    updateProduct,
    
    // Estado de UI
    expandedCategories,
    setExpandedCategories,
    expandedSections,
    setExpandedSections,
    selectedCategory,
    setSelectedCategory,
    selectedSection,
    setSelectedSection,
    selectedProduct,
    setSelectedProduct
  };
} 
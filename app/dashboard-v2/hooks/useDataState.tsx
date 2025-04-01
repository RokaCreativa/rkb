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
  const [sections, setSections] = useState<{ [key: string]: Section[] }>({});
  const [products, setProducts] = useState<{ [key: string]: Product[] }>({});
  
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
  
  // Cargar secciones para una categoría específica
  const fetchSectionsByCategory = useCallback(async (categoryId: number) => {
    if (!categoryId) {
      console.error("❌ ID de categoría no válido");
      return [];
    }

    // Si ya tenemos las secciones cargadas, retornarlas
    if (sections[categoryId] && sections[categoryId].length > 0) {
      console.log(`📦 Secciones ya cargadas para categoría ${categoryId}, evitando recarga`);
      return sections[categoryId];
    }
    
    console.log(`🔄 Cargando secciones para categoría ${categoryId}...`);
    
    try {
      const response = await fetch(`/api/sections?category_id=${categoryId}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Se cargaron ${data.length} secciones para categoría ${categoryId}`);
      
      // Verificar la estructura de los datos
      console.log('Estructura de la primera sección:', data[0]);
      console.log('Datos completos de secciones:', JSON.stringify(data.slice(0, 2)));
      
      // Normalización de datos para asegurar formato correcto
      const processedSections = data.map((section: any) => ({
        section_id: section.section_id || section.id,
        id: section.id || section.section_id, // Asegurarse de que siempre tiene id para compatibilidad
        name: section.name,
        image: section.image,
        status: typeof section.status === 'boolean' ? (section.status ? 1 : 0) : section.status,
        display_order: section.display_order || section.order || 0,
        category_id: categoryId,
        products_count: section.products_count || 0,
        visible_products_count: section.visible_products_count || 0
      }));
      
      // Actualizar estado con las secciones cargadas
      setSections(prev => {
        const newSections = { ...prev };
        newSections[categoryId] = processedSections;
        console.log(`🔄 Actualizando estado de secciones para categoría ${categoryId}:`, 
                   processedSections.map((s: Section) => s.name).join(', '));
        return newSections;
      });
      
      // Verificar que se hayan guardado correctamente
      setTimeout(() => {
        console.log(`✅ Verificación después de guardar: ${sections[categoryId]?.length || 0} secciones para categoría ${categoryId}`);
        if (sections[categoryId]) {
          console.log('Secciones guardadas:', sections[categoryId].map(s => s.name).join(', '));
        }
      }, 100);
      
      // Actualizar categorías con conteos
      if (data.length > 0) {
        const visibleSectionsCount = data.filter((s: Section) => 
          typeof s.status === 'boolean' ? s.status : s.status === 1
        ).length;
        
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.category_id === categoryId 
              ? {
                  ...cat,
                  sections_count: data.length,
                  visible_sections_count: visibleSectionsCount
                } 
              : cat
          )
        );
      }
      
      return processedSections;
    } catch (error) {
      console.error(`❌ Error al cargar secciones para categoría ${categoryId}:`, error);
      toast.error("Error al cargar las secciones");
      return [];
    }
  }, [sections, setCategories]);
  
  // Cargar productos para una sección específica
  const fetchProductsBySection = useCallback(async (sectionId: number) => {
    if (!sectionId) {
      console.error("❌ ID de sección no válido");
      return [];
    }
    
    console.log(`🔄 Cargando productos para sección ${sectionId}...`);
    
    try {
      const response = await fetch(`/api/products?section_id=${sectionId}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Se cargaron ${data.length} productos para sección ${sectionId}`);
      
      // Verificar que realmente tengamos datos
      if (data.length > 0) {
        console.log("Primeros productos:", data.slice(0, 2));
      }
      
      // Actualizar estado con los productos cargados
      setProducts(prev => ({
        ...prev,
        [sectionId]: data
      }));
      
      // Actualizar sección con conteos de productos si corresponde
      const foundCategoryId = findCategoryIdForSection(sectionId);
      if (foundCategoryId !== null) {
        const visibleProductsCount = data.filter((p: Product) => p.status === 1).length;
        
        setSections(prev => {
          const updated = { ...prev };
          if (updated[foundCategoryId]) {
            updated[foundCategoryId] = updated[foundCategoryId].map(s => 
              s.section_id === sectionId 
                ? {
                    ...s,
                    products_count: data.length,
                    visible_products_count: visibleProductsCount
                  } 
                : s
            );
          }
          return updated;
        });
      }
      
      // Verificar que los nombres de los productos estén bien
      const sectionNames = data.map((s: Product) => s.name);
      console.log(`Nombres de productos recibidos para sección ${sectionId}:`, sectionNames.join(", "));
      
      return data;
    } catch (error) {
      console.error(`❌ Error al cargar productos para sección ${sectionId}:`, error);
      toast.error("Error al cargar los productos");
      return [];
    }
  }, []);
  
  // Funciones de ayuda
  const findCategoryIdForSection = useCallback((sectionId: number): number | null => {
    for (const [categoryId, categorySections] of Object.entries(sections)) {
      if (categorySections.some(s => s.section_id === sectionId)) {
        return parseInt(categoryId);
      }
    }
    return null;
  }, [sections]);
  
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
    sections: sectionsFromHook || sections,
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
"use client";

/**
 * @fileoverview Hook principal para la gestión del estado del dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  DashboardState, 
  DashboardActions
} from '@/app/dashboard-v2/types';
import useCategoryManagement from './useCategoryManagement';
import useSectionManagement from './useSectionManagement';
import useProductManagement from './useProductManagement';

// Definición de tipos inline para evitar dependencias externas
interface Client {
  id?: number;
  client_id?: number;
  name?: string;
  business_name?: string;
  main_logo?: string | null;
  status?: number;
}

interface Category {
  category_id: number;
  client_id?: number;
  name: string;
  description?: string;
  display_order?: number;
  status: number;
  sections_count?: number;
  visible_sections_count?: number;
}

interface Section {
  section_id: number;
  category_id: number;
  name: string;
  description?: string;
  display_order?: number;
  status: number;
  products_count?: number;
  visible_products_count?: number;
  image?: string;
}

interface Product {
  product_id: number;
  section_id: number;
  name: string;
  description?: string;
  price: number;
  display_order?: number;
  status: number;
  image?: string;
}

interface DataState {
  client: Client | null;
  categories: Category[];
  sections: Record<string, Section[]>;
  products: Record<string, Product[]>;
  expandedCategories: Record<number, boolean>;
  expandedSections: Record<number, boolean>;
  selectedCategory: Category | null;
  selectedSection: Section | null;
  selectedProduct: Product | null;
  isLoading: boolean;
  isSectionsLoading: boolean;
  isProductsLoading: boolean;
  error: string | null;
  isUpdatingVisibility: number | null;
  isUpdatingOrder: boolean;
}

/**
 * Hook personalizado para gestionar los datos y las operaciones del dashboard
 */
export default function useDashboardState(clientId?: number) {
  // Estados
  const [client, setClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<{ [key: string]: Section[] }>({});
  const [products, setProducts] = useState<{ [key: string]: Product[] }>({});
  
  // Estados de UI
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isSectionsLoading, setIsSectionsLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar categorías
  const fetchCategories = useCallback(async (options?: { page?: number; limit?: number; forceRefresh?: boolean }) => {
    const forceRefresh = options?.forceRefresh || false;
    
    if (!forceRefresh && categories.length > 0) {
      console.log('📦 Categorías ya cargadas, evitando recarga duplicada');
      return categories;
    }

    console.log('🔄 Iniciando carga de categorías' + (forceRefresh ? ' (FORZADA)' : '') + '...');
    setIsLoading(true);

    try {
      // Añadir timestamp para evitar caché en refreshes forzados
      let url = forceRefresh
        ? `/api/categories?_t=${Date.now()}`
        : '/api/categories';

      console.log(`🔍 Solicitando categorías desde: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error al cargar categorías: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Se cargaron ${data.length} categorías${forceRefresh ? ' (refresco forzado)' : ''}`);

      // Normalizar el estado para UI
      const normalizedCategories = data.map((cat: Category) => ({
        ...cat,
        status: typeof cat.status === 'boolean' ?
          (cat.status ? 1 : 0) : Number(cat.status)
      }));

      setCategories(normalizedCategories);
      return normalizedCategories;
    } catch (error) {
      console.error('❌ Error en fetchCategories:', error);
      setError('Error al cargar categorías');
      toast.error('No se pudieron cargar las categorías');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [categories]);

  // Función para encontrar a qué categoría pertenece una sección
  const findCategoryIdForSection = useCallback((sectionId: number): number | null => {
    for (const [categoryId, categorySections] of Object.entries(sections)) {
      if (categorySections.some(s => s.section_id === sectionId)) {
        return parseInt(categoryId);
      }
    }
    return null;
  }, [sections]);

  // Cargar secciones por categoría
  const fetchSectionsByCategory = useCallback(async (categoryId: number) => {
    if (!categoryId) {
      console.error("❌ ID de categoría inválido:", categoryId);
      return [];
    }

    console.log(`🔄 Cargando secciones para categoría ${categoryId}...`);

    // Verificar si ya tenemos las secciones en caché
    if (sections[categoryId.toString()] && sections[categoryId.toString()].length > 0) {
      console.log(`📦 Secciones ya cargadas para categoría ${categoryId}, evitando recarga`);
      return sections[categoryId.toString()];
    }

    setIsSectionsLoading(true);

    try {
      const response = await fetch(`/api/sections?category_id=${categoryId}`);

      if (!response.ok) {
        throw new Error(`Error al cargar secciones: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let sectionsData = Array.isArray(data) ? data : data.sections || data.data || [];
      
      // Normalizar las secciones
      const processedSections = sectionsData.map((section: any) => ({
        ...section,
        section_id: section.section_id,
        id: section.section_id,
        status: typeof section.status === 'boolean' ? (section.status ? 1 : 0) : Number(section.status),
        category_id: section.category_id,
        products_count: section.products_count || 0,
        visible_products_count: section.visible_products_count || 0
      }));

      // Actualizar el estado
      setSections(prev => ({
        ...prev,
        [categoryId.toString()]: processedSections
      }));

      console.log(`✅ Se cargaron ${processedSections.length} secciones para categoría ${categoryId}`);
      return processedSections;
    } catch (error) {
      console.error(`❌ Error al cargar secciones para categoría ${categoryId}:`, error);
      setError(`Error al cargar secciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      toast.error('No se pudieron cargar las secciones');
      return [];
    } finally {
      setIsSectionsLoading(false);
    }
  }, [sections]);

  // Cargar productos por sección
  const fetchProductsBySection = useCallback(async (sectionId: number) => {
    if (!sectionId) {
      console.error("❌ ID de sección inválido:", sectionId);
      return [];
    }

    console.log(`🔄 Cargando productos para sección ${sectionId}...`);

    // Verificar si ya tenemos los productos en caché
    if (products[sectionId.toString()] && products[sectionId.toString()].length > 0) {
      console.log(`📦 Productos ya cargados para sección ${sectionId}, evitando recarga`);
      return products[sectionId.toString()];
    }

    setIsProductsLoading(true);

    try {
      const response = await fetch(`/api/products?sectionId=${sectionId}`);

      if (!response.ok) {
        throw new Error(`Error al cargar productos: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Normalizar los productos
      const processedProducts = data.map((product: any) => ({
        ...product,
        product_id: product.product_id,
        id: product.product_id,
        status: typeof product.status === 'boolean' ? (product.status ? 1 : 0) : Number(product.status),
        section_id: sectionId,
        price: product.price !== null ? parseFloat(product.price) : 0,
        display_order: product.display_order || 0
      }));

      // Actualizar el estado
      setProducts(prev => ({
        ...prev,
        [sectionId.toString()]: processedProducts
      }));

      console.log(`✅ Se cargaron ${processedProducts.length} productos para sección ${sectionId}`);
      return processedProducts;
    } catch (error) {
      console.error(`❌ Error al cargar productos para sección ${sectionId}:`, error);
      setError(`Error al cargar productos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      toast.error('No se pudieron cargar los productos');
      return [];
    } finally {
      setIsProductsLoading(false);
    }
  }, [products]);

  // Cambiar visibilidad de una categoría
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
      return true;
    } catch (error) {
      console.error('❌ Error al cambiar visibilidad:', error);
      toast.error('No se pudo cambiar la visibilidad');
      return false;
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, []);

  // Cambiar visibilidad de una sección
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
          updated[categoryId] = updated[categoryId]?.map(section =>
            section.section_id === sectionId ? { ...section, status: newStatus } : section
          ) || [];
        });
        return updated;
      });

      toast.success(newStatus === 1 ? 'Sección visible' : 'Sección oculta');
      return true;
    } catch (error) {
      console.error('❌ Error al cambiar visibilidad de sección:', error);
      toast.error('No se pudo cambiar la visibilidad');
      return false;
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, []);

  // Cambiar visibilidad de un producto
  const toggleProductVisibility = useCallback(async (productId: number, currentStatus: number, sectionId: number) => {
    setIsUpdatingVisibility(productId);

    try {
      const newStatus = currentStatus === 1 ? 0 : 1;

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

      if (!response.ok) {
        throw new Error('Error al actualizar la visibilidad del producto');
      }

      // Actualizar estado local
      setProducts(prev => {
        const updated = { ...prev };
        const sectionKey = sectionId.toString();
        
        if (updated[sectionKey]) {
          updated[sectionKey] = updated[sectionKey].map(product =>
            product.product_id === productId ? { ...product, status: newStatus } : product
          );
        }
        
        return updated;
      });

      toast.success(newStatus === 1 ? 'Producto visible' : 'Producto oculto');
      return true;
    } catch (error) {
      console.error('❌ Error al cambiar visibilidad del producto:', error);
      toast.error('No se pudo cambiar la visibilidad');
      return false;
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, []);

  // Eliminar una categoría
  const deleteCategory = useCallback(async (categoryId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la categoría');
      }

      // Actualizar el estado local
      setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
      toast.success('Categoría eliminada correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      toast.error('No se pudo eliminar la categoría');
      return false;
    }
  }, []);

  // Eliminar una sección
  const deleteSection = useCallback(async (sectionId: number, categoryId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la sección');
      }

      // Actualizar el estado local
      setSections(prev => {
        const updated = { ...prev };
        const categoryKey = categoryId.toString();
        
        if (updated[categoryKey]) {
          updated[categoryKey] = updated[categoryKey].filter(section => 
            section.section_id !== sectionId
          );
        }
        
        return updated;
      });

      toast.success('Sección eliminada correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar sección:', error);
      toast.error('No se pudo eliminar la sección');
      return false;
    }
  }, []);

  // Eliminar un producto
  const deleteProduct = useCallback(async (productId: number, sectionId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      // Actualizar el estado local
      setProducts(prev => {
        const updated = { ...prev };
        const sectionKey = sectionId.toString();
        
        if (updated[sectionKey]) {
          updated[sectionKey] = updated[sectionKey].filter(product => 
            product.product_id !== productId
          );
        }
        
        return updated;
      });

      toast.success('Producto eliminado correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('No se pudo eliminar el producto');
      return false;
    }
  }, []);

  // Actualizar una sección
  const updateSection = useCallback(async (
    formData: FormData | any,
    sectionId: number,
    categoryId: number
  ): Promise<boolean> => {
    setIsSectionsLoading(true);

    try {
      let response;

      if (formData instanceof FormData) {
        response = await fetch('/api/sections', {
          method: 'PUT',
          body: formData
        });
      } else {
        response = await fetch('/api/sections', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      }

      if (!response.ok) {
        throw new Error('Error al actualizar la sección');
      }

      // Actualizar estado local
      const updatedSectionData = await response.json();
      
      setSections(prev => {
        const updated = { ...prev };
        const categoryKey = categoryId.toString();
        
        if (updated[categoryKey]) {
          updated[categoryKey] = updated[categoryKey].map(section =>
            section.section_id === sectionId ? { ...section, ...updatedSectionData } : section
          );
        }
        
        return updated;
      });

      toast.success('Sección actualizada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error al actualizar la sección:', error);
      toast.error('No se pudo actualizar la sección');
      return false;
    } finally {
      setIsSectionsLoading(false);
    }
  }, []);

  // Actualizar un producto
  const updateProduct = useCallback(async (
    formData: FormData | any,
    productId: number,
    sectionId: number
  ): Promise<boolean> => {
    setIsProductsLoading(true);

    try {
      let response;

      if (formData instanceof FormData) {
        response = await fetch('/api/products', {
          method: 'PUT',
          body: formData
        });
      } else {
        response = await fetch('/api/products', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      }

      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }

      // Actualizar estado local
      const updatedProductData = await response.json();
      
      setProducts(prev => {
        const updated = { ...prev };
        const sectionKey = sectionId.toString();
        
        if (updated[sectionKey]) {
          updated[sectionKey] = updated[sectionKey].map(product =>
            product.product_id === productId ? { ...product, ...updatedProductData } : product
          );
        }
        
        return updated;
      });

      toast.success('Producto actualizado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error al actualizar el producto:', error);
      toast.error('No se pudo actualizar el producto');
      return false;
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  // Crear una sección
  const createSection = useCallback(async (
    formData: FormData | any,
    categoryId: number
  ): Promise<boolean> => {
    setIsSectionsLoading(true);

    try {
      let response;

      if (formData instanceof FormData) {
        // Asegurar que el categoryId está en el FormData
        formData.append('category_id', categoryId.toString());
        
        response = await fetch('/api/sections', {
          method: 'POST',
          body: formData
        });
      } else {
        response = await fetch('/api/sections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            category_id: categoryId
          })
        });
      }

      if (!response.ok) {
        throw new Error('Error al crear la sección');
      }

      // Obtener la sección creada
      const newSection = await response.json();
      
      // Actualizar el estado local
      setSections(prev => {
        const updated = { ...prev };
        const categoryKey = categoryId.toString();
        
        if (!updated[categoryKey]) {
          updated[categoryKey] = [];
        }
        
        updated[categoryKey] = [...updated[categoryKey], newSection];
        return updated;
      });

      // Actualizar el contador de secciones en la categoría
      setCategories(prev => 
        prev.map(category => 
          category.category_id === categoryId 
            ? { 
                ...category, 
                sections_count: (category.sections_count || 0) + 1,
                visible_sections_count: newSection.status ? (category.visible_sections_count || 0) + 1 : (category.visible_sections_count || 0)
              } 
            : category
        )
      );

      toast.success('Sección creada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error al crear la sección:', error);
      toast.error('No se pudo crear la sección');
      return false;
    } finally {
      setIsSectionsLoading(false);
    }
  }, []);

  // Crear un producto
  const createProduct = useCallback(async (
    formData: FormData | any,
    sectionId: number
  ): Promise<boolean> => {
    setIsProductsLoading(true);

    try {
      let response;

      if (formData instanceof FormData) {
        // Asegurar que el sectionId está en el FormData
        formData.append('section_id', sectionId.toString());
        
        response = await fetch('/api/products', {
          method: 'POST',
          body: formData
        });
      } else {
        response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            section_id: sectionId
          })
        });
      }

      if (!response.ok) {
        throw new Error('Error al crear el producto');
      }

      // Obtener el producto creado
      const newProduct = await response.json();
      
      // Actualizar el estado local
      setProducts(prev => {
        const updated = { ...prev };
        const sectionKey = sectionId.toString();
        
        if (!updated[sectionKey]) {
          updated[sectionKey] = [];
        }
        
        updated[sectionKey] = [...updated[sectionKey], newProduct];
        return updated;
      });

      // Actualizar los contadores de la sección
      const categoryId = findCategoryIdForSection(sectionId);
      if (categoryId) {
        setSections(prev => {
          const updated = { ...prev };
          const categoryKey = categoryId.toString();
          
          if (updated[categoryKey]) {
            updated[categoryKey] = updated[categoryKey].map(section => 
              section.section_id === sectionId 
                ? { 
                    ...section, 
                    products_count: (section.products_count || 0) + 1,
                    visible_products_count: newProduct.status ? (section.visible_products_count || 0) + 1 : (section.visible_products_count || 0) 
                  } 
                : section
            );
          }
          
          return updated;
        });
      }

      toast.success('Producto creado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error al crear el producto:', error);
      toast.error('No se pudo crear el producto');
      return false;
    } finally {
      setIsProductsLoading(false);
    }
  }, [findCategoryIdForSection]);

  // Handlers de UI
  const handleCategoryClick = useCallback(async (category: Category) => {
    const categoryId = category.category_id;
    console.log(`👆 Clic en categoría: ${category.name} (${categoryId})`);

    // Actualizar selección
    setSelectedCategory(category);

    // Cargar secciones si no están cargadas
    if (!sections[categoryId.toString()] || sections[categoryId.toString()].length === 0) {
      await fetchSectionsByCategory(categoryId);
    }

    // Toggle estado de expansión
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, [expandedCategories, fetchSectionsByCategory, sections]);

  const handleSectionClick = useCallback(async (sectionId: number) => {
    console.log(`👆 Clic en sección ID: ${sectionId}`);

    // Toggle estado de expansión
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));

    // Buscar la sección y su categoría
    const categoryId = findCategoryIdForSection(sectionId);
    if (!categoryId) {
      console.error("❌ No se pudo encontrar la categoría para esta sección");
      return;
    }

    // Encontrar el objeto sección
    const categoryIdStr = categoryId.toString();
    const section = sections[categoryIdStr]?.find(s => s.section_id === sectionId);
    if (!section) {
      console.error("❌ No se pudo encontrar la sección");
      return;
    }

    // Actualizar selección
    setSelectedSection(section);

    // Cargar productos
    await fetchProductsBySection(sectionId);
  }, [expandedSections, fetchProductsBySection, findCategoryIdForSection, sections]);

  // Añadir la función createCategory
  const createCategory = useCallback(async (formData: FormData | any): Promise<boolean> => {
    setIsLoading(true);
    console.log('🔄 Creando nueva categoría...');
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear categoría: ${response.status} ${response.statusText}`);
      }
      
      const newCategory = await response.json();
      console.log('✅ Categoría creada correctamente');
      
      // Actualizar el estado local
      setCategories(prev => [...prev, {
        ...newCategory,
        status: typeof newCategory.status === 'boolean' ? 
          (newCategory.status ? 1 : 0) : Number(newCategory.status)
      }]);
      
      toast.success('Categoría creada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error al crear categoría:', error);
      setError('Error al crear categoría');
      toast.error('No se pudo crear la categoría');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Añadir la función updateCategory
  const updateCategory = useCallback(async (categoryId: number, formData: FormData | any): Promise<boolean> => {
    setIsLoading(true);
    console.log(`🔄 Actualizando categoría ${categoryId}...`);
    
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar categoría: ${response.status} ${response.statusText}`);
      }
      
      const updatedCategory = await response.json();
      console.log('✅ Categoría actualizada correctamente');
      
      // Actualizar el estado local
      setCategories(prev => prev.map(cat => 
        cat.category_id === categoryId ? {
          ...cat,
          ...updatedCategory,
          status: typeof updatedCategory.status === 'boolean' ? 
            (updatedCategory.status ? 1 : 0) : Number(updatedCategory.status)
        } : cat
      ));
      
      toast.success('Categoría actualizada correctamente');
      return true;
    } catch (error) {
      console.error(`❌ Error al actualizar categoría ${categoryId}:`, error);
      setError('Error al actualizar categoría');
      toast.error('No se pudo actualizar la categoría');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Retornar todos los estados y funciones necesarios
  return {
    // Estados
    client,
    categories,
    sections,
    products,
    expandedCategories,
    expandedSections,
    selectedCategory,
    selectedSection,
    selectedProduct,
    isLoading,
    isSectionsLoading,
    isProductsLoading,
    isUpdatingVisibility,
    isUpdatingOrder,
    error,

    // Setters
    setCategories,
    setSections,
    setProducts,
    setExpandedCategories,
    setExpandedSections,
    setSelectedCategory,
    setSelectedSection,
    setSelectedProduct,

    // Carga de datos
    fetchClientData,
    fetchCategories,
    fetchSectionsByCategory,
    fetchProductsBySection,
    findCategoryIdForSection,
    
    // Operaciones CRUD
    toggleCategoryVisibility,
    toggleSectionVisibility,
    toggleProductVisibility,
    deleteCategory,
    deleteSection,
    deleteProduct,
    updateSection,
    updateProduct,
    createSection,
    createProduct,
    
    // Handlers de UI
    handleCategoryClick,
    handleSectionClick,

    // Añadir la función createCategory
    createCategory,

    // Añadir la función updateCategory
    updateCategory
  };
}
"use client";

import { useState, useCallback } from 'react';

// Interfaces para los datos
interface Client {
  id: number;
  name: string;
  logo?: string;
  mainLogo?: string;
}

interface Category {
  id: number;
  name: string;
  image?: string;
  order: number;
  visible: boolean;
}

interface Section {
  id: number;
  name: string;
  image?: string;
  order: number;
  visible: boolean;
}

interface Product {
  product_id: number;
  name: string;
  description?: string;
  price: string | number;
  image: string | null;
  display_order: number;
  status: number;
  section_id: number;
  client_id: number;
}

// Estado global del dashboard
interface DashboardState {
  client: Client | null;
  categories: Category[];
  sections: { [categoryId: number]: Section[] };
  products: { [sectionId: number]: Product[] };
  selectedCategory: Category | null;
  selectedSection: Section | null;
  expandedCategories: { [key: number]: boolean };
  currentView: 'categories' | 'sections' | 'products';
  isLoading: boolean;
  isSectionsLoading: boolean;
  isUpdatingVisibility: boolean;
  error: string | null;
  loadingSections: { [key: number]: boolean };
  isReorderModeActive: boolean;
}

// Acciones que se pueden realizar
interface DashboardActions {
  setClient: (client: Client) => void;
  setCategories: (categories: Category[]) => void;
  setSections: (sections: { [key: number]: Section[] }) => void;
  setProducts: (products: Product[]) => void;
  setSelectedCategory: (category: Category | null) => void;
  setSelectedSection: (section: Section | null) => void;
  setExpandedCategories: (expandedCategories: { [key: number]: boolean }) => void;
  setCurrentView: (view: 'categories' | 'sections' | 'products') => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSectionsLoading: (isLoading: boolean) => void;
  setIsUpdatingVisibility: (isUpdating: boolean) => void;
  setError: (error: string | null) => void;
  setLoadingSections: (loadingSections: { [key: number]: boolean }) => void;
  setIsReorderModeActive: (isActive: boolean) => void;
  
  // Acciones complejas
  handleCategoryClick: (category: Category) => void;
  handleSectionClick: (section: Section) => void;
  toggleCategoryVisibility: (categoryId: number) => Promise<void>;
  toggleSectionVisibility: (sectionId: number) => Promise<void>;
  toggleProductVisibility: (productId: number) => Promise<void>;
  reorderCategories: (categories: Category[]) => Promise<void>;
  reorderSections: (sections: Section[]) => Promise<void>;
  reorderProducts: (products: Product[]) => Promise<void>;
  resetView: () => void;
}

// Hook para manejar el estado del dashboard
export function useDashboardState() {
  // Estado del dashboard
  const [state, setState] = useState<DashboardState>({
    client: null,
    categories: [],
    sections: {},
    products: {},
    selectedCategory: null,
    selectedSection: null,
    expandedCategories: {},
    currentView: 'categories',
    isLoading: false,
    isSectionsLoading: false,
    isUpdatingVisibility: false,
    error: null,
    loadingSections: {},
    isReorderModeActive: false
  });

  // Setters básicos
  const setClient = useCallback((client: Client) => {
    setState(prev => ({ ...prev, client }));
  }, []);

  const setCategories = useCallback((categories: Category[]) => {
    setState(prev => ({ ...prev, categories }));
  }, []);

  const setSections = useCallback((sections: { [key: number]: Section[] }) => {
    setState(prev => ({ ...prev, sections }));
  }, []);

  const setProducts = useCallback((products: Product[]) => {
    if (!state.selectedSection) return;
    
    const sectionId = state.selectedSection.id;
    setState(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [sectionId]: products
      }
    }));
  }, [state.selectedSection]);

  const setSelectedCategory = useCallback((selectedCategory: Category | null) => {
    setState(prev => ({ ...prev, selectedCategory }));
  }, []);

  const setSelectedSection = useCallback((selectedSection: Section | null) => {
    setState(prev => ({ ...prev, selectedSection }));
  }, []);

  const setExpandedCategories = useCallback((expandedCategories: { [key: number]: boolean }) => {
    setState(prev => ({ ...prev, expandedCategories }));
  }, []);

  const setCurrentView = useCallback((currentView: 'categories' | 'sections' | 'products') => {
    setState(prev => ({ ...prev, currentView }));
  }, []);

  const setIsLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setIsSectionsLoading = useCallback((isSectionsLoading: boolean) => {
    setState(prev => ({ ...prev, isSectionsLoading }));
  }, []);

  const setIsUpdatingVisibility = useCallback((isUpdatingVisibility: boolean) => {
    setState(prev => ({ ...prev, isUpdatingVisibility }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLoadingSections = useCallback((loadingSections: { [key: number]: boolean }) => {
    setState(prev => ({ ...prev, loadingSections }));
  }, []);

  const setIsReorderModeActive = useCallback((isReorderModeActive: boolean) => {
    setState(prev => ({ ...prev, isReorderModeActive }));
  }, []);

  // Acciones complejas
  const handleCategoryClick = useCallback(async (category: Category) => {
    try {
      setSelectedCategory(category);
      setSelectedSection(null);
      setCurrentView('sections');
      
      // Expandir categoría
      setState(prev => ({
        ...prev,
        expandedCategories: {
          ...prev.expandedCategories,
          [category.id]: true
        }
      }));
      
      // Si no hay secciones cargadas para esta categoría, cargarlas
      if (!state.sections[category.id] || state.sections[category.id].length === 0) {
        // Actualizar estado de carga
        setState(prev => ({
          ...prev,
          loadingSections: {
            ...prev.loadingSections,
            [category.id]: true
          }
        }));
        
        // Hacer fetch de secciones
        const response = await fetch(`/api/sections?categoryId=${category.id}`);
        
        if (!response.ok) {
          throw new Error(`Error al cargar secciones: ${response.status}`);
        }
        
        const sectionsData = await response.json();
        
        // Actualizar secciones para esta categoría
        setState(prev => ({
          ...prev,
          sections: {
            ...prev.sections,
            [category.id]: sectionsData
          },
          loadingSections: {
            ...prev.loadingSections,
            [category.id]: false
          }
        }));
      }
    } catch (error: any) {
      console.error('Error al cargar secciones:', error);
      setError(error.message || 'Error al cargar secciones');
      setState(prev => ({
        ...prev,
        loadingSections: {
          ...prev.loadingSections,
          [category.id]: false
        }
      }));
    }
  }, [state.sections, setSelectedCategory, setSelectedSection, setCurrentView, setError]);

  const handleSectionClick = useCallback(async (section: Section) => {
    try {
      setSelectedSection(section);
      setCurrentView('products');
      
      // Si no hay productos cargados para esta sección, cargarlos
      if (!state.products[section.id] || state.products[section.id].length === 0) {
        setIsLoading(true);
        
        // Hacer fetch de productos
        const response = await fetch(`/api/products?sectionId=${section.id}`);
        
        if (!response.ok) {
          throw new Error(`Error al cargar productos: ${response.status}`);
        }
        
        const productsData = await response.json();
        
        // Actualizar productos para esta sección
        setState(prev => ({
          ...prev,
          products: {
            ...prev.products,
            [section.id]: productsData
          }
        }));
        
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Error al cargar productos:', error);
      setError(error.message || 'Error al cargar productos');
      setIsLoading(false);
    }
  }, [state.products, setSelectedSection, setCurrentView, setIsLoading, setError]);

  const toggleCategoryVisibility = useCallback(async (categoryId: number) => {
    try {
      setIsUpdatingVisibility(true);
      
      // Encontrar la categoría
      const category = state.categories.find(c => c.id === categoryId);
      if (!category) return;
      
      // Invertir visibilidad
      const newVisibility = !category.visible;
      
      // Actualizar en API
      const response = await fetch(`/api/categories/${categoryId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visible: newVisibility })
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar visibilidad: ${response.status}`);
      }
      
      // Actualizar estado local
      setCategories(state.categories.map(c => 
        c.id === categoryId ? { ...c, visible: newVisibility } : c
      ));
      
      setIsUpdatingVisibility(false);
    } catch (error: any) {
      console.error('Error al cambiar visibilidad de categoría:', error);
      setError(error.message || 'Error al cambiar visibilidad');
      setIsUpdatingVisibility(false);
    }
  }, [state.categories, setIsUpdatingVisibility, setCategories, setError]);

  const toggleSectionVisibility = useCallback(async (sectionId: number) => {
    try {
      setIsUpdatingVisibility(true);
      
      if (!state.selectedCategory) return;
      
      // Encontrar la sección
      const section = state.sections[state.selectedCategory.id]?.find(s => s.id === sectionId);
      if (!section) return;
      
      // Invertir visibilidad
      const newVisibility = !section.visible;
      
      // Actualizar en API
      const response = await fetch(`/api/sections/${sectionId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visible: newVisibility })
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar visibilidad: ${response.status}`);
      }
      
      // Actualizar estado local
      if (state.selectedCategory) {
        setSections({
          ...state.sections,
          [state.selectedCategory.id]: state.sections[state.selectedCategory.id].map(s => 
            s.id === sectionId ? { ...s, visible: newVisibility } : s
          )
        });
      }
      
      setIsUpdatingVisibility(false);
    } catch (error: any) {
      console.error('Error al cambiar visibilidad de sección:', error);
      setError(error.message || 'Error al cambiar visibilidad');
      setIsUpdatingVisibility(false);
    }
  }, [state.selectedCategory, state.sections, setIsUpdatingVisibility, setSections, setError]);

  const toggleProductVisibility = useCallback(async (productId: number) => {
    try {
      if (!state.selectedSection) return;
      
      const sectionId = state.selectedSection.id;
      const products = state.products[sectionId] || [];
      const product = products.find(p => p.product_id === productId);
      
      if (!product) return;
      
      setIsUpdatingVisibility(true);
      
      // Llamar a la API para actualizar visibilidad
      const response = await fetch(`/api/products/${productId}/visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: product.status ? 0 : 1 })
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar visibilidad: ${response.status}`);
      }
      
      // Actualizar estado local
      const updatedProducts = products.map(p => 
        p.product_id === productId ? { ...p, status: p.status ? 0 : 1 } : p
      );
      
      setState(prev => ({
        ...prev,
        products: {
          ...prev.products,
          [sectionId]: updatedProducts
        }
      }));
      
      setIsUpdatingVisibility(false);
    } catch (error: any) {
      console.error('Error al actualizar visibilidad:', error);
      setError(error.message || 'Error al actualizar visibilidad del producto');
      setIsUpdatingVisibility(false);
    }
  }, [state.selectedSection, state.products, setIsUpdatingVisibility, setError]);

  const reorderCategories = useCallback(async (categories: Category[]) => {
    try {
      setIsLoading(true);
      
      // Actualizar orden en API
      const response = await fetch('/api/categories/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categories: categories.map((c, index) => ({ id: c.id, order: index + 1 })) })
      });
      
      if (!response.ok) {
        throw new Error(`Error al reordenar categorías: ${response.status}`);
      }
      
      // Actualizar estado local
      setCategories(categories.map((c, index) => ({ ...c, order: index + 1 })));
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error al reordenar categorías:', error);
      setError(error.message || 'Error al reordenar categorías');
      setIsLoading(false);
    }
  }, [setIsLoading, setCategories, setError]);

  const reorderSections = useCallback(async (sections: Section[]) => {
    try {
      setIsLoading(true);
      
      if (!state.selectedCategory) return;
      
      // Actualizar orden en API
      const response = await fetch(`/api/sections/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          categoryId: state.selectedCategory.id,
          sections: sections.map((s, index) => ({ id: s.id, order: index + 1 })) 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al reordenar secciones: ${response.status}`);
      }
      
      // Actualizar estado local
      setSections({
        ...state.sections,
        [state.selectedCategory.id]: sections.map((s, index) => ({ ...s, order: index + 1 }))
      });
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error al reordenar secciones:', error);
      setError(error.message || 'Error al reordenar secciones');
      setIsLoading(false);
    }
  }, [state.selectedCategory, state.sections, setIsLoading, setSections, setError]);

  const reorderProducts = useCallback(async (products: Product[]) => {
    try {
      if (!state.selectedSection) return;
      
      const sectionId = state.selectedSection.id;
      setIsLoading(true);
      
      // Llamar a la API para reordenar
      const response = await fetch(`/api/sections/${sectionId}/products/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: products.map(p => ({ id: p.product_id, order: p.display_order })) })
      });
      
      if (!response.ok) {
        throw new Error(`Error al reordenar productos: ${response.status}`);
      }
      
      // Actualizar estado local
      setState(prev => ({
        ...prev,
        products: {
          ...prev.products,
          [sectionId]: products
        }
      }));
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error al reordenar productos:', error);
      setError(error.message || 'Error al reordenar productos');
      setIsLoading(false);
    }
  }, [state.selectedSection, setIsLoading, setError]);

  const resetView = useCallback(() => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSelectedSection(null);
  }, [setCurrentView, setSelectedCategory, setSelectedSection]);

  // Construir el objeto de acciones
  const actions: DashboardActions = {
    setClient,
    setCategories,
    setSections,
    setProducts,
    setSelectedCategory,
    setSelectedSection,
    setExpandedCategories,
    setCurrentView,
    setIsLoading,
    setIsSectionsLoading,
    setIsUpdatingVisibility,
    setError,
    setLoadingSections,
    setIsReorderModeActive,
    handleCategoryClick,
    handleSectionClick,
    toggleCategoryVisibility,
    toggleSectionVisibility,
    toggleProductVisibility,
    reorderCategories,
    reorderSections,
    reorderProducts,
    resetView
  };

  // Retornar el estado y las acciones
  return {
    ...state,
    actions
  };
} 
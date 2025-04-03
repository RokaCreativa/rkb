"use client";

import { useState, useCallback } from 'react';
import { Category, Section, Product, Client } from '@/app/types/menu';
import { toast } from 'react-hot-toast';

export interface DashboardState {
  client: Client | null;
  categories: Category[];
  sections: { [key: string]: Section[] };
  products: { [key: string]: Product[] };
  selectedCategory: Category | null;
  selectedSection: Section | null;
  expandedCategories: { [key: number]: boolean };
  currentView: 'categories' | 'sections' | 'products';
  isLoading: boolean;
  isSectionsLoading: boolean;
  isUpdatingVisibility: number | null;
  error: string | null;
  loadingSections: { [key: number]: boolean };
  isReorderModeActive: boolean;
}

export interface DashboardActions {
  setClient: (client: Client | null) => void;
  setCategories: (categories: Category[]) => void;
  setSections: (sections: { [key: string]: Section[] }) => void;
  setProducts: (products: { [key: string]: Product[] }) => void;
  setSelectedCategory: (category: Category | null) => void;
  setSelectedSection: (section: Section | null) => void;
  setExpandedCategories: (expandedCategories: { [key: number]: boolean }) => void;
  setCurrentView: (view: 'categories' | 'sections' | 'products') => void;
  toggleCategoryExpansion: (categoryId: number) => void;
  handleCategoryClick: (category: Category) => Promise<void>;
  handleSectionClick: (section: Section) => void;
  toggleReorderMode: () => void;
  fetchClientData: () => Promise<Client | null>;
  fetchCategories: () => Promise<Category[]>;
  fetchSectionsByCategory: (categoryId: number) => Promise<Section[]>;
  fetchProductsBySection: (sectionId: number) => Promise<Product[]>;
  toggleCategoryVisibility: (categoryId: number, status: number) => Promise<void>;
}

export default function useDashboardState(clientId: number | null = null): DashboardState & DashboardActions {
  // Estados principales
  const [client, setClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<{ [key: string]: Section[] }>({});
  const [products, setProducts] = useState<{ [key: string]: Product[] }>({});
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: number]: boolean }>({});
  const [currentView, setCurrentView] = useState<'categories' | 'sections' | 'products'>('categories');
  
  // Estados de carga y errores
  const [isLoading, setIsLoading] = useState(true);
  const [isSectionsLoading, setIsSectionsLoading] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingSections, setLoadingSections] = useState<{ [key: number]: boolean }>({});
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);
  
  // Funciones para obtener datos
  const fetchClientData = useCallback(async (): Promise<Client | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/client');
      if (!response.ok) {
        throw new Error(`Error al cargar datos del cliente: ${response.status}`);
      }
      
      const clientData = await response.json();
      setClient(clientData);
      return clientData;
    } catch (error) {
      console.error('Error al cargar datos del cliente:', error);
      setError('Error al cargar datos del cliente');
      toast.error('No se pudieron cargar los datos del cliente');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchCategories = useCallback(async (): Promise<Category[]> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`Error al cargar categorías: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data);
      return data;
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setError('Error al cargar categorías');
      toast.error('No se pudieron cargar las categorías');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchSectionsByCategory = useCallback(async (categoryId: number): Promise<Section[]> => {
    setLoadingSections(prev => ({ ...prev, [categoryId]: true }));
    try {
      const response = await fetch(`/api/sections?category_id=${categoryId}`);
      if (!response.ok) {
        throw new Error(`Error al cargar secciones: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Normalizar valores de status
      const normalizedSections = data.map((section: Section) => ({
        ...section,
        status: typeof section.status === 'boolean' ? (section.status ? 1 : 0) : (section.status === 1 ? 1 : 0)
      }));
      
      // Actualizar el estado
      setSections(prev => ({
        ...prev,
        [categoryId]: normalizedSections
      }));
      
      return normalizedSections;
    } catch (error) {
      console.error(`Error al cargar secciones para categoría ${categoryId}:`, error);
      toast.error('Error al cargar secciones');
      return [];
    } finally {
      setLoadingSections(prev => ({ ...prev, [categoryId]: false }));
    }
  }, []);
  
  const fetchProductsBySection = useCallback(async (sectionId: number): Promise<Product[]> => {
    try {
      const response = await fetch(`/api/products?section_id=${sectionId}`);
      if (!response.ok) {
        throw new Error(`Error al cargar productos: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Actualizar el estado
      setProducts(prev => ({
        ...prev,
        [sectionId]: data
      }));
      
      return data;
    } catch (error) {
      console.error(`Error al cargar productos para sección ${sectionId}:`, error);
      toast.error('Error al cargar productos');
      return [];
    }
  }, []);
  
  // Funciones de manipulación de estado
  const toggleCategoryExpansion = useCallback((categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);
  
  const handleCategoryClick = useCallback(async (category: Category): Promise<void> => {
    // Establecer la categoría seleccionada
    setSelectedCategory(category);
    setSelectedSection(null);
    
    // Expandir la categoría
    setExpandedCategories(prev => ({
      ...prev,
      [category.category_id]: true
    }));
    
    // Cambiar la vista a secciones
    setCurrentView('sections');
    
    // Cargar secciones si no están cargadas
    if (!sections[category.category_id] || sections[category.category_id].length === 0) {
      await fetchSectionsByCategory(category.category_id);
    }
  }, [sections, fetchSectionsByCategory]);
  
  const handleSectionClick = useCallback((section: Section) => {
    setSelectedSection(section);
    setCurrentView('products');
    
    // Cargar productos si no están cargados
    if (!products[section.section_id.toString()] || products[section.section_id.toString()].length === 0) {
      fetchProductsBySection(section.section_id);
    }
  }, [products, fetchProductsBySection]);
  
  const toggleReorderMode = useCallback(() => {
    setIsReorderModeActive(prev => !prev);
  }, []);
  
  const toggleCategoryVisibility = useCallback(async (categoryId: number, status: number): Promise<void> => {
    setIsUpdatingVisibility(categoryId);
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar visibilidad: ${response.status}`);
      }
      
      // Actualizar el estado local
      setCategories(prev => prev.map(category => 
        category.category_id === categoryId ? { ...category, status } : category
      ));
      
      toast.success(`Categoría ${status === 1 ? 'visible' : 'oculta'}`);
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error);
      toast.error('Error al cambiar visibilidad');
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, []);
  
  return {
    // Estado
    client,
    categories,
    sections,
    products,
    selectedCategory,
    selectedSection,
    expandedCategories,
    currentView,
    isLoading,
    isSectionsLoading,
    isUpdatingVisibility,
    error,
    loadingSections,
    isReorderModeActive,
    
    // Acciones
    setClient,
    setCategories,
    setSections,
    setProducts,
    setSelectedCategory,
    setSelectedSection,
    setExpandedCategories,
    setCurrentView,
    toggleCategoryExpansion,
    handleCategoryClick,
    handleSectionClick,
    toggleReorderMode,
    fetchClientData,
    fetchCategories,
    fetchSectionsByCategory,
    fetchProductsBySection,
    toggleCategoryVisibility
  };
} 

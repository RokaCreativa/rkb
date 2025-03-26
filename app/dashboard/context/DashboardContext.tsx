/**
 * Contexto del Dashboard
 * Gestiona el estado global del dashboard y proporciona funcionalidades compartidas
 * 
 * @author Claude
 * @version 1.0.0
 * @updated 2024-03-27
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

// Importar los tipos necesarios
import { Category, Section, Product, Client } from '@/app/types/menu';

// Extender Client para incluir id
interface DashboardClient extends Client {
  id: number;
  logo?: string | null;
  name: string;
  main_logo: string | null;
}

// Definir la interfaz para el contexto
interface DashboardContextType {
  // Estado
  client: DashboardClient | null;
  categories: Category[];
  sections: Record<string, Section[]>;
  products: Record<string, Product[]>;
  
  // Estado de navegación
  currentView: 'categories' | 'sections' | 'products';
  selectedCategory: Category | null;
  selectedSection: Section | null;
  
  // Estado de UI
  isLoading: boolean;
  error: string | null;
  expandedCategories: Record<number, boolean>;
  expandedSections: Record<number, boolean>;
  
  // Funciones de navegación
  navigateToCategory: (categoryId: number) => void;
  navigateToSection: (sectionId: number) => void;
  navigateBack: () => void;
  
  // Funciones para actualizar el estado
  setCategories: (categories: Category[]) => void;
  setSections: (sections: Record<string, Section[]>) => void;
  setProducts: (products: Record<string, Product[]>) => void;
  
  // Funciones para expandir/colapsar
  toggleCategoryExpanded: (categoryId: number) => void;
  toggleSectionExpanded: (sectionId: number) => void;
}

// Crear el contexto con un valor inicial
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Definir el proveedor del contexto
interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<DashboardClient | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [error, setError] = useState<string | null>(null);
  
  // Estado de navegación
  const [currentView, setCurrentView] = useState<'categories' | 'sections' | 'products'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  
  // Estado de expansión para categorías y secciones
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  
  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      if (status !== 'authenticated') return;
      
      setIsLoading(true);
      try {
        // Cargar datos del cliente
        const clientResponse = await fetch('/api/client');
        if (!clientResponse.ok) throw new Error('Error al cargar datos del cliente');
        const clientData = await clientResponse.json();
        setClient(clientData);
        
        // Cargar categorías
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) throw new Error('Error al cargar categorías');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
        // Establecer la primera categoría como seleccionada inicialmente
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos iniciales');
        toast.error('Error al cargar los datos del dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [status]);
  
  // Funciones de navegación
  const navigateToCategory = (categoryId: number) => {
    const category = categories.find(c => c.category_id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setCurrentView('sections');
      
      // Si no tenemos las secciones cargadas, expandir la categoría para cargarlas
      if (!sections[categoryId]) {
        toggleCategoryExpanded(categoryId);
      }
    }
  };
  
  const navigateToSection = (sectionId: number) => {
    if (!selectedCategory) return;
    
    const section = sections[selectedCategory.category_id]?.find(s => s.section_id === sectionId);
    if (section) {
      setSelectedSection(section);
      setCurrentView('products');
      
      // Si no tenemos los productos cargados, expandir la sección para cargarlos
      if (!products[sectionId]) {
        toggleSectionExpanded(sectionId);
      }
    }
  };
  
  const navigateBack = () => {
    if (currentView === 'products') {
      setCurrentView('sections');
    } else if (currentView === 'sections') {
      setCurrentView('categories');
    }
  };
  
  // Funciones para expandir/colapsar categorías y secciones
  const toggleCategoryExpanded = async (categoryId: number) => {
    const isExpanded = expandedCategories[categoryId];
    
    // Actualizar estado de expansión
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !isExpanded
    }));
    
    // Si estamos expandiendo y no tenemos las secciones, cargarlas
    if (!isExpanded && !sections[categoryId]) {
      try {
        const response = await fetch(`/api/sections?category_id=${categoryId}`);
        if (!response.ok) throw new Error('Error al cargar secciones');
        const sectionsData = await response.json();
        
        setSections(prev => ({
          ...prev,
          [categoryId]: sectionsData
        }));
      } catch (error) {
        console.error('Error al cargar secciones:', error);
        toast.error('Error al cargar las secciones');
      }
    }
  };
  
  const toggleSectionExpanded = async (sectionId: number) => {
    const isExpanded = expandedSections[sectionId];
    
    // Actualizar estado de expansión
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !isExpanded
    }));
    
    // Si estamos expandiendo y no tenemos los productos, cargarlos
    if (!isExpanded && !products[sectionId]) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products?section_id=${sectionId}`);
        if (!response.ok) throw new Error('Error al cargar productos');
        const productsData = await response.json();
        
        // Asegurarnos de que productsData es un array
        const productsArray = Array.isArray(productsData) ? productsData : [];
        
        setProducts(prev => ({
          ...prev,
          [sectionId]: productsArray
        }));
      } catch (error) {
        console.error('Error al cargar productos:', error);
        toast.error('Error al cargar los productos');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Preparar el valor del contexto
  const contextValue: DashboardContextType = {
    // Estado
    client,
    categories,
    sections,
    products,
    
    // Estado de navegación
    currentView,
    selectedCategory,
    selectedSection,
    
    // Estado de UI
    isLoading,
    error,
    expandedCategories,
    expandedSections,
    
    // Funciones de navegación
    navigateToCategory,
    navigateToSection,
    navigateBack,
    
    // Funciones para actualizar el estado
    setCategories,
    setSections,
    setProducts,
    
    // Funciones para expandir/colapsar
    toggleCategoryExpanded,
    toggleSectionExpanded,
  };
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard debe usarse dentro de un DashboardProvider');
  }
  return context;
};

export default DashboardContext; 
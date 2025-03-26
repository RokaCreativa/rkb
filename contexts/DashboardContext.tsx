/**
 * @fileoverview Contexto para gestionar el estado global del dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, Section, Product, Client } from '@/app/types/menu';
import { useDashboardSections, useDashboardProducts, useDashboardService } from '@/lib/hooks/dashboard';
import { toast } from 'react-hot-toast';

type ViewType = 'categories' | 'sections' | 'products';

interface DashboardContextType {
  // Estado
  client: Client | null;
  categories: Category[];
  sections: Record<string, Section[]>;
  products: Record<string, Product[]>;
  expandedCategories: Record<number, boolean>;
  expandedSections: Record<number, boolean>;
  currentView: ViewType;
  selectedCategory: Category | null;
  selectedSection: Section | null;
  isUpdatingVisibility: number | null;
  
  // Acciones
  setClient: (client: Client | null) => void;
  setCategories: (categories: Category[]) => void;
  setSections: (sections: Record<string, Section[]>) => void;
  setProducts: (products: Record<string, Product[]>) => void;
  toggleCategoryExpansion: (categoryId: number) => void;
  toggleSectionExpansion: (sectionId: number) => void;
  setCurrentView: (view: ViewType) => void;
  setSelectedCategory: (category: Category | null) => void;
  setSelectedSection: (section: Section | null) => void;
  setIsUpdatingVisibility: (id: number | null) => void;
  
  // Navegación
  navigateToCategories: () => void;
  navigateToSections: (category: Category) => void;
  navigateToProducts: (section: Section) => void;
  navigateBack: () => void;
}

// Crear el contexto con valores por defecto
const DashboardContext = createContext<DashboardContextType>({
  // Estado
  client: null,
  categories: [],
  sections: {},
  products: {},
  expandedCategories: {},
  expandedSections: {},
  currentView: 'categories',
  selectedCategory: null,
        selectedSection: null,
  isUpdatingVisibility: null,
  
  // Acciones
  setClient: () => {},
  setCategories: () => {},
  setSections: () => {},
  setProducts: () => {},
  toggleCategoryExpansion: () => {},
  toggleSectionExpansion: () => {},
  setCurrentView: () => {},
  setSelectedCategory: () => {},
  setSelectedSection: () => {},
  setIsUpdatingVisibility: () => {},
  
  // Navegación
  navigateToCategories: () => {},
  navigateToSections: () => {},
  navigateToProducts: () => {},
  navigateBack: () => {},
});

// Props para el proveedor del contexto
interface DashboardProviderProps {
  children: ReactNode;
  initialClient?: Client | null;
  initialCategories?: Category[];
}

// Proveedor del contexto
export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
  initialClient = null,
  initialCategories = []
}) => {
  // Estado
  const [client, setClient] = useState<Client | null>(initialClient);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [currentView, setCurrentView] = useState<ViewType>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  
  // Hooks para secciones y productos
  const dashboardSections = useDashboardSections({
    onSuccess: () => {
      // Opcional: Acciones después de operaciones exitosas
    },
    onError: (error: Error) => {
      console.error('Error en operación de secciones:', error);
      toast.error('Error al procesar secciones');
    }
  });
  
  const dashboardProducts = useDashboardProducts({
    onSuccess: () => {
      // Opcional: Acciones después de operaciones exitosas
    },
    onError: (error: Error) => {
      console.error('Error en operación de productos:', error);
      toast.error('Error al procesar productos');
    }
  });
  
  const dashboardService = useDashboardService();
  
  // Funciones para expandir/contraer categorías y secciones
  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  const toggleSectionExpansion = (sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Funciones de navegación
  const navigateToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSelectedSection(null);
  };
  
  const navigateToSections = (category: Category) => {
    setSelectedCategory(category);
    setCurrentView('sections');
    setSelectedSection(null);
    
    // Cargar secciones si no están cargadas
    if (!sections[category.category_id] && client?.id) {
      dashboardSections.fetchSections(category.category_id, client.id)
        .then((fetchedSections: Section[]) => {
          setSections(prev => ({
            ...prev,
            [category.category_id]: fetchedSections
          }));
        })
        .catch((error: Error) => {
          console.error('Error al cargar secciones:', error);
          toast.error('Error al cargar secciones');
        });
    }
  };
  
  const navigateToProducts = (section: Section) => {
    setSelectedSection(section);
    setCurrentView('products');
    
    // Cargar productos si no están cargados
    if (!products[section.section_id]) {
      dashboardProducts.fetchProducts(section.section_id)
        .then((fetchedProducts: Product[]) => {
          setProducts(prev => ({
            ...prev,
            [section.section_id]: fetchedProducts
          }));
        })
        .catch((error: Error) => {
          console.error('Error al cargar productos:', error);
          toast.error('Error al cargar productos');
        });
    }
  };
  
  const navigateBack = () => {
    if (currentView === 'products' && selectedCategory) {
      setCurrentView('sections');
      setSelectedSection(null);
    } else if (currentView === 'sections') {
      setCurrentView('categories');
      setSelectedCategory(null);
    }
  };
  
  // Valor del contexto
  const contextValue: DashboardContextType = {
    // Estado
    client,
    categories,
    sections,
    products,
    expandedCategories,
    expandedSections,
    currentView,
    selectedCategory,
    selectedSection,
    isUpdatingVisibility,
    
    // Acciones
    setClient,
    setCategories,
    setSections,
    setProducts,
    toggleCategoryExpansion,
    toggleSectionExpansion,
    setCurrentView,
    setSelectedCategory,
    setSelectedSection,
    setIsUpdatingVisibility,
    
    // Navegación
    navigateToCategories,
    navigateToSections,
    navigateToProducts,
    navigateBack,
  };
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook para utilizar el contexto
export const useDashboard = () => useContext(DashboardContext);

export default DashboardContext; 

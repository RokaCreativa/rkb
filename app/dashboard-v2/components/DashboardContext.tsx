"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Category, Section } from '@/app/types/menu';

// Definir la interfaz del contexto
interface DashboardContextType {
  // Estado
  categories: Category[];
  sections: { [key: string]: Section[] };
  selectedCategory: Category | null;
  selectedSection: Section | null;
  expandedCategories: { [key: number]: boolean };
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  setCategories: (categories: Category[]) => void;
  setSections: (sections: { [key: string]: Section[] }) => void;
  setSelectedCategory: (category: Category | null) => void;
  setSelectedSection: (section: Section | null) => void;
  setExpandedCategories: (expanded: { [key: number]: boolean }) => void;
  
  // Operaciones
  handleCategoryClick: (category: Category) => Promise<void>;
  handleSectionClick: (section: Section) => void;
  fetchCategories: () => Promise<Category[]>;
  fetchSectionsByCategory: (categoryId: number) => Promise<Section[]>;
}

// Crear el contexto
const DashboardContext = createContext<DashboardContextType | null>(null);

// Hook para usar el contexto
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard debe ser usado dentro de un DashboardProvider');
  }
  return context;
};

// Proveedor del contexto
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const clientId = session?.user?.client_id;
  
  // Estado
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<{ [key: string]: Section[] }>({});
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar categorías
  const fetchCategories = async (): Promise<Category[]> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error(`Error al cargar categorías: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data);
      return data;
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('No se pudieron cargar las categorías');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cargar secciones para una categoría
  const fetchSectionsByCategory = async (categoryId: number): Promise<Section[]> => {
    try {
      const response = await fetch(`/api/sections?category_id=${categoryId}`);
      
      if (!response.ok) {
        throw new Error(`Error al cargar secciones: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Normalizar los valores de status
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
    } catch (err) {
      console.error(`Error al cargar secciones para categoría ${categoryId}:`, err);
      return [];
    }
  };
  
  // Manejar clic en categoría
  const handleCategoryClick = async (category: Category): Promise<void> => {
    setSelectedCategory(category);
    setExpandedCategories(prev => ({
      ...prev,
      [category.category_id]: true
    }));
    
    // Cargar secciones si no están cargadas
    if (!sections[category.category_id] || sections[category.category_id].length === 0) {
      await fetchSectionsByCategory(category.category_id);
    }
  };
  
  // Manejar clic en sección
  const handleSectionClick = (section: Section): void => {
    setSelectedSection(section);
  };
  
  // Cargar datos iniciales
  useEffect(() => {
    if (session && session.user) {
      fetchCategories();
    }
  }, [session]);
  
  // Valor del contexto
  const contextValue: DashboardContextType = {
    // Estado
    categories,
    sections,
    selectedCategory,
    selectedSection,
    expandedCategories,
    isLoading,
    error,
    
    // Acciones
    setCategories,
    setSections,
    setSelectedCategory,
    setSelectedSection,
    setExpandedCategories,
    
    // Operaciones
    handleCategoryClick,
    handleSectionClick,
    fetchCategories,
    fetchSectionsByCategory
  };
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
} 
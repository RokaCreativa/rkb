"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useDataState from '../hooks/useDataState';
import { Category, Section, Product } from '@/app/types/menu';

// Crear el contexto
const DashboardContext = createContext<any>(null);

// Hook para usar el contexto
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard debe ser usado dentro de un DashboardState');
  }
  return context;
};

// Componente que proporciona el estado
export default function DashboardState({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const clientId = session?.user?.client_id;
  
  // Usar el hook de datos
  const dataState = useDataState(clientId || null);
  
  // Estados adicionales específicos del dashboard
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{[key: number]: boolean}>({});
  
  // Cargar datos iniciales cuando cambia el cliente
  useEffect(() => {
    if (clientId) {
      dataState.fetchClientData().catch(console.error);
      dataState.fetchCategories().catch(console.error);
    }
  }, [clientId, dataState.fetchClientData, dataState.fetchCategories]);
  
  // Manejar clic en categoría
  const handleCategoryClick = async (category: Category) => {
    console.log(`[DashboardState] Clic en categoría: ${category.name} (${category.category_id})`);
    
    // Siempre establecer la categoría seleccionada
    setSelectedCategory(category);
    
    // Expandir la categoría si no está expandida
    setExpandedCategories(prev => ({
      ...prev,
      [category.category_id]: true
    }));
    
    // Cargar secciones si no están cargadas
    const categoryId = category.category_id;
    const sections = dataState.sections[categoryId];
    
    if (!sections || sections.length === 0) {
      console.log(`[DashboardState] Cargando secciones para categoría: ${categoryId}`);
      try {
        await dataState.fetchSectionsByCategory(categoryId);
        console.log(`[DashboardState] Secciones cargadas con éxito para categoría: ${categoryId}`);
      } catch (error) {
        console.error(`[DashboardState] Error al cargar secciones:`, error);
      }
    } else {
      console.log(`[DashboardState] Usando secciones ya cargadas (${sections.length}) para categoría: ${categoryId}`);
    }
  };
  
  // Valor del contexto
  const contextValue = {
    ...dataState,
    selectedCategory,
    setSelectedCategory,
    selectedSection,
    setSelectedSection,
    expandedCategories,
    setExpandedCategories,
    handleCategoryClick
  };
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
} 
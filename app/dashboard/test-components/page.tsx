"use client";

/**
 * Página de prueba para componentes refactorizados del dashboard
 */
import React, { useEffect, useState } from 'react';
import { CategoryActions, SectionActions, ProductActions, BackButton } from '../components/actions';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import { Category, Section, Client } from '@/app/types/menu';

// Componente interno que utiliza el contexto
function DashboardTest() {
  const {
    client,
    categories,
    currentView,
    selectedCategory,
    selectedSection,
    navigateToCategories,
    navigateToSections,
    navigateToProducts,
    navigateBack,
    setCategories,
    setClient
  } = useDashboard();

  // Efecto para cargar datos de prueba
  useEffect(() => {
    // Simular carga de datos
    const mockClient: Client = {
      id: 1,
      name: 'Restaurante de Prueba',
      main_logo: null,
      status: 1
    };

    const mockCategories: Category[] = [
      { category_id: 1, name: 'Entrantes', client_id: 1, display_order: 1, status: 1, image: null },
      { category_id: 2, name: 'Platos Principales', client_id: 1, display_order: 2, status: 1, image: null },
      { category_id: 3, name: 'Postres', client_id: 1, display_order: 3, status: 1, image: null }
    ];

    setClient(mockClient);
    setCategories(mockCategories);
  }, [setClient, setCategories]);

  // Manejar acciones
  const handleNewCategory = () => {
    alert('Crear nueva categoría');
  };

  const handleNewSection = () => {
    alert('Crear nueva sección en: ' + selectedCategory?.name);
  };

  const handleNewProduct = () => {
    alert('Crear nuevo producto en: ' + selectedSection?.name);
  };

  // Renderizar según la vista actual
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test de Componentes Dashboard</h1>
      
      {/* Navegación */}
      <div className="mb-4 flex items-center gap-2">
        <BackButton onClick={navigateBack} />
        <span className="text-gray-500">
          {currentView === 'categories' ? 'Categorías' : 
           currentView === 'sections' ? `Categoría: ${selectedCategory?.name}` : 
           `Sección: ${selectedSection?.name}`}
        </span>
      </div>

      {/* Componentes según la vista */}
      {currentView === 'categories' && (
        <>
          <CategoryActions onNewCategory={handleNewCategory} />
          <ul className="bg-white shadow rounded-lg divide-y">
            {categories.map(category => (
              <li key={category.category_id} className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigateToSections(category)}>
                {category.name}
              </li>
            ))}
          </ul>
        </>
      )}

      {currentView === 'sections' && selectedCategory && (
        <>
          <SectionActions categoryName={selectedCategory.name} onNewSection={handleNewSection} />
          <p className="text-gray-500 mb-4">No hay secciones disponibles para mostrar.</p>
        </>
      )}

      {currentView === 'products' && selectedSection && (
        <>
          <ProductActions sectionName={selectedSection.name} onNewProduct={handleNewProduct} />
          <p className="text-gray-500 mb-4">No hay productos disponibles para mostrar.</p>
        </>
      )}
    </div>
  );
}

// Página principal que envuelve el componente con el proveedor de contexto
export default function TestComponentsPage() {
  return (
    <DashboardProvider>
      <DashboardTest />
    </DashboardProvider>
  );
} 
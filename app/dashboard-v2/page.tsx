"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Loader } from "../components/ui/loader";
import { TopNavbar } from "./components/TopNavbar";
import { Breadcrumbs } from "./components/Breadcrumbs";
import FloatingPhonePreview from "@/components/FloatingPhonePreview";
import { getImagePath } from '@/lib/imageUtils';

// Tipos básicos
import { Category, Section, Product, Client } from "@/app/types/menu";

// Hooks
import useDataState from './hooks/useDataState';
import CategoryTable from "./components/CategoryTable";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'categories' | 'sections' | 'products'>('categories');

  // Estados para modales
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);

  // Usar el hook de estado de datos
  const {
    categories,
    sections,
    products,
    expandedCategories,
    expandedSections,
    selectedCategory,
    selectedSection,
    isLoading,
    isUpdatingVisibility,
    setIsLoading,
    
    // Funciones
    fetchCategories,
    handleCategoryClick,
    handleSectionClick,
    toggleCategoryVisibility,
    toggleSectionVisibility
  } = useDataState();

  // Cargar datos del cliente
  const fetchClientData = async () => {
    try {
      const response = await fetch('/api/client');
      if (!response.ok) {
        throw new Error('Error al cargar datos del cliente');
      }
      const data = await response.json();
      console.log("Cliente cargado:", data);
      setClient(data);
      return data;
    } catch (error) {
      console.error("Error al cargar el cliente:", error);
      setError("No se pudo cargar la información del cliente");
      return null;
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      if (status === "authenticated") {
        setIsLoading(true);
        try {
          console.log("🚀 Iniciando carga de datos iniciales...");
          
          // Paso 1: Cargar datos del cliente
          const clientData = await fetchClientData();
          if (!clientData) {
            throw new Error("No se pudo cargar la información del cliente");
          }
          console.log("✅ Cliente cargado:", clientData.name);
          
          // Paso 2: Cargar categorías
          const categoriesData = await fetchCategories();
          if (!categoriesData || categoriesData.length === 0) {
            console.log("ℹ️ No hay categorías disponibles");
          } else {
            console.log(`✅ ${categoriesData.length} categorías cargadas`);
          }
          
        } catch (error) {
          console.error("❌ Error inicializando datos:", error);
          setError("No se pudieron cargar los datos iniciales");
        } finally {
          setIsLoading(false);
          console.log("🏁 Carga inicial completada");
        }
      }
    };

    loadInitialData();
  }, [status, fetchCategories, setIsLoading]);

  // Función para editar una categoría
  const handleEditCategory = (category: Category) => {
    toast('Editar categoría - Funcionalidad en desarrollo');
  };

  // Función para eliminar una categoría
  const handleDeleteCategory = (categoryId: number) => {
    toast('Eliminar categoría - Funcionalidad en desarrollo');
  };

  // Función para agregar una sección
  const handleAddSection = (categoryId: number) => {
    setShowNewSectionModal(true);
  };

  // Función para editar una sección
  const handleEditSection = (section: Section) => {
    toast('Editar sección - Funcionalidad en desarrollo');
  };

  // Función para eliminar una sección
  const handleDeleteSection = (section: Section) => {
    toast('Eliminar sección - Funcionalidad en desarrollo');
  };

  // Función para agregar un producto
  const handleAddProduct = (sectionId: number) => {
    setShowNewProductModal(true);
  };

  // Renderizado condicional basado en el estado
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size="lg" text="Verificando autenticación..." />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No autorizado</h2>
          <p className="text-gray-600">Por favor, inicia sesión para acceder al dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // Generar items para breadcrumbs
  const getBreadcrumbItems = () => {
    const items = [
      { 
        id: 'categories', 
        name: 'Categorías', 
        onClick: () => setCurrentView('categories'), 
        current: currentView === 'categories' 
      }
    ];
    
    if (currentView === 'sections' && selectedCategory) {
      items.push({ 
        id: `category-${selectedCategory.category_id}`, 
        name: selectedCategory.name, 
        onClick: () => {}, 
        current: true 
      });
    }
    
    return items;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNavbar />
      
      <div className="max-w-6xl mx-auto pt-2">
        {/* Acciones superiores */}
        <div className="flex justify-between items-center mb-6 px-4">
          <Breadcrumbs items={getBreadcrumbItems()} />
          <button
            onClick={() => {
              // Activar la vista previa
              const event = new CustomEvent('toggle-preview');
              window.dispatchEvent(event);
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <DevicePhoneMobileIcon className="h-4 w-4 mr-1" />
            Live Preview
          </button>
        </div>
        
        {/* Título de la sección */}
        <div className="px-4 mb-4">
          <h2 className="text-xl font-medium text-gray-700">Tus menús (Comidas, Bebidas, Postres, Etc)</h2>
          <div className="text-xs text-gray-500">{categories.length} Visibles</div>
        </div>
        
        {/* Botón para agregar nueva categoría */}
        <div className="px-4 mb-4">
          <button
            onClick={() => setShowNewCategoryModal(true)}
            className="w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="inline-block h-5 w-5 mr-1 -mt-1" />
            Nueva Categoría
          </button>
        </div>
        
        {/* Categorías */}
        <CategoryTable 
          categories={categories}
          sections={sections}
          expandedCategories={expandedCategories}
          isUpdatingVisibility={isUpdatingVisibility}
          onCategoryClick={handleCategoryClick}
          onToggleCategoryVisibility={toggleCategoryVisibility}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onAddSection={handleAddSection}
          onSectionClick={handleSectionClick}
          expandedSections={expandedSections}
          onToggleSectionVisibility={toggleSectionVisibility}
          onEditSection={handleEditSection}
          onDeleteSection={handleDeleteSection}
          onAddProduct={handleAddProduct}
        />
      </div>
      
      {/* Vista previa flotante */}
      <FloatingPhonePreview 
        clientName={client?.name} 
        clientLogo={client?.logoCompany || client?.logo}
        clientMainLogo={client?.logoMain || client?.main_logo}
        categories={categories
          .filter(cat => cat.status === 1)
          .map(cat => ({
            id: cat.category_id,
            category_id: cat.category_id,
            name: cat.name,
            image: cat.image || undefined,
            sections: sections[cat.category_id]?.filter(sec => sec.status === 1).map(sec => ({
              id: sec.section_id,
              name: sec.name,
              image: sec.image || undefined
            })) || []
          }))}
        selectedCategory={selectedCategory ? {
          id: selectedCategory.category_id,
          name: selectedCategory.name,
          image: selectedCategory.image || undefined
        } : null}
        selectedSection={selectedSection ? {
          id: selectedSection.section_id,
          name: selectedSection.name,
          image: selectedSection.image || undefined
        } : null}
      />
      
      {/* Modales */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Nueva Categoría</h2>
            <p className="text-gray-600 mb-4">Esta funcionalidad está en desarrollo</p>
            <button
              onClick={() => setShowNewCategoryModal(false)}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
      {showNewSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Nueva Sección</h2>
            <p className="text-gray-600 mb-4">Esta funcionalidad está en desarrollo</p>
            <button
              onClick={() => setShowNewSectionModal(false)}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

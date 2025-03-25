"use client";

/**
 * @fileoverview Componente para gestionar la navegación en el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 */

import React from 'react';
import { PlusIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Category, Section } from '@/app/types/menu';

// Importar la interfaz BreadcrumbItem directamente de Breadcrumbs
interface BreadcrumbItem {
  id: number | null | any;
  name: string;
  onClick?: () => void;
  current: boolean;
}

/**
 * Props para el componente DashboardNavigation
 * @property {BreadcrumbItem[]} breadcrumbItems - Elementos para las migas de pan
 * @property {'categories' | 'sections' | 'products'} currentView - Vista actual del dashboard
 * @property {Category | null} selectedCategory - Categoría seleccionada (si aplica)
 * @property {Section | null} selectedSection - Sección seleccionada (si aplica)
 * @property {Function} onNewCategory - Función para crear una nueva categoría
 * @property {Function} onNewSection - Función para crear una nueva sección
 * @property {Function} onNewProduct - Función para crear un nuevo producto
 * @property {Function} onTogglePreview - Función para mostrar/ocultar la vista previa
 */
interface DashboardNavigationProps {
  breadcrumbItems: BreadcrumbItem[];
  currentView: 'categories' | 'sections' | 'products';
  selectedCategory: Category | null;
  selectedSection: Section | null;
  onNewCategory: () => void;
  onNewSection: () => void;
  onNewProduct: () => void;
  onTogglePreview: () => void;
}

/**
 * Componente de navegación para el dashboard
 * 
 * Este componente muestra las migas de pan (breadcrumbs) y los botones de acción
 * correspondientes a la vista actual del dashboard.
 * 
 * @param {DashboardNavigationProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de navegación del dashboard
 */
const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  breadcrumbItems,
  currentView,
  selectedCategory,
  selectedSection,
  onNewCategory,
  onNewSection,
  onNewProduct,
  onTogglePreview
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 px-4">
      {/* Breadcrumbs */}
      <div>
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      
      {/* Botón de acción según la vista */}
      <div>
        {currentView === 'categories' && (
          <div className="flex items-center">
            <button
              onClick={onTogglePreview}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DevicePhoneMobileIcon className="h-4 w-4 mr-1" />
              Live Preview
            </button>
          </div>
        )}
        
        {currentView === 'sections' && selectedCategory && (
          <button
            onClick={onNewSection}
            className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Nueva Sección
          </button>
        )}
        
        {currentView === 'products' && selectedSection && (
          <button
            onClick={onNewProduct}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Nuevo Producto
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardNavigation; 
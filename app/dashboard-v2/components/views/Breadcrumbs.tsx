"use client";

/**
 * @fileoverview Componente de breadcrumbs para navegación en el dashboard
 * @author RokaMenu Team
 * @version 1.1.0
 * @updated 2024-07-28
 */

import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Category, Section } from "@/app/types/menu";
import { ViewType } from "@/app/dashboard-v2/types/dashboard";

/**
 * Props para el componente Breadcrumbs
 */
interface BreadcrumbsProps {
  currentView: ViewType;
  selectedCategory?: Category | null;
  selectedSection?: Section | null;
  onHomeClick: () => void;
  onCategoryClick: (category: Category) => void;
  onSectionClick: (section: Section) => void;
}

/**
 * Componente que muestra la ruta de navegación actual en el dashboard
 * 
 * Permite al usuario navegar fácilmente entre diferentes vistas: 
 * - Inicio (categorías)
 * - Categoría específica (secciones)
 * - Sección específica (productos)
 * 
 * Optimizado para ser responsivo en dispositivos móviles.
 * 
 * @param {BreadcrumbsProps} props - Propiedades del componente
 * @returns {JSX.Element} El componente de breadcrumbs
 */
export default function Breadcrumbs({
  currentView,
  selectedCategory,
  selectedSection,
  onHomeClick,
  onCategoryClick,
  onSectionClick
}: BreadcrumbsProps) {
  return (
    <nav className="flex mb-3 sm:mb-5 overflow-x-auto pb-1 hide-scrollbar" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 sm:space-x-3 flex-nowrap min-w-full">
        <li className="inline-flex items-center">
          <button
            onClick={onHomeClick}
            className={`inline-flex items-center text-sm font-medium touch-optimized py-2 px-2 sm:px-3 rounded-md ${
              currentView === 'CATEGORIES' 
                ? 'text-indigo-600 hover:text-indigo-800 bg-indigo-50' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-current={currentView === 'CATEGORIES' ? 'page' : undefined}
          >
            <HomeIcon className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate max-w-[80px] sm:max-w-none">Categorías</span>
          </button>
        </li>
        
        {currentView !== 'CATEGORIES' && selectedCategory && (
          <li>
            <div className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <button
                onClick={() => onCategoryClick(selectedCategory)}
                className={`ml-1 text-sm font-medium touch-optimized py-2 px-2 sm:px-3 rounded-md flex items-center ${
                  currentView === 'SECTIONS' 
                    ? 'text-indigo-600 hover:text-indigo-800 bg-indigo-50' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-current={currentView === 'SECTIONS' ? 'page' : undefined}
              >
                <span className="truncate max-w-[100px] sm:max-w-[200px]">{selectedCategory.name}</span>
              </button>
            </div>
          </li>
        )}
        
        {currentView === 'PRODUCTS' && selectedSection && (
          <li>
            <div className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <button
                onClick={() => onSectionClick(selectedSection)}
                className="ml-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 touch-optimized py-2 px-2 sm:px-3 rounded-md bg-indigo-50 flex items-center"
                aria-current="page"
              >
                <span className="truncate max-w-[100px] sm:max-w-[200px]">{selectedSection.name}</span>
              </button>
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
} 
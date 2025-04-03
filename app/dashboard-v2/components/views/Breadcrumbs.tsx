"use client";

/**
 * @fileoverview Componente de breadcrumbs para navegación en el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
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
  onNavigateToHome: () => void;
  onNavigateToCategory: (category: Category) => void;
  onNavigateToSection: (section: Section) => void;
}

/**
 * Componente que muestra la ruta de navegación actual en el dashboard
 * 
 * Permite al usuario navegar fácilmente entre diferentes vistas: 
 * - Inicio (categorías)
 * - Categoría específica (secciones)
 * - Sección específica (productos)
 * 
 * @param {BreadcrumbsProps} props - Propiedades del componente
 * @returns {JSX.Element} El componente de breadcrumbs
 */
export default function Breadcrumbs({
  currentView,
  selectedCategory,
  selectedSection,
  onNavigateToHome,
  onNavigateToCategory,
  onNavigateToSection
}: BreadcrumbsProps) {
  return (
    <nav className="flex mb-5" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <button
            onClick={onNavigateToHome}
            className={`inline-flex items-center text-sm font-medium ${
              currentView === 'CATEGORIES' 
                ? 'text-indigo-600 hover:text-indigo-800' 
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Categorías
          </button>
        </li>
        
        {currentView !== 'CATEGORIES' && selectedCategory && (
          <li>
            <div className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => onNavigateToCategory(selectedCategory)}
                className={`ml-1 text-sm font-medium ${
                  currentView === 'SECTIONS' 
                    ? 'text-indigo-600 hover:text-indigo-800' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {selectedCategory.name}
              </button>
            </div>
          </li>
        )}
        
        {currentView === 'PRODUCTS' && selectedSection && (
          <li>
            <div className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => onNavigateToSection(selectedSection)}
                className="ml-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                {selectedSection.name}
              </button>
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
} 
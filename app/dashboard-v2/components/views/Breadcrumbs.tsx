"use client";

/**
 * @fileoverview Componente de breadcrumbs para navegación en el dashboard
 * @author RokaMenu Team
 * @version 1.2.0
 * @updated 2025-04-11
 * @changelog Optimización completa para dispositivos móviles con diseño adaptativo
 */

import { useState, useEffect } from "react";
import { ChevronRightIcon, HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
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
 * Optimizado para ser plenamente responsivo con múltiples modos de visualización
 * según el tamaño de pantalla disponible.
 * 
 * En pantallas muy pequeñas (<350px), muestra un modo ultra compacto solo con iconos
 * y el elemento actual truncado.
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
  // Estado para detectar pantallas ultra pequeñas
  const [isUltraCompact, setIsUltraCompact] = useState(false);

  // Detectar pantallas muy pequeñas para activar modo ultra compacto
  useEffect(() => {
    const checkScreenSize = () => {
      setIsUltraCompact(window.innerWidth < 350);
    };

    // Comprobar al cargar y cuando cambie el tamaño
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Determinar el texto del elemento actual según la vista
  const getCurrentItemText = () => {
    if (currentView === 'CATEGORIES') return 'Categorías';
    if (currentView === 'SECTIONS' && selectedCategory) return selectedCategory.name;
    if (currentView === 'PRODUCTS' && selectedSection) return selectedSection.name;
    return '';
  };

  // Renderizar en modo ultra compacto para pantallas muy pequeñas
  if (isUltraCompact) {
    return (
      <nav className="flex mb-3 overflow-hidden" aria-label="Breadcrumb">
        <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-100 w-full">
          {/* Botón atrás contextual */}
          <button
            onClick={currentView === 'CATEGORIES' 
              ? onHomeClick 
              : (currentView === 'SECTIONS' && selectedCategory) 
                ? onHomeClick 
                : (currentView === 'PRODUCTS' && selectedSection) 
                  ? () => selectedCategory && onCategoryClick(selectedCategory)
                  : onHomeClick
            }
            className="p-3 flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-l-lg transition-colors"
            aria-label="Volver"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          
          {/* Separador visual */}
          <div className="h-6 w-px bg-gray-200 mx-1"></div>
          
          {/* Indicador de ubicación actual */}
          <div className="flex-1 px-3 py-2 truncate font-medium text-gray-800">
            {getCurrentItemText()}
          </div>
          
          {/* Indicador de nivel de profundidad */}
          <div className="px-3 py-2 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-r-lg">
            {currentView === 'CATEGORIES' ? '1' : currentView === 'SECTIONS' ? '2' : '3'}
          </div>
        </div>
      </nav>
    );
  }

  // Renderizar en modo estándar para pantallas normales
  return (
    <nav className="flex mb-3 sm:mb-5 overflow-x-auto pb-1 hide-scrollbar" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 sm:space-x-3 flex-nowrap min-w-full">
        <li className="inline-flex items-center">
          <button
            onClick={onHomeClick}
            className={`inline-flex items-center text-sm font-medium touch-optimized py-2 px-2 sm:px-3 rounded-md min-h-[44px] ${
              currentView === 'CATEGORIES' 
                ? 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 shadow-sm' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-current={currentView === 'CATEGORIES' ? 'page' : undefined}
          >
            <HomeIcon className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate max-w-[60px] xs:max-w-[80px] sm:max-w-none">Categorías</span>
          </button>
        </li>
        
        {currentView !== 'CATEGORIES' && selectedCategory && (
          <li>
            <div className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <button
                onClick={() => onCategoryClick(selectedCategory)}
                className={`ml-1 text-sm font-medium touch-optimized py-2 px-2 sm:px-3 rounded-md flex items-center min-h-[44px] ${
                  currentView === 'SECTIONS' 
                    ? 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 shadow-sm' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-current={currentView === 'SECTIONS' ? 'page' : undefined}
              >
                <span className="truncate max-w-[80px] xs:max-w-[100px] sm:max-w-[200px]">{selectedCategory.name}</span>
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
                className="ml-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 touch-optimized py-2 px-2 sm:px-3 rounded-md bg-indigo-50 flex items-center min-h-[44px] shadow-sm"
                aria-current="page"
              >
                <span className="truncate max-w-[80px] xs:max-w-[100px] sm:max-w-[200px]">{selectedSection.name}</span>
              </button>
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
} 
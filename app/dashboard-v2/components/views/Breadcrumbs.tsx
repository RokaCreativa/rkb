"use client";

/**
 * @fileoverview Componente de migas de pan (breadcrumbs) para navegación jerárquica
 * @description Muestra la ruta de navegación actual y permite regresar a niveles anteriores
 * @author RokaMenu Team
 * @version 1.2.0
 * @updated 2025-04-23 - Optimizado para vista móvil
 */

import React from 'react';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Category, Section } from "@/app/types/menu";
import { ViewType } from "@/app/dashboard-v2/types/dashboard";

/**
 * Props para el componente Breadcrumbs
 */
export interface BreadcrumbsProps {
  currentView: ViewType;
  selectedCategory?: Category | null;
  selectedSection?: Section | null;
  onHomeClick: () => void;
  onCategoryClick: (category: Category) => void;
  onSectionClick: (section: Section) => void;
  className?: string;
}

/**
 * Componente de migas de pan (breadcrumbs) para mostrar la navegación jerárquica
 * Incluye optimizaciones para vista móvil:
 * - Oculta el primer elemento (Home) en dispositivos pequeños
 * - Usa tamaños y espaciados optimizados para pantallas pequeñas
 * - Mantiene áreas táctiles suficientemente grandes
 */
export default function Breadcrumbs({
  currentView,
  selectedCategory,
  selectedSection,
  onHomeClick,
  onCategoryClick,
  onSectionClick,
  className = ''
}: BreadcrumbsProps) {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center space-x-2 md:space-x-4">
        {/* Home item - Categorías */}
        <li className="flex items-center">
          <div className="breadcrumb-home-item flex items-center">
            <button 
              onClick={onHomeClick}
              className={`text-sm font-medium ${
                currentView === "CATEGORIES" 
                  ? "text-indigo-600" 
                  : "text-gray-500 hover:text-indigo-600"
              } flex items-center`}
              aria-label="Inicio"
              aria-current={currentView === "CATEGORIES" ? "page" : undefined}
            >
              <HomeIcon className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only md:not-sr-only md:ml-2">Categorías</span>
            </button>
          </div>
        </li>

        {/* Category item */}
        {currentView !== "CATEGORIES" && selectedCategory && (
          <li className="flex items-center">
            <ChevronRightIcon
              className="h-4 w-4 shrink-0 text-gray-400"
              aria-hidden="true"
            />
            <div className={`ml-2 md:ml-4 ${currentView === "SECTIONS" ? "breadcrumb-current-item" : "breadcrumb-item"}`}>
              <button
                onClick={() => onCategoryClick(selectedCategory)}
                className={`text-sm font-medium ${
                  currentView === "SECTIONS" 
                    ? "text-indigo-600" 
                    : "text-gray-500 hover:text-indigo-600"
                }`}
                aria-current={currentView === "SECTIONS" ? "page" : undefined}
              >
                {selectedCategory.name}
              </button>
            </div>
          </li>
        )}

        {/* Section item */}
        {currentView === "PRODUCTS" && selectedSection && (
          <li className="flex items-center">
            <ChevronRightIcon
              className="h-4 w-4 shrink-0 text-gray-400"
              aria-hidden="true"
            />
            <div className="ml-2 md:ml-4 breadcrumb-current-item">
              <button
                onClick={() => onSectionClick(selectedSection)}
                className="text-sm font-medium text-indigo-600"
                aria-current="page"
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
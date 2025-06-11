"use client";

/**
 * @fileoverview Componente de vista para mostrar y gestionar las secciones de una categoría
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-20
 * 
 * Este componente proporciona una interfaz para ver y gestionar las secciones
 * dentro de una categoría específica, con funcionalidades para expandir y mostrar
 * los productos dentro de cada sección.
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { Category, Section, Product } from '@/app/types/menu';
import { CompatibleProduct } from '@/app/dashboard-v2/types/type-adapters';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import SectionList from '../domain/sections/SectionList';
import ProductList from '../domain/products/ProductList';
import { Loader } from '../ui/Loader';

/**
 * Props para el componente SectionView
 */
interface SectionViewProps {
  selectedCategory: Category;
  sections: Section[];
  products: Record<number, Product[]>;
  categoryName?: string;
  categoryId?: number;
  expandedSections?: { [key: number]: boolean };
  onBackToCategories: () => void;
  onAddSection: (categoryId?: number) => void;
  onSectionClick: (section: Section) => void;
  onToggleSectionVisibility: (sectionId: number, status: number, categoryId?: number) => Promise<void>;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: number) => void;
  isUpdatingVisibility: number | null;
  isReorderModeActive?: boolean;
  onAddProduct?: (sectionId: number) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onToggleProductVisibility?: (productId: number, status: number, sectionId?: number) => Promise<void>;
  isUpdatingProductVisibility?: number | null;
  onSectionReorder?: (categoryId: number, sourceIndex: number, destIndex: number) => void;
  onProductReorder?: (sectionId: number, sourceIndex: number, destIndex: number) => void;
  isLoading?: boolean;
  category?: Category;
}

/**
 * Componente SectionView - Muestra y gestiona las secciones de una categoría
 */
const SectionView: React.FC<SectionViewProps> = ({
  selectedCategory,
  sections,
  products,
  categoryName,
  categoryId,
  expandedSections = {},
  onBackToCategories,
  onAddSection,
  onSectionClick,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  isUpdatingVisibility,
  isReorderModeActive = false,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleProductVisibility,
  isUpdatingProductVisibility,
  onSectionReorder,
  onProductReorder,
  isLoading = false,
  category
}) => {
  const [expandedSectionsRecord, setExpandedSectionsRecord] = useState<Record<number, boolean>>({});
  const [expandedSectionIds, setExpandedSectionIds] = useState<number[]>([]);

  // Actualizar el registro de secciones expandidas cuando cambia el prop expandedSections
  useEffect(() => {
    if (expandedSections) {
      setExpandedSectionsRecord(expandedSections);
      setExpandedSectionIds(
        Object.entries(expandedSections)
          .filter(([, expanded]) => expanded)
          .map(([id]) => parseInt(id))
      );
    }
  }, [expandedSections]);

  // Si está cargando, mostrar indicador
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Si no hay secciones, mostrar mensaje
  if (sections.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={onBackToCategories}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" /> Volver a categorías
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{categoryName || "Comidas"}</h1>
          <button
            onClick={() => onAddSection(category?.category_id || selectedCategory.category_id)}
            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" /> Añadir sección
          </button>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No hay secciones</h2>
          <p className="text-gray-500 mb-4">Esta categoría no tiene secciones aún</p>
          <button
            onClick={() => onAddSection(category?.category_id || selectedCategory.category_id)}
            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5 inline mr-1" /> Añadir sección
          </button>
        </div>
      </div>
    );
  }

  // Manejar clics en secciones (para expandir/colapsar)
  const handleSectionClick = (section: Section) => {
    onSectionClick(section);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con navegación y botón de añadir */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBackToCategories}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Volver a categorías
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{categoryName || "Comidas"}</h1>
        <button
          onClick={() => onAddSection(category?.category_id || selectedCategory.category_id)}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" /> Añadir sección
        </button>
      </div>

      {/* Lista de secciones con soporte para drag & drop */}
      <SectionList
        sections={sections}
        onSectionClick={handleSectionClick}
        onToggleSectionVisibility={onToggleSectionVisibility}
        onEditSection={onEditSection}
        onDeleteSection={onDeleteSection}
        isUpdatingVisibility={isUpdatingVisibility}
        isReorderModeActive={isReorderModeActive}
        onSectionReorder={onSectionReorder}
        onProductReorder={onProductReorder}
        isLoading={isLoading}
        category={category}
      />
    </div>
  );
};

export default SectionView; 
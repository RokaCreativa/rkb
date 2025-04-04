"use client";

/**
 * @fileoverview Componente de vista para la visualización y gestión de secciones
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { PlusIcon } from "@heroicons/react/24/outline";
import { SectionTable } from "../SectionTable";
import { Category, Section, Product } from "@/app/types/menu";
import SectionList from '../sections/SectionList';

/**
 * Props para el componente SectionView
 */
interface SectionViewProps {
  sections: Section[];
  categoryName: string;
  categoryId: number;
  expandedSections?: { [key: number]: boolean };
  isUpdatingVisibility: number | null;
  onAddSection: () => void;
  onSectionClick: (section: Section) => void;
  onToggleSectionVisibility: (sectionId: number, currentStatus: number) => Promise<void>;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  onAddProduct: (sectionId: number) => void;
  products?: { [key: number]: Product[] };
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => Promise<void>;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  isUpdatingProductVisibility?: number | null;
  isLoading?: boolean;
  isReorderModeActive: boolean;
  handleReorderSection: (sectionId: number, newPosition: number) => void;
  selectedCategory?: Category;
}

/**
 * Componente que gestiona la visualización y acciones relacionadas con secciones
 * 
 * Esta vista centraliza la interacción con las secciones de una categoría específica, incluyendo:
 * - Lista de secciones con sus propiedades
 * - Acciones para añadir, editar y eliminar secciones
 * - Manejo de productos asociados a cada sección
 * - Delegación de eventos a los componentes padres a través de callbacks
 * 
 * @param {SectionViewProps} props - Propiedades del componente
 * @returns {JSX.Element} La vista de secciones renderizada
 */
export default function SectionView({
  sections,
  categoryName,
  categoryId,
  expandedSections = {},
  isUpdatingVisibility,
  onAddSection,
  onSectionClick,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  onAddProduct,
  products = {},
  onToggleProductVisibility,
  onEditProduct,
  onDeleteProduct,
  isUpdatingProductVisibility,
  isLoading = false,
  isReorderModeActive,
  handleReorderSection,
  selectedCategory
}: SectionViewProps) {
  // Adaptador para manejar la diferencia de tipos en onSectionClick
  const handleSectionClick = (sectionId: number) => {
    // Buscar la sección por id
    const section = sections.find(s => s.section_id === sectionId);
    if (section) {
      onSectionClick(section);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-gray-800">Secciones</h2>
          <span className="text-sm text-gray-500">
            ({sections.filter(s => s.status === 1).length}/{sections.length} visibles)
          </span>
        </div>
        <button
          type="button"
          onClick={onAddSection}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Añadir sección
        </button>
      </div>

      <SectionList
        sections={sections}
        expandedSections={expandedSections}
        onSectionClick={handleSectionClick}
        onAddSection={onAddSection}
        onToggleSectionVisibility={onToggleSectionVisibility}
        onEditSection={onEditSection}
        onDeleteSection={onDeleteSection}
        onAddProduct={onAddProduct}
        products={products}
        onToggleProductVisibility={onToggleProductVisibility}
        onEditProduct={onEditProduct}
        onDeleteProduct={onDeleteProduct}
        isUpdatingVisibility={isUpdatingVisibility}
        isUpdatingProductVisibility={isUpdatingProductVisibility}
      />

    </div>
  );
} 
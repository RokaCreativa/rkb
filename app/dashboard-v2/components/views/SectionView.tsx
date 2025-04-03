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
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Secciones: {categoryName}
        </h1>
        
        <button
          onClick={onAddSection}
          className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md shadow-sm"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Añadir sección
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40 bg-white rounded-lg border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <SectionTable
          sections={sections || []}
          expandedSections={expandedSections}
          onSectionClick={(sectionId) => {
            const section = sections.find(s => s.section_id === sectionId);
            if (section) {
              onSectionClick(section);
            }
          }}
          onToggleVisibility={onToggleSectionVisibility}
          onAddProduct={onAddProduct}
          onEditSection={onEditSection}
          onDeleteSection={onDeleteSection}
          isUpdatingVisibility={isUpdatingVisibility}
          categoryId={selectedCategory?.category_id || 0}
          isReorderModeActive={isReorderModeActive}
          onReorderSection={handleReorderSection}
          products={products || {}}
          onToggleProductVisibility={onToggleProductVisibility}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
          isUpdatingProductVisibility={isUpdatingProductVisibility}
          client={{}}
          loading={false}
          setLoading={() => {}}
          setSections={() => {}}
          setExpandedSections={() => {}}
          onEdit={onEditSection}
          handleAddProduct={(section) => onAddProduct(section.section_id)}
          setProducts={() => {}}
        />
      )}
    </>
  );
} 
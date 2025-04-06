"use client";

/**
 * @fileoverview Componente de vista para la visualización y gestión de secciones
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import React, { useState, useCallback, useEffect } from 'react';
import { PlusIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { Category, Section, Product } from "@/app/types/menu";
import SectionList from '../sections/SectionList';
import ProductList from '../sections/ProductList';
import { ProductTable } from '../ProductTable';

/**
 * Props para el componente SectionView
 */
interface SectionViewProps {
  category?: Category;
  sections: Section[];
  products: Record<number, Product[]>;
  categoryName?: string;
  categoryId?: number;
  expandedSections?: Record<number, boolean>;
  isReorderModeActive?: boolean;
  selectedCategory?: Category;
  handleReorderSection?: (sectionId: number, newPosition: number) => void;
  onAddSection: (categoryId?: number) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  onSectionClick?: (sectionId: number) => void;
  onAddProduct: (sectionId: number) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onToggleSectionVisibility: (sectionId: number, currentStatus: number) => void;
  onToggleProductVisibility: (productId: number, currentStatus: number, sectionId: number) => void;
  onSectionReorder?: (categoryId: number, sourceIndex: number, destinationIndex: number) => void;
  onProductReorder?: (sectionId: number, sourceIndex: number, destinationIndex: number) => void;
  isUpdatingVisibility?: number | null;
  isUpdatingProductVisibility?: number | null;
  isLoading?: boolean;
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
const SectionView: React.FC<SectionViewProps> = ({
  category,
  sections,
  products,
  categoryName,
  categoryId,
  expandedSections,
  isReorderModeActive,
  selectedCategory,
  handleReorderSection,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onSectionClick,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleSectionVisibility,
  onToggleProductVisibility,
  onSectionReorder,
  onProductReorder,
  isUpdatingVisibility,
  isUpdatingProductVisibility,
  isLoading
}) => {
  const [expandedSectionIds, setExpandedSectionIds] = useState<number[]>([]);

  const handleSectionClick = useCallback((sectionId: number) => {
    setExpandedSectionIds((prev) => {
      if (prev.includes(sectionId)) {
        return prev.filter((id) => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  }, []);

  // Convertir el array de secciones expandidas a un Record para SectionList
  const expandedSectionsRecord = expandedSectionIds.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {} as Record<number, boolean>);

  // Calcular contadores de productos visibles y totales
  const visibleProductsCounts: Record<number, number> = {};
  const totalProductsCounts: Record<number, number> = {};

  Object.entries(products).forEach(([sectionId, sectionProducts]) => {
    const sectionIdNum = parseInt(sectionId);
    visibleProductsCounts[sectionIdNum] = sectionProducts.filter(p => p.status === 1).length;
    totalProductsCounts[sectionIdNum] = sectionProducts.length;
  });

  // Expandir automáticamente si solo hay una sección
  useEffect(() => {
    if (sections.length === 1 && expandedSectionIds.length === 0) {
      setExpandedSectionIds([sections[0].section_id]);
    }
  }, [sections, expandedSectionIds.length]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => onAddSection(category?.category_id)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <PlusCircleIcon className="h-5 w-5 mr-1" />
          Agregar sección
        </button>
      </div>

      <SectionList
        sections={sections}
        expandedSections={expandedSectionsRecord}
        onSectionClick={handleSectionClick}
        onToggleSectionVisibility={onToggleSectionVisibility}
        onEditSection={onEditSection}
        onDeleteSection={onDeleteSection}
        onAddProduct={onAddProduct}
        products={Object.entries(products).reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, Product[]>)}
        isUpdatingVisibility={isUpdatingVisibility || null}
        isUpdatingProductVisibility={isUpdatingProductVisibility}
        categoryName={category?.name || "Comidas"}
        categoryId={category?.category_id}
        onSectionsReorder={
          category?.category_id && onSectionReorder
            ? (sourceIndex, destinationIndex) => {
                onSectionReorder(category.category_id, sourceIndex, destinationIndex);
              }
            : undefined
        }
      />

      {/* Productos de las secciones expandidas */}
      {expandedSectionIds.map((sectionId) => {
        const sectionProducts = products[sectionId] || [];
        const section = sections.find(s => s.section_id === sectionId);
        
        if (!section) return null;
        
        return (
          <div key={`section-products-${sectionId}`} className="mt-2 ml-4 pl-2 border-l-2 border-green-200">
            <ProductList
              sectionId={sectionId}
              products={sectionProducts}
              sectionName={section.name}
              onAddProduct={() => onAddProduct(sectionId)}
              onEditProduct={onEditProduct}
              onDeleteProduct={onDeleteProduct}
              onToggleProductVisibility={onToggleProductVisibility}
              isUpdatingProductVisibility={isUpdatingProductVisibility || null}
              onProductsReorder={
                onProductReorder ? 
                (sourceIndex: number, destinationIndex: number) => {
                  onProductReorder(sectionId, sourceIndex, destinationIndex);
                } : 
                undefined
              }
            />
          </div>
        );
      })}
    </div>
  );
};

export default SectionView; 
"use client";

import React from 'react';
import { Section, Product } from '@/app/types/menu';
import SectionList from './sections/SectionList';

interface SectionTableProps {
  sections: Section[];
  client?: any;
  loading?: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setSections?: React.Dispatch<React.SetStateAction<Record<string, Section[]>>>;
  expandedSections: Record<string, boolean>;
  setExpandedSections?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onEdit?: (section: Section) => void;
  onDelete?: (section: Section) => void;
  onToggleVisibility: (sectionId: number, currentStatus: number) => void | Promise<void>;
  isUpdatingVisibility: number | null;
  onSectionClick: (sectionId: number) => void;
  handleAddProduct?: (section: Section) => void;
  products: Record<string, Product[]>;
  setProducts?: React.Dispatch<React.SetStateAction<Record<string, Product[]>>>;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void | Promise<void>;
  isUpdatingProductVisibility?: number | null;
  categoryId: number;
  categoryName?: string;
  onAddProduct: (sectionId: number) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  isReorderModeActive?: boolean;
  onReorderSection?: (sourceIndex: number, destinationIndex: number) => void;
}

/**
 * SectionTable - Componente envoltorio que ahora utiliza SectionList internamente
 * Mantenemos este componente por compatibilidad con código existente
 */
export const SectionTable: React.FC<SectionTableProps> = ({
  sections,
  categoryName,
  categoryId,
  isUpdatingVisibility,
  expandedSections,
  onAddProduct,
  onSectionClick,
  onEditSection,
  onDeleteSection,
  onToggleVisibility,
  isReorderModeActive = false,
  onReorderSection,
  products,
  onToggleProductVisibility,
  onEditProduct,
  onDeleteProduct,
  isUpdatingProductVisibility = null
}) => {
  // Adaptador para la interfaz de SectionList
  const handleSectionClick = (sectionId: number) => {
    onSectionClick(sectionId);
  };

  // Adaptador para el reordenamiento de secciones
  const handleSectionsReorder = async (reorderedSections: Section[]) => {
    if (!onReorderSection) return;
    
    console.log("SectionTable - Recibida solicitud de reordenamiento:", reorderedSections);
    
    // Verificar que tengamos secciones para reordenar
    if (reorderedSections && reorderedSections.length > 0) {
      try {
        // Llamar directamente a la API para reordenar secciones
        const response = await fetch('/api/sections/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sections: reorderedSections.map(section => ({
              id: section.section_id,
              display_order: section.display_order
            }))
          }),
        });
        
        if (!response.ok) {
          throw new Error('Error al reordenar secciones');
        }
        
        console.log("Reordenamiento exitoso, notificando al componente padre");
        
        // Notificar al componente padre que el reordenamiento fue exitoso
        // usando la interfaz actual (que espera sourceIndex y destinationIndex)
        onReorderSection(0, 0);
        
      } catch (error) {
        console.error("Error al reordenar secciones:", error);
      }
    }
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 bg-white rounded-md border border-teal-200">
        No hay secciones disponibles
      </div>
    );
  }

  // Convertir el Record<string, boolean> a Record<number, boolean>
  const normalizedExpandedSections: Record<number, boolean> = {};
  Object.entries(expandedSections).forEach(([key, value]) => {
    normalizedExpandedSections[parseInt(key)] = value;
  });

  return (
    <SectionList
      sections={sections}
      expandedSections={normalizedExpandedSections}
      onSectionClick={handleSectionClick}
      onToggleSectionVisibility={onToggleVisibility}
      onEditSection={onEditSection}
      onDeleteSection={onDeleteSection}
      onAddProduct={onAddProduct}
      products={products}
      onToggleProductVisibility={onToggleProductVisibility}
      onEditProduct={onEditProduct}
      onDeleteProduct={onDeleteProduct}
      isUpdatingVisibility={isUpdatingVisibility}
      isUpdatingProductVisibility={isUpdatingProductVisibility}
      categoryName={categoryName}
      categoryId={categoryId}
      onSectionsReorder={onReorderSection ? handleSectionsReorder : undefined}
    />
  );
}; 

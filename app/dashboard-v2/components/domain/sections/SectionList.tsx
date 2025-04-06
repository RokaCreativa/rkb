import { useState, useEffect } from 'react';
import SectionListItem from '@/app/dashboard-v2/components/sections/SectionListItem';
import { Section } from '@/app/types/menu';

// Tipos
export interface SectionListProps {
  sections: Section[];
  categoryId: string;
  categoryName: string;
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (section: Section) => void;
  onToggleSectionVisibility?: (sectionId: number, status: number) => void;
  onEditSectionOrder?: (sections: Section[]) => void;
  isUpdatingSectionId?: number;
  showOnlyActions?: boolean;
  visibleSections?: number;
  totalSections?: number;
}

export default function SectionList({
  sections,
  categoryId,
  categoryName,
  onEditSection,
  onDeleteSection,
  onToggleSectionVisibility,
  isUpdatingSectionId,
  showOnlyActions = false,
  visibleSections,
  totalSections,
}: SectionListProps) {
  
  if (!sections || sections.length === 0) {
    return (
      <div className="mt-4 section-border rounded-md p-4 text-center">
        <p className="text-sm section-text">No hay secciones en esta categoría.</p>
      </div>
    );
  }

  const visibilityInfo = visibleSections !== undefined && totalSections !== undefined 
    ? `(${visibleSections}/${totalSections} visibles)` 
    : '';

  return (
    <div className="w-full mt-4">
      <table className="w-full grid-table">
        <thead>
          <tr className="grid-header">
            <th className="text-left section-text pl-4">Secciones: {categoryName} {visibilityInfo}</th>
            <th className="text-center">Orden</th>
            <th className="text-center">Foto</th>
            <th className="text-center">Visibilidad</th>
            <th className="text-right pr-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <SectionListItem
              key={section.section_id}
              section={section}
              isExpanded={false}
              visibleProductsCount={section.visible_products_count || 0}
              totalProductsCount={section.products_count || 0}
              onSectionClick={() => {}} 
              onAddProduct={() => {}}
              onToggleSectionVisibility={(sectionId, status) => 
                onToggleSectionVisibility && onToggleSectionVisibility(sectionId, status)
              }
              onEditSection={(section) => 
                onEditSection && onEditSection(section)
              }
              onDeleteSection={(section) => 
                onDeleteSection && onDeleteSection(section)
              }
              orderIndex={section.display_order || 0}
              showOnlyActions={showOnlyActions}
              isHidden={section.status !== 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
} 
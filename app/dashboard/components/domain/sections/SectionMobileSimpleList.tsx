/**
 * @fileoverview Componente SectionList - Lista de secciones con soporte para arrastrar y soltar (drag and drop)
 * Este componente muestra las secciones de una categoría específica en formato de tabla
 * y permite arrastrar y reordenar las secciones visibles.
 * 
 * IMPORTANTE: Este componente NO incluye su propio DragDropContext.
 * Debe ser usado dentro del DragDropContext global definido en DashboardView.tsx.
 * 
 * @autor RokaMenu Team
 * @version 2.0
 * @updated 2024-06-18
 */

'use client';

import React from 'react';
import { Section } from '@/app/dashboard-v2/types';
import { GenericRow } from '@/app/dashboard/components/ui/Table/GenericRow';
import { ActionIcon } from '@/app/dashboard/components/ui/Button/ActionIcon';
import { Pencil, Trash, Eye, EyeOff } from 'lucide-react';

/**
 * Props para el componente SectionList
 */
export interface SectionListProps {
  sections: Section[];
  onSectionSelect: (section: Section) => void;
  onEdit: (section: Section) => void;
  onDelete: (section: Section) => void;
  onToggleVisibility: (section: Section) => void;
}

/**
 * Componente SectionList - Muestra secciones en formato de tabla con soporte para drag & drop
 * 
 * Este componente recibe una lista de secciones y las muestra en una tabla interactiva.
 * Cada sección puede ser:
 * - Expandida/colapsada para mostrar sus productos
 * - Arrastrada para cambiar su orden
 * - Editada, eliminada o se puede cambiar su visibilidad
 * 
 * IMPORTANTE: Este componente NO incluye su propio DragDropContext,
 * debe ser utilizado dentro del DragDropContext global en DashboardView.
 */
export const SectionList: React.FC<SectionListProps> = ({
  sections,
  onSectionSelect,
  onEdit,
  onDelete,
  onToggleVisibility,
}) => {

  const renderActions = (section: Section) => (
    <>
      <ActionIcon
        Icon={section.status ? Eye : EyeOff}
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility(section);
        }}
        iconClassName={section.status ? "text-gray-600" : "text-gray-400"}
      />
      <ActionIcon
        Icon={Pencil}
        onClick={(e) => {
          e.stopPropagation();
          onEdit(section);
        }}
        iconClassName="text-gray-600"
      />
      <ActionIcon
        Icon={Trash}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(section);
        }}
        iconClassName="text-gray-600"
      />
    </>
  );

  if (!sections || sections.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No hay secciones en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <GenericRow
          key={section.section_id}
          id={section.section_id}
          title={section.name}
          subtitle={`${section.products_count ?? 0} productos`}
          imageSrc={section.image}
          imageAlt={section.name ?? 'Sección'}
          imageType="sections"
          actions={renderActions(section)}
          onClick={() => onSectionSelect(section)}
          className={!section.status ? 'opacity-50' : ''}
          isSelected={false}
          isReorderMode={false}
        />
      ))}
    </div>
  );
};

export default SectionList; 
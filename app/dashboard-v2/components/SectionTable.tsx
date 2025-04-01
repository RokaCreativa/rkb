"use client";

import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Section } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/core/utils/imageUtils';

interface SectionTableProps {
  sections: Section[];
  isUpdatingVisibility?: number | null;
  onToggleSectionVisibility?: (sectionId: number, currentStatus: number) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section, categoryId: number) => void;
  categoryId: number;
}

export function SectionTable({
  sections,
  isUpdatingVisibility,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  categoryId
}: SectionTableProps) {
  if (!sections || sections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay secciones para esta categoría.
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            NOMBRE
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ORDEN
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            FOTO
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            VISIBLE
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ACCIONES
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {sections.map((section) => (
          <tr key={section.section_id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{section.name}</div>
              {section.products_count !== undefined && (
                <div className="text-xs text-gray-500">
                  {section.products_count} productos
                  {section.visible_products_count !== undefined && ` (${section.visible_products_count} visibles)`}
                </div>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {section.display_order}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="h-10 w-10 rounded-full overflow-hidden">
                {section.image ? (
                  <img 
                    src={getImagePath(section.image, 'sections')} 
                    alt={section.name} 
                    className="h-full w-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200">
                    <span className="text-xs text-gray-500">Sin imagen</span>
                  </div>
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {onToggleSectionVisibility && (
                <button 
                  className={`${
                    section.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  } px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full`}
                  onClick={() => onToggleSectionVisibility(section.section_id, section.status)}
                  disabled={isUpdatingVisibility === section.section_id}
                >
                  {isUpdatingVisibility === section.section_id ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Actualizando...
                    </span>
                  ) : (
                    section.status === 1 ? 'Visible' : 'Oculto'
                  )}
                </button>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div className="flex space-x-3">
                <button 
                  onClick={() => onEditSection(section)}
                  aria-label="Editar sección"
                >
                  <PencilIcon className="h-5 w-5 text-blue-600 hover:text-blue-800" />
                </button>
                <button 
                  onClick={() => onDeleteSection(section, categoryId)}
                  aria-label="Eliminar sección"
                >
                  <TrashIcon className="h-5 w-5 text-red-600 hover:text-red-800" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 
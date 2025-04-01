"use client";

import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Section } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';

interface SectionTableProps {
  sections: Section[];
  isUpdatingVisibility: number | null;
  onToggleSectionVisibility: (sectionId: number, status: number) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  categoryId: number;
}

export const SectionTable: React.FC<SectionTableProps> = ({
  sections,
  isUpdatingVisibility,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  categoryId
}) => {
  if (!sections || sections.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No hay secciones disponibles
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-gray-200 rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              NOMBRE
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              ORDEN
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              FOTO
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
              VISIBLE
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              ACCIONES
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sections.map((section, index) => (
            <tr key={section.section_id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{section.name}</div>
                    <div className="text-xs text-gray-500">
                      {section.products_count || 0} Productos ({section.visible_products_count || 0} visibles)
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                {section.display_order || index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="h-10 w-10 rounded-full overflow-hidden mx-auto">
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
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <button 
                  className={`${
                    section.status === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  } px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full`}
                  onClick={() => onToggleSectionVisibility(section.section_id, section.status === 1 ? 0 : 1)}
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
                    <span>Visible</span>
                  )}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex space-x-3 justify-center">
                  <button 
                    onClick={() => onEditSection(section)}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Editar sección"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => onDeleteSection(section)}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Eliminar sección"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 
"use client";

import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Section } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';

interface SectionTableProps {
  sections: Section[];
  isUpdatingVisibility: number | null;
  onToggleSectionVisibility: (sectionId: number, status: number) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  categoryId: number;
  onSectionClick?: (sectionId: number) => void;
  onAddProduct?: (sectionId: number) => void;
}

export const SectionTable: React.FC<SectionTableProps> = ({
  sections,
  isUpdatingVisibility,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  categoryId,
  onSectionClick,
  onAddProduct
}) => {
  if (!sections || sections.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No hay secciones disponibles
      </div>
    );
  }

  // Obtener secciones visibles y no visibles
  const visibleSections = sections.filter(s => s.status === 1);
  const hiddenSections = sections.filter(s => s.status !== 1);

  return (
    <div className="overflow-hidden border border-gray-200 rounded-md">
      <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-medium text-indigo-600">
          Secciones
        </h2>
        <div className="text-xs text-gray-500">
          ({visibleSections.length}/{sections.length} Visibles)
        </div>
      </div>
      
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
            <tr key={section.section_id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSectionClick && onSectionClick(section.section_id)}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Bars3Icon className="h-5 w-5 text-gray-400 mr-2" />
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
                  className={`focus:outline-none`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSectionVisibility(section.section_id, section.status === 1 ? 0 : 1);
                  }}
                  disabled={isUpdatingVisibility === section.section_id}
                >
                  {isUpdatingVisibility === section.section_id ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : section.status === 1 ? (
                    <span className="inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Visible
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      <EyeSlashIcon className="h-4 w-4 mr-1" />
                      Oculto
                    </span>
                  )}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex space-x-3 justify-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSection(section);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Editar sección"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSection(section);
                    }}
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
      
      {/* Botón para agregar nuevo producto */}
      {onAddProduct && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => onAddProduct(0)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Nuevo Producto
          </button>
        </div>
      )}
      
      {/* Contador de secciones no visibles */}
      {hiddenSections.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 text-right">
          <span className="text-xs text-gray-500">
            {hiddenSections.length} secciones no visibles
          </span>
        </div>
      )}
    </div>
  );
}; 
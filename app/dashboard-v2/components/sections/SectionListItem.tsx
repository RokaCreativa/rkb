import React from 'react';
import { ChevronDownIcon, ChevronRightIcon, PencilIcon, PlusIcon, TrashIcon, EyeIcon, EyeSlashIcon, PhotoIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { Section } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';

export interface SectionListItemProps {
  section: Section;
  isExpanded: boolean;
  visibleProductsCount: number;
  totalProductsCount: number;
  onSectionClick: (sectionId: number) => void;
  onAddProduct: (sectionId: number) => void;
  onToggleSectionVisibility: (sectionId: number, currentStatus: number) => void | Promise<void>;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  orderIndex: number;
  showOnlyImage?: boolean;
  showOnlyActions?: boolean;
  isHidden?: boolean;
}

/**
 * Componente que muestra una fila de sección, o partes específicas de ella basado en las props
 */
const SectionListItem: React.FC<SectionListItemProps> = ({
  section,
  isExpanded,
  visibleProductsCount,
  totalProductsCount,
  onSectionClick,
  onAddProduct,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  orderIndex = 0,
  showOnlyImage,
  showOnlyActions,
  isHidden
}) => {
  // Si sólo queremos mostrar la imagen
  if (showOnlyImage) {
    return (
      <td className="flex items-center justify-center">
        {section.image ? (
          <div 
            className="w-8 h-8 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200"
          >
            <img
              src={getImagePath(section.image, 'sections')}
              alt={section.name}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-md bg-gray-100 text-gray-400 flex items-center justify-center text-xs border border-gray-200">
            <PhotoIcon className="w-4 h-4" />
          </div>
        )}
      </td>
    );
  }

  // Si sólo queremos mostrar los botones de acción
  if (showOnlyActions) {
    return (
      <td className="flex items-center justify-center space-x-1">
        <button
          onClick={() => onEditSection(section)}
          className={`p-1.5 rounded-full transition-colors ${
            isHidden 
              ? 'text-gray-400 hover:bg-gray-100' 
              : 'section-action hover:bg-teal-100'
          }`}
          title="Editar sección"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDeleteSection(section)}
          className={`p-1.5 rounded-full transition-colors ${
            isHidden 
              ? 'text-gray-400 hover:bg-gray-100' 
              : 'text-red-500 hover:bg-red-50'
          }`}
          title="Eliminar sección"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </td>
    );
  }

  // Renderizado por defecto (componente completo)
  return (
    <>
      {/* Toggle para expandir/colapsar */}
      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
        <div className="flex items-center justify-center">
          <button 
            onClick={() => onSectionClick(section.section_id)}
            className="p-1 rounded-full transition-colors"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5 text-teal-500" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-teal-500" />
            )}
          </button>
        </div>
      </td>
      
      {/* Información de la sección */}
      <td className="px-3 py-2 cursor-pointer" onClick={() => onSectionClick(section.section_id)}>
        <div className="flex items-center">
          <span className={`text-sm font-medium ${
            isExpanded 
              ? "text-teal-700" 
              : "text-gray-700"
          }`}>{section.name}</span>
          <span className="text-xs text-gray-500 ml-2">
            ({visibleProductsCount}/{totalProductsCount})
          </span>
        </div>
      </td>
      
      {/* Orden */}
      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
        {section.display_order || orderIndex + 1}
      </td>
      
      {/* Imagen */}
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="flex justify-center">
          {section.image ? (
            <div 
              className="w-8 h-8 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200"
            >
              <img
                src={getImagePath(section.image, 'sections')}
                alt={section.name}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-md bg-gray-100 text-gray-400 flex items-center justify-center text-xs border border-gray-200">
              <PhotoIcon className="w-4 h-4" />
            </div>
          )}
        </div>
      </td>
      
      {/* Botón de visibilidad */}
      <td className="px-2 py-2 whitespace-nowrap text-center">
        <div className="flex justify-center">
          <button
            onClick={() => onToggleSectionVisibility(section.section_id, section.status)}
            className={`p-1.5 rounded-full transition-colors ${
              section.status === 1 
                ? 'text-teal-600 bg-teal-50 hover:bg-teal-100' 
                : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
            }`}
            title={section.status === 1 ? "Visible" : "No visible"}
          >
            <EyeIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
      
      {/* Botones de acción */}
      <td className="px-3 py-2 whitespace-nowrap text-center">
        <div className="flex justify-center space-x-1">
          <button
            onClick={() => onAddProduct(section.section_id)}
            className="p-1.5 rounded-full section-action hover:bg-teal-50 transition-colors"
            title="Agregar producto"
          >
            <PlusCircleIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEditSection(section)}
            className="p-1.5 rounded-full section-action hover:bg-teal-50 transition-colors"
            title="Editar sección"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteSection(section)}
            className="p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors"
            title="Eliminar sección"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </>
  );
};

export default SectionListItem; 
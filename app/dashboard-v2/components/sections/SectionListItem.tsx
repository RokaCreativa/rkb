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
          <div className="grid-image-container">
            <img
              src={getImagePath(section.image, 'sections')}
              alt={section.name}
              onError={handleImageError}
              className="grid-image"
            />
          </div>
        ) : (
          <div className="grid-image-placeholder">
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
          className={`action-button ${
            isHidden 
              ? 'text-gray-400 hover:bg-gray-100' 
              : 'section-action section-icon-hover'
          }`}
          title="Editar sección"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDeleteSection(section)}
          className="section-action-delete"
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
      <td className="px-2 py-2 whitespace-nowrap text-sm w-10">
        <div className="flex items-center justify-center">
          <button 
            onClick={() => onSectionClick(section.section_id)}
            className="p-1 rounded-full transition-colors"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5 section-text" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 section-text" />
            )}
          </button>
        </div>
      </td>
      
      {/* Información de la sección */}
      <td className="px-3 py-2 cursor-pointer" onClick={() => onSectionClick(section.section_id)}>
        <div className="flex items-center">
          <span className={`text-sm font-medium ${
            isExpanded 
              ? "section-text" 
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
            <div className="grid-image-container">
              <img
                src={getImagePath(section.image, 'sections')}
                alt={section.name}
                onError={handleImageError}
                className="grid-image"
              />
            </div>
          ) : (
            <div className="grid-image-placeholder">
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
            className={`action-button ${
              section.status === 1 
                ? 'section-action section-icon-hover' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={section.status === 1 ? "Visible" : "No visible"}
          >
            {section.status === 1 ? (
              <EyeIcon className="w-4 h-4" />
            ) : (
              <EyeSlashIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
      
      {/* Botones de acción */}
      <td className="px-3 py-2 whitespace-nowrap text-center">
        <div className="flex justify-center space-x-1">
          <button
            onClick={() => onAddProduct(section.section_id)}
            className="action-button section-action section-icon-hover"
            title="Agregar producto"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEditSection(section)}
            className="action-button section-action-edit"
            title="Editar sección"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteSection(section)}
            className="section-action-delete"
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
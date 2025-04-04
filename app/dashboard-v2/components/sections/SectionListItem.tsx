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
      <div className="flex items-center justify-center">
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
    );
  }

  // Si sólo queremos mostrar los botones de acción
  if (showOnlyActions) {
    return (
      <div className="flex items-center justify-center space-x-1">
        <button
          onClick={() => onEditSection(section)}
          className={`p-1.5 rounded-full transition-colors ${
            isHidden 
              ? 'text-gray-400 hover:bg-gray-100' 
              : 'section-action hover:bg-green-100'
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
      </div>
    );
  }

  // Renderizado por defecto (componente completo)
  return (
    <div className="flex items-center py-2 transition-colors w-full" style={{ 
      borderBottom: '3px solid #000000'
    }}>
      {/* Toggle para expandir/colapsar */}
      <div className="w-10 flex items-center justify-center">
        <button 
          onClick={() => onSectionClick(section.section_id)}
          className="p-1 rounded-full transition-colors"
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-5 w-5 text-green-500" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-green-500" />
          )}
        </button>
      </div>
      
      {/* Información de la sección */}
      <div className="flex-1 px-3 flex flex-col">
        <div className="flex items-center">
          <span className={`text-sm font-medium ${
            isExpanded 
              ? "text-green-700" 
              : "text-gray-700"
          }`}>{section.name}</span>
          <span className="text-xs text-gray-500 ml-2">
            ({visibleProductsCount}/{totalProductsCount})
          </span>
        </div>
      </div>
      
      {/* Orden */}
      <div className="w-16 text-right pr-4 text-sm text-gray-500">
        {section.display_order || orderIndex + 1}
      </div>
      
      {/* Imagen */}
      <div className="w-16 flex items-center justify-center">
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
      
      {/* Botón de visibilidad */}
      <div className="w-12 flex items-center justify-center">
        <button
          onClick={() => onToggleSectionVisibility(section.section_id, section.status)}
          className={`p-1.5 rounded-full transition-colors ${
            section.status === 1 
              ? 'text-green-600 bg-green-50 hover:bg-green-100' 
              : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
          }`}
          title={section.status === 1 ? "Visible" : "No visible"}
        >
          <EyeIcon className="w-4 h-4" />
        </button>
      </div>
      
      {/* Botones de acción */}
      <div className="w-20 flex items-center justify-center space-x-1">
        <button
          onClick={() => onAddProduct(section.section_id)}
          className="p-1.5 rounded-full section-action hover:bg-green-50 transition-colors"
          title="Agregar producto"
        >
          <PlusCircleIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEditSection(section)}
          className="p-1.5 rounded-full section-action hover:bg-green-50 transition-colors"
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
    </div>
  );
};

export default SectionListItem; 
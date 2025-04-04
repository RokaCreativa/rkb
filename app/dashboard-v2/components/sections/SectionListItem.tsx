import React from 'react';
import { ChevronDownIcon, ChevronRightIcon, PencilIcon, PlusIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Section } from '@/app/types/menu';

interface SectionListItemProps {
  section: Section;
  isExpanded: boolean;
  visibleProductsCount: number;
  totalProductsCount: number;
  onSectionClick: (sectionId: number) => void;
  onAddProduct: (sectionId: number) => void;
  onToggleSectionVisibility: (sectionId: number, status: number) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
}

/**
 * Componente reutilizable para mostrar una fila de sección
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
  onDeleteSection
}) => {
  return (
    <div 
      className={`flex items-center justify-between px-4 py-3 bg-white cursor-pointer hover:bg-gray-50 border-b border-gray-300`}
      onClick={() => onSectionClick(section.section_id)}
    >
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0 flex items-center">
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4 text-green-500" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-green-500" />
          )}
        </div>
        
        <span className={`text-sm font-medium ${
          isExpanded
            ? "text-green-700"
            : "text-gray-700"
        }`}>
          {section.name}
        </span>
        
        <span className="text-xs text-gray-500">
          ({visibleProductsCount}/{totalProductsCount})
        </span>
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddProduct(section.section_id);
          }}
          className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50 ml-2"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSectionVisibility(section.section_id, section.status);
          }}
          className={`p-1.5 rounded-full transition-colors ${
            section.status === 1 
              ? 'text-green-600 bg-green-50 hover:bg-green-100' 
              : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
          }`}
          title={section.status === 1 ? "Visible" : "No visible"}
        >
          {section.status === 1 ? (
            <EyeIcon className="w-4 h-4" />
          ) : (
            <EyeSlashIcon className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditSection(section);
          }}
          className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSection(section);
          }}
          className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SectionListItem; 
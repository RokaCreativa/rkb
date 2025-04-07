/**
 * @fileoverview Componente para mostrar la lista de secciones de una categoría
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-20
 * 
 * IMPORTANTE: Este componente NO debe incluir su propio DragDropContext.
 * Debe ser usado dentro del DragDropContext global definido en DashboardView.tsx.
 */

import React from 'react';
import { Section } from '@/app/dashboard-v2/types/domain/section';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { fromMenuSection } from '@/app/dashboard-v2/types/type-adapters';

/**
 * Props para el componente SectionList
 */
interface SectionListProps {
  sections: Section[];
  onSectionClick: (section: Section) => void;
  onToggleSectionVisibility: (sectionId: number, status: number) => Promise<void>;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: number) => void;
  isUpdatingVisibility: number | null;
  categoryId: number;
  onReorderSection?: (categoryId: number, sourceIndex: number, destIndex: number) => void;
  isReorderModeActive?: boolean;
}

/**
 * Componente que muestra la lista de secciones en forma de tabla o grid
 */
const SectionList: React.FC<SectionListProps> = ({
  sections,
  onSectionClick,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  isUpdatingVisibility,
  categoryId,
  onReorderSection,
  isReorderModeActive = false
}) => {
  /**
   * NOTA: Esta función no debería ser usada ya que el DragDropContext global en DashboardView
   * maneja todos los eventos de drag and drop. Se deja como referencia.
   */
  /*
  const handleDragEnd = (result: any) => {
    if (!result.destination || !onReorderSection) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    if (sourceIndex === destIndex) return;
    
    onReorderSection(categoryId, sourceIndex, destIndex);
  };
  */

  // Si no hay secciones, mostrar mensaje
  if (!sections || sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-500 mb-4">No hay secciones en esta categoría</p>
      </div>
    );
  }

  // Renderiza la lista de secciones con soporte para drag and drop
  return (
    <Droppable droppableId={`category-${categoryId}`} type="SECTION">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {sections.map((section, index) => (
            <Draggable
              key={section.section_id.toString()}
              draggableId={`section-${section.section_id}`}
              index={index}
              isDragDisabled={!isReorderModeActive}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className={`bg-white rounded-lg shadow p-4 flex flex-col relative ${
                    snapshot.isDragging ? 'border-2 border-teal-500 shadow-lg' : ''
                  } ${section.status === 0 ? 'opacity-60' : ''}`}
                >
                  <div 
                    className="flex items-center mb-2 cursor-pointer"
                    onClick={() => onSectionClick(section)}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className={`section-drag-handle mr-2 p-2 rounded-lg ${isReorderModeActive ? 'bg-teal-50 hover:bg-teal-100 cursor-grab' : ''}`}
                      title={isReorderModeActive ? "Arrastrar para reordenar" : ""}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    {section.image && (
                      <div className="h-12 w-12 rounded-md overflow-hidden mr-4">
                        <img
                          src={section.image}
                          alt={section.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-medium text-gray-900 truncate flex-1">
                      {section.name}
                    </h3>
                  </div>
                  
                  <div className="flex-1 mt-2 mb-2">
                    <p className="text-sm text-gray-500">
                      {section.products_count || 0} productos
                      {section.products_count && section.visible_products_count !== undefined && (
                        <span> ({section.visible_products_count} visibles)</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-auto">
                    <button
                      onClick={() => onToggleSectionVisibility(section.section_id, section.status)}
                      className={`rounded-full p-1 ${
                        section.status === 1 ? 'text-teal-500 hover:text-teal-600' : 'text-gray-400 hover:text-gray-500'
                      }`}
                      disabled={isUpdatingVisibility === section.section_id}
                    >
                      {isUpdatingVisibility === section.section_id ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : section.status === 1 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => onEditSection(section)}
                      className="text-teal-500 hover:text-teal-600 rounded-full p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteSection(section.section_id)}
                      className="text-red-500 hover:text-red-600 rounded-full p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default SectionList; 
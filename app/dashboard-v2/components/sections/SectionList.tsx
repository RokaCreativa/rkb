import React, { useState } from 'react';
import { PlusIcon, EyeIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import { Section, Product } from '@/app/types/menu';
import SectionListItem from './SectionListItem';
import ProductListItem from './ProductListItem';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface SectionListProps {
  sections: Section[];
  expandedSections: Record<number, boolean>;
  onSectionClick: (sectionId: number) => void;
  onAddSection?: () => void;
  onToggleSectionVisibility: (sectionId: number, currentStatus: number) => void | Promise<void>;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  onAddProduct: (sectionId: number) => void;
  products: Record<string, Product[]>;
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void | Promise<void>;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  isUpdatingVisibility: number | null;
  isUpdatingProductVisibility?: number | null;
  categoryName?: string;
  categoryId?: number;
  onSectionsReorder?: (reorderedSections: Section[]) => void | Promise<void>;
}

/**
 * Componente para mostrar una lista de secciones con sus productos
 * Este componente puede usarse tanto dentro de CategoryTable como de forma independiente
 */
const SectionList: React.FC<SectionListProps> = ({
  sections,
  expandedSections,
  onSectionClick,
  onAddSection,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  onAddProduct,
  products,
  onToggleProductVisibility,
  onEditProduct,
  onDeleteProduct,
  isUpdatingVisibility,
  isUpdatingProductVisibility,
  categoryName,
  categoryId,
  onSectionsReorder
}) => {
  const [showHiddenSections, setShowHiddenSections] = useState(true);
  
  // Separar secciones visibles y ocultas
  const visibleSections = sections.filter(s => s.status === 1);
  const hiddenSections = sections.filter(s => s.status !== 1);
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onSectionsReorder) return;
    
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Actualiza el display_order en cada elemento
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));
    
    onSectionsReorder(updatedItems);
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="bg-white p-4 text-center text-gray-500 rounded-lg border border-gray-200">
        No hay secciones disponibles
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {/* Botón de agregar sección flotante */}
      {onAddSection && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onAddSection}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded shadow-sm"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Agregar sección
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg border section-border overflow-hidden shadow-sm">
        <div className="flex justify-between items-center px-4 py-2 section-bg border-b section-border">          
          <div className="flex items-center space-x-3">
            <div className="text-xs section-title">
              ({visibleSections.length}/{sections.length} visibles)
            </div>
            
            <button
              type="button"
              onClick={() => setShowHiddenSections(!showHiddenSections)}
              className="text-xs section-title hover:text-green-700 flex items-center gap-1"
            >
              {showHiddenSections ? 'Ocultar' : 'Mostrar'} no visibles
            </button>
          </div>
        </div>
        
        {onSectionsReorder ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-white divide-y divide-gray-200"
                >
                  {sections.map((section, index) => (
                    <Draggable
                      key={section.section_id.toString()}
                      draggableId={section.section_id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <SectionListItem
                            section={section}
                            isExpanded={expandedSections[section.section_id] || false}
                            visibleProductsCount={
                              products[section.section_id]
                                ? products[section.section_id].filter(p => p.status === 1).length
                                : section.visible_products_count || 0
                            }
                            totalProductsCount={
                              products[section.section_id]
                                ? products[section.section_id].length
                                : section.products_count || 0
                            }
                            onSectionClick={onSectionClick}
                            onAddProduct={onAddProduct}
                            onToggleSectionVisibility={onToggleSectionVisibility}
                            onEditSection={onEditSection}
                            onDeleteSection={onDeleteSection}
                            orderIndex={index}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="bg-white divide-y divide-gray-200">
            {sections.map((section, index) => (
              <SectionListItem
                key={section.section_id}
                section={section}
                isExpanded={expandedSections[section.section_id] || false}
                visibleProductsCount={
                  products[section.section_id]
                    ? products[section.section_id].filter(p => p.status === 1).length
                    : section.visible_products_count || 0
                }
                totalProductsCount={
                  products[section.section_id]
                    ? products[section.section_id].length
                    : section.products_count || 0
                }
                onSectionClick={onSectionClick}
                onAddProduct={onAddProduct}
                onToggleSectionVisibility={onToggleSectionVisibility}
                onEditSection={onEditSection}
                onDeleteSection={onDeleteSection}
                orderIndex={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionList; 
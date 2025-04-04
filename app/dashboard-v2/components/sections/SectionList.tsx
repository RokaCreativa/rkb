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
      <div className="bg-white p-4 text-center text-gray-500 rounded-lg border border-teal-200">
        No hay secciones disponibles
      </div>
    );
  }
  
  return (
    <div className="rounded-lg border section-border overflow-hidden bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-2 section-bg border-b section-border">
        <h2 className="text-sm font-medium text-teal-700">
          Secciones: {categoryName || 'Comidas'}
        </h2>
        <div className="flex items-center">
          <div className="text-xs section-title mr-4">
            ({visibleSections.length}/{sections.length} visibles)
          </div>
          <button
            type="button"
            onClick={() => setShowHiddenSections(!showHiddenSections)}
            className="text-xs section-title hover:text-teal-700 flex items-center gap-1"
          >
            {showHiddenSections ? 'Ocultar' : 'Mostrar'} no visibles
          </button>
        </div>
      </div>

      {onSectionsReorder ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <table className="min-w-full divide-y section-border" {...provided.droppableProps} ref={provided.innerRef}>
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium section-title uppercase tracking-wider w-10"></th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium section-title uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <ViewColumnsIcon className="h-3 w-3 section-title" />
                        <span>Nombre</span>
                      </div>
                    </th>
                    <th scope="col" className="px-2 py-2 text-center text-xs font-medium section-title uppercase tracking-wider w-16">Orden</th>
                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium section-title uppercase tracking-wider w-16">Foto</th>
                    <th scope="col" className="px-2 py-2 text-center text-xs font-medium section-title uppercase tracking-wider w-16">
                      <EyeIcon className="h-4 w-4 mx-auto section-title" />
                    </th>
                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium section-title uppercase tracking-wider w-20">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y section-border">
                  {sections.map((section, index) => (
                    <Draggable
                      key={section.section_id.toString()}
                      draggableId={section.section_id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${snapshot.isDragging ? 'bg-teal-50' : ''}`}
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
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <table className="min-w-full divide-y section-border">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium section-title uppercase tracking-wider w-10"></th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium section-title uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <ViewColumnsIcon className="h-3 w-3 section-title" />
                  <span>Nombre</span>
                </div>
              </th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium section-title uppercase tracking-wider w-16">Orden</th>
              <th scope="col" className="px-3 py-2 text-center text-xs font-medium section-title uppercase tracking-wider w-16">Foto</th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium section-title uppercase tracking-wider w-16">
                <EyeIcon className="h-4 w-4 mx-auto section-title" />
              </th>
              <th scope="col" className="px-3 py-2 text-center text-xs font-medium section-title uppercase tracking-wider w-20">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y section-border">
            {sections.map((section, index) => (
              <tr key={section.section_id} className="hover:bg-gray-50">
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SectionList; 
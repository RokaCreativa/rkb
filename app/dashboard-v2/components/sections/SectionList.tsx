import React, { useState } from 'react';
import { PlusIcon, EyeIcon, ViewColumnsIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Section, Product } from '@/app/types/menu';
import SectionListItem from './SectionListItem';
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
  const [showHiddenProducts, setShowHiddenProducts] = useState(true);
  
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
      <div className="bg-white p-4 text-center text-gray-500 rounded-lg border section-border">
        No hay secciones disponibles
      </div>
    );
  }
  
  // Renderiza productos para una sección
  const renderProducts = (sectionId: number) => {
    if (!expandedSections[sectionId] || !products[sectionId]) {
      return null;
    }
    
    const sectionProducts = products[sectionId] || [];
    if (sectionProducts.length === 0) {
      return (
        <tr>
          <td colSpan={6}>
            <div className="bg-white p-4 text-center text-gray-500 rounded-lg border product-border my-2 mx-4">
              No hay productos en esta sección
              <div className="mt-2">
                <button
                  onClick={() => onAddProduct(sectionId)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded product-button"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Agregar producto
                </button>
              </div>
            </div>
          </td>
        </tr>
      );
    }
    
    // Filtrar productos visibles y no visibles
    const visibleProducts = sectionProducts.filter(p => p.status === 1);
    const productsToShow = showHiddenProducts 
      ? sectionProducts 
      : visibleProducts;
    
    return (
      <tr>
        <td colSpan={6} className="p-0">
          <div className="m-4">
            <div className="rounded-lg border product-border overflow-hidden bg-white shadow-sm">
              <div className="flex justify-between items-center px-4 py-2 product-bg border-b product-border">
                <h2 className="text-sm font-medium product-title">
                  Productos ({sectionProducts.length})
                </h2>
                <div className="flex items-center">
                  <div className="text-xs product-title mr-4">
                    ({visibleProducts.length}/{sectionProducts.length} visibles)
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowHiddenProducts(!showHiddenProducts)}
                    className="text-xs product-title hover:product-text flex items-center gap-1"
                  >
                    {showHiddenProducts ? 'Ocultar' : 'Mostrar'} no visibles
                  </button>
                </div>
              </div>
              
              <table className="min-w-full divide-y product-border">
                <thead className="product-bg">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium product-title uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <ViewColumnsIcon className="h-3 w-3 product-title" />
                        <span>Nombre</span>
                      </div>
                    </th>
                    <th scope="col" className="px-2 py-2 text-center text-xs font-medium product-title uppercase tracking-wider w-16">Orden</th>
                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium product-title uppercase tracking-wider w-16">Foto</th>
                    <th scope="col" className="px-2 py-2 text-center text-xs font-medium product-title uppercase tracking-wider w-16">
                      <EyeIcon className="h-4 w-4 mx-auto product-title" />
                    </th>
                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium product-title uppercase tracking-wider w-20">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y product-border">
                  {productsToShow.map((product, index) => (
                    <tr key={product.product_id} className={`product-hover ${product.status !== 1 ? 'grid-item-hidden' : ''}`}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="font-medium text-sm product-text">{product.name}</div>
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-600">
                        {product.display_order || index + 1}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex justify-center">
                          <div className="grid-image-container">
                            {product.image && (
                              <img 
                                src={product.image.startsWith('http') ? product.image : `/images/products/${product.image}`} 
                                alt={product.name}
                                className="grid-image"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/placeholder.png';
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <button
                          onClick={() => onToggleProductVisibility && onToggleProductVisibility(product.product_id, product.status, sectionId)}
                          className={`inline-flex items-center justify-center h-6 w-6 rounded ${
                            product.status === 1 
                              ? 'product-action product-icon-hover' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          disabled={isUpdatingProductVisibility === product.product_id}
                        >
                          {isUpdatingProductVisibility === product.product_id ? (
                            <div className="w-4 h-4 border-2 border-t-transparent border-yellow-500 rounded-full animate-spin"></div>
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onEditProduct && onEditProduct(product)}
                            className="action-button product-action product-icon-hover"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct && onDeleteProduct(product)}
                            className="product-action-delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </td>
      </tr>
    );
  };
  
  return (
    <div className="rounded-lg border section-border overflow-hidden bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-2 section-bg border-b section-border">
        <h2 className="text-sm font-medium section-title">
          Secciones: {categoryName || 'Comidas'}
        </h2>
        <div className="flex items-center">
          <div className="text-xs section-title mr-4">
            ({visibleSections.length}/{sections.length} visibles)
          </div>
          <button
            type="button"
            onClick={() => setShowHiddenSections(!showHiddenSections)}
            className="text-xs section-title hover:section-text flex items-center gap-1"
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
                    <React.Fragment key={`section-group-${section.section_id}`}>
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
                            className={`${snapshot.isDragging ? 'grid-item-dragging-section' : ''}`}
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
                      
                      {expandedSections[section.section_id] && renderProducts(section.section_id)}
                    </React.Fragment>
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
              <React.Fragment key={`section-group-${section.section_id}`}>
                <tr className="section-hover">
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
                
                {expandedSections[section.section_id] && renderProducts(section.section_id)}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SectionList; 
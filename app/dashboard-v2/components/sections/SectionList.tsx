import React, { useState } from 'react';
import { PlusIcon, EyeIcon, ViewColumnsIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Section, Product } from '@/app/types/menu';
import SectionListItem from './SectionListItem';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import Image from 'next/image';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';

/**
 * Propiedades del componente SectionList
 * @typedef {Object} SectionListProps
 * @property {Section[]} sections - Array de secciones a mostrar
 * @property {Record<number, boolean>} expandedSections - Registro de secciones expandidas
 * @property {function} onSectionClick - Manejador para el click en una sección
 * @property {function} onToggleSectionVisibility - Manejador para alternar la visibilidad de una sección
 * @property {function} onEditSection - Manejador para editar una sección
 * @property {function} onDeleteSection - Manejador para eliminar una sección
 * @property {function} onAddProduct - Manejador para agregar un producto a una sección
 * @property {Record<string, Product[]>} products - Productos agrupados por sección
 * @property {function} [onToggleProductVisibility] - Manejador para alternar la visibilidad de un producto
 * @property {function} [onEditProduct] - Manejador para editar un producto
 * @property {function} [onDeleteProduct] - Manejador para eliminar un producto
 * @property {number|null} isUpdatingVisibility - ID de la sección cuya visibilidad se está actualizando
 * @property {number|null} [isUpdatingProductVisibility] - ID del producto cuya visibilidad se está actualizando
 * @property {string} [categoryName] - Nombre de la categoría padre
 * @property {number} [categoryId] - ID de la categoría padre
 * @property {function} [onSectionsReorder] - Manejador para reordenar secciones
 * @property {function} [onAddSectionToCategory] - Manejador para agregar una sección a una categoría
 */
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
  onAddSectionToCategory?: (categoryId: number) => void;
}

/**
 * Componente para mostrar una lista de secciones con sus productos en formato de tabla
 * 
 * Este componente visualiza secciones de menú en una tabla con capacidad
 * para expandir/colapsar mostrando los productos de cada sección. Mantiene
 * el esquema de colores teal para establecer una identidad visual diferenciada
 * de las categorías (indigo) y los productos (yellow).
 * 
 * @param {SectionListProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente renderizado
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
  onSectionsReorder,
  onAddSectionToCategory
}) => {
  const [showHiddenSections, setShowHiddenSections] = useState(true);
  const [showHiddenProducts, setShowHiddenProducts] = useState(true);
  
  // Separar secciones visibles y ocultas
  const visibleSections = sections.filter(s => s.status === 1);
  const hiddenSections = sections.filter(s => s.status !== 1);
  
  /**
   * Maneja el fin del arrastre para reordenar secciones
   * @param {DropResult} result - Resultado del arrastre
   */
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

  // Mostrar mensaje cuando no hay secciones
  if (!sections || sections.length === 0) {
    return (
      <div className="bg-white p-4 text-center text-gray-500 rounded-lg border section-border">
        No hay secciones disponibles
      </div>
    );
  }
  
  /**
   * Renderiza los productos para una sección específica
   * @param {number} sectionId - ID de la sección
   * @returns {JSX.Element|null} Tabla de productos o null si la sección no está expandida
   */
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
                    {showHiddenProducts ? 
                      <ChevronDownIcon className="h-3 w-3" /> : 
                      <ChevronDownIcon className="h-3 w-3" />
                    }
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
                  
                  {/* Botón para agregar producto al final de la lista */}
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-3 py-3 text-center">
                      <button
                        onClick={() => onAddProduct(sectionId)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded product-button"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Agregar producto
                      </button>
                    </td>
                  </tr>
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
      {/* HEADER - Ahora con nombre y contador de visibles en la misma fila */}
      <div className="flex items-center justify-between px-4 py-2 section-bg border-b section-border">
        <h2 className="text-sm font-medium section-text">
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
            {showHiddenSections ? 
              <ChevronDownIcon className="h-3 w-3" /> : 
              <ChevronDownIcon className="h-3 w-3" />
            }
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
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
                    <React.Fragment key={`section-${section.section_id}`}>
                      <Draggable
                        key={section.section_id.toString()}
                        draggableId={section.section_id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${
                              snapshot.isDragging 
                                ? "grid-item-dragging-section" 
                                : expandedSections[section.section_id] 
                                  ? "section-bg" 
                                  : "hover:bg-gray-50"
                            } ${section.status !== 1 ? 'grid-item-hidden' : ''}`}
                          >
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                              <div className="flex items-center">
                                <button 
                                  onClick={() => onSectionClick(section.section_id)}
                                  className={`p-1 rounded-full transition-colors ${
                                    expandedSections[section.section_id] 
                                      ? "bg-teal-100 section-title" 
                                      : "hover:bg-gray-200 text-gray-500"
                                  }`}
                                  aria-label={expandedSections[section.section_id] ? "Colapsar" : "Expandir"}
                                >
                                  {expandedSections[section.section_id] ? (
                                    <ChevronDownIcon className="h-5 w-5" />
                                  ) : (
                                    <ChevronRightIcon className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td 
                              className="px-3 py-2 cursor-pointer"
                              onClick={() => onSectionClick(section.section_id)}
                            >
                              <div className="flex items-center">
                                <div {...provided.dragHandleProps} className="mr-2">
                                  <Bars3Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                </div>
                                <div className="flex items-center">
                                  <span className={`text-sm font-medium ${
                                    expandedSections[section.section_id] 
                                      ? "section-text" 
                                      : "text-gray-700"
                                  }`}>{section.name}</span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({section.visible_products_count || 0}/{section.products_count || 0} productos visibles)
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">{section.display_order || index + 1}</td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex justify-center">
                                <div className="grid-image-container">
                                  {section.image && (
                                    <img 
                                      src={section.image.startsWith('http') ? section.image : `/images/sections/${section.image}`} 
                                      alt={section.name || ''}
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
                                onClick={() => onToggleSectionVisibility(section.section_id, section.status)}
                                className={`inline-flex items-center justify-center h-6 w-6 rounded ${
                                  section.status === 1
                                    ? 'section-action section-icon-hover'
                                    : 'text-gray-400 hover:bg-gray-100'
                                }`}
                                disabled={isUpdatingVisibility === section.section_id}
                              >
                                {isUpdatingVisibility === section.section_id ? (
                                  <div className="w-4 h-4 border-2 border-t-transparent border-teal-500 rounded-full animate-spin"></div>
                                ) : (
                                  <EyeIcon className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => onEditSection(section)}
                                  className="action-button section-action section-icon-hover"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onDeleteSection(section)}
                                  className="section-action-delete"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                      {renderProducts(section.section_id)}
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                  
                  {/* Botón para agregar sección al final de la lista */}
                  {categoryId && onAddSectionToCategory && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-3 py-3 text-center">
                        <button
                          onClick={() => onAddSectionToCategory(categoryId)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded section-button"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Agregar sección
                        </button>
                      </td>
                    </tr>
                  )}
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
              <React.Fragment key={`section-${section.section_id}`}>
                <tr className={`hover:bg-gray-50 ${section.status !== 1 ? 'grid-item-hidden' : ''}`}>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                    <div className="flex items-center">
                      <button 
                        onClick={() => onSectionClick(section.section_id)}
                        className={`p-1 rounded-full transition-colors ${
                          expandedSections[section.section_id] 
                            ? "bg-teal-100 section-title" 
                            : "hover:bg-gray-200 text-gray-500"
                        }`}
                        aria-label={expandedSections[section.section_id] ? "Colapsar" : "Expandir"}
                      >
                        {expandedSections[section.section_id] ? (
                          <ChevronDownIcon className="h-5 w-5" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td 
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => onSectionClick(section.section_id)}
                  >
                    <div className="flex items-center">
                      <div className="mr-2">
                        <Bars3Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          expandedSections[section.section_id] 
                            ? "section-text" 
                            : "text-gray-700"
                        }`}>{section.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({section.visible_products_count || 0}/{section.products_count || 0} productos visibles)
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">{section.display_order || index + 1}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex justify-center">
                      <div className="grid-image-container">
                        {section.image && (
                          <img 
                            src={section.image.startsWith('http') ? section.image : `/images/sections/${section.image}`} 
                            alt={section.name || ''}
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
                      onClick={() => onToggleSectionVisibility(section.section_id, section.status)}
                      className={`inline-flex items-center justify-center h-6 w-6 rounded ${
                        section.status === 1
                          ? 'section-action section-icon-hover'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      disabled={isUpdatingVisibility === section.section_id}
                    >
                      {isUpdatingVisibility === section.section_id ? (
                        <div className="w-4 h-4 border-2 border-t-transparent border-teal-500 rounded-full animate-spin"></div>
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => onEditSection(section)}
                        className="action-button section-action section-icon-hover"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSection(section)}
                        className="section-action-delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {renderProducts(section.section_id)}
              </React.Fragment>
            ))}
            
            {/* Botón para agregar sección al final de la lista (versión sin DnD) */}
            {categoryId && onAddSectionToCategory && (
              <tr className="bg-gray-50">
                <td colSpan={6} className="px-3 py-3 text-center">
                  <button
                    onClick={() => onAddSectionToCategory(categoryId)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded section-button"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Agregar sección
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SectionList; 
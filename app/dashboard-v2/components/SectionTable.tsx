"use client";

import React, { useState } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Section, Product } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface SectionTableProps {
  sections: Section[];
  client?: any;
  loading?: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setSections?: React.Dispatch<React.SetStateAction<Record<string, Section[]>>>;
  expandedSections: Record<string, boolean>;
  setExpandedSections?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onEdit?: (section: Section) => void;
  onDelete?: (section: Section) => void;
  onToggleVisibility: (sectionId: number, currentStatus: number) => void;
  isUpdatingVisibility: number | null;
  onSectionClick: (sectionId: number) => void;
  handleAddProduct?: (section: Section) => void;
  products: Record<string, Product[]>;
  setProducts?: React.Dispatch<React.SetStateAction<Record<string, Product[]>>>;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void;
  isUpdatingProductVisibility?: number | null;
  categoryId: number;
  categoryName?: string;
  onAddProduct: (sectionId: number) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  isReorderModeActive?: boolean;
  onReorderSection?: (sourceIndex: number, destinationIndex: number) => void;
}

export const SectionTable: React.FC<SectionTableProps> = ({
  sections,
  categoryName,
  categoryId,
  isUpdatingVisibility,
  expandedSections,
  onAddProduct,
  onSectionClick,
  onEditSection,
  onDeleteSection,
  onToggleVisibility,
  isReorderModeActive = false,
  onReorderSection,
  products,
  onToggleProductVisibility,
  onEditProduct,
  onDeleteProduct,
  isUpdatingProductVisibility = null,
  client,
  loading,
  setLoading,
  setSections,
  setExpandedSections,
  onEdit,
  handleAddProduct,
  setProducts
}) => {
  const [showHiddenSections, setShowHiddenSections] = useState(true);
  
  // Obtener secciones visibles y no visibles
  const visibleSections = sections.filter(s => s.status === 1);
  const hiddenSections = sections.filter(s => s.status !== 1);

  // Manejar el evento de drag and drop finalizado
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    
    if (onReorderSection) {
      onReorderSection(result.source.index, result.destination.index);
    }
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 bg-white rounded-md border border-green-200">
        No hay secciones disponibles
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green-100 overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-green-50 border-b border-green-100">
        <h2 className="text-sm font-medium text-green-700">
          Secciones: {categoryName || `Categoría #${categoryId}`}
        </h2>
        <div className="flex items-center">
          <div className="text-xs text-green-600 mr-4">
            ({visibleSections.length}/{sections.length} Visibles)
          </div>
          <button
            onClick={() => setShowHiddenSections(!showHiddenSections)}
            className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
          >
            {showHiddenSections ? 'Ocultar' : 'Mostrar'} no visibles
            {showHiddenSections ? 
              <ChevronDownIcon className="h-3 w-3" /> : 
              <ChevronDownIcon className="h-3 w-3" />
            }
          </button>
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <table className="min-w-full divide-y divide-green-100" {...provided.droppableProps} ref={provided.innerRef}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-green-600 uppercase tracking-wider w-10"></th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>Nombre</span>
                    </div>
                  </th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-green-600 uppercase tracking-wider w-16">Orden</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-green-600 uppercase tracking-wider w-16">Foto</th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-green-600 uppercase tracking-wider w-16">
                    <EyeIcon className="h-4 w-4 mx-auto text-green-500" />
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-green-600 uppercase tracking-wider w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {/* Secciones visibles */}
                {visibleSections.map((section, index) => (
                  <React.Fragment key={`section-group-${section.section_id}`}>
                    <Draggable 
                      key={section.section_id.toString()} 
                      draggableId={section.section_id.toString()} 
                      index={index}
                      isDragDisabled={!onReorderSection || !isReorderModeActive}
                    >
                      {(provided, snapshot) => (
                        <div
                          key={`section-${section.section_id}`}
                          className="group border border-gray-100 rounded-md mb-1 overflow-hidden"
                        >
                          <tr 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${
                              snapshot.isDragging 
                                ? "bg-blue-50" 
                                : expandedSections && expandedSections[section.section_id] 
                                  ? "bg-white border-l-4 border-green-500" 
                                  : "hover:bg-gray-50 border-l-4 border-transparent"
                            } bg-white`}
                          >
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                              <div className="flex items-center">
                                <button 
                                  onClick={() => onSectionClick(section.section_id)}
                                  className={`p-1 rounded-full transition-colors ${
                                    expandedSections && expandedSections[section.section_id] 
                                      ? "bg-green-100 text-green-600" 
                                      : "hover:bg-gray-200 text-gray-500"
                                  }`}
                                >
                                  {expandedSections && expandedSections[section.section_id] ? (
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
                                    expandedSections && expandedSections[section.section_id] 
                                      ? "text-green-700" 
                                      : "text-gray-700"
                                  }`}>{section.name}</span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {products && products[section.section_id.toString()] ? (
                                      `(${products[section.section_id.toString()].filter(p => p.status === 1).length}/${products[section.section_id.toString()].length} productos visibles)`
                                    ) : (
                                      `(${section.visible_products_count || 0}/${section.products_count || 0} productos visibles)`
                                    )}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">{section.display_order || index + 1}</td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex justify-center">
                                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                                  <Image
                                    src={getImagePath(section.image, 'sections')}
                                    alt={section.name || ''}
                                    width={32}
                                    height={32}
                                    className="object-cover w-full h-full"
                                    onError={handleImageError}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-center">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => onToggleVisibility(section.section_id, section.status)}
                                  disabled={isUpdatingVisibility === section.section_id}
                                  className={`p-1.5 rounded-full transition-colors ${
                                    section.status === 1 
                                      ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                                      : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                                  }`}
                                  title={section.status === 1 ? "Visible" : "No visible"}
                                >
                                  {isUpdatingVisibility === section.section_id ? (
                                    <div className="w-5 h-5 flex items-center justify-center">
                                      <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                                    </div>
                                  ) : section.status === 1 ? (
                                    <EyeIcon className="w-5 h-5" />
                                  ) : (
                                    <EyeSlashIcon className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center">
                              <div className="flex justify-center space-x-1">
                                {onAddProduct && (
                                  <button
                                    onClick={() => onAddProduct(section.section_id)}
                                    className="p-1 text-green-600 hover:text-green-900 rounded-full hover:bg-green-50"
                                    title="Añadir producto"
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => onEditSection(section)}
                                  className="p-1 text-green-600 hover:text-green-900 rounded-full hover:bg-green-50"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => onDeleteSection(section)}
                                  className="p-1 text-green-600 hover:text-green-900 rounded-full hover:bg-green-50"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </div>
                      )}
                    </Draggable>

                    {/* Mostrar productos si la sección está expandida */}
                    {expandedSections && expandedSections[section.section_id] && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div className="pl-8 pr-4 py-2 border-t border-green-100">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-sm font-medium text-green-700">
                                Productos: {section.name}
                              </h3>
                              {onAddProduct && (
                                <button
                                  onClick={() => onAddProduct(section.section_id)}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded"
                                >
                                  <PlusIcon className="h-3 w-3 mr-1" />
                                  Añadir producto
                                </button>
                              )}
                            </div>
                            
                            {products[section.section_id.toString()] && products[section.section_id.toString()].length > 0 ? (
                              <div className="mt-2 mb-2 rounded-lg bg-yellow-50 p-2 border border-yellow-100">
                                <table className="min-w-full divide-y divide-yellow-200">
                                  <thead className="bg-yellow-50">
                                    <tr>
                                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Nombre</th>
                                      <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-yellow-700 uppercase tracking-wider w-20">Precio</th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-yellow-700 uppercase tracking-wider w-16">Foto</th>
                                      <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-yellow-700 uppercase tracking-wider w-16">
                                        <EyeIcon className="h-3 w-3 mx-auto text-yellow-600" />
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-yellow-700 uppercase tracking-wider w-20">Acciones</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-yellow-100">
                                    {products[section.section_id.toString()].map((product: Product) => (
                                      <tr 
                                        key={`product-${product.product_id}`}
                                        className="hover:bg-yellow-50"
                                      >
                                        <td className="px-3 py-2 whitespace-nowrap">
                                          <div className="flex items-center">
                                            <span className="text-sm font-medium text-gray-700">
                                              {product.name}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                          {product.price}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                          <div className="flex justify-center">
                                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                                              <Image
                                                src={getImagePath(product.image, 'products')}
                                                alt={product.name || ''}
                                                width={32}
                                                height={32}
                                                className="object-cover w-full h-full"
                                                onError={handleImageError}
                                              />
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-center">
                                          {onToggleProductVisibility && (
                                            <div className="flex justify-center">
                                              <button
                                                onClick={() => onToggleProductVisibility(product.product_id, product.status, section.section_id)}
                                                disabled={isUpdatingProductVisibility === product.product_id}
                                                className={`p-1.5 rounded-full transition-colors ${
                                                  product.status === 1 
                                                    ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                                                    : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                                                }`}
                                                title={product.status === 1 ? "Visible" : "No visible"}
                                              >
                                                {isUpdatingProductVisibility === product.product_id ? (
                                                  <div className="w-4 h-4 flex items-center justify-center">
                                                    <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                                                  </div>
                                                ) : product.status === 1 ? (
                                                  <EyeIcon className="w-4 h-4" />
                                                ) : (
                                                  <EyeSlashIcon className="w-4 h-4" />
                                                )}
                                              </button>
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-center">
                                          <div className="flex justify-center space-x-1">
                                            {onEditProduct && (
                                              <button
                                                onClick={() => onEditProduct(product)}
                                                className="p-1 text-yellow-600 hover:text-yellow-800 rounded-full hover:bg-yellow-50"
                                              >
                                                <PencilIcon className="h-4 w-4" />
                                              </button>
                                            )}
                                            {onDeleteProduct && (
                                              <button
                                                onClick={() => onDeleteProduct(product)}
                                                className="p-1 text-yellow-600 hover:text-yellow-800 rounded-full hover:bg-yellow-50"
                                              >
                                                <TrashIcon className="h-4 w-4" />
                                              </button>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="mt-2 mb-2 rounded-lg bg-yellow-50 p-3 border border-yellow-100 text-center">
                                <div className="text-sm text-yellow-700">
                                  No hay productos disponibles
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}

                {provided.placeholder}
                
                {/* Secciones ocultas */}
                {showHiddenSections && hiddenSections.map((section, index) => (
                  <tr 
                    key={`hidden-${section.section_id}`}
                    className={`${
                      expandedSections && expandedSections[section.section_id] 
                        ? "bg-gray-50 opacity-80" 
                        : "hover:bg-gray-50 opacity-70"
                    }`}
                  >
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-400 w-10">
                      <div className="flex items-center">
                        <button 
                          onClick={() => onSectionClick(section.section_id)}
                          className={`p-1 rounded-full transition-colors ${
                            expandedSections && expandedSections[section.section_id] 
                              ? "bg-gray-200 text-gray-500" 
                              : "hover:bg-gray-200 text-gray-400"
                          }`}
                        >
                          {expandedSections && expandedSections[section.section_id] ? (
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
                          <Bars3Icon className="h-5 w-5 text-gray-300 flex-shrink-0" />
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-400">{section.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {products && products[section.section_id.toString()] ? (
                              `(${products[section.section_id.toString()].filter(p => p.status === 1).length}/${products[section.section_id.toString()].length} productos visibles)`
                            ) : (
                              `(${section.visible_products_count || 0}/${section.products_count || 0} productos visibles)`
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-400 text-center">{section.display_order || index + 1 + visibleSections.length}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                          <Image
                            src={getImagePath(section.image, 'sections')}
                            alt={section.name || ''}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full opacity-50 grayscale"
                            onError={handleImageError}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => onToggleVisibility(section.section_id, section.status)}
                          disabled={isUpdatingVisibility === section.section_id}
                          className="p-1.5 rounded-full text-gray-400 bg-gray-50 hover:bg-gray-100"
                          title="No visible"
                        >
                          {isUpdatingVisibility === section.section_id ? (
                            <div className="w-5 h-5 flex items-center justify-center">
                              <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                            </div>
                          ) : (
                            <EyeSlashIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-1">
                        <button
                          onClick={() => onEditSection(section)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteSection(section)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}; 

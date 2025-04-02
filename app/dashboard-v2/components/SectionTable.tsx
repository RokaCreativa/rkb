"use client";

import React, { useState } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Section } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface SectionTableProps {
  sections: Section[];
  expandedSections: Record<number, boolean>;
  isUpdatingVisibility: number | null;
  onToggleSectionVisibility: (sectionId: number, currentStatus: number) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  categoryId: number;
  onSectionClick?: (sectionId: number) => void;
  onAddProduct?: (sectionId: number) => void;
  onReorderSection?: (sourceIndex: number, destinationIndex: number) => void;
  isReorderModeActive?: boolean;
  categoryName?: string;
}

export const SectionTable: React.FC<SectionTableProps> = ({
  sections,
  expandedSections,
  isUpdatingVisibility,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  categoryId,
  onSectionClick,
  onAddProduct,
  onReorderSection,
  isReorderModeActive = false,
  categoryName
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
      <div className="text-center py-4 text-gray-500 bg-white rounded-md border border-teal-200">
        No hay secciones disponibles
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-teal-200 overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-teal-50 border-b border-teal-100">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-medium text-teal-700">
            {categoryName ? `Secciones de ${categoryName}` : 'Secciones'}
          </h2>
        </div>
        <div className="flex items-center">
          <div className="text-xs text-teal-600 mr-4">
            ({visibleSections.length}/{sections.length} Visibles)
          </div>
          <button
            onClick={() => setShowHiddenSections(!showHiddenSections)}
            className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1"
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
            <table className="min-w-full divide-y divide-teal-100" {...provided.droppableProps} ref={provided.innerRef}>
              <thead className="bg-teal-50">
                <tr>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-teal-600 uppercase tracking-wider w-10"></th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-teal-600 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>Nombre</span>
                    </div>
                  </th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-teal-600 uppercase tracking-wider w-16">Orden</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-teal-600 uppercase tracking-wider w-16">Foto</th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-teal-600 uppercase tracking-wider w-16">
                    <EyeIcon className="h-4 w-4 mx-auto text-teal-500" />
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-teal-600 uppercase tracking-wider w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-teal-100">
                {/* Secciones visibles */}
                {visibleSections.map((section, index) => (
                  <Draggable 
                    key={section.section_id.toString()} 
                    draggableId={section.section_id.toString()} 
                    index={index}
                    isDragDisabled={!onReorderSection || !isReorderModeActive}
                  >
                    {(provided, snapshot) => (
                      <tr 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${
                          snapshot.isDragging 
                            ? "bg-blue-50" 
                            : expandedSections && expandedSections[section.section_id] 
                              ? "bg-teal-50" 
                              : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                          <div className="flex items-center">
                            <button 
                              onClick={() => onSectionClick && onSectionClick(section.section_id)}
                              className={`p-1 rounded-full transition-colors ${
                                expandedSections && expandedSections[section.section_id] 
                                  ? "bg-teal-100 text-teal-600" 
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
                          onClick={() => onSectionClick && onSectionClick(section.section_id)}
                        >
                          <div className="flex items-center">
                            <div {...provided.dragHandleProps} className="mr-2">
                              <Bars3Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            </div>
                            <div className="flex items-center">
                              <span className={`text-sm font-medium ${
                                expandedSections && expandedSections[section.section_id] 
                                  ? "text-teal-700" 
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
                              onClick={() => onToggleSectionVisibility(section.section_id, section.status)}
                              disabled={isUpdatingVisibility === section.section_id}
                              className={`p-1.5 rounded-full transition-colors ${
                                section.status === 1 
                                  ? 'text-teal-600 bg-teal-50 hover:bg-teal-100' 
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
                            <button
                              onClick={() => onEditSection(section)}
                              className="p-1 text-teal-600 hover:text-teal-900 rounded-full hover:bg-teal-50"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteSection(section)}
                              className="p-1 text-teal-600 hover:text-teal-900 rounded-full hover:bg-teal-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Draggable>
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
                          onClick={() => onSectionClick && onSectionClick(section.section_id)}
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
                      onClick={() => onSectionClick && onSectionClick(section.section_id)}
                    >
                      <div className="flex items-center">
                        <div className="mr-2">
                          <Bars3Icon className="h-5 w-5 text-gray-300 flex-shrink-0" />
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-400">{section.name}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            ({section.visible_products_count || 0}/{section.products_count || 0} productos visibles)
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
                          onClick={() => onToggleSectionVisibility(section.section_id, section.status)}
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
      
      {/* Botón para agregar nuevo producto */}
      {onAddProduct && (
        <div className="px-4 py-3 border-t border-teal-100 bg-teal-50">
          <button
            onClick={() => onAddProduct(0)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Nuevo Producto
          </button>
        </div>
      )}
    </div>
  );
}; 
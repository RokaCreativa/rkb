import React, { useState } from 'react';
import Image from 'next/image';
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, ArrowLeftIcon, ViewColumnsIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { getImagePath, handleImageError } from '@/lib/imageUtils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Pagination from '@/components/ui/Pagination';

// Tipos para las propiedades
export interface Section {
  section_id: number;
  name: string;
  image: string | null;
  status: number;
  display_order: number;
  category_id: number;
  client_id: number;
  products_count?: number;
  visible_products_count?: number;
}

interface SectionTableProps {
  sections: Section[];
  expandedSections: Record<number, boolean>;
  onSectionClick?: (sectionId: number) => void;
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (sectionId: number) => void;
  onToggleVisibility?: (sectionId: number, currentStatus: number) => void;
  isUpdatingVisibility?: number | null;
  onBackClick?: () => void;
  categoryName?: string;
  onReorderSection?: (sourceIndex: number, destinationIndex: number) => void;
  isReorderModeActive?: boolean;
  // Propiedades de paginación
  paginationEnabled?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  totalSections?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onTogglePagination?: () => void;
}

/**
 * Tabla de secciones con soporte para arrastrar y soltar
 * Permite reordenar secciones mediante drag and drop
 * Creado: 29-05-2024 (UTC+0 - Londres/Tenerife)
 */
export default function SectionTable({
  sections,
  expandedSections,
  onSectionClick,
  onEditSection,
  onDeleteSection,
  onToggleVisibility,
  isUpdatingVisibility,
  onBackClick,
  categoryName,
  onReorderSection,
  isReorderModeActive,
  // Propiedades de paginación
  paginationEnabled = false,
  currentPage = 1,
  itemsPerPage = 10,
  totalSections = 0,
  onPageChange,
  onPageSizeChange,
  onTogglePagination
}: SectionTableProps) {
  
  const [showHiddenSections, setShowHiddenSections] = useState(false);
  
  // Separar secciones visibles y no visibles
  // Usar conversión de tipos para manejar tanto booleanos como números
  const visibleSections = sections.filter(sec => 
    sec.status === 1 || Boolean(sec.status) === true
  );
  const hiddenSections = sections.filter(sec => 
    sec.status !== 1 && Boolean(sec.status) !== true
  );
  
  // Determinar el total real de secciones para paginación
  const effectiveTotalSections = paginationEnabled && totalSections ? 
    totalSections : sections.length;
  
  // Manejar el evento de drag and drop finalizado
  const handleDragEnd = (result: DropResult) => {
    // Si no hay destino o si el origen y destino son iguales, no hacer nada
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    
    // Llamar a la función de reordenamiento proporcionada por el padre
    if (onReorderSection) {
      onReorderSection(result.source.index, result.destination.index);
    }
  };
  
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white w-full">
      <div className="flex items-center justify-between px-4 py-3 bg-teal-50 border-b border-teal-100">
        <div className="flex items-center space-x-2">
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          )}
          <h2 className="text-base font-medium text-teal-600">
            {categoryName || 'Secciones'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-500">
            ({sections.filter(sec => sec.status === 1 || Boolean(sec.status) === true).length}/{sections.length} Visibles)
          </div>
          
          {onTogglePagination && (
            <button
              onClick={onTogglePagination}
              className={`px-2 py-1 text-xs rounded-md flex items-center ${
                paginationEnabled 
                  ? 'bg-teal-100 text-teal-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {paginationEnabled ? 'Desactivar paginación' : 'Activar paginación'}
            </button>
          )}
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <table className="min-w-full divide-y divide-teal-100" {...provided.droppableProps} ref={provided.innerRef}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <ViewColumnsIcon className="h-3 w-3 text-gray-400" />
                      <span>Nombre</span>
                    </div>
                  </th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Orden</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Foto</th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Visible</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-teal-100">
                {/* Secciones visibles */}
                {visibleSections.map((section, index) => (
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
                            ? "bg-teal-50" 
                            : expandedSections[section.section_id] 
                              ? "bg-teal-50" 
                              : "hover:bg-teal-50/50"
                        }`}
                      >
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                          <div className="flex items-center">
                            <button 
                              onClick={() => onSectionClick && onSectionClick(section.section_id)}
                              className={`p-1 rounded-full transition-colors ${
                                expandedSections[section.section_id] 
                                  ? "bg-teal-100 text-teal-600" 
                                  : "hover:bg-teal-50"
                              }`}
                              aria-label={expandedSections[section.section_id] ? "Colapsar" : "Expandir"}
                            >
                              {expandedSections[section.section_id] ? (
                                <ChevronDownIcon className="h-5 w-5 text-teal-600" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td 
                          className="px-3 py-2"
                          {...provided.dragHandleProps}
                        >
                          <div className="flex items-center">
                            <div className="text-gray-400 mr-2">
                              <Bars3Icon className="h-5 w-5" />
                            </div>
                            <div className={`font-medium text-sm ${
                              expandedSections[section.section_id] 
                                ? "text-teal-700" 
                                : "text-gray-600"
                            }`}>
                              {section.name}
                              {section.products_count !== undefined && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({section.visible_products_count !== undefined && section.products_count !== undefined
                                    ? `${section.visible_products_count}/${section.products_count} Productos visibles`
                                    : section.products_count > 0 
                                      ? `${section.products_count} productos`
                                      : 'Sin productos'})
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-600">
                          {section.display_order}
                        </td>
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
                              onClick={() => onToggleVisibility && onToggleVisibility(section.section_id, section.status)}
                              disabled={isUpdatingVisibility === section.section_id}
                              className={`p-1.5 rounded-full transition-colors ${
                                section.status === 1 || Boolean(section.status) === true
                                  ? 'text-teal-600 bg-teal-50 hover:bg-teal-100' 
                                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                              }`}
                              title={section.status === 1 || Boolean(section.status) === true ? "Visible" : "No visible"}
                            >
                              {isUpdatingVisibility === section.section_id ? (
                                <div className="w-5 h-5 flex items-center justify-center">
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                                </div>
                              ) : section.status === 1 || Boolean(section.status) === true ? (
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
                              onClick={() => onEditSection && onEditSection(section)}
                              className="p-1 text-teal-600 hover:text-teal-900 rounded-full hover:bg-teal-50"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteSection && onDeleteSection(section.section_id)}
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

                {/* Sección de secciones no visibles */}
                {hiddenSections.length > 0 && (
                  <tr className="bg-teal-50/30 hover:bg-teal-50/50">
                    <td colSpan={6} className="py-2 px-4">
                      <button 
                        className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-gray-700"
                        onClick={() => setShowHiddenSections(!showHiddenSections)}
                      >
                        <span>{hiddenSections.length} {hiddenSections.length === 1 ? 'sección' : 'secciones'} no visible{hiddenSections.length !== 1 ? 's' : ''}</span>
                        <ChevronDownIcon className={`h-4 w-4 transition-transform ${showHiddenSections ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                  </tr>
                )}

                {/* Secciones no visibles (mostrar solo si está expandido) */}
                {showHiddenSections && hiddenSections.map((section, index) => (
                  <Draggable 
                    key={section.section_id.toString()} 
                    draggableId={section.section_id.toString()} 
                    index={visibleSections.length + index}
                  >
                    {(provided, snapshot) => (
                      <tr 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${
                          snapshot.isDragging 
                            ? "bg-teal-50" 
                            : expandedSections[section.section_id] 
                              ? "bg-teal-50" 
                              : "hover:bg-teal-50/50"
                        }`}
                      >
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                          <div className="flex items-center">
                            <button 
                              onClick={() => onSectionClick && onSectionClick(section.section_id)}
                              className={`p-1 rounded-full transition-colors ${
                                expandedSections[section.section_id] 
                                  ? "bg-teal-100 text-teal-600" 
                                  : "hover:bg-teal-50"
                              }`}
                              aria-label={expandedSections[section.section_id] ? "Colapsar" : "Expandir"}
                            >
                              {expandedSections[section.section_id] ? (
                                <ChevronDownIcon className="h-5 w-5 text-teal-600" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td 
                          className="px-3 py-2"
                          {...provided.dragHandleProps}
                        >
                          <div className="flex items-center">
                            <div className="text-gray-400 mr-2">
                              <Bars3Icon className="h-5 w-5" />
                            </div>
                            <div className="font-medium text-sm text-gray-500">
                              {section.name}
                              {section.products_count !== undefined && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({section.visible_products_count !== undefined && section.products_count !== undefined
                                    ? `${section.visible_products_count}/${section.products_count} Productos visibles`
                                    : section.products_count > 0 
                                      ? `${section.products_count} productos`
                                      : 'Sin productos'})
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                          {section.display_order}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex justify-center">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200 opacity-70">
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
                              onClick={() => onToggleVisibility && onToggleVisibility(section.section_id, section.status)}
                              disabled={isUpdatingVisibility === section.section_id}
                              className="p-1.5 rounded-full transition-colors text-gray-400 bg-gray-50 hover:bg-gray-100"
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
                              onClick={() => onEditSection && onEditSection(section)}
                              className="p-1 text-gray-500 hover:text-teal-900 rounded-full hover:bg-teal-50"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteSection && onDeleteSection(section.section_id)}
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
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>

      {/* Componente de paginación */}
      {onPageChange && paginationEnabled && (
        <div className="border-t border-teal-100 bg-white">
          <Pagination
            totalItems={effectiveTotalSections}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>
      )}
    </div>
  );
} 
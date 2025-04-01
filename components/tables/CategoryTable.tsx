import React, { useState } from 'react';
import Image from 'next/image';
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, ViewColumnsIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { getImagePath, handleImageError } from '@/lib/imageUtils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Category } from '@/app/types/menu';
import Pagination from '../ui/Pagination';

export interface CategoryTableProps {
  /** Categorías a mostrar */
  categories: Category[];
  /** Registro de categorías expandidas */
  expandedCategories: Record<number, boolean>;
  /** Función llamada cuando se hace clic en una categoría */
  onCategoryClick?: (category: Category) => void;
  /** Función llamada cuando se edita una categoría */
  onEditCategory?: (category: Category) => void;
  /** Función llamada cuando se elimina una categoría */
  onDeleteCategory?: (categoryId: number) => void;
  /** Función llamada cuando se cambia la visibilidad de una categoría */
  onToggleVisibility?: (categoryId: number, currentStatus: number) => void;
  /** ID de la categoría cuya visibilidad se está actualizando */
  isUpdatingVisibility?: number | null;
  /** Función llamada cuando se reordenan las categorías */
  onReorderCategory?: (sourceIndex: number, destinationIndex: number) => void;
  
  /** Props de paginación (opcionales) */
  /** Número total de categorías (si es diferente de la longitud del array de categorías) */
  totalCategories?: number;
  /** Página actual (comenzando en 1) */
  currentPage?: number;
  /** Elementos por página */
  itemsPerPage?: number;
  /** Función llamada cuando se cambia de página */
  onPageChange?: (page: number) => void;
  /** Función llamada cuando se cambia el tamaño de página */
  onPageSizeChange?: (pageSize: number) => void;
  /** Si se ha habilitado la paginación */
  paginationEnabled?: boolean;
}

/**
 * Tabla de categorías con soporte para arrastrar y soltar
 * Permite reordenar categorías mediante drag and drop
 * Se ha añadido soporte para paginación opcional (28/03/2024)
 */
export default function CategoryTable({
  categories,
  expandedCategories,
  onCategoryClick,
  onEditCategory,
  onDeleteCategory,
  onToggleVisibility,
  isUpdatingVisibility,
  onReorderCategory,
  
  // Props de paginación
  totalCategories,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onPageSizeChange,
  paginationEnabled = false
}: CategoryTableProps) {
  
  const [showHiddenCategories, setShowHiddenCategories] = useState(false);
  
  // Separar categorías visibles y no visibles
  const visibleCategories = categories.filter(cat => cat.status === 1);
  const hiddenCategories = categories.filter(cat => cat.status !== 1);
  
  // Total real de categorías (para paginación)
  const actualTotalCategories = totalCategories ?? categories.length;
  
  // Manejar el evento de drag and drop finalizado
  const handleDragEnd = (result: DropResult) => {
    // Si no hay destino o si el origen y destino son iguales, no hacer nada
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    
    // Llamar a la función de reordenamiento proporcionada por el padre
    if (onReorderCategory) {
      onReorderCategory(result.source.index, result.destination.index);
    }
  };
  
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-medium text-indigo-600">
          Tus menús (Comidas, Bebidas, Postres..Etc)
        </h2>
        <div className="text-xs text-gray-500">
          ({categories.filter(cat => cat.status === 1).length}/{categories.length} Visibles)
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories">
          {(provided) => (
            <table className="min-w-full divide-y divide-gray-200" {...provided.droppableProps} ref={provided.innerRef}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <ViewColumnsIcon className="h-3 w-3 text-gray-400" />
                      <span>Nombre</span>
                    </div>
                  </th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Orden</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Foto</th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Visible</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Categorías visibles */}
                {visibleCategories.map((category, index) => (
                  <Draggable 
                    key={category.category_id.toString()} 
                    draggableId={category.category_id.toString()} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <tr 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${
                          snapshot.isDragging 
                            ? "bg-blue-50" 
                            : expandedCategories[category.category_id] 
                              ? "bg-indigo-50" 
                              : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-8">
                          <div className="flex items-center">
                            <button 
                              onClick={() => onCategoryClick && onCategoryClick(category)}
                              className={`p-1 rounded-full transition-colors ${
                                expandedCategories[category.category_id] 
                                  ? "bg-indigo-100 text-indigo-600" 
                                  : "hover:bg-gray-200 text-gray-500"
                              }`}
                              aria-label={expandedCategories[category.category_id] ? "Colapsar" : "Expandir"}
                            >
                              {expandedCategories[category.category_id] ? (
                                <ChevronDownIcon className="h-5 w-5" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td 
                          className="px-3 py-2 whitespace-nowrap"
                          {...provided.dragHandleProps}
                        >
                          <div className="flex items-center">
                            <div className="text-gray-400 mr-2">
                              <Bars3Icon className="h-5 w-5" />
                            </div>
                            <div className={`font-medium text-sm max-w-xs truncate ${
                              expandedCategories[category.category_id] 
                                ? "text-indigo-700" 
                                : "text-gray-600"
                            }`}>
                              {category.name}
                              {category.sections_count !== undefined && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({category.sections_count > 0 ? `${category.sections_count}` : 'Sin'} secciones)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-600">
                          {category.display_order}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex justify-center">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                              <Image
                                src={getImagePath(category.image, 'categories')}
                                alt={category.name || ''}
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
                              onClick={() => onToggleVisibility && onToggleVisibility(category.category_id, category.status)}
                              disabled={isUpdatingVisibility === category.category_id}
                              className={`p-1.5 rounded-full transition-colors ${
                                category.status === 1 
                                  ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                              }`}
                              title={category.status === 1 ? "Visible" : "No visible"}
                            >
                              {isUpdatingVisibility === category.category_id ? (
                                <div className="w-5 h-5 flex items-center justify-center">
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                                </div>
                              ) : category.status === 1 ? (
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
                              onClick={() => onEditCategory && onEditCategory(category)}
                              className="p-1 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteCategory && onDeleteCategory(category.category_id)}
                              className="p-1 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                
                {/* Categorías ocultas */}
                {showHiddenCategories && hiddenCategories.map((category, index) => (
                  <tr 
                    key={`hidden-${category.category_id}`}
                    className={`${
                      expandedCategories[category.category_id] 
                        ? "bg-indigo-50 opacity-70" 
                        : "hover:bg-gray-50 opacity-60"
                    }`}
                  >
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-8">
                      <div className="flex items-center">
                        <button 
                          onClick={() => onCategoryClick && onCategoryClick(category)}
                          className={`p-1 rounded-full transition-colors ${
                            expandedCategories[category.category_id] 
                              ? "bg-indigo-100 text-indigo-600" 
                              : "hover:bg-gray-200 text-gray-500"
                          }`}
                          aria-label={expandedCategories[category.category_id] ? "Colapsar" : "Expandir"}
                        >
                          {expandedCategories[category.category_id] ? (
                            <ChevronDownIcon className="h-5 w-5" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="font-medium text-sm max-w-xs truncate text-gray-400">
                          {category.name}
                          {category.sections_count !== undefined && (
                            <span className="ml-2 text-xs text-gray-400">
                              ({category.sections_count > 0 ? `${category.sections_count}` : 'Sin'} secciones)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-400">
                      {category.display_order}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                          <Image
                            src={getImagePath(category.image, 'categories')}
                            alt={category.name || ''}
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
                          onClick={() => onToggleVisibility && onToggleVisibility(category.category_id, category.status)}
                          disabled={isUpdatingVisibility === category.category_id}
                          className={`p-1.5 rounded-full transition-colors ${
                            category.status === 1 
                              ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                              : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                          }`}
                          title={category.status === 1 ? "Visible" : "No visible"}
                        >
                          {isUpdatingVisibility === category.category_id ? (
                            <div className="w-5 h-5 flex items-center justify-center">
                              <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                            </div>
                          ) : category.status === 1 ? (
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
                          onClick={() => onEditCategory && onEditCategory(category)}
                          className="p-1 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCategory && onDeleteCategory(category.category_id)}
                          className="p-1 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Botón para mostrar/ocultar categorías ocultas */}
      {hiddenCategories.length > 0 && (
        <div className="p-2 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => setShowHiddenCategories(!showHiddenCategories)}
            className="w-full flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
          >
            {showHiddenCategories ? (
              <>Ocultar categorías no visibles</>
            ) : (
              <>Mostrar {hiddenCategories.length} categorías no visibles</>
            )}
          </button>
        </div>
      )}
      
      {/* Componente de paginación (si está habilitado) */}
      {paginationEnabled && onPageChange && (
        <Pagination
          totalItems={actualTotalCategories}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          className="border-t border-gray-200"
        />
      )}
    </div>
  );
} 
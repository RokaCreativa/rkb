import React from 'react';
import Image from 'next/image';
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import { getImagePath, handleImageError } from '@/lib/imageUtils';
import { Switch } from '@headlessui/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// Tipos para las propiedades
export interface Category {
  category_id: number;
  name: string;
  image: string | null;
  status: number;
  display_order: number;
  client_id: number;
  sections_count?: number;
}

export interface CategoryTableProps {
  categories: Category[];
  expandedCategories: Record<number, boolean>;
  onCategoryClick?: (categoryId: number) => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: number) => void;
  onToggleVisibility?: (categoryId: number, currentStatus: number) => void;
  isUpdatingVisibility?: number | null;
  onReorderCategory?: (sourceIndex: number, destinationIndex: number) => void;
}

/**
 * Tabla de categorías con soporte para arrastrar y soltar
 * Permite reordenar categorías mediante drag and drop
 * Creado: 29-05-2024 (UTC+0 - Londres/Tenerife)
 */
export default function CategoryTable({
  categories,
  expandedCategories,
  onCategoryClick,
  onEditCategory,
  onDeleteCategory,
  onToggleVisibility,
  isUpdatingVisibility,
  onReorderCategory
}: CategoryTableProps) {
  
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
          {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}
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
                {categories.map((category, index) => (
                  <Draggable 
                    key={category.category_id.toString()} 
                    draggableId={category.category_id.toString()} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <tr 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? "bg-blue-50" : "hover:bg-gray-50"}`}
                      >
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-8">
                          <div className="flex items-center">
                            <button 
                              onClick={() => onCategoryClick && onCategoryClick(category.category_id)}
                              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                              aria-label={expandedCategories[category.category_id] ? "Colapsar" : "Expandir"}
                            >
                              {expandedCategories[category.category_id] ? (
                                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td 
                          className="px-3 py-2 whitespace-nowrap cursor-move"
                          {...provided.dragHandleProps}
                        >
                          <div className="flex items-center">
                            <div className="font-medium text-sm text-gray-600 max-w-xs truncate">
                              {category.name}
                              {category.sections_count !== undefined && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({category.sections_count} secciones)
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
                            <Switch
                              checked={category.status === 1}
                              onChange={() => onToggleVisibility && onToggleVisibility(category.category_id, category.status)}
                              disabled={isUpdatingVisibility === category.category_id}
                              className={`${
                                category.status === 1 ? 'bg-indigo-600' : 'bg-gray-200'
                              } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none`}
                            >
                              {isUpdatingVisibility === category.category_id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-2 h-2 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                </div>
                              )}
                              <span
                                className={`${
                                  category.status === 1 ? 'translate-x-5' : 'translate-x-1'
                                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                              />
                            </Switch>
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
                              className="p-1 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
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
    </div>
  );
} 
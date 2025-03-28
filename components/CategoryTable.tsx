import React, { useState } from 'react';
import Image from 'next/image';
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, ViewColumnsIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { getImagePath, handleImageError } from '@/lib/imageUtils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Pagination from '@/components/ui/Pagination';

// Tipos para las propiedades
export interface Category {
  category_id: number;
  name: string;
  image: string | null;
  status: number;
  display_order: number;
  client_id: number;
  sections_count?: number;
  visible_sections_count?: number;
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
  // Props de paginación (opcionales)
  paginationEnabled?: boolean;
  totalCategories?: number;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
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
  onReorderCategory,
  // Props de paginación
  paginationEnabled = false,
  totalCategories,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onPageSizeChange
}: CategoryTableProps) {
  
  const [showHiddenCategories, setShowHiddenCategories] = useState(false);
  
  // Log para depuración
  console.log("🔢 CategoryTable - categories recibidas:", categories.map(cat => ({
    id: cat.category_id,
    name: cat.name,
    sections_count: cat.sections_count,
    visible_sections_count: cat.visible_sections_count
  })));
  
  // Separar categorías visibles y no visibles
  const visibleCategories = categories.filter(cat => cat.status === 1);
  const hiddenCategories = categories.filter(cat => cat.status !== 1);
  
  // Total real de categorías (para paginación)
  const actualTotalCategories = totalCategories ?? categories.length;
  
  // Cálculo de índices de paginación
  const startIndex = paginationEnabled ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = paginationEnabled ? startIndex + itemsPerPage : categories.length;
  
  // Obtener las categorías a mostrar según paginación
  const paginatedCategories = paginationEnabled 
    ? categories.slice(startIndex, endIndex)
    : categories;
    
  // Separar las categorías paginadas por visibilidad
  const paginatedVisibleCategories = paginatedCategories.filter(cat => cat.status === 1);
  const paginatedHiddenCategories = paginatedCategories.filter(cat => cat.status !== 1);
  
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
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white w-full">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-medium text-indigo-600">
          Tus menús (Comidas, Bebidas, Postres..Etc)
        </h2>
        <div className="text-xs text-gray-500">
          {paginationEnabled ? (
            <span>Mostrando {paginatedCategories.length} de {categories.length} categorías</span>
          ) : (
            <span>({categories.filter(cat => cat.status === 1).length}/{categories.length} Visibles)</span>
          )}
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories">
          {(provided) => (
            <table className="min-w-full divide-y divide-indigo-100" {...provided.droppableProps} ref={provided.innerRef}>
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
              <tbody className="bg-white divide-y divide-indigo-100">
                {/* Categorías visibles - usar las categorías filtradas por paginación */}
                {paginatedVisibleCategories.map((category, index) => {
                  // Log para depuración individual
                  console.log(`🏷️ Renderizando categoría ${category.name} con contadores:`, {
                    sections_count: category.sections_count,
                    visible_sections_count: category.visible_sections_count
                  });
                  
                  return (
                    <Draggable 
                      key={category.category_id.toString()} 
                      draggableId={category.category_id.toString()} 
                      index={index}
                      isDragDisabled={!onReorderCategory}
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
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                            <div className="flex items-center">
                              <button 
                                onClick={() => onCategoryClick && onCategoryClick(category.category_id)}
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
                            className="px-3 py-2"
                            {...provided.dragHandleProps}
                          >
                            <div className="flex items-center">
                              <div className="text-gray-400 mr-2">
                                <Bars3Icon className="h-5 w-5" />
                              </div>
                              <div className={`font-medium text-sm ${
                                expandedCategories[category.category_id] 
                                  ? "text-indigo-700" 
                                  : "text-gray-600"
                              }`}>
                                {category.name}
                                {(category.sections_count !== undefined || category.visible_sections_count !== undefined) && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({category.visible_sections_count !== undefined && category.sections_count !== undefined
                                      ? `${category.visible_sections_count}/${category.sections_count} Secciones visibles`
                                      : category.sections_count
                                        ? `${category.sections_count} secciones`
                                        : 'Sin secciones'})
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
                  );
                })}

                {/* Sección de categorías no visibles - usar las categorías filtradas por paginación */}
                {paginatedHiddenCategories.length > 0 && (
                  <tr className="bg-indigo-50/30 hover:bg-indigo-50/50">
                    <td colSpan={6} className="py-2 px-4">
                      <button 
                        className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-gray-700"
                        onClick={() => setShowHiddenCategories(!showHiddenCategories)}
                      >
                        <span>{paginatedHiddenCategories.length} {paginatedHiddenCategories.length === 1 ? 'categoría' : 'categorías'} no visible{paginatedHiddenCategories.length !== 1 ? 's' : ''}</span>
                        <ChevronDownIcon className={`h-4 w-4 transition-transform ${showHiddenCategories ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                  </tr>
                )}

                {/* Categorías no visibles - usar las categorías filtradas por paginación */}
                {showHiddenCategories && paginatedHiddenCategories.map((category, index) => (
                  <Draggable 
                    key={category.category_id.toString()} 
                    draggableId={category.category_id.toString()} 
                    index={paginatedVisibleCategories.length + index}
                  >
                    {(provided, snapshot) => (
                      <tr 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${
                          snapshot.isDragging 
                            ? "bg-blue-50" 
                            : expandedCategories[category.category_id] 
                              ? "bg-indigo-100" 
                              : "bg-indigo-50 hover:bg-indigo-50"
                        }`}
                      >
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                          <div className="flex items-center">
                            <button 
                              onClick={() => onCategoryClick && onCategoryClick(category.category_id)}
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
                          className="px-3 py-2"
                          {...provided.dragHandleProps}
                        >
                          <div className="flex items-center">
                            <div className="text-gray-400 mr-2">
                              <Bars3Icon className="h-5 w-5" />
                            </div>
                            <div className="font-medium text-sm text-gray-500">
                              {category.name}
                              {(category.sections_count !== undefined || category.visible_sections_count !== undefined) && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({category.visible_sections_count !== undefined && category.sections_count !== undefined
                                    ? `${category.visible_sections_count}/${category.sections_count} Secciones visibles`
                                    : category.sections_count
                                      ? `${category.sections_count} secciones`
                                      : 'Sin secciones'})
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                          {category.display_order}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex justify-center">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200 opacity-70">
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
                              className="p-1.5 rounded-full transition-colors text-gray-400 bg-gray-50 hover:bg-gray-100"
                              title="No visible"
                            >
                              {isUpdatingVisibility === category.category_id ? (
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
                              onClick={() => onEditCategory && onEditCategory(category)}
                              className="p-1 text-gray-500 hover:text-indigo-900 rounded-full hover:bg-indigo-50"
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
                
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Añadir paginación al final de la tabla */}
      {paginationEnabled && onPageChange && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Pagination
            totalItems={actualTotalCategories}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
} 
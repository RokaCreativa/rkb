"use client";

import React, { useState } from 'react';
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, EyeIcon, EyeSlashIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Category, Section } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface CategoryTableProps {
  categories: Category[];
  expandedCategories: Record<number, boolean>;
  isUpdatingVisibility: number | null;
  onCategoryClick: (category: Category) => void;
  onToggleCategoryVisibility: (categoryId: number, currentStatus: number) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: number) => void;
  sections: Record<number, Section[]>;
  expandedSections: Record<number, boolean>;
  onAddSection: (categoryId: number) => void;
  onSectionClick: (sectionId: number) => void;
  onToggleSectionVisibility: (sectionId: number, currentStatus: number) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  onAddProduct: (sectionId: number) => void;
  onReorderCategory?: (sourceIndex: number, destinationIndex: number) => void;
  isReorderModeActive?: boolean;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  expandedCategories,
  isUpdatingVisibility,
  onCategoryClick,
  onToggleCategoryVisibility,
  onEditCategory,
  onDeleteCategory,
  onReorderCategory,
  isReorderModeActive = false
}) => {
  const [showHiddenCategories, setShowHiddenCategories] = useState(true);
  
  const visibleCategories = categories.filter(cat => cat.status === 1);
  const hiddenCategories = categories.filter(cat => cat.status !== 1);
  
  const visibleCategoriesCount = visibleCategories.length;
  const totalCategories = categories.length;
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    
    if (onReorderCategory) {
      onReorderCategory(result.source.index, result.destination.index);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg mb-4 border border-gray-200">
      <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-medium text-indigo-600">
          Tus menús (Comidas, Bebidas, Postres..Etc)
        </h2>
        <div className="text-xs text-gray-500">
          ({visibleCategoriesCount}/{totalCategories} Visibles)
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
                {visibleCategories.map((category, index) => (
                  <Draggable 
                    key={category.category_id.toString()} 
                    draggableId={category.category_id.toString()} 
                    index={index}
                    isDragDisabled={!onReorderCategory || !isReorderModeActive}
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
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onCategoryClick && onCategoryClick(category);
                              }}
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
                          onClick={() => onCategoryClick(category)}
                          {...provided.dragHandleProps}
                        >
                          <div className="flex items-center">
                            <Bars3Icon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900 mr-2">{category.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(category.sections_count || 0)} Secciones {(category.visible_sections_count || 0)} visibles)
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">{category.display_order || index + 1}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="h-10 w-10 rounded-full overflow-hidden mx-auto">
                            {category.image ? (
                              <img 
                                src={getImagePath(category.image, 'categories')} 
                                alt={category.name} 
                                className="h-full w-full object-cover"
                                onError={handleImageError}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                <span className="text-xs text-gray-500">Sin imagen</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleCategoryVisibility(category.category_id, category.status === 1 ? 0 : 1);
                            }}
                            disabled={isUpdatingVisibility === category.category_id}
                            className="focus:outline-none"
                          >
                            {isUpdatingVisibility === category.category_id ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </span>
                            ) : category.status === 1 ? (
                              <span className="inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                <EyeIcon className="h-4 w-4" />
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                <EyeSlashIcon className="h-4 w-4" />
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="flex space-x-3 justify-center">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditCategory(category);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              aria-label="Editar categoría"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteCategory(category.category_id);
                              }}
                              className="text-red-600 hover:text-red-800"
                              aria-label="Eliminar categoría"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                
                {hiddenCategories.length > 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                      <div 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => setShowHiddenCategories(!showHiddenCategories)}
                      >
                        {showHiddenCategories ? (
                          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-xs text-gray-500">{hiddenCategories.length} categorías no visibles</span>
                      </div>
                    </td>
                  </tr>
                )}
                
                {showHiddenCategories && hiddenCategories.map((category, index) => (
                  <tr 
                    key={`hidden-${category.category_id}`}
                    className={`bg-gray-50 hover:bg-gray-100 cursor-pointer ${expandedCategories[category.category_id] ? 'bg-gray-100' : ''}`}
                    onClick={() => onCategoryClick(category)}
                  >
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                      <div className="flex items-center">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onCategoryClick && onCategoryClick(category);
                          }}
                          className={`p-1 rounded-full transition-colors ${
                            expandedCategories[category.category_id] 
                              ? "bg-indigo-100 text-indigo-600" 
                              : "hover:bg-gray-200 text-gray-500"
                          }`}
                        >
                          {expandedCategories[category.category_id] ? (
                            <ChevronDownIcon className="h-5 w-5" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <Bars3Icon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 mr-2">{category.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(category.sections_count || 0)} Secciones {(category.visible_sections_count || 0)} visibles)
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">{category.display_order || visibleCategories.length + index + 1}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden mx-auto">
                        {category.image ? (
                          <img 
                            src={getImagePath(category.image, 'categories')} 
                            alt={category.name} 
                            className="h-full w-full object-cover"
                            onError={handleImageError}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-200">
                            <span className="text-xs text-gray-500">Sin imagen</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCategoryVisibility(category.category_id, category.status === 1 ? 0 : 1);
                        }}
                        disabled={isUpdatingVisibility === category.category_id}
                        className="focus:outline-none"
                      >
                        {isUpdatingVisibility === category.category_id ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </span>
                        ) : category.status === 1 ? (
                          <span className="inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <EyeIcon className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            <EyeSlashIcon className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="flex space-x-3 justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCategory(category);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          aria-label="Editar categoría"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCategory(category.category_id);
                          }}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Eliminar categoría"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {provided.placeholder}
                
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay categorías disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CategoryTable; 
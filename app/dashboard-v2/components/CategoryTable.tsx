"use client";

import React, { useState } from 'react';
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, EyeIcon, EyeSlashIcon, ViewColumnsIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Category, Section, Product } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Image from 'next/image';
import SectionList from './sections/SectionList';

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
  products?: Record<string, Product[]>;
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  isUpdatingProductVisibility?: number | null;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  expandedCategories,
  isUpdatingVisibility,
  onCategoryClick,
  onToggleCategoryVisibility,
  onEditCategory,
  onDeleteCategory,
  sections,
  expandedSections,
  onAddSection,
  onSectionClick,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  onAddProduct,
  onReorderCategory,
  isReorderModeActive = false,
  products = {},
  onToggleProductVisibility,
  onEditProduct,
  onDeleteProduct,
  isUpdatingProductVisibility = null
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
    <div className="rounded-lg border category-border overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 category-bg border-b category-border">
        <h2 className="text-sm font-medium category-text">
          Tus menús (Comidas, Bebidas, Postres...)
        </h2>
        <div className="flex items-center">
          <div className="text-xs category-title mr-4">
            ({visibleCategoriesCount}/{totalCategories} Visibles)
          </div>
          <button
            onClick={() => setShowHiddenCategories(!showHiddenCategories)}
            className="text-xs category-title hover:text-indigo-800 flex items-center gap-1"
          >
            {showHiddenCategories ? 'Ocultar' : 'Mostrar'} no visibles
            {showHiddenCategories ? 
              <ChevronDownIcon className="h-3 w-3" /> : 
              <ChevronDownIcon className="h-3 w-3" />
            }
          </button>
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories">
          {(provided) => (
            <table className="min-w-full divide-y category-border" {...provided.droppableProps} ref={provided.innerRef}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium category-title uppercase tracking-wider w-10"></th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium category-title uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <ViewColumnsIcon className="h-3 w-3 category-title" />
                      <span>Nombre</span>
                    </div>
                  </th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium category-title uppercase tracking-wider w-16">Orden</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium category-title uppercase tracking-wider w-16">Foto</th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium category-title uppercase tracking-wider w-16">
                    <EyeIcon className="h-4 w-4 mx-auto category-title" />
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium category-title uppercase tracking-wider w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y category-border">
                {visibleCategories.map((category, index) => (
                  <React.Fragment key={`section-group-${category.category_id}`}>
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
                                ? "category-bg" 
                                : "hover:bg-gray-50"
                          } mt-4`}
                        >
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                            <div className="flex items-center">
                              <button 
                                onClick={() => onCategoryClick(category)}
                                className={`p-1 rounded-full transition-colors ${
                                  expandedCategories[category.category_id] 
                                    ? "bg-indigo-100 category-title" 
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
                            className="px-3 py-2 cursor-pointer"
                            onClick={() => onCategoryClick(category)}
                          >
                            <div className="flex items-center">
                              <div {...provided.dragHandleProps} className="mr-2">
                                <Bars3Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              </div>
                              <div className="flex items-center">
                                <span className={`text-sm font-medium ${
                                  expandedCategories[category.category_id] 
                                    ? "category-text" 
                                    : "text-gray-700"
                                }`}>{category.name}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  ({category.visible_sections_count || 0}/{category.sections_count || 0} secciones visibles)
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">{category.display_order || index + 1}</td>
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
                                onClick={() => onToggleCategoryVisibility(category.category_id, category.status)}
                                disabled={isUpdatingVisibility === category.category_id}
                                className={`p-1.5 rounded-full transition-colors ${
                                  category.status === 1 
                                    ? 'category-title bg-indigo-50 hover:bg-indigo-100' 
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
                                onClick={() => onEditCategory(category)}
                                className="p-1 category-title hover:text-indigo-900 rounded-full hover:bg-indigo-50"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onDeleteCategory(category.category_id)}
                                className="p-1 category-title hover:text-indigo-900 rounded-full hover:bg-indigo-50"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                    
                    {expandedCategories[category.category_id] && sections[category.category_id] ? (
                      <tr key={`sections-${category.category_id}`} className="bg-white">
                        <td colSpan={6} className="p-0">
                          <div className="px-4 py-4 border-t border-gray-100">
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                              <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700">
                                  Secciones: {category.name}
                                </h3>
                                <button
                                  onClick={() => onAddSection(category.category_id)}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded category-button hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  <PlusIcon className="h-4 w-4 mr-1" />
                                  Agregar sección
                                </button>
                              </div>
                              
                              {sections[category.category_id] && sections[category.category_id].length > 0 ? (
                                <SectionList
                                  sections={sections[category.category_id]}
                                  expandedSections={expandedSections}
                                  onSectionClick={onSectionClick}
                                  onAddSection={() => onAddSection(category.category_id)}
                                  onToggleSectionVisibility={onToggleSectionVisibility}
                                  onEditSection={onEditSection}
                                  onDeleteSection={onDeleteSection}
                                  onAddProduct={onAddProduct}
                                  products={products}
                                  onToggleProductVisibility={onToggleProductVisibility}
                                  onEditProduct={onEditProduct}
                                  onDeleteProduct={onDeleteProduct}
                                  isUpdatingVisibility={isUpdatingVisibility}
                                  isUpdatingProductVisibility={isUpdatingProductVisibility}
                                  categoryName={category.name}
                                  categoryId={category.category_id}
                                />
                              ) : (
                                <div className="p-4 text-center text-gray-500 bg-white">
                                  No hay secciones disponibles
                                </div>
                              )}
                              
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                ))}
                
                {provided.placeholder}
                
                {showHiddenCategories && hiddenCategories.map((category, index) => (
                  <tr 
                    key={`hidden-${category.category_id}`}
                    className={`${
                      expandedCategories[category.category_id] 
                        ? "bg-gray-50 opacity-80" 
                        : "hover:bg-gray-50 opacity-70"
                    }`}
                  >
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-400 w-10">
                      <div className="flex items-center">
                        <button 
                          onClick={() => onCategoryClick(category)}
                          className={`p-1 rounded-full transition-colors ${
                            expandedCategories[category.category_id] 
                              ? "bg-gray-200 text-gray-500" 
                              : "hover:bg-gray-200 text-gray-400"
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
                    <td 
                      className="px-3 py-2 cursor-pointer"
                      onClick={() => onCategoryClick(category)}
                    >
                      <div className="flex items-center">
                        <div className="mr-2">
                          <Bars3Icon className="h-5 w-5 text-gray-300 flex-shrink-0" />
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-400">{category.name}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            ({category.visible_sections_count || 0}/{category.sections_count || 0} secciones visibles)
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-400 text-center">{category.display_order || index + 1 + visibleCategories.length}</td>
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
                          onClick={() => onToggleCategoryVisibility(category.category_id, category.status)}
                          disabled={isUpdatingVisibility === category.category_id}
                          className="p-1.5 rounded-full text-gray-400 bg-gray-50 hover:bg-gray-100"
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
                          onClick={() => onEditCategory(category)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCategory(category.category_id)}
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

export default CategoryTable; 
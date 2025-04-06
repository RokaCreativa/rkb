"use client";

import React, { useState } from 'react';
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, EyeIcon, EyeSlashIcon, ViewColumnsIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Category, Section, Product } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import { Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Image from 'next/image';
import SectionList from './sections/SectionList';
import { GridIcon } from '@/app/dashboard-v2/shared/components/grid/GridIcon';

interface CategoryTableProps {
  categories: Category[];
  expandedCategories: Record<number, boolean>;
  isUpdatingVisibility: number | null;
  onCategoryClick: (category: Category) => void;
  onToggleCategoryVisibility: (categoryId: number, currentStatus: number) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
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
  products?: Record<number, Product[]>;
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  isUpdatingProductVisibility?: number | null;
  onAddCategory?: () => void;
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
  isUpdatingProductVisibility = null,
  onAddCategory
}) => {
  const [showHiddenCategories, setShowHiddenCategories] = useState(true);
  
  const visibleCategories = categories.filter(cat => cat.status === 1);
  const hiddenCategories = categories.filter(cat => cat.status !== 1);
  
  const visibleCategoriesCount = visibleCategories.length;
  const totalCategories = categories.length;
  
  /**
   * Maneja el fin del arrastre para reordenar categorías
   * @param {DropResult} result - Resultado del arrastre
   */
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    
    console.log("Drag end in CategoryTable", result);
    
    // Solo procesar si tenemos una función de reordenamiento y el modo está activo
    if (onReorderCategory && isReorderModeActive) {
      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;
      
      // Llamar directamente a la función de reordenamiento con los índices correctos
      onReorderCategory(sourceIndex, destinationIndex);
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
      
      <Droppable droppableId="categories" type="CATEGORY">
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
                    isDragDisabled={false}
                  >
                    {(provided, snapshot) => (
                      <tr 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${
                          snapshot.isDragging 
                            ? "grid-item-dragging-category" 
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
                              aria-expanded={expandedCategories[category.category_id]}
                            >
                              {expandedCategories[category.category_id] ? (
                                <GridIcon type="category" icon="collapse" size="large" />
                              ) : (
                                <GridIcon type="category" icon="expand" size="large" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td 
                          className="px-3 py-2 cursor-pointer"
                          onClick={() => onCategoryClick(category)}
                        >
                          <div className="flex items-center">
                            <div {...provided.dragHandleProps} className="category-drag-handle mr-2 px-1" title="Arrastrar para reordenar">
                              <GridIcon type="category" icon="drag" size="large" />
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
                            <div className="grid-image-container">
                              <Image
                                src={getImagePath(category.image, 'categories')}
                                alt={category.name || ''}
                                width={32}
                                height={32}
                                className="grid-image"
                                onError={handleImageError}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-center">
                          <button
                            onClick={() => onToggleCategoryVisibility(category.category_id, category.status)}
                            className={`inline-flex items-center justify-center h-6 w-6 rounded ${
                              category.status === 1
                                ? 'category-action category-icon-hover'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            disabled={isUpdatingVisibility === category.category_id}
                            aria-label={category.status === 1 ? "Ocultar categoría" : "Mostrar categoría"}
                          >
                            {isUpdatingVisibility === category.category_id ? (
                              <div className="w-4 h-4 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
                            ) : (
                              <GridIcon 
                                type="category" 
                                icon={category.status === 1 ? "visibility" : "hidden"} 
                                size="medium" 
                              />
                            )}
                          </button>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-1">
                            <button
                              onClick={() => onAddSection(category.category_id)}
                              className="action-button category-action category-icon-hover"
                              title="Agregar sección"
                            >
                              <GridIcon type="category" icon="add" size="medium" />
                            </button>
                            <button
                              onClick={() => onEditCategory(category)}
                              className="action-button category-action category-icon-hover"
                            >
                              <GridIcon type="category" icon="edit" size="medium" />
                            </button>
                            <button
                              onClick={() => onDeleteCategory(category)}
                              className="category-action-delete"
                            >
                              <GridIcon type="category" icon="delete" size="medium" />
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
                            {sections[category.category_id] && sections[category.category_id].length > 0 ? (
                              <SectionList
                                sections={sections[category.category_id]}
                                expandedSections={expandedSections}
                                onSectionClick={onSectionClick}
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
                                onAddSectionToCategory={(catId) => onAddSection(catId)}
                                onSectionsReorder={onReorderCategory ? 
                                  (categoryId, sourceIndex, destIndex) => onReorderCategory(sourceIndex, destIndex) 
                                  : undefined
                                }
                                isReorderModeActive={isReorderModeActive}
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
                <tr key={`hidden-category-${category.category_id}`} className="grid-item-hidden hover:bg-gray-50">
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                    <div className="flex items-center">
                      <button 
                        onClick={() => onCategoryClick(category)}
                        className={`p-1 rounded-full transition-colors hover:bg-gray-200 text-gray-400`}
                        aria-label={expandedCategories[category.category_id] ? "Colapsar" : "Expandir"}
                      >
                        {expandedCategories[category.category_id] ? (
                          <GridIcon type="category" icon="collapse" size="large" />
                        ) : (
                          <GridIcon type="category" icon="expand" size="large" />
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
                        <GridIcon type="category" icon="drag" size="large" />
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-400">{category.name}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          ({category.visible_sections_count || 0}/{category.sections_count || 0} secciones visibles)
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-400 text-center">{category.display_order || visibleCategories.length + index + 1}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex justify-center">
                      <div className="grid-image-container">
                        {category.image && (
                          <img 
                            src={getImagePath(category.image, 'categories')}
                            alt={category.name || ''}
                            className="grid-image opacity-50 grayscale"
                            onError={handleImageError}
                          />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-center">
                    <button
                      onClick={() => onToggleCategoryVisibility(category.category_id, category.status)}
                      className="p-1.5 rounded-full text-gray-400 bg-gray-50 hover:bg-gray-100"
                      title="No visible"
                      disabled={isUpdatingVisibility === category.category_id}
                    >
                      {isUpdatingVisibility === category.category_id ? (
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                        </div>
                      ) : (
                        <GridIcon 
                          type="category" 
                          icon={category.status === 1 ? "visibility" : "hidden"} 
                          size="medium" 
                        />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-1">
                      <button
                        onClick={() => onAddSection(category.category_id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        title="Agregar sección"
                      >
                        <GridIcon type="category" icon="add" size="medium" />
                      </button>
                      <button
                        onClick={() => onEditCategory(category)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <GridIcon type="category" icon="edit" size="medium" />
                      </button>
                      <button
                        onClick={() => onDeleteCategory(category)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <GridIcon type="category" icon="delete" size="medium" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Botón para agregar categoría al final de la lista */}
              {onAddCategory && (
                <tr className="bg-gray-50">
                  <td colSpan={6} className="px-3 py-3 text-center">
                    <button
                      onClick={onAddCategory}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded category-button"
                    >
                      <GridIcon type="category" icon="add" size="medium" />
                      Agregar categoría
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Droppable>
    </div>
  );
};

export default CategoryTable; 
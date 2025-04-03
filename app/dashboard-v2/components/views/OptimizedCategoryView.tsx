"use client";

/**
 * @fileoverview Versión optimizada del componente CategoryView con virtualización
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import React, { memo, useCallback, useMemo, CSSProperties } from 'react';
import { CheckIcon, EyeIcon, EyeSlashIcon, PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Category, Section } from '@/app/dashboard-v2/types';
import VirtualizedList from '../ui/VirtualizedList';

// Altura de cada elemento de categoría
const CATEGORY_ITEM_HEIGHT = 80;

interface OptimizedCategoryViewProps {
  categories: Category[];
  expandedCategories: { [key: number]: boolean };
  isUpdatingVisibility: number | null;
  onAddCategory: () => void;
  onCategoryClick: (category: Category) => void;
  onToggleCategoryVisibility: (categoryId: number, status: number) => Promise<void>;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: number) => void;
  sections: { [key: string]: Section[] };
  expandedSections: { [key: number]: boolean };
  onAddSection: (categoryId: number) => void;
  onSectionClick: (section: Section) => void;
  onToggleSectionVisibility: (sectionId: number, status: number) => Promise<void>;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: number) => void;
  onAddProduct: (sectionId: number) => void;
  onReorderCategory?: (sourceIndex: number, destIndex: number) => void;
  isReorderModeActive?: boolean;
}

/**
 * Versión optimizada del componente CategoryView que utiliza virtualización
 * para mejorar el rendimiento con grandes cantidades de categorías.
 */
function OptimizedCategoryView({
  categories,
  expandedCategories,
  isUpdatingVisibility,
  onAddCategory,
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
  isReorderModeActive
}: OptimizedCategoryViewProps) {
  // Memoizamos el renderizado de cada categoría para evitar re-renders innecesarios
  const renderCategory = useCallback((category: Category, index: number, style: CSSProperties) => {
    const isExpanded = expandedCategories[category.category_id] || false;
    const isUpdating = isUpdatingVisibility === category.category_id;
    
    return (
      <div className="mb-4 bg-white shadow-sm rounded-lg overflow-hidden" style={{ ...style, height: 'auto' }}>
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => onCategoryClick(category)}
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg font-medium">{category.name}</span>
            {category.sections_count && category.sections_count > 0 && (
              <span className="text-xs bg-gray-200 text-gray-700 py-1 px-2 rounded-full">
                {category.visible_sections_count || 0}/{category.sections_count} secciones
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCategoryVisibility(category.category_id, category.status);
              }}
              className="p-1.5 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
              disabled={!!isUpdatingVisibility}
            >
              {isUpdating ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />
              ) : category.status === 1 ? (
                <EyeIcon className="w-5 h-5" />
              ) : (
                <EyeSlashIcon className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditCategory(category);
              }}
              className="p-1.5 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCategory(category.category_id);
              }}
              className="p-1.5 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }, [expandedCategories, isUpdatingVisibility, onCategoryClick, onToggleCategoryVisibility, onEditCategory, onDeleteCategory]);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        <button
          onClick={onAddCategory}
          className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Añadir Categoría</span>
        </button>
      </div>
      
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay categorías creadas</p>
          <button
            onClick={onAddCategory}
            className="inline-flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Crear primera categoría</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <VirtualizedList
            items={categories}
            height="calc(100vh - 200px)"
            itemHeight={CATEGORY_ITEM_HEIGHT}
            renderItem={renderCategory}
            className="pr-2"
            itemClassName="transition-all duration-200"
          />
        </div>
      )}
    </div>
  );
}

// Utilizamos React.memo para evitar re-renders innecesarios
export default memo(OptimizedCategoryView); 
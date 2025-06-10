"use client";

import React from 'react';
import { Category } from '@/app/dashboard-v2/types/domain/category';
import Image from 'next/image';
import { ArrowLongRightIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import ContextMenu from '../../ui/ContextMenu';

interface CategoryListProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
  expandedCategories: { [key: number]: boolean };
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (category: Category) => void;
  onToggleVisibility?: (category: Category) => void;
}

export function CategoryList({ categories, onCategoryClick, expandedCategories, onEditCategory, onDeleteCategory, onToggleVisibility }: CategoryListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-3">Categorías</h2>

      {categories.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay categorías disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {categories.map((category) => {
            const actions = [];
            if (onEditCategory) {
              actions.push({ label: 'Editar', onClick: () => onEditCategory(category) });
            }
            if (onDeleteCategory) {
              actions.push({ label: 'Eliminar', onClick: () => onDeleteCategory(category), isDestructive: true });
            }

            return (
              <div
                key={category.category_id}
                className={`bg-white rounded-lg shadow-md transition-all duration-300 ${category.status === 0 ? 'opacity-60' : ''}`}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-shrink-0 h-14 w-14 relative">
                    <Image
                      src={getImagePath(category.image || null, 'categories')}
                      alt={category.name}
                      fill
                      className="object-cover rounded-md"
                      onError={handleImageError}
                    />
                  </div>

                  <div className="flex-grow cursor-pointer" onClick={() => onCategoryClick(category)}>
                    <h3 className="font-bold text-lg text-gray-800">{category.name}</h3>
                    <span className="text-sm text-gray-500">
                      {category.visible_sections_count} / {category.sections_count} Secciones Visibles
                    </span>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    {onToggleVisibility && (
                      <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(category); }} className="p-2 rounded-full hover:bg-gray-200">
                        {category.status === 1 ? <EyeIcon className="h-6 w-6 text-gray-600" /> : <EyeSlashIcon className="h-6 w-6 text-gray-500" />}
                      </button>
                    )}
                    {actions.length > 0 && <ContextMenu actions={actions} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 
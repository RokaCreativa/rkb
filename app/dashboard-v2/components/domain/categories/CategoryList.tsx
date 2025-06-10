"use client";

import React from 'react';
import { Category } from '@/app/types/menu';
import Image from 'next/image';
import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import ContextMenu from '../../ui/ContextMenu';

interface CategoryListProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
  expandedCategories: { [key: number]: boolean };
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (category: Category) => void;
}

export function CategoryList({ categories, onCategoryClick, expandedCategories, onEditCategory, onDeleteCategory }: CategoryListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-3">Categorías</h2>

      {categories.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay categorías disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${expandedCategories[category.category_id] ? 'ring-2 ring-indigo-500' : ''
                  }`}
              >
                <div className="relative h-36" onClick={() => onCategoryClick(category)}>
                  {category.image ? (
                    <Image
                      src={getImagePath(category.image, 'categories')}
                      alt={category.name}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Sin imagen</span>
                    </div>
                  )}

                  {category.status === 0 && (
                    <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Oculta
                    </div>
                  )}
                </div>

                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <span className="text-sm text-gray-500">Orden: {category.display_order}</span>
                  </div>
                  {actions.length > 0 && <ContextMenu actions={actions} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 
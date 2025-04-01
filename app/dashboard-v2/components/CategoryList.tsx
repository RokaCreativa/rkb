"use client";

import React from 'react';
import { Category } from '@/app/types/menu';
import Image from 'next/image';

interface CategoryListProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
  expandedCategories: {[key: number]: boolean};
}

export function CategoryList({ categories, onCategoryClick, expandedCategories }: CategoryListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-3">Categorías</h2>
      
      {categories.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay categorías disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div 
              key={category.category_id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                expandedCategories[category.category_id] ? 'ring-2 ring-indigo-500' : ''
              }`}
              onClick={() => onCategoryClick(category)}
            >
              <div className="relative h-36">
                {category.image ? (
                  <Image
                    src={`/images/categories/${category.image}`}
                    alt={category.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.png';
                    }}
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
              
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">Orden: {category.display_order}</span>
                  {expandedCategories[category.category_id] && (
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                      Seleccionada
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
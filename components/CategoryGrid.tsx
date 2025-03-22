import React from 'react';
import Image from 'next/image';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { getImagePath, handleImageError } from '@/lib/imageUtils';

// Tipos para las propiedades
export interface Category {
  category_id: number;
  name: string;
  image: string | null;
  status: number;
  display_order: number;
  products_count?: number;
  sections_count?: number;
}

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick?: (category: Category) => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (category: Category) => void;
  onToggleVisibility?: (category: Category) => void;
  isUpdatingVisibility?: number | null;
}

/**
 * Componente para mostrar categorías en un grid con tarjetas.
 * Permite la navegación a las secciones de cada categoría.
 */
export default function CategoryGrid({
  categories,
  onCategoryClick,
  onEditCategory,
  onDeleteCategory,
  onToggleVisibility,
  isUpdatingVisibility
}: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <div 
          key={category.category_id}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md"
        >
          {/* Imagen de la categoría */}
          <div 
            className="relative h-40 bg-gray-100 cursor-pointer"
            onClick={() => onCategoryClick && onCategoryClick(category)}
          >
            <Image
              src={getImagePath(category.image, 'categories')}
              alt={category.name || ''}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="object-cover"
              onError={handleImageError}
            />
            
            {/* Indicador de estado */}
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
              category.status === 1 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-400 text-white'
            }`}>
              {category.status === 1 ? 'Activo' : 'Inactivo'}
            </div>
          </div>
          
          {/* Información de la categoría */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <h3 
                className="text-base font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => onCategoryClick && onCategoryClick(category)}
              >
                {category.name}
              </h3>
              
              <div className="flex space-x-1">
                {onToggleVisibility && (
                  <button
                    onClick={() => onToggleVisibility(category)}
                    disabled={isUpdatingVisibility === category.category_id}
                    className="p-1 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors"
                    title={category.status === 1 ? 'Desactivar' : 'Activar'}
                  >
                    <EyeIcon className="h-4 w-4" />
                    {isUpdatingVisibility === category.category_id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
                      </div>
                    )}
                  </button>
                )}
                
                {onEditCategory && (
                  <button
                    onClick={() => onEditCategory(category)}
                    className="p-1 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors"
                    title="Editar categoría"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                
                {onDeleteCategory && (
                  <button
                    onClick={() => onDeleteCategory(category)}
                    className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    title="Eliminar categoría"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Orden: {category.display_order}</span>
              <div className="flex items-center space-x-3">
                {category.sections_count !== undefined && (
                  <span>{category.sections_count} secciones</span>
                )}
                {category.products_count !== undefined && (
                  <span>{category.products_count} productos</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {categories.length === 0 && (
        <div className="col-span-full text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No hay categorías disponibles</p>
        </div>
      )}
    </div>
  );
} 
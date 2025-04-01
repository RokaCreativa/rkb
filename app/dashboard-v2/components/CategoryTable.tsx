"use client";

import React from 'react';
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, PlusIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Category, Section } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';

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
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  expandedCategories,
  isUpdatingVisibility,
  onCategoryClick,
  onToggleCategoryVisibility,
  onEditCategory,
  onDeleteCategory
}) => {
  // Obtener las categorías visibles
  const visibleCategories = categories.filter(cat => cat.status === 1);
  const visibleCategoriesCount = visibleCategories.length;
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
      <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-medium text-indigo-600">
          Tus menús (Comidas, Bebidas, Postres..Etc)
        </h2>
        <div className="text-xs text-gray-500">
          ({visibleCategoriesCount}/{categories.length} Visibles)
        </div>
      </div>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="pl-6 pr-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              NOMBRE
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              ORDEN
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              FOTO
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
              VISIBLE
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              ACCIONES
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <tr 
                key={category.category_id}
                className={`hover:bg-gray-50 cursor-pointer ${expandedCategories[category.category_id] ? 'bg-gray-50' : ''}`}
                onClick={() => onCategoryClick(category)}
              >
                <td className="pl-6 pr-3 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-2">
                      {expandedCategories[category.category_id] ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <Bars3Icon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      <div className="text-xs text-gray-500">
                        {(category.sections_count || 0)} Secciones ({(category.visible_sections_count || 0)} visibles)
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{category.display_order || index + 1}</td>
                <td className="px-3 py-4 whitespace-nowrap text-center">
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
                <td className="px-3 py-4 whitespace-nowrap text-center">
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
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Visible
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        <EyeSlashIcon className="h-4 w-4 mr-1" />
                        Oculto
                      </span>
                    )}
                  </button>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-center">
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
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                No hay categorías disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable; 
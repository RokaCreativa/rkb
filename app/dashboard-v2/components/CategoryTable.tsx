"use client";

import React from 'react';
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Category, Section } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/core/utils/imageUtils';
import { SectionTable } from './SectionTable';

interface CategoryTableProps {
  categories: Category[];
  sections: Record<number, Section[]>;
  expandedCategories: Record<number, boolean>;
  isUpdatingVisibility: number | null;
  onCategoryClick: (category: Category) => void;
  onToggleCategoryVisibility: (categoryId: number, currentStatus: number) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: number) => void;
  onAddSection: (categoryId: number) => void;
  onSectionClick: (sectionId: number) => void;
  expandedSections: Record<number, boolean>;
  onToggleSectionVisibility: (sectionId: number, currentStatus: number) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  onAddProduct: (sectionId: number) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  sections,
  expandedCategories,
  isUpdatingVisibility,
  onCategoryClick,
  onToggleCategoryVisibility,
  onEditCategory,
  onDeleteCategory,
  onAddSection,
  onSectionClick,
  expandedSections,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  onAddProduct
}) => {
  return (
    <div className="bg-white shadow overflow-hidden rounded-md mb-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              NOMBRE
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ORDEN
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              FOTO
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              VISIBLE
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ACCIONES
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <React.Fragment key={category.category_id}>
                <tr 
                  className={`hover:bg-gray-50 cursor-pointer ${expandedCategories[category.category_id] ? 'bg-gray-50' : ''}`}
                  onClick={() => onCategoryClick(category)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-2">
                        {expandedCategories[category.category_id] ? (
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        <div className="text-xs text-gray-500">
                          {category.sections_count || 0} Secciones ({category.visible_sections_count || 0} visibles)
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      className={`${
                        category.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      } px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCategoryVisibility(category.category_id, category.status);
                      }}
                      disabled={isUpdatingVisibility === category.category_id}
                    >
                      {isUpdatingVisibility === category.category_id ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Actualizando...
                        </span>
                      ) : (
                        category.status === 1 ? 'Visible' : 'Oculto'
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCategory(category);
                        }}
                        aria-label="Editar categoría"
                      >
                        <PencilIcon className="h-5 w-5 text-blue-600 hover:text-blue-800" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(category.category_id);
                        }}
                        aria-label="Eliminar categoría"
                      >
                        <TrashIcon className="h-5 w-5 text-red-600 hover:text-red-800" />
                      </button>
                    </div>
                  </td>
                </tr>
                
                {/* Secciones expandidas */}
                {expandedCategories[category.category_id] && (
                  <tr>
                    <td colSpan={5} className="px-0 py-0 border-0">
                      <div className="bg-gray-50 py-4">
                        <div className="px-6 py-2 border-l-4 border-indigo-500 ml-4">
                          <h3 className="text-lg font-medium">{category.name}</h3>
                          <div className="text-xs text-gray-500">
                            {sections[category.category_id]?.length || 0} Secciones
                            ({sections[category.category_id]?.filter(s => s.status === 1).length || 0} visibles)
                          </div>
                        </div>
                        
                        {/* Tabla de secciones */}
                        <div className="mt-4 px-10">
                          <SectionTable 
                            sections={sections[category.category_id] || []}
                            isUpdatingVisibility={isUpdatingVisibility}
                            onToggleSectionVisibility={onToggleSectionVisibility}
                            onEditSection={onEditSection}
                            onDeleteSection={(section) => onDeleteSection(section)}
                            categoryId={category.category_id}
                          />
                        </div>
                        
                        {/* Botón para agregar nueva sección */}
                        <div className="mt-4 px-10 flex justify-end">
                          <button
                            onClick={() => onAddSection(category.category_id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Añadir sección
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
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
import React from 'react';
import { Category } from '@/app/types/menu';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

/**
 * Props para el componente CategoriesView
 */
interface CategoriesViewProps {
  /**
   * Lista de categorías a mostrar
   */
  categories: Category[];
  
  /**
   * Registro de categorías expandidas por ID
   */
  expandedCategories: Record<number, boolean>;
  
  /**
   * Función que se ejecuta al hacer clic en una categoría
   * @param categoryId ID de la categoría seleccionada
   */
  onCategoryClick: (categoryId: number) => void;
  
  /**
   * Función que se ejecuta para crear una nueva categoría
   */
  onNewCategory: () => void;
  
  /**
   * Función que se ejecuta para editar una categoría
   * @param category Categoría a editar
   */
  onEditCategory: (category: Category) => void;
  
  /**
   * Función que se ejecuta para eliminar una categoría
   * @param categoryId ID de la categoría a eliminar
   */
  onDeleteCategory: (categoryId: number) => void;
  
  /**
   * Función que se ejecuta para cambiar la visibilidad de una categoría
   * @param categoryId ID de la categoría
   */
  onToggleVisibility: (categoryId: number) => Promise<void>;
  
  /**
   * ID de la categoría que está actualizando su visibilidad
   */
  isUpdatingVisibility: number | null;
  
  /**
   * Función que se ejecuta para reordenar categorías
   * @param sourceIndex Índice de origen
   * @param destinationIndex Índice de destino
   */
  onReorderCategory: (sourceIndex: number, destinationIndex: number) => void;
}

/**
 * Componente que muestra la lista de categorías
 * Permite la navegación, expansión, creación, edición y eliminación de categorías
 */
const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  expandedCategories,
  onCategoryClick,
  onNewCategory,
  onEditCategory,
  onDeleteCategory,
  onToggleVisibility,
  isUpdatingVisibility,
  onReorderCategory
}) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Categorías</h2>
        <button
          type="button"
          onClick={onNewCategory}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Nueva Categoría
        </button>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {categories.length === 0 ? (
          <li className="p-4 text-center text-sm text-gray-500">
            No hay categorías disponibles. ¡Crea una nueva categoría para comenzar!
          </li>
        ) : (
          categories.map((category, index) => (
            <li 
              key={category.category_id} 
              className="px-4 py-3 flex items-center hover:bg-gray-50"
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', index.toString());
                e.currentTarget.classList.add('bg-gray-100');
              }}
              onDragEnd={(e) => {
                e.currentTarget.classList.remove('bg-gray-100');
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('bg-blue-50');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-blue-50');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-blue-50');
                const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
                onReorderCategory(sourceIndex, index);
              }}
            >
              <div className="flex-1 flex items-center">
                <button
                  onClick={() => onCategoryClick(category.category_id)}
                  className="flex items-center text-left"
                >
                  {expandedCategories[category.category_id] ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400 mr-2" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 mr-2" />
                  )}
                  
                  {category.image ? (
                    <div className="relative h-10 w-10 mr-3">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover rounded"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
                      <span className="text-xs text-gray-500">Sin img</span>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-500">
                      {category.status === 1 ? 'Visible' : 'Oculta'}
                    </p>
                  </div>
                </button>
              </div>
              
              <div className="ml-4 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onToggleVisibility(category.category_id)}
                  disabled={isUpdatingVisibility === category.category_id}
                  className={`px-2 py-1 text-xs rounded-md ${
                    category.status === 1
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {isUpdatingVisibility === category.category_id ? 'Actualizando...' : category.status === 1 ? 'Visible' : 'Oculta'}
                </button>
                
                <button
                  type="button"
                  onClick={() => onEditCategory(category)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
                
                <button
                  type="button"
                  onClick={() => onDeleteCategory(category.category_id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default CategoriesView; 
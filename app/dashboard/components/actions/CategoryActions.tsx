/**
 * @fileoverview Componente para las acciones relacionadas con categorías
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface CategoryActionsProps {
  /**
   * Función que se ejecuta al hacer clic en "Nueva Categoría"
   */
  onNewCategory: () => void;
}

/**
 * Componente que muestra acciones relacionadas con la gestión de categorías
 * 
 * @example
 * <CategoryActions onNewCategory={() => console.log('Nueva categoría')} />
 */
const CategoryActions: React.FC<CategoryActionsProps> = ({ onNewCategory }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-medium text-gray-900">Categorías</h2>
      <button
        type="button"
        onClick={onNewCategory}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
        Nueva Categoría
      </button>
    </div>
  );
};

export default CategoryActions; 
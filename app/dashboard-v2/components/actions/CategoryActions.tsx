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
    <div className="mb-4">
      <button
        type="button"
        onClick={onNewCategory}
        className="w-full flex items-center justify-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-0 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
      >
        <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
        Nueva Categoría
      </button>
    </div>
  );
};

export default CategoryActions; 
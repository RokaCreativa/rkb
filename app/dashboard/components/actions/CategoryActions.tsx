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
 * Componente que muestra los botones de acción para las categorías
 * 
 * Este componente agrupa los botones de acción relacionados con las categorías,
 * como el botón para crear una nueva categoría.
 */
const CategoryActions: React.FC<CategoryActionsProps> = ({ onNewCategory }) => {
  return (
    <div className="mb-4">
      <button
        onClick={onNewCategory}
        className="w-full flex items-center justify-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Nueva Categoría
      </button>
    </div>
  );
};

export default CategoryActions; 
/**
 * @fileoverview Componente para las acciones relacionadas con productos
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ProductActionsProps {
  /**
   * Sección seleccionada actualmente
   */
  sectionName: string;
  
  /**
   * Función que se ejecuta al hacer clic en "Nuevo Producto"
   */
  onNewProduct: () => void;
}

/**
 * Componente que muestra los botones de acción para los productos
 * 
 * Este componente agrupa los botones de acción relacionados con los productos,
 * como el botón para crear un nuevo producto dentro de la sección seleccionada.
 */
const ProductActions: React.FC<ProductActionsProps> = ({ sectionName, onNewProduct }) => {
  return (
    <div className="mb-4">
      <button
        onClick={onNewProduct}
        className="w-full flex items-center justify-center px-4 py-2 border border-amber-300 text-sm font-medium rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-sm"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        {sectionName ? `Añadir nuevo producto a ${sectionName}` : 'Nuevo Producto'}
      </button>
    </div>
  );
};

export default ProductActions; 
"use client";

import React, { useState } from 'react';
import { useDragAndDrop } from '@/lib/hooks/ui';

/**
 * Componente para probar el hook useDragAndDrop
 * Muestra una lista simple de elementos que se pueden reordenar
 */
export default function DragAndDropTest() {
  // Lista de ejemplo para reordenar
  const [items, setItems] = useState([
    'Elemento 1', 
    'Elemento 2', 
    'Elemento 3', 
    'Elemento 4', 
    'Elemento 5'
  ]);
  
  // Función para reordenar elementos
  const handleReorder = (sourceIndex: number, destinationIndex: number) => {
    const updatedItems = [...items];
    const [movedItem] = updatedItems.splice(sourceIndex, 1);
    updatedItems.splice(destinationIndex, 0, movedItem);
    setItems(updatedItems);
  };
  
  // Usar el hook de drag and drop
  const { getDragHandlers } = useDragAndDrop(handleReorder);
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Prueba de Drag and Drop</h2>
      
      <p className="mb-2 text-sm text-gray-600">Arrastra los elementos para reordenarlos:</p>
      
      <ul className="border rounded-md overflow-hidden">
        {items.map((item, index) => (
          <li
            key={item}
            className="p-3 bg-gray-50 border-b last:border-b-0 cursor-move"
            {...getDragHandlers(index)}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
} 
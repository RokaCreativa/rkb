"use client";

import React from 'react';
import { useDashboardNavigation } from '@/lib/hooks/dashboard';

/**
 * Componente de prueba para verificar que el hook de navegación funciona correctamente
 * Este componente solo muestra botones para cambiar entre vistas y el estado actual
 */
const TestNavigation: React.FC = () => {
  const {
    currentView,
    navigateToCategories,
    navigateToSections,
    navigateToProducts,
    navigateBack
  } = useDashboardNavigation();

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Prueba de Navegación</h1>
      
      <div className="mb-4">
        <p className="font-bold">Vista actual: {currentView}</p>
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={navigateToCategories}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Ir a Categorías
        </button>
        
        <button
          onClick={() => navigateToSections({ category_id: 1, name: 'Categoría de prueba', status: 1 } as any)}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Ir a Secciones
        </button>
        
        <button
          onClick={() => navigateToProducts({ section_id: 1, name: 'Sección de prueba', status: 1 } as any)}
          className="px-3 py-1 bg-yellow-500 text-white rounded"
        >
          Ir a Productos
        </button>
        
        <button
          onClick={navigateBack}
          className="px-3 py-1 bg-gray-500 text-white rounded"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default TestNavigation; 
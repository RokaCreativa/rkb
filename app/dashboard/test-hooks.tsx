"use client";

import React from 'react';
import TestNavigation from './test-navigation';

/**
 * Página de prueba para verificar que los hooks del dashboard funcionan correctamente
 */
const TestHooksPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Prueba de Hooks del Dashboard</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Navegación</h2>
        <TestNavigation />
      </div>
      
      <div className="text-sm text-gray-500 mt-8">
        <p>Esta página es solo para pruebas y se eliminará después de verificar que los hooks funcionan correctamente.</p>
      </div>
    </div>
  );
};

export default TestHooksPage; 
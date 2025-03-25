import React from 'react';
import TestHook from '../test-hooks';
import DragAndDropTest from './drag-and-drop-test';

export default function TestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Página de Prueba</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TestHook />
        <DragAndDropTest />
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Esta página es solo para pruebas y se eliminará después de verificar que los hooks funcionan correctamente.</p>
      </div>
    </div>
  );
} 
"use client";

import React from 'react';
import { useDashboardNavigation } from '@/lib/hooks/dashboard';

/**
 * Componente simple para probar que el hook de navegación funciona
 */
export default function TestHook() {
  const { currentView } = useDashboardNavigation();
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Prueba de Hook</h2>
      <p>Vista actual: {currentView}</p>
    </div>
  );
} 
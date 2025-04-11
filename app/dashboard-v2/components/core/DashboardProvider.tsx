"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import useDashboardState from '../../hooks/core/useDashboardState';

// Crear el contexto del dashboard
export const DashboardContext = createContext<ReturnType<typeof useDashboardState> | undefined>(undefined);

// Props para el provider
interface DashboardProviderProps {
  children: ReactNode;
}

// Componente Provider que envuelve la aplicación
export function DashboardProvider({ children }: DashboardProviderProps) {
  // Usar el hook para gestionar el estado
  const dashboardState = useDashboardState();
  
  return (
    <DashboardContext.Provider value={dashboardState}>
      {children}
    </DashboardContext.Provider>
  );
}

// Hook para usar el contexto en componentes hijos
export function useDashboard() {
  const context = useContext(DashboardContext);
  
  if (context === undefined) {
    throw new Error('useDashboard debe ser usado dentro de un DashboardProvider');
  }
  
  return context;
} 
"use client";

import React, { useState } from 'react';
import { PaintBrushIcon, PhoneIcon } from '@heroicons/react/24/outline';
import CustomizationModal from '@/app/dashboard-v2/components/modals/CustomizationModal';

interface TopNavbarProps {
  isReorderModeActive?: boolean;
  onToggleReorderMode?: () => void;
  clientLogo?: string | null;
  clientName?: string;
}

export function TopNavbar({ 
  isReorderModeActive = false, 
  onToggleReorderMode = () => {},
  clientLogo = null,
  clientName = 'RokaMenu'
}: TopNavbarProps) {
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  
  // Función para mostrar/ocultar la vista previa
  const handleTogglePreview = () => {
    // Disparar evento personalizado para activar la vista previa
    window.dispatchEvent(new Event('toggle-preview'));
  };
  
  // Función para manejar el reordenamiento con logs
  const handleReorderModeToggle = () => {
    console.log('🔄 [REORDER DEBUG] Botón de reordenamiento clickeado');
    console.log('🔄 [REORDER DEBUG] Estado actual isReorderModeActive:', isReorderModeActive);
    console.log('🔄 [REORDER DEBUG] Cambio a:', !isReorderModeActive);
    
    // Llamar a la función original para activar/desactivar el modo
    onToggleReorderMode();
  };
  
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y menú izquierdo */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/images/logo_rokamenu.png" alt="RokaMenu" />
              {clientName && (
                <div className="ml-4 px-3 py-1 border-l border-gray-200">
                  <span className="text-sm font-medium text-gray-900">{clientName}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Menú derecho */}
          <div className="flex items-center">
            {/* Botón de vista previa */}
            <button
              type="button"
              onClick={handleTogglePreview}
              className="inline-flex items-center px-3 py-2 border border-indigo-100 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PhoneIcon className="h-5 w-5 mr-2 text-indigo-500" />
              Live Preview
            </button>
            
            {/* Botón de personalización */}
            <button
              type="button"
              onClick={() => setIsCustomizationModalOpen(true)}
              className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PaintBrushIcon className="h-5 w-5 mr-2 text-gray-500" />
              Personalizar Dashboard
            </button>
            
            {/* Botón de modo reordenamiento - solo mostrar si se proporciona la función */}
            {onToggleReorderMode !== undefined && (
              <button
                type="button"
                onClick={handleReorderModeToggle}
                className={`ml-3 inline-flex items-center px-4 py-2 border ${
                  isReorderModeActive 
                    ? 'bg-red-100 border-red-300 text-red-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                <svg 
                  className={`-ml-1 mr-2 h-5 w-5 ${isReorderModeActive ? 'text-red-500' : 'text-gray-500'}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                {isReorderModeActive ? 'Desactivar reordenamiento' : 'Modo reordenamiento'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de personalización */}
      <CustomizationModal 
        isOpen={isCustomizationModalOpen} 
        onClose={() => setIsCustomizationModalOpen(false)} 
      />
    </div>
  );
} 
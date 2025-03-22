import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CollapsiblePreviewProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Panel lateral colapsable para mostrar una vista previa del menú.
 * Permite al usuario expandir y contraer el panel para optimizar el espacio de trabajo.
 */
export default function CollapsiblePreview({ title, children }: CollapsiblePreviewProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <div 
      className={`flex flex-col transition-all duration-300 overflow-hidden border-l border-gray-200 bg-white ${
        isCollapsed ? 'w-12' : 'w-60 lg:w-72'
      }`}
    >
      {/* Encabezado con título y botón de colapsar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <h3 className={`font-medium text-sm text-gray-700 ${isCollapsed ? 'sr-only' : ''}`}>
          {title}
        </h3>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? 'Expandir' : 'Colapsar'}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>
      
      {/* Contenido del panel (oculto cuando está colapsado) */}
      <div className={`flex-1 overflow-auto flex items-center justify-center ${isCollapsed ? 'hidden' : ''}`}>
        <div className="p-2 w-full flex justify-center">
          {children}
        </div>
      </div>
      
      {/* Botón vertical cuando está colapsado */}
      {isCollapsed && (
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="transform -rotate-90 whitespace-nowrap text-xs text-gray-500 hover:text-gray-700 transition-colors py-2"
          >
            {title}
          </button>
        </div>
      )}
    </div>
  );
} 
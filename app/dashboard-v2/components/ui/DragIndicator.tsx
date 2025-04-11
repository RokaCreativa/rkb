"use client";

import React, { useEffect, useState } from 'react';
import { ArrowsUpDownIcon } from '@heroicons/react/24/solid';

interface DragIndicatorProps {
  entityName?: 'categoría' | 'sección' | 'producto';
  className?: string;
}

/**
 * Componente que muestra un indicador visual durante operaciones de arrastrar y soltar
 * Especialmente útil en dispositivos móviles para proporcionar feedback al usuario
 * Se muestra automáticamente cuando el body tiene la clase 'is-dragging'
 */
const DragIndicator: React.FC<DragIndicatorProps> = ({
  entityName = 'elemento',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // Observar la clase 'is-dragging' en el body para mostrar el indicador
  useEffect(() => {
    const checkDragging = () => {
      const isDraggingActive = document.body.classList.contains('is-dragging');
      setIsDragging(isDraggingActive);
    };
    
    // Verificar el estado inicial
    checkDragging();
    
    // Observar mutaciones en la clase del body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDragging();
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // Limpiar el observer al desmontar
    return () => {
      observer.disconnect();
    };
  }, []);
  
  if (!isDragging) {
    return null;
  }
  
  return (
    <div className={`drag-indicator ${className}`}>
      <div className="flex items-center justify-center space-x-2 py-2 px-4">
        <ArrowsUpDownIcon className="h-4 w-4 text-white animate-pulse" />
        <span className="text-sm font-medium">
          Arrastrando {entityName}... <span className="text-xs font-normal">(Suelta para colocar)</span>
        </span>
      </div>
    </div>
  );
};

export default DragIndicator; 
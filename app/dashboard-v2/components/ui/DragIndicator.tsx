"use client";

import React, { useEffect, useState, useRef } from 'react';
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
  // Referencia para controlar el temporizador de seguridad
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Efecto para forzar la ocultación después de un tiempo máximo
  // Esto es una garantía adicional para evitar que se quede visible indefinidamente
  useEffect(() => {
    if (isDragging) {
      // Si el arrastre está activo, configurar un temporizador de seguridad
      timeoutRef.current = setTimeout(() => {
        // Después de 3 segundos, forzar la ocultación independientemente del estado
        setIsDragging(false);
        // Y limpiar la clase del body por si acaso
        if (document.body.classList.contains('is-dragging')) {
          document.body.classList.remove('is-dragging');
        }
      }, 3000); // 3 segundos máximo de duración del arrastre
    } else if (timeoutRef.current) {
      // Si el arrastre termina normalmente, limpiar el temporizador
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Limpiar el temporizador al desmontar
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDragging]);
  
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
    
    // Verificación adicional: comprobar periódicamente si el arrastre ha terminado
    const intervalId = setInterval(() => {
      // Si el indicador muestra que estamos arrastrando pero el body no tiene la clase,
      // actualizar el estado
      if (isDragging && !document.body.classList.contains('is-dragging')) {
        setIsDragging(false);
      }
    }, 250); // Comprobar cada 250ms
    
    // Limpiar el observer y el intervalo al desmontar
    return () => {
      observer.disconnect();
      clearInterval(intervalId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDragging]);
  
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
"use client";

/**
 * @fileoverview Componente Indicador de Arrastre para funcionalidad de arrastrar y soltar
 * @author RokaMenu Team
 * @version 1.0.0
 * @description Este componente muestra un indicador visual cuando el usuario está arrastrando elementos
 *              en la interfaz, especialmente útil para dispositivos móviles donde no hay feedback visual natural
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowsUpDownIcon } from '@heroicons/react/24/outline';

/**
 * Propiedades para el componente DragIndicator
 * @interface DragIndicatorProps
 * @property {string} [entityName] - Nombre de la entidad que se está arrastrando (ej: "categoría", "sección")
 * @property {string} [className] - Clases CSS adicionales para personalizar el componente
 */
interface DragIndicatorProps {
  entityName?: string;
  className?: string;
}

/**
 * Componente que muestra un indicador visual durante operaciones de arrastrar y soltar.
 * 
 * Este componente monitorea si hay una operación de arrastre activa observando clases CSS
 * en el elemento body. Cuando detecta arrastre, muestra un mensaje informativo con una animación
 * para dar feedback al usuario, especialmente útil en dispositivos móviles.
 * 
 * El indicador se oculta automáticamente después de 3 segundos o cuando termina la acción de arrastre.
 * 
 * @example
 * // Uso básico
 * <DragIndicator />
 * 
 * // Con nombre de entidad personalizado
 * <DragIndicator entityName="producto" />
 * 
 * @param {DragIndicatorProps} props - Propiedades del componente
 * @returns {JSX.Element|null} El componente indicador de arrastre o null si no hay arrastre activo
 */
const DragIndicator: React.FC<DragIndicatorProps> = ({ 
  entityName = "elemento", 
  className = ""
}) => {
  // Estado que controla la visibilidad del indicador
  const [isDragging, setIsDragging] = useState(false);
  
  // Referencia al temporizador para limpiar en el desmontaje
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Este efecto maneja el tiempo que el indicador permanece visible
   * Después de 3 segundos, oculta automáticamente el indicador
   */
  useEffect(() => {
    // Cuando el estado de arrastre cambia a true...
    if (isDragging) {
      // Limpiar cualquier temporizador existente para evitar fugas de memoria
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Establecer un nuevo temporizador para ocultar el indicador después de 3 segundos
      timeoutRef.current = setTimeout(() => {
        setIsDragging(false);
      }, 3000);
    }
    
    // Limpieza al desmontar el componente o cuando cambia isDragging
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDragging]);

  /**
   * Este efecto observa cambios en las clases del body para detectar cuando
   * una operación de arrastrar y soltar está activa
   */
  useEffect(() => {
    // Función que se ejecuta cuando se observan cambios en las clases del body
    const handleBodyClassChange = () => {
      // Verificar si el body tiene la clase 'dragging-active'
      const isDraggingActive = document.body.classList.contains('dragging-active');
      // Actualizar el estado solo si es diferente al actual
      if (isDraggingActive !== isDragging) {
        setIsDragging(isDraggingActive);
      }
    };
    
    // Configuración del observador de mutaciones para vigilar cambios en el body
    const observer = new MutationObserver(handleBodyClassChange);
    
    // Iniciar la observación del atributo class del body
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    // Comprobar el estado inicial (por si ya hay un arrastre activo)
    handleBodyClassChange();
    
    // Detener la observación al desmontar el componente
    return () => {
      observer.disconnect();
    };
  }, [isDragging]);

  // Si no hay arrastre activo, no renderizar nada
  if (!isDragging) {
    return null;
  }

  // Renderizar el indicador de arrastre cuando está activo
  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center animate-pulse ${className}`}>
      <ArrowsUpDownIcon className="h-5 w-5 mr-2" />
      <span className="text-sm font-medium">Arrastrando {entityName}...</span>
    </div>
  );
};

export default DragIndicator; 
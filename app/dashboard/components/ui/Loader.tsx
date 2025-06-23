"use client";

/**
 * @fileoverview Componente de Indicador de Carga (Spinner)
 * @author RokaMenu Team
 * @version 1.0.0
 * @description Este componente muestra un indicador visual de carga (spinner) que gira
 *              continuamente para indicar que una operación está en proceso.
 */

import React from 'react';

/**
 * Tamaños disponibles para el spinner de carga
 * Controla las dimensiones del indicador de carga
 * 
 * @typedef LoaderSize
 */
export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Propiedades para el componente Loader
 * Permite personalizar el tamaño, color, clases y mensaje del indicador de carga
 * 
 * @interface LoaderProps
 */
export interface LoaderProps {
  /** Tamaño del spinner (xs: muy pequeño, sm: pequeño, md: mediano, lg: grande) */
  size?: LoaderSize;
  /** Color del spinner (usando clases de Tailwind como 'text-indigo-600') */
  color?: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Mensaje opcional para mostrar debajo del spinner */
  message?: string;
}

/**
 * Componente Loader - Indicador visual de carga (spinner)
 * 
 * Este componente muestra un spinner animado que indica al usuario que
 * una operación está en progreso. Es útil para mostrar durante:
 * - Carga inicial de datos
 * - Envío de formularios
 * - Procesos en segundo plano
 * - Cualquier operación que requiere tiempo
 * 
 * Puede personalizarse con diferentes tamaños, colores y un mensaje opcional.
 * 
 * @example
 * // Spinner básico
 * <Loader />
 * 
 * // Spinner grande con color personalizado y mensaje
 * <Loader size="lg" color="text-red-600" message="Cargando datos..." />
 * 
 * @param {LoaderProps} props - Las propiedades del spinner
 * @returns {JSX.Element} Un spinner animado con mensaje opcional
 */
export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  color = 'text-indigo-600',
  className = '',
  message
}) => {
  /**
   * Mapa de tamaños que define las dimensiones del spinner
   * según el tamaño seleccionado
   */
  const sizeMap = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  /**
   * Clases finales para el spinner, combinando:
   * - La clase de animación (animate-spin)
   * - El tamaño seleccionado del mapa
   * - El color especificado
   * - Cualquier clase adicional proporcionada
   */
  const spinnerClasses = `animate-spin ${sizeMap[size]} ${color} ${className}`;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* SVG que muestra el spinner giratorio */}
      <svg 
        className={spinnerClasses} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-label="Cargando"
      >
        {/* Círculo exterior (más transparente) */}
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        {/* Segmento visible del círculo (más opaco) que crea el efecto visual de giro */}
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      
      {/* Mensaje opcional que se muestra debajo del spinner */}
      {message && (
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default Loader; 
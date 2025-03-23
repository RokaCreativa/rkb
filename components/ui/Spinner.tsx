/**
 * Componente Spinner
 * 
 * Indicador de carga con diferentes tamaños y variantes.
 */

import React from 'react';
import { cn } from '@/lib/utils/tailwind';

/**
 * Variantes de color del spinner
 */
export type SpinnerVariant = 'primary' | 'secondary' | 'white' | 'gray';

/**
 * Tamaños del spinner
 */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Propiedades del componente Spinner
 */
export interface SpinnerProps {
  /** Variante de color */
  variant?: SpinnerVariant;
  /** Tamaño */
  size?: SpinnerSize;
  /** Clases CSS adicionales */
  className?: string;
  /** Si debe centrar el spinner en el contenedor padre */
  centered?: boolean;
  /** Texto accesible para lectores de pantalla */
  label?: string;
}

/**
 * Mapa de clases para los tamaños
 */
const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

/**
 * Mapa de clases para las variantes
 */
const variantClasses: Record<SpinnerVariant, string> = {
  primary: 'text-indigo-600',
  secondary: 'text-pink-600',
  white: 'text-white',
  gray: 'text-gray-400',
};

/**
 * Componente Spinner
 * 
 * @example
 * <Spinner size="md" variant="primary" />
 */
export default function Spinner({
  variant = 'primary',
  size = 'md',
  className,
  centered = false,
  label = 'Cargando...',
}: SpinnerProps) {
  // SVG para el spinner
  const spinnerElement = (
    <>
      <span className="sr-only">{label}</span>
      <svg
        className={cn(
          "animate-spin",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        data-testid="spinner"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </>
  );
  
  // Si debe estar centrado, lo envolvemos en un contenedor
  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        {spinnerElement}
      </div>
    );
  }
  
  return spinnerElement;
} 
/**
 * Componente Button
 * 
 * Botón reutilizable con diferentes variantes, tamaños y estados.
 * Soporta iconos y personalización de estilos.
 */

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/tailwind';

/**
 * Variantes disponibles para el botón
 */
export type ButtonVariant = 
  | 'primary'   // Color principal, para acciones destacadas
  | 'secondary' // Color secundario, para acciones alternativas
  | 'outline'   // Borde sin relleno, para acciones menos destacadas
  | 'ghost'     // Sin fondo ni borde, sólo interacción
  | 'danger'    // Color de peligro, para acciones destructivas
  | 'success'   // Color de éxito, para acciones positivas
  | 'link';     // Estilo de enlace, sin fondo

/**
 * Tamaños disponibles para el botón
 */
export type ButtonSize = 
  | 'xs'    // Extra pequeño, para espacios muy reducidos
  | 'sm'    // Pequeño, para espacios reducidos
  | 'md'    // Mediano (por defecto)
  | 'lg'    // Grande, para destacar
  | 'xl';   // Extra grande, para máximo énfasis

/**
 * Propiedades del componente Button
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual del botón */
  variant?: ButtonVariant;
  /** Tamaño del botón */
  size?: ButtonSize;
  /** Icono a mostrar antes del texto */
  leftIcon?: ReactNode;
  /** Icono a mostrar después del texto */
  rightIcon?: ReactNode;
  /** Si el botón ocupa todo el ancho disponible */
  fullWidth?: boolean;
  /** Si el botón está en estado de carga */
  isLoading?: boolean;
  /** Contenido del botón */
  children?: ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Mapa de clases para las diferentes variantes
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white shadow-sm',
  secondary: 'bg-white hover:bg-gray-50 focus:ring-indigo-500 text-gray-700 border border-gray-300 shadow-sm',
  outline: 'bg-transparent hover:bg-gray-50 focus:ring-indigo-500 text-indigo-600 border border-indigo-300',
  ghost: 'bg-transparent hover:bg-gray-50 focus:ring-indigo-500 text-gray-700',
  danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white shadow-sm',
  success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white shadow-sm',
  link: 'bg-transparent text-indigo-600 hover:text-indigo-700 hover:underline p-0 h-auto',
};

/**
 * Mapa de clases para los diferentes tamaños
 */
const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
  xl: 'px-6 py-3 text-base',
};

/**
 * Componente Button
 * 
 * @example
 * <Button 
 *   variant="primary" 
 *   size="md" 
 *   leftIcon={<PlusIcon className="w-4 h-4" />}
 *   onClick={handleClick}
 * >
 *   Añadir elemento
 * </Button>
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  isLoading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={cn(
        // Clases base para todos los botones
        'inline-flex items-center justify-center relative font-medium rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
        
        // Aplicar variante y tamaño
        variantClasses[variant],
        sizeClasses[size],
        
        // Deshabilitar
        (disabled || isLoading) && 'opacity-60 cursor-not-allowed',
        
        // Ancho completo
        fullWidth && 'w-full',
        
        // Clases adicionales
        className
      )}
      {...props}
    >
      {/* Indicador de carga */}
      {isLoading && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg 
            className="animate-spin h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg"
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      
      {/* Contenido del botón, oculto durante la carga */}
      <span className={cn("inline-flex items-center", isLoading && 'invisible')}>
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </span>
    </button>
  );
}

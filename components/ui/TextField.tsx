/**
 * Componente TextField
 * 
 * Campo de texto con soporte para etiquetas, mensajes de error,
 * iconos y diferentes variantes.
 */

import React, { ReactNode, forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/tailwind';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

/**
 * Tipos de campos de texto
 */
export type TextFieldVariant = 'default' | 'filled' | 'outlined';

/**
 * Tamaños de campos de texto
 */
export type TextFieldSize = 'sm' | 'md' | 'lg';

/**
 * Estados del campo
 */
export type TextFieldState = 'normal' | 'error' | 'success' | 'disabled';

/**
 * Propiedades para el componente TextField
 */
export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** ID del campo */
  id?: string;
  /** Nombre del campo */
  name?: string;
  /** Etiqueta del campo */
  label?: string;
  /** Mensaje de error */
  error?: string;
  /** Mensaje de ayuda */
  helperText?: string;
  /** Variante visual */
  variant?: TextFieldVariant;
  /** Tamaño del campo */
  size?: TextFieldSize;
  /** Icono para el inicio del campo */
  startIcon?: ReactNode;
  /** Icono para el final del campo */
  endIcon?: ReactNode;
  /** Si el campo está en estado de éxito */
  success?: boolean;
  /** Si el campo ocupa todo el ancho disponible */
  fullWidth?: boolean;
  /** Contenedor para el campo */
  containerClassName?: string;
  /** Clases para la etiqueta */
  labelClassName?: string;
  /** Clases para el campo de entrada */
  inputClassName?: string;
  /** Clases para el mensaje de error/ayuda */
  helperClassName?: string;
}

/**
 * Componente TextField
 * 
 * @example
 * <TextField
 *   label="Nombre"
 *   placeholder="Ingresa tu nombre"
 *   error={errors.name}
 *   startIcon={<UserIcon className="h-5 w-5" />}
 * />
 */
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id,
      name,
      label,
      error,
      helperText,
      variant = 'default',
      size = 'md',
      startIcon,
      endIcon,
      success = false,
      fullWidth = false,
      containerClassName,
      labelClassName,
      inputClassName,
      helperClassName,
      className,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    // Generar ID si no se proporciona
    const inputId = id || name || `textfield-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determinar si mostrar estado de error
    const hasError = !!error;
    
    // Clases base para cada tamaño
    const sizeClasses: Record<TextFieldSize, string> = {
      sm: 'h-8 text-xs px-2 py-1',
      md: 'h-10 text-sm px-3 py-2',
      lg: 'h-12 text-base px-4 py-2.5',
    };
    
    // Clases base para cada variante
    const variantClasses: Record<TextFieldVariant, string> = {
      default: 'bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
      filled: 'bg-gray-100 border border-gray-100 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500',
      outlined: 'bg-transparent border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
    };
    
    // Clases para estados
    const stateClasses: Record<TextFieldState, string> = {
      normal: '',
      error: 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900',
      success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
      disabled: 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed opacity-75',
    };
    
    // Determinar estado actual
    let currentState: TextFieldState = 'normal';
    if (disabled) currentState = 'disabled';
    else if (hasError) currentState = 'error';
    else if (success) currentState = 'success';
    
    return (
      <div className={cn(
        "flex flex-col space-y-1",
        fullWidth ? 'w-full' : 'max-w-sm',
        containerClassName
      )}>
        {/* Etiqueta */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium text-gray-700",
              hasError && 'text-red-700',
              disabled && 'text-gray-500',
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Contenedor del input con iconos */}
        <div className="relative rounded-md">
          {/* Icono inicial */}
          {startIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className={cn(
                "text-gray-500",
                hasError ? "text-red-500" : success ? "text-green-500" : ""
              )}>
                {startIcon}
              </span>
            </div>
          )}
          
          {/* Campo de entrada */}
          <input
            ref={ref}
            id={inputId}
            name={name}
            className={cn(
              "block rounded-md w-full focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-75",
              sizeClasses[size],
              variantClasses[variant],
              stateClasses[currentState],
              startIcon ? "pl-10" : "",
              endIcon ? "pr-10" : "",
              inputClassName,
              className
            )}
            disabled={disabled}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            required={required}
            {...props}
          />
          
          {/* Icono final o icono de error */}
          {(endIcon || hasError) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {hasError ? (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              ) : (
                <span className={cn(
                  "text-gray-500",
                  success ? "text-green-500" : ""
                )}>
                  {endIcon}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Mensaje de error o texto de ayuda */}
        {(error || helperText) && (
          <p
            id={hasError ? `${inputId}-error` : `${inputId}-helper`}
            className={cn(
              "text-xs mt-1",
              hasError ? "text-red-600" : "text-gray-500",
              helperClassName
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField; 
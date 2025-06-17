"use client";

/**
 * @fileoverview Componente de Botón Reutilizable y Personalizable
 * @author RokaMenu Team
 * @version 1.1.0
 * @description Este componente proporciona un botón estilizado y configurable para toda la aplicación,
 *              con soporte para diferentes variantes, tamaños, estados de carga y posiciones de iconos.
 */

import React from 'react';
import { Loader } from '../Loader';

/**
 * Tipos de variantes disponibles para el botón
 * Cada variante tiene un estilo visual diferente según su propósito
 * 
 * @typedef ButtonVariant
 */
export type ButtonVariant =
  | 'primary'   // Botón principal/de acción destacada (fondo azul)
  | 'secondary' // Botón secundario/menos destacado (fondo gris)
  | 'outline'   // Botón con borde pero sin fondo (transparente)
  | 'ghost'     // Botón sin borde y sin fondo (solo texto)
  | 'danger'   // Botón para acciones peligrosas (fondo rojo)
  | 'success';  // Botón para acciones de éxito o confirmación (fondo teal)

/**
 * Tamaños disponibles para el botón
 * Controla las dimensiones y el tamaño del texto del botón
 * 
 * @typedef ButtonSize
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Propiedades para el componente Button
 * Extiende los atributos nativos del elemento button HTML
 * 
 * @interface ButtonProps
 * @extends React.ButtonHTMLAttributes<HTMLButtonElement>
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual del botón */
  variant?: ButtonVariant;
  /** Tamaño del botón */
  size?: ButtonSize;
  /** Indica si el botón está en estado de carga */
  isLoading?: boolean;
  /** Texto o elemento a mostrar como indicador de carga */
  loadingText?: React.ReactNode;
  /** Icono a mostrar a la izquierda del texto */
  leftIcon?: React.ReactNode;
  /** Icono a mostrar a la derecha del texto */
  rightIcon?: React.ReactNode;
  /** Si es true, el botón ocupará todo el ancho disponible */
  fullWidth?: boolean;
  /** Elemento hijo (generalmente el texto del botón) */
  children: React.ReactNode;
}

/**
 * Componente Button - Botón personalizable y reutilizable
 * 
 * Este componente proporciona un botón estilizado con Tailwind CSS que soporta:
 * - Diferentes variantes visuales (primary, secondary, outline, ghost, danger)
 * - Varios tamaños predefinidos (xs, sm, md, lg)
 * - Estado de carga con spinner
 * - Iconos a la izquierda y/o derecha del texto
 * - Capacidad para ocupar el ancho completo
 * - Todas las propiedades nativas de los botones HTML
 * 
 * @example
 * // Botón primario básico
 * <Button>Guardar</Button>
 * 
 * // Botón de peligro con ícono y estado de carga
 * <Button 
 *   variant="danger" 
 *   leftIcon={<TrashIcon />} 
 *   isLoading={isDeleting}
 *   onClick={handleDelete}
 * >
 *   Eliminar
 * </Button>
 * 
 * @param {ButtonProps} props - Las propiedades del botón
 * @returns {JSX.Element} Un botón estilizado y funcional
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled = false,
  children,
  ...props
}, ref) => {
  /**
   * Clases base que se aplican a todos los botones
   * - flex: Para alinear el contenido
   * - items-center: Alinea verticalmente el contenido
   * - justify-center: Centra horizontalmente el contenido
   * - font-medium: Hace que el texto sea semibold
   * - focus:outline-0: Elimina el borde de enfoque predeterminado
   * - focus:ring-2: Añade un anillo al enfocar
   * - transition-colors: Anima los cambios de color
   */
  const baseClasses = "flex items-center justify-center font-medium focus:outline-0 focus:ring-2 transition-colors";

  /**
   * Clases para cada variante visual del botón
   * Definimos colores de fondo, texto, bordes y estados de hover/focus
   */
  const variantClasses = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-teal-50 border border-teal-300 text-teal-700 hover:bg-teal-100 focus:ring-teal-500"
  };

  /**
   * Clases para cada tamaño del botón
   * Definimos padding, bordes redondeados y tamaño de texto
   */
  const sizeClasses = {
    xs: "text-xs px-2 py-1 rounded",
    sm: "text-sm px-3 py-1.5 rounded",
    md: "text-sm px-4 py-2 rounded-md",
    lg: "text-base px-6 py-3 rounded-lg"
  };

  /**
   * Construimos las clases finales combinando:
   * - Clases base (común a todos los botones)
   * - Clases de variante (según el tipo de botón)
   * - Clases de tamaño (según las dimensiones deseadas)
   * - Clases para ancho completo (si se especifica)
   * - Clases para deshabilitado (si el botón está deshabilitado)
   * - Clases adicionales proporcionadas por el usuario
   */
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${(disabled || isLoading) ? 'opacity-70 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Si el botón está cargando y tiene texto de carga, mostramos ese texto */}
      {isLoading && loadingText ? (
        <>{loadingText}</>
      ) : (
        <>
          {/* Si hay un ícono izquierdo y el botón no está cargando, lo mostramos */}
          {leftIcon && !isLoading && (
            <span className="mr-2">{leftIcon}</span>
          )}

          {/* Si el botón está cargando, mostramos el spinner junto al texto */}
          {isLoading ? (
            <>
              <Loader size="sm" className="mr-2" />
              {children}
            </>
          ) : (
            <>{children}</>
          )}

          {/* Si hay un ícono derecho y el botón no está cargando, lo mostramos */}
          {rightIcon && !isLoading && (
            <span className="ml-2">{rightIcon}</span>
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button; 
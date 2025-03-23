/**
 * Componente Alert
 * 
 * Muestra mensajes de alerta informativos, de éxito, advertencia o error.
 */

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils/tailwind';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * Tipos de alerta
 */
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * Propiedades para el componente Alert
 */
export interface AlertProps {
  /** Título de la alerta */
  title?: string;
  /** Mensaje o contenido de la alerta */
  children: ReactNode;
  /** Variante/tipo de la alerta */
  variant?: AlertVariant;
  /** Si es posible cerrar la alerta */
  dismissible?: boolean;
  /** Función llamada al cerrar la alerta */
  onDismiss?: () => void;
  /** Icono personalizado */
  icon?: ReactNode;
  /** Acción para la alerta (ej: botón) */
  action?: ReactNode;
  /** Si debe ser una alerta con borde */
  outlined?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Configuración para cada variante
 */
const variantConfig: Record<AlertVariant, {
  bgColor: string;
  borderColor: string;
  textColor: string;
  outlinedBg: string;
  icon: ReactNode;
}> = {
  info: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-800',
    outlinedBg: 'bg-white',
    icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" />,
  },
  success: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-800',
    outlinedBg: 'bg-white',
    icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
  },
  warning: {
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-800',
    outlinedBg: 'bg-white',
    icon: <ExclamationCircleIcon className="h-5 w-5 text-amber-400" />,
  },
  error: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-800',
    outlinedBg: 'bg-white',
    icon: <XCircleIcon className="h-5 w-5 text-red-400" />,
  },
};

/**
 * Componente Alert
 * 
 * @example
 * <Alert variant="warning" title="Atención" dismissible onDismiss={() => setShowAlert(false)}>
 *   Esta acción no se puede deshacer.
 * </Alert>
 */
export default function Alert({
  title,
  children,
  variant = 'info',
  dismissible = false,
  onDismiss,
  icon,
  action,
  outlined = false,
  className,
}: AlertProps) {
  const config = variantConfig[variant];
  
  return (
    <div
      className={cn(
        "rounded-md p-4",
        outlined ? config.outlinedBg : config.bgColor,
        outlined && `border ${config.borderColor}`,
        className
      )}
    >
      <div className="flex">
        {/* Icono */}
        <div className="flex-shrink-0">
          {icon || config.icon}
        </div>
        
        {/* Contenido */}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={cn("text-sm font-medium", config.textColor)}>
              {title}
            </h3>
          )}
          
          <div className={cn(
            "text-sm",
            title ? "mt-2" : "",
            config.textColor
          )}>
            {children}
          </div>
          
          {/* Acción */}
          {action && (
            <div className="mt-4">
              {action}
            </div>
          )}
        </div>
        
        {/* Botón para cerrar */}
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={cn(
                  "inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2",
                  outlined ? config.outlinedBg : config.bgColor,
                  config.textColor,
                  "hover:bg-opacity-80"
                )}
              >
                <span className="sr-only">Cerrar</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
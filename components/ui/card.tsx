/**
 * Componente Card
 * 
 * Tarjeta con bordes, sombra y diferentes estilos para mostrar contenido.
 */

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils/tailwind';
import { If } from './conditional';

/**
 * Tipos de tarjeta
 */
export type CardVariant = 'default' | 'outline' | 'filled' | 'elevated';

/**
 * Propiedades para el componente Card
 */
export interface CardProps {
  /** Contenido del Card */
  children: ReactNode;
  /** Variante de estilo */
  variant?: CardVariant;
  /** Título de la tarjeta */
  title?: ReactNode;
  /** Subtítulo de la tarjeta */
  subtitle?: ReactNode;
  /** Contenido del encabezado (alternativa a título/subtítulo) */
  header?: ReactNode;
  /** Contenido del pie */
  footer?: ReactNode;
  /** Si se está cargando la tarjeta */
  isLoading?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Clases CSS para el encabezado */
  headerClassName?: string;
  /** Clases CSS para el cuerpo */
  bodyClassName?: string;
  /** Clases CSS para el pie */
  footerClassName?: string;
  /** Si la tarjeta debe ocupar toda la altura disponible */
  fullHeight?: boolean;
  /** Si debe tener padding reducido */
  compact?: boolean;
  /** Atributos adicionales */
  [x: string]: any;
}

/**
 * Clases según la variante
 */
const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-200 shadow-sm',
  outline: 'bg-white border border-gray-300',
  filled: 'bg-gray-50 border border-gray-200',
  elevated: 'bg-white border border-gray-100 shadow-md',
};

/**
 * Componente CardSkeleton para estado de carga
 */
function CardSkeleton({ variant = 'default', className }: { variant?: CardVariant, className?: string }) {
  return (
    <div className={cn(
      "animate-pulse rounded-lg p-4",
      variantClasses[variant],
      className
    )}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}

/**
 * Componente Card
 * 
 * @example
 * <Card
 *   title="Título de la tarjeta"
 *   subtitle="Información adicional"
 *   footer={<Button>Acción</Button>}
 *   variant="elevated"
 * >
 *   Contenido de la tarjeta
 * </Card>
 */
export default function Card({
  children,
  variant = 'default',
  title,
  subtitle,
  header,
  footer,
  isLoading = false,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  fullHeight = false,
  compact = false,
  ...rest
}: CardProps) {
  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return <CardSkeleton variant={variant} className={className} />;
  }
  
  // Determinar si mostrar el encabezado
  const hasHeader = Boolean(header || title || subtitle);
  // Determinar si mostrar el pie
  const hasFooter = Boolean(footer);
  
  // Calcular padding según modo compacto
  const padding = compact ? 'p-3' : 'p-4';
  
  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden",
        variantClasses[variant],
        fullHeight && "h-full flex flex-col",
        className
      )}
      {...rest}
    >
      {/* Encabezado */}
      <If condition={hasHeader}>
        <div className={cn(
          "border-b border-gray-200",
          padding,
          headerClassName
        )}>
          {header || (
            <>
              {title && (
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      </If>
      
      {/* Cuerpo */}
      <div className={cn(
        padding,
        fullHeight && "flex-1",
        bodyClassName
      )}>
        {children}
      </div>
      
      {/* Pie */}
      <If condition={hasFooter}>
        <div className={cn(
          "border-t border-gray-200",
          padding,
          footerClassName
        )}>
          {footer}
        </div>
      </If>
    </div>
  );
}

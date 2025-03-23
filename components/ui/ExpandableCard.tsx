/**
 * Componente ExpandableCard
 * 
 * Tarjeta expandible/colapsable para mostrar contenido organizado
 * con un encabezado y un botón para expandir/contraer.
 */

import React from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/tailwind';
import { ENTITY_COLORS } from '@/lib/constants/colors';

/**
 * Tipos de entidad para las tarjetas expandibles
 */
export type EntityType = 'CATEGORY' | 'SECTION' | 'PRODUCT';

/**
 * Propiedades para el componente ExpandableCard
 */
export interface ExpandableCardProps {
  /** Título de la tarjeta */
  title: string;
  /** Contenido a mostrar cuando está expandido */
  children: React.ReactNode;
  /** Si la tarjeta está expandida */
  expanded: boolean;
  /** Función para alternar el estado expandido */
  onToggle: () => void;
  /** Tipo de entidad (determina el esquema de color) */
  entityType?: EntityType;
  /** Contenido a mostrar a la derecha del título */
  rightContent?: React.ReactNode;
  /** Clases adicionales */
  className?: string;
}

/**
 * Componente ExpandableCard
 * 
 * @example
 * <ExpandableCard
 *   title="Categoría: Bebidas"
 *   expanded={isExpanded}
 *   onToggle={() => setIsExpanded(!isExpanded)}
 *   entityType="CATEGORY"
 *   rightContent={<Badge>3 secciones</Badge>}
 * >
 *   <SectionList sections={sections} />
 * </ExpandableCard>
 */
export default function ExpandableCard({
  title,
  children,
  expanded,
  onToggle,
  entityType = 'CATEGORY',
  rightContent,
  className = ''
}: ExpandableCardProps) {
  // Obtener el esquema de colores según el tipo de entidad
  const colors = ENTITY_COLORS[entityType];
  
  return (
    <div className={cn(
      "rounded-lg border overflow-hidden shadow-sm",
      colors.border,
      className
    )}>
      <div className={cn(
        "flex justify-between items-center p-3",
        colors.light
      )}>
        <div className="flex items-center">
          <button
            onClick={onToggle}
            className={cn(
              "p-1 rounded-full transition-colors",
              expanded ? colors.active : 'hover:bg-gray-200',
              expanded ? colors.accent : 'text-gray-500'
            )}
            aria-expanded={expanded}
            aria-label={expanded ? "Colapsar" : "Expandir"}
          >
            {expanded ? (
              <ChevronDownIcon className="h-5 w-5" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>
          <h3 className={cn("ml-2 font-medium", colors.text)}>{title}</h3>
        </div>
        {rightContent && (
          <div className="flex items-center">
            {rightContent}
          </div>
        )}
      </div>

      {expanded && (
        <div className="p-3 bg-white">
          {children}
        </div>
      )}
    </div>
  );
} 
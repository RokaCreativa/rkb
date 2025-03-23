/**
 * Componente ActionIcon
 * 
 * Botón con icono para acciones específicas (editar, eliminar, visibilidad)
 * con estilos adaptados al tipo de entidad.
 */

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/tailwind';
import { ENTITY_COLORS } from '@/lib/constants/colors';

/**
 * Tipos de entidad para los iconos de acción
 */
export type ActionIconEntityType = 'CATEGORY' | 'SECTION' | 'PRODUCT';

/**
 * Tipos de acción disponibles
 */
export type ActionIconType = 'edit' | 'delete' | 'visibility';

/**
 * Propiedades para el componente ActionIcon
 */
export interface ActionIconProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Tipo de entidad (determina el esquema de color) */
  entityType: ActionIconEntityType;
  /** Tipo de acción (edit, delete, visibility) */
  actionType: ActionIconType;
  /** Contenido (normalmente un icono) */
  children: ReactNode;
  /** Si el botón está deshabilitado */
  disabled?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Mapa de clases base según el tipo de acción
 */
const actionTypeClasses: Record<ActionIconType, string> = {
  edit: 'hover:bg-opacity-10',
  delete: 'hover:bg-red-50 text-red-600 hover:text-red-700',
  visibility: 'hover:bg-opacity-10',
};

/**
 * Componente ActionIcon
 * 
 * @example
 * <ActionIcon
 *   entityType="SECTION"
 *   actionType="edit"
 *   onClick={() => handleEdit(item)}
 * >
 *   <PencilIcon className="h-4 w-4" />
 * </ActionIcon>
 */
export default function ActionIcon({
  entityType,
  actionType,
  children,
  className = '',
  disabled = false,
  ...props
}: ActionIconProps) {
  // Obtener colores según el tipo de entidad
  const colors = ENTITY_COLORS[entityType];
  
  // Determinar las clases según el tipo de acción y entidad
  const getActionClasses = () => {
    if (actionType === 'delete') {
      return actionTypeClasses.delete;
    }
    
    // Para editar y visibilidad, usar los colores de la entidad
    return cn(
      actionType === 'edit' ? colors.icon.primary : 'text-gray-500 hover:' + colors.icon.primary,
      actionType === 'edit' ? colors.hover : ''
    );
  };
  
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        // Clases base para todos los botones de acción
        'p-1.5 rounded-lg transition-colors',
        
        // Clases específicas según el tipo de acción
        getActionClasses(),
        
        // Estado deshabilitado
        disabled && 'opacity-50 cursor-not-allowed',
        
        // Clases adicionales
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
} 
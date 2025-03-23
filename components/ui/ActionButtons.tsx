/**
 * Componente ActionButtons
 * 
 * Agrupa botones de acción comunes (editar, eliminar, visibilidad)
 * para entidades del sistema.
 */

import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import ActionIcon, { ActionIconEntityType } from './ActionIcon';
import { cn } from '@/lib/utils/tailwind';

/**
 * Propiedades para el componente ActionButtons
 */
export interface ActionButtonsProps {
  /** Tipo de entidad (para esquema de colores) */
  entityType: ActionIconEntityType;
  /** ID de la entidad */
  entityId: number;
  /** Estado de visibilidad actual */
  isVisible: boolean;
  /** Función para editar la entidad */
  onEdit: () => void;
  /** Función para eliminar la entidad */
  onDelete: () => void;
  /** Función para cambiar visibilidad */
  onToggleVisibility?: (id: number, status: number) => void;
  /** ID de entidad actualmente actualizando visibilidad */
  updatingVisibilityId?: number | null;
  /** Clases adicionales */
  className?: string;
}

/**
 * Componente ActionButtons
 * 
 * @example
 * <ActionButtons
 *   entityType="SECTION"
 *   entityId={section.section_id}
 *   isVisible={section.status === 1}
 *   onEdit={() => handleEditSection(section)}
 *   onDelete={() => handleDeleteSection(section.section_id)}
 *   onToggleVisibility={toggleSectionVisibility}
 * />
 */
export default function ActionButtons({
  entityType,
  entityId,
  isVisible,
  onEdit,
  onDelete,
  onToggleVisibility,
  updatingVisibilityId,
  className = ''
}: ActionButtonsProps) {
  return (
    <div className={cn("flex space-x-1", className)}>
      {onToggleVisibility && (
        <ActionIcon
          entityType={entityType}
          actionType="visibility"
          onClick={() => onToggleVisibility(entityId, isVisible ? 1 : 0)}
          disabled={updatingVisibilityId === entityId}
          title={isVisible ? "Ocultar" : "Mostrar"}
        >
          {updatingVisibilityId === entityId ? (
            <div className="w-5 h-5 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
            </div>
          ) : isVisible ? (
            <EyeIcon className="w-5 h-5" />
          ) : (
            <EyeSlashIcon className="w-5 h-5" />
          )}
        </ActionIcon>
      )}
      
      <ActionIcon
        entityType={entityType}
        actionType="edit"
        onClick={onEdit}
        title="Editar"
      >
        <PencilIcon className="h-4 w-4" />
      </ActionIcon>
      
      <ActionIcon
        entityType={entityType}
        actionType="delete"
        onClick={onDelete}
        title="Eliminar"
      >
        <TrashIcon className="h-4 w-4" />
      </ActionIcon>
    </div>
  );
} 
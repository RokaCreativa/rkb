/**
 * Componente ConfirmDialog
 * 
 * Diálogo de confirmación para acciones importantes o destructivas.
 * Basado en el componente Modal.
 */

import React, { ReactNode } from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Modal, { ModalSize } from './Modal';
import Button from './button';
import { cn } from '@/lib/utils/tailwind';

/**
 * Tipos de diálogo de confirmación
 */
export type ConfirmDialogType = 'danger' | 'warning' | 'info';

/**
 * Propiedades para el componente ConfirmDialog
 */
export interface ConfirmDialogProps {
  /** Si el diálogo está abierto */
  isOpen: boolean;
  /** Función para cerrar el diálogo */
  onClose: () => void;
  /** Título del diálogo */
  title: string;
  /** Mensaje o contenido del diálogo */
  message: ReactNode;
  /** Función a ejecutar al confirmar */
  onConfirm: () => void;
  /** Tipo de diálogo */
  type?: ConfirmDialogType;
  /** Texto del botón de confirmación */
  confirmText?: string;
  /** Texto del botón de cancelación */
  cancelText?: string;
  /** Si se está procesando la confirmación */
  isLoading?: boolean;
  /** Tamaño del diálogo */
  size?: ModalSize;
  /** Icono personalizado */
  icon?: ReactNode;
}

/**
 * Mapa de colores según el tipo de diálogo
 */
const typeStyles: Record<ConfirmDialogType, {
  textColor: string;
  bgColor: string;
  iconColor: string;
  buttonVariant: 'danger' | 'primary';
  icon: ReactNode;
}> = {
  danger: {
    textColor: 'text-red-800',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    buttonVariant: 'danger',
    icon: <ExclamationTriangleIcon className="h-6 w-6" />
  },
  warning: {
    textColor: 'text-amber-800',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    buttonVariant: 'danger',
    icon: <ExclamationTriangleIcon className="h-6 w-6" />
  },
  info: {
    textColor: 'text-blue-800',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    buttonVariant: 'primary',
    icon: <InformationCircleIcon className="h-6 w-6" />
  }
};

/**
 * Componente ConfirmDialog
 * 
 * @example
 * <ConfirmDialog
 *   isOpen={isDeleteDialogOpen}
 *   onClose={() => setIsDeleteDialogOpen(false)}
 *   title="Eliminar categoría"
 *   message="¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer."
 *   onConfirm={handleDeleteCategory}
 *   type="danger"
 *   isLoading={isDeleting}
 * />
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  type = 'danger',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  size = 'sm',
  icon
}: ConfirmDialogProps) {
  const styles = typeStyles[type];
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      showCloseButton={false}
      closeOnOutsideClick={!isLoading}
    >
      <div className="sm:flex sm:items-start">
        {/* Icono */}
        <div className={cn(
          "mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10",
          styles.bgColor
        )}>
          <span className={styles.iconColor}>
            {icon || styles.icon}
          </span>
        </div>
        
        {/* Contenido */}
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {title}
          </h3>
          <div className="mt-2">
            {typeof message === 'string' ? (
              <p className="text-sm text-gray-500">{message}</p>
            ) : (
              message
            )}
          </div>
        </div>
      </div>
      
      {/* Botones */}
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button
          variant={styles.buttonVariant}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full sm:w-auto sm:ml-3"
        >
          {confirmText}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
          className="mt-3 w-full sm:mt-0 sm:w-auto"
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
} 
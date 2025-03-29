/**
 * @file ConfirmationModal.tsx
 * @description Componente modal para confirmar acciones peligrosas
 * @author TuNombre
 * @version 1.0.0
 * @lastUpdated 2024-03-27
 */

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import BaseModal from './BaseModal';

interface ConfirmationModalProps {
  /**
   * Título del modal
   */
  title: string;
  
  /**
   * Mensaje de confirmación
   */
  message: string;
  
  /**
   * Elemento a confirmar (nombre del ítem a eliminar, etc.)
   */
  itemName?: string;
  
  /**
   * Indica si el modal está abierto
   */
  isOpen: boolean;
  
  /**
   * Función para cerrar el modal
   */
  onClose: () => void;
  
  /**
   * Función que se ejecuta al confirmar la acción
   */
  onConfirm: () => void;
  
  /**
   * Texto del botón de confirmar
   */
  confirmText?: string;
  
  /**
   * Texto del botón de cancelar
   */
  cancelText?: string;
  
  /**
   * Variante del modal (determina colores y icono)
   */
  variant?: 'danger' | 'warning' | 'info';
  
  /**
   * Indica si se está procesando la acción
   */
  isProcessing?: boolean;
}

/**
 * Componente modal para confirmar acciones peligrosas
 * 
 * Utiliza BaseModal para proporcionar una interfaz de confirmación para acciones
 * que pueden tener consecuencias importantes, como eliminación de elementos.
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  itemName,
  isOpen,
  onClose,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isProcessing = false
}) => {
  // Configuración según la variante
  const variantConfig = {
    danger: {
      icon: ExclamationTriangleIcon,
      iconClass: 'text-red-600',
      buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      confirmText: confirmText || 'Eliminar'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      iconClass: 'text-yellow-600',
      buttonClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      confirmText: confirmText || 'Continuar'
    },
    info: {
      icon: ExclamationTriangleIcon,
      iconClass: 'text-blue-600',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      confirmText: confirmText || 'Aceptar'
    }
  };
  
  const { icon: Icon, iconClass, buttonClass, confirmText: variantConfirmText } = variantConfig[variant];
  const finalConfirmText = confirmText || variantConfirmText;
  
  // Renderizar botones de acción para el modal
  const actionButtons = (
    <>
      <button
        type="button"
        disabled={isProcessing}
        onClick={onConfirm}
        className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${buttonClass} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing ? 'Procesando...' : finalConfirmText}
      </button>
      <button
        type="button"
        disabled={isProcessing}
        onClick={onClose}
        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelText}
      </button>
    </>
  );
  
  return (
    <BaseModal
      title={title}
      isOpen={isOpen}
      onClose={isProcessing ? () => {} : onClose}
      showCloseButton={!isProcessing}
      actions={actionButtons}
      size="small"
    >
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <Icon className={`h-6 w-6 ${iconClass}`} aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {message}
              {itemName && <span className="font-medium"> "{itemName}"</span>}
            </p>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmationModal; 
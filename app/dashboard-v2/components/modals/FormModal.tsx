/**
 * @file FormModal.tsx
 * @description Componente modal para formularios
 * @author TuNombre
 * @version 1.0.0
 * @lastUpdated 2024-03-27
 */

import React from 'react';
import BaseModal from './BaseModal';

interface FormModalProps {
  /**
   * Título del modal
   */
  title: string;
  
  /**
   * Indica si el modal está abierto
   */
  isOpen: boolean;
  
  /**
   * Función para cerrar el modal
   */
  onClose: () => void;
  
  /**
   * Contenido del formulario
   */
  children: React.ReactNode;
  
  /**
   * Función que se ejecuta al enviar el formulario
   */
  onSubmit: (e: React.FormEvent) => void;
  
  /**
   * Texto del botón de guardar
   */
  submitText?: string;
  
  /**
   * Texto del botón de cancelar
   */
  cancelText?: string;
  
  /**
   * Indica si el formulario está procesando el envío
   */
  isSubmitting?: boolean;
  
  /**
   * Indica si el botón de guardar debe estar deshabilitado
   */
  isSubmitDisabled?: boolean;
  
  /**
   * Tamaño del modal (small, medium, large, xlarge)
   */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

/**
 * Componente modal para formularios
 * 
 * Extiende BaseModal para proporcionar una estructura específica para formularios:
 * - Gestión de eventos de formulario
 * - Botones estándar (Guardar/Cancelar)
 * - Estado de carga durante el envío
 */
const FormModal: React.FC<FormModalProps> = ({
  title,
  isOpen,
  onClose,
  children,
  onSubmit,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  isSubmitting = false,
  isSubmitDisabled = false,
  size = 'medium'
}) => {
  /**
   * Maneja el evento de envío del formulario
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };
  
  // Renderizar botones de acción para el modal
  const actionButtons = (
    <>
      <button
        type="submit"
        form="form-modal"
        disabled={isSubmitting || isSubmitDisabled}
        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Guardando...' : submitText}
      </button>
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
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
      onClose={isSubmitting ? () => {} : onClose} // Prevenir cierre durante envío
      showCloseButton={!isSubmitting}
      actions={actionButtons}
      size={size}
    >
      <form id="form-modal" onSubmit={handleSubmit}>
        {children}
      </form>
    </BaseModal>
  );
};

export default FormModal; 
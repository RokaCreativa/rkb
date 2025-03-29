/**
 * @file BaseModal.tsx
 * @description Componente base para todos los modales del dashboard
 * @author TuNombre
 * @version 1.0.0
 * @lastUpdated 2024-03-27
 */

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BaseModalProps {
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
   * Indica si se debe mostrar un botón de cerrar en la esquina superior derecha
   */
  showCloseButton?: boolean;
  
  /**
   * Contenido del modal
   */
  children: React.ReactNode;
  
  /**
   * Botones de acción del modal (pie del modal)
   */
  actions?: React.ReactNode;
  
  /**
   * Tamaño del modal (small, medium, large, xlarge)
   */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

/**
 * Componente base para todos los modales del dashboard
 * 
 * Proporciona una estructura común para todos los modales:
 * - Transición de entrada/salida
 * - Overlay con fondo oscuro
 * - Estructura con encabezado, cuerpo y pie
 * - Botón de cerrar
 */
const BaseModal: React.FC<BaseModalProps> = ({
  title,
  isOpen,
  onClose,
  showCloseButton = true,
  children,
  actions,
  size = 'medium'
}) => {
  // Clases según el tamaño del modal
  const sizeClasses = {
    small: 'sm:max-w-sm',
    medium: 'sm:max-w-lg',
    large: 'sm:max-w-2xl',
    xlarge: 'sm:max-w-4xl'
  };
  
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Overlay de fondo */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* Truco para centrar el contenido del modal */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          
          {/* Contenido del modal */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}>
              {/* Encabezado del modal */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    {title}
                  </Dialog.Title>
                  
                  {showCloseButton && (
                    <button
                      type="button"
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={onClose}
                    >
                      <span className="sr-only">Cerrar</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  )}
                </div>
                
                {/* Cuerpo del modal */}
                <div className="mt-3 sm:mt-4">
                  {children}
                </div>
              </div>
              
              {/* Pie del modal (acciones) */}
              {actions && (
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {actions}
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default BaseModal; 
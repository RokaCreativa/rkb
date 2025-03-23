/**
 * Componente Modal
 * 
 * Modal reutilizable con animaciones y diferentes tamaños.
 * Utiliza Headless UI para accesibilidad y comportamiento.
 */

import React, { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/tailwind';

/**
 * Tamaños disponibles para el modal
 */
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Propiedades para el componente Modal
 */
export interface ModalProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Título del modal */
  title?: string;
  /** Contenido del modal */
  children: ReactNode;
  /** Contenido del footer */
  footer?: ReactNode;
  /** Tamaño del modal */
  size?: ModalSize;
  /** Si se muestra un botón para cerrar */
  showCloseButton?: boolean;
  /** Si se puede cerrar haciendo clic fuera o con Escape */
  closeOnOutsideClick?: boolean;
  /** Clases adicionales para el panel */
  panelClassName?: string;
}

/**
 * Mapa de clases para los diferentes tamaños
 */
const sizeClasses: Record<ModalSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

/**
 * Componente Modal
 * 
 * @example
 * <Modal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   title="Crear nueva categoría"
 *   size="md"
 * >
 *   <CategoryForm onSubmit={handleCreateCategory} />
 * </Modal>
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOutsideClick = true,
  panelClassName = '',
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnOutsideClick ? onClose : () => {}}
      >
        {/* Overlay con efecto de desvanecimiento */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* Panel del modal con efecto de escala */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={cn(
                  "w-full transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all",
                  sizeClasses[size],
                  panelClassName
                )}
              >
                {/* Encabezado del modal */}
                {(title || showCloseButton) && (
                  <div className="flex justify-between items-center border-b border-gray-200 px-4 py-3">
                    {title && (
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        {title}
                      </Dialog.Title>
                    )}
                    
                    {showCloseButton && (
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={onClose}
                        aria-label="Cerrar"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Contenido del modal */}
                <div className="px-4 py-4">
                  {children}
                </div>

                {/* Footer del modal */}
                {footer && (
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 
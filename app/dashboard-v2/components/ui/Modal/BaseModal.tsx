import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Definición de tamaños responsive para diferentes dispositivos
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
}: BaseModalProps) {
  if (!isOpen) return null;

  // Manejar clic en el fondo para evitar propagación
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  // Prevenir propagación en el modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-2 sm:px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Fondo oscuro con animación mejorada */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ease-in-out"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />

        {/* Modal con mejor posicionamiento y animación */}
        <div 
          className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all duration-300 ease-in-out sm:my-8 sm:w-full sm:align-middle w-full mx-auto"
          onClick={handleModalClick}
        >
          <div className={`${sizeClasses[size]} w-full mx-auto ${className}`}>
            {/* Header optimizado para móviles */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
              <h3 className="text-base sm:text-lg font-medium leading-6 text-gray-900 pr-2">
                {title}
              </h3>
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none touch-optimized"
                onClick={onClose}
                aria-label="Cerrar"
              >
                <span className="sr-only">Cerrar</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Contenido con mejor padding en móviles */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 max-h-[70vh] overflow-y-auto">
              {children}
            </div>

            {/* Footer optimizado para móviles */}
            {footer && (
              <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
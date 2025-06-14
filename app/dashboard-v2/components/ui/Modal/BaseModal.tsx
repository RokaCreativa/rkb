import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * @fileoverview BaseModal - Modal base unificado del sistema
 * @description 
 * 🧭 MIGA DE PAN: Este es el modal base que unifica todo el sistema de modales
 * siguiendo los Mandamientos #5 (Mobile-First) y #8 (Consistencia Visual).
 * Se conecta con:
 * - ModalManager.tsx: Gestor central que renderiza este modal
 * - EditModals.tsx: Sistema unificado de modales de edición
 * - FormModal.tsx: Modal genérico para formularios
 * - Todos los modales legacy (pendientes de refactorización)
 * 
 * 🎯 MANDAMIENTO #5: Diseño Mobile-First con touch-optimized
 * 🎯 MANDAMIENTO #8: Sistema de diseño consistente y unificado
 * 🎯 MANDAMIENTO #6: Separación clara entre lógica y presentación
 */

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// 🧭 MIGA DE PAN: Tamaños responsive optimizados para Mobile-First (Mandamiento #5)
// Se conecta con todos los modales del sistema para mantener consistencia visual
const sizeClasses = {
  sm: 'w-full max-w-sm',      // Móvil: full width, Desktop: 384px
  md: 'w-full max-w-md',      // Móvil: full width, Desktop: 448px  
  lg: 'w-full max-w-2xl',     // Móvil: full width, Desktop: 672px
  xl: 'w-full max-w-4xl',     // Móvil: full width, Desktop: 896px
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

  // 🧭 MIGA DE PAN: Manejo de eventos optimizado para touch devices (Mandamiento #5)
  // Previene cierre accidental en móviles al tocar el modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 🧭 MIGA DE PAN: Container Mobile-First con padding optimizado para touch */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:block sm:p-0">

        {/* 🧭 MIGA DE PAN: Backdrop con animación suave (Mandamiento #8: Consistencia) */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ease-in-out"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />

        {/* 🧭 MIGA DE PAN: Modal principal con sizing unificado y responsive */}
        <div
          className={`
            relative inline-block align-bottom bg-white rounded-lg text-left 
            overflow-hidden shadow-xl transition-all 
            sm:my-8 sm:align-middle ${sizeClasses[size]}
            ${className}
          `}
          onClick={handleModalClick}
        >
          {/* 🧭 MIGA DE PAN: Header Mobile-First con touch targets optimizados */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-4">
            <h3 className="text-lg font-semibold leading-6 text-gray-900 pr-2 truncate">
              {title}
            </h3>
            {/* 🧭 MIGA DE PAN: Botón cerrar con área táctil amplia (44px mínimo) */}
            <button
              type="button"
              className="
                shrink-0 rounded-md bg-white text-gray-400 
                hover:text-gray-500 focus:outline-0 focus:ring-2 
                focus:ring-blue-500 focus:ring-offset-2
                p-2 -m-2 min-w-[44px] min-h-[44px] 
                flex items-center justify-center
              "
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* 🧭 MIGA DE PAN: Contenido con scroll optimizado y padding Mobile-First */}
          <div className="px-4 sm:px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>

          {/* 🧭 MIGA DE PAN: Footer sticky con acciones principales (Mandamiento #8) */}
          {footer && (
            <div className="
              sticky bottom-0 border-t border-gray-200 
              px-4 sm:px-6 py-4 bg-gray-50
              flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-end
            ">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
/**
 * Componente Notification
 * 
 * Muestra notificaciones tipo toast para feedback al usuario.
 */

import React, { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/tailwind';
import { NotificationType } from '@/contexts/NotificationContext';

interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  autoClose?: boolean;
  duration?: number;
  show: boolean;
  onClose: (id: string) => void;
}

/**
 * Mapa de iconos según el tipo de notificación
 */
const typeIcons = {
  success: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
  error: <XCircleIcon className="h-6 w-6 text-red-400" />,
  warning: <ExclamationCircleIcon className="h-6 w-6 text-amber-400" />,
  info: <InformationCircleIcon className="h-6 w-6 text-blue-400" />
};

/**
 * Mapa de clases según el tipo de notificación
 */
const typeClasses = {
  success: 'bg-green-50 border-green-100',
  error: 'bg-red-50 border-red-100',
  warning: 'bg-amber-50 border-amber-100',
  info: 'bg-blue-50 border-blue-100'
};

/**
 * Componente Notification
 */
export default function Notification({
  id,
  type = 'info',
  title,
  message,
  autoClose = true,
  duration = 5000,
  show,
  onClose
}: NotificationProps) {
  // Cerrar automáticamente después de la duración especificada
  React.useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [show, id, autoClose, duration, onClose]);
  
  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={cn(
          "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg",
          typeClasses[type]
        )}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {typeIcons[type]}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              {message && (
                <p className="mt-1 text-sm text-gray-500">{message}</p>
              )}
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => onClose(id)}
              >
                <span className="sr-only">Cerrar</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
} 
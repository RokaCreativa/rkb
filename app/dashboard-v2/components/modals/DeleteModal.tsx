"use client";

/**
 * @fileoverview Modal de confirmación genérico para eliminar entidades
 * @author RokaMenu Team
 * @version 1.0.0
 * @created 2024-08-26
 * 
 * Este componente es un modal genérico para confirmar la eliminación de cualquier
 * tipo de entidad (categoría, sección, producto, etc). Reemplaza los modales específicos
 * para cada entidad, siguiendo el mandamiento "No duplicarás lo que ya está creado".
 */

import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../hooks/ui/useI18n';

/**
 * Tipo de entidad que se puede eliminar
 */
export type EntityType = 'category' | 'section' | 'product';

/**
 * Props para el modal de eliminación genérico
 */
interface DeleteModalProps {
  /**
   * Controla si el modal está visible
   */
  isOpen: boolean;
  
  /**
   * Función que se llama al cerrar el modal
   */
  onClose: () => void;
  
  /**
   * Tipo de entidad que se está eliminando
   */
  entityType: EntityType;
  
  /**
   * ID de la entidad
   */
  entityId: number;
  
  /**
   * Nombre de la entidad que se muestra en el mensaje
   */
  entityName: string;
  
  /**
   * Función que se ejecuta al confirmar la eliminación
   */
  onConfirm: () => Promise<void>;
  
  /**
   * Si es true, muestra que hay una operación en curso
   */
  isLoading?: boolean;
}

/**
 * Modal de confirmación genérico para eliminar entidades
 * 
 * @param props - Props del modal
 * @returns Componente React
 */
export default function DeleteModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  onConfirm,
  isLoading = false
}: DeleteModalProps) {
  const cancelButtonRef = useRef(null);
  const { t } = useI18n();

  /**
   * Maneja la confirmación de eliminación y captura errores
   */
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error(`Error al eliminar ${entityType}:`, error);
    }
  };

  /**
   * Obtiene el título del modal según el tipo de entidad
   */
  const getTitle = () => {
    return t(`${entityType}s.delete`);
  };

  /**
   * Obtiene el mensaje de confirmación según el tipo de entidad
   */
  const getMessage = () => {
    // Mensaje básico de confirmación con el nombre de la entidad
    const baseMessage = t(`${entityType}s.deleteConfirm`, { name: entityName });
    
    // Mensaje adicional de advertencia específico para categorías y secciones
    let warningMessage = '';
    if (entityType === 'category') {
      warningMessage = t('categories.deleteWarning');
    } else if (entityType === 'section') {
      warningMessage = t('sections.deleteWarning');
    }
    
    // Mensaje de que la acción no se puede deshacer
    const undoWarning = t('modals.delete.undoWarning');
    
    // Combinar los mensajes
    return (
      <>
        {baseMessage} 
        {warningMessage && (
          <>
            <br /><br />
            {warningMessage}
          </>
        )}
        <br /><br />
        {undoWarning}
      </>
    );
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    {getTitle()}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {getMessage()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? t('modals.delete.processing') : t('modals.delete.confirmButton')}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={onClose}
                  ref={cancelButtonRef}
                  disabled={isLoading}
                >
                  {t('modals.delete.cancelButton')}
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 
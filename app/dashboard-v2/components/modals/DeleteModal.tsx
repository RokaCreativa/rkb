/**
 * @fileoverview DeleteModal - Modal unificado para eliminación de entidades
 * @author RokaMenu Team
 * @version 2.0.0
 * @updated 2024-08-25
 * 
 * Este componente proporciona una interfaz unificada para la eliminación de cualquier
 * tipo de entidad (categorías, secciones, productos). Reemplaza los múltiples modales
 * específicos por tipo, eliminando la duplicación de código y mejorando la mantenibilidad.
 */

import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';
import { useEntityOperations, DeleteFunction } from '../../hooks/core/useEntityOperations';
import { useTranslation } from 'react-i18next';

/**
 * Tipos de entidades que se pueden eliminar
 */
export type EntityType = 'category' | 'section' | 'product';

/**
 * Configuración de mensajes según el tipo de entidad
 */
const ENTITY_CONFIG = {
  category: {
    titleKey: 'categories.delete',
    warningKey: 'categories.deleteWarning',
    entityNameSpanish: 'categoría',
    entityNameEnglish: 'category',
    i18nKey: 'categories'
  },
  section: {
    titleKey: 'sections.delete',
    warningKey: 'sections.deleteWarning',
    entityNameSpanish: 'sección',
    entityNameEnglish: 'section',
    i18nKey: 'sections'
  },
  product: {
    titleKey: 'products.delete',
    warningKey: '',
    entityNameSpanish: 'producto',
    entityNameEnglish: 'product',
    i18nKey: 'products'
  }
};

/**
 * Props para el modal de eliminación genérico
 */
export interface DeleteModalProps<T = number, A = unknown> {
  /**
   * Tipo de entidad a eliminar
   */
  entityType: EntityType;
  
  /**
   * ID de la entidad a eliminar
   */
  entityId: T;
  
  /**
   * Nombre de la entidad a eliminar (para mostrar)
   */
  entityName: string;
  
  /**
   * Función para eliminar la entidad
   */
  deleteFunction: DeleteFunction<T, A>;
  
  /**
   * Argumentos adicionales para la función de eliminación
   */
  deleteArgs?: A[];
  
  /**
   * Indica si el modal está abierto
   */
  isOpen: boolean;
  
  /**
   * Función para cerrar el modal
   */
  onClose: () => void;
  
  /**
   * Función a llamar después de eliminar exitosamente
   */
  onDeleteSuccess?: () => void;
  
  /**
   * Mensajes personalizados (opcionales)
   */
  customMessages?: {
    deleteSuccess?: string;
    deleteError?: string;
  };
}

/**
 * Modal unificado para eliminación de entidades
 * 
 * @template T - Tipo del ID de la entidad (normalmente number)
 * @template A - Tipo de argumentos adicionales para la función de eliminación
 */
function DeleteModal<T = number, A = unknown>({
  entityType,
  entityId,
  entityName,
  deleteFunction,
  deleteArgs = [] as unknown as A[],
  isOpen,
  onClose,
  onDeleteSuccess,
  customMessages
}: DeleteModalProps<T, A>) {
  // Configuración según el tipo de entidad
  const { titleKey, warningKey, entityNameSpanish, entityNameEnglish, i18nKey } = ENTITY_CONFIG[entityType];
  
  // Obtener función de traducción
  const { t } = useTranslation();
  
  // Referencia para el botón de cancelar
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  
  // Usar nuestro hook genérico para operaciones de entidades
  const { isDeleting, deleteEntity } = useEntityOperations({
    entityName: entityNameSpanish,
    deleteFunction,
    onDeleteSuccess,
    messages: customMessages
  });
  
  /**
   * Manejador para confirmar la eliminación
   */
  const handleConfirm = async () => {
    // Intentar eliminar la entidad
    const success = await deleteEntity(entityId, ...deleteArgs);
    
    // Cerrar el modal si la eliminación fue exitosa
    if (success) {
      onClose();
    }
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
                    {t(titleKey)}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {t(`${i18nKey}.deleteConfirm`, { name: entityName })}
                      {warningKey && (
                        <span className="block mt-1">{t(warningKey)}</span>
                      )}
                      <span className="block mt-1">{t('modals.delete.undoWarning')}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? t('modals.delete.processing') : t('modals.delete.confirmButton')}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
                  onClick={onClose}
                  ref={cancelButtonRef}
                  disabled={isDeleting}
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

export default DeleteModal; 
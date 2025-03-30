/**
 * @file DeleteCategoryConfirmation.tsx
 * @description Modal de confirmación para eliminar categorías
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

"use client";

import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { deleteCategory } from '@/lib/handlers/categoryEventHandlers';

/**
 * Props para el componente DeleteCategoryConfirmation
 */
interface DeleteCategoryConfirmationProps {
  /**
   * Determina si el modal está abierto o cerrado
   */
  isOpen: boolean;
  
  /**
   * Función que se ejecuta al cerrar el modal
   */
  onClose: () => void;
  
  /**
   * ID de la categoría a eliminar
   */
  categoryId: number;
  
  /**
   * Nombre de la categoría (para mostrar en el mensaje)
   */
  categoryName: string;
  
  /**
   * Función que se ejecuta después de eliminar la categoría
   * @param categoryId ID de la categoría eliminada
   */
  onDeleted: (categoryId: number) => void;

  /**
   * ID del cliente (opcional)
   */
  clientId: number | null;
}

/**
 * Componente para confirmar la eliminación de una categoría
 * 
 * Muestra un modal con mensaje de advertencia y botones para confirmar o cancelar.
 * Si el usuario confirma, realiza la solicitud al API para eliminar la categoría.
 * 
 * @example
 * <DeleteCategoryConfirmation
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   categoryId={123}
 *   categoryName="Bebidas"
 *   onDeleted={(id) => console.log(`Categoría ${id} eliminada`)}
 * />
 */
export default function DeleteCategoryConfirmation({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  onDeleted,
  clientId
}: DeleteCategoryConfirmationProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    
    try {
      // Llamada a la API para eliminar la categoría
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('No se pudo eliminar la categoría');
      }
      
      // Llamar al callback onDeleted
      onDeleted(categoryId);
      onClose();
    } catch (error) {
      console.error('Error al eliminar la categoría:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
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
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-red-500">
                    <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Eliminar categoría
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que quieres eliminar la categoría <span className="font-semibold">{categoryName}</span>?
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Esta acción eliminará también todas las secciones y productos asociados.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    onClick={onClose}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    onClick={handleDeleteConfirmed}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Eliminando...
                      </>
                    ) : (
                      'Eliminar'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 
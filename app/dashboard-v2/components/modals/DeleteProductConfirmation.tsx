/**
 * @file DeleteProductConfirmation.tsx
 * @description Modal de confirmación para eliminar productos
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

"use client";

import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { deleteProduct } from '@/lib/handlers/productEventHandlers';

/**
 * Props para el componente DeleteProductConfirmation
 */
interface DeleteProductConfirmationProps {
  /**
   * Determina si el modal está abierto o cerrado
   */
  isOpen: boolean;
  
  /**
   * Función que se ejecuta al cerrar el modal
   */
  onClose: () => void;
  
  /**
   * ID del producto a eliminar
   */
  productId: number;
  
  /**
   * Nombre del producto (para mostrar en el mensaje)
   */
  productName: string;
  
  /**
   * Función que se ejecuta después de eliminar el producto
   * @param productId ID del producto eliminado
   */
  onDeleted: (productId: number) => void;
}

/**
 * Componente para confirmar la eliminación de un producto
 * 
 * Muestra un modal con mensaje de advertencia y botones para confirmar o cancelar.
 * Si el usuario confirma, realiza la solicitud al API para eliminar el producto.
 * 
 * @example
 * <DeleteProductConfirmation
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   productId={123}
 *   productName="Hamburguesa"
 *   onDeleted={(id) => console.log(`Producto ${id} eliminado`)}
 * />
 */
export default function DeleteProductConfirmation({
  isOpen,
  onClose,
  productId,
  productName,
  onDeleted
}: DeleteProductConfirmationProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    
    try {
      // Llamada a la API para eliminar el producto
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('No se pudo eliminar el producto');
      }
      
      // Llamar al callback onDeleted
      onDeleted(productId);
      onClose();
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
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
                  <div className="flex-shrink-0 text-amber-500">
                    <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Eliminar producto
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que quieres eliminar el producto <span className="font-semibold">{productName}</span>?
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                    onClick={onClose}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
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
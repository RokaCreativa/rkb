/**
 * @file DeleteProductConfirmation.tsx
 * @description Modal de confirmación para eliminar productos
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

"use client";

import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { deleteProduct } from '@/lib/handlers/productEventHandlers';
import { toast } from 'react-hot-toast';
import { CheckIcon } from '@heroicons/react/24/outline';

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      // Llamada a la API para eliminar el producto
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('No se pudo eliminar el producto');
      }
      
      // En caso de éxito mostrar mensaje antes de recargar
      const reloadWithFeedback = () => {
        // Primer mensaje de éxito
        setSuccessMessage(`Producto "${productName}" eliminado correctamente.`);
        
        // Después de un momento, avisar que vamos a recargar
        setTimeout(() => {
          setSuccessMessage(`Producto "${productName}" eliminado correctamente. Recargando...`);
          
          // Finalmente recargar después de un tiempo para que se vea el mensaje
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }, 800);
      };
      
      // Si hay callback onDeleted, ejecutarlo
      if (onDeleted) {
        onDeleted(productId);
      }
      
      // Iniciar secuencia de recarga con feedback
      reloadWithFeedback();
      
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('No se pudo eliminar el producto');
      setIsDeleting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
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
            <Dialog.Panel className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              {successMessage ? (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Operación exitosa
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{successMessage}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
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

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={onClose}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 
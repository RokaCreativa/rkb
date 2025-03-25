"use client";

/**
 * @fileoverview Componente modal para la eliminación de productos en el menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este componente proporciona una interfaz de usuario para confirmar y procesar
 * la eliminación de productos individuales en el sistema de gestión de menús.
 * Implementa un patrón de confirmación para prevenir eliminaciones accidentales.
 */

import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Section, Product } from '@/app/types/menu';

/**
 * Props para el componente DeleteProductModal
 * 
 * @property {boolean} isOpen - Controla si el modal está abierto o cerrado
 * @property {Function} onClose - Función para cerrar el modal y restablecer el estado
 * @property {number | null} productToDelete - ID del producto que se va a eliminar
 * @property {Function} deleteProduct - Función que realiza la petición de eliminación a la API
 * @property {boolean} isDeletingProduct - Indica si hay una operación de eliminación en proceso
 * @property {Section | null} selectedSection - Sección a la que pertenece el producto a eliminar
 * @property {Function} setProducts - Función para actualizar el estado global de productos
 */
interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToDelete: number | null;
  deleteProduct: (productId: number) => Promise<boolean>;
  isDeletingProduct: boolean;
  selectedSection: Section | null;
  setProducts: React.Dispatch<React.SetStateAction<Record<string, Product[]>>>;
}

/**
 * Componente modal para confirmar y procesar la eliminación de productos
 * 
 * Este componente proporciona una interfaz de confirmación para eliminar
 * productos del sistema de menú, con las siguientes características:
 * 
 * - Modal de confirmación con mensaje claro sobre las consecuencias
 * - Gestión del estado de carga durante el proceso de eliminación
 * - Actualización inmediata del estado global tras una eliminación exitosa
 * - Notificaciones de éxito/error al usuario mediante toast
 * - Prevención de eliminaciones accidentales mediante confirmación explícita
 * 
 * El componente se encarga tanto de la comunicación con la API como de
 * mantener la interfaz actualizada eliminando el producto del estado.
 * 
 * @param {DeleteProductModalProps} props - Propiedades del componente
 * @returns {JSX.Element} Modal de confirmación para eliminar productos
 */
const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  productToDelete,
  deleteProduct,
  isDeletingProduct,
  selectedSection,
  setProducts
}) => {
  /**
   * Estado local para controlar el proceso de eliminación
   * Este estado es independiente del isDeletingProduct que viene por props
   * para permitir un control más granular dentro del componente.
   */
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Procesa la solicitud de eliminación del producto
   * 
   * Este método:
   * 1. Verifica que existan IDs válidos de producto y sección para eliminar
   * 2. Establece el estado de carga durante el proceso
   * 3. Realiza la llamada a la API para eliminar el producto
   * 4. Actualiza el estado global eliminando el producto de la lista de su sección
   * 5. Muestra una notificación del resultado al usuario
   * 6. Cierra el modal si la operación es exitosa
   * 
   * La actualización del estado se realiza inmediatamente en el componente
   * para proporcionar una experiencia de usuario fluida sin necesidad de
   * recargar datos desde el servidor.
   */
  const confirmDelete = async () => {
    if (!productToDelete || !selectedSection) return;
    
    setIsDeleting(true);
    
    try {
      // Llamar a la función de eliminación
      const success = await deleteProduct(productToDelete);
      
      if (success) {
        // Actualizar el estado local para eliminar el producto
        setProducts(prev => {
          const updated = {...prev};
          if (updated[selectedSection.section_id]) {
            updated[selectedSection.section_id] = updated[selectedSection.section_id].filter(
              product => product.product_id !== productToDelete
            );
          }
          return updated;
        });
        
        toast.success('Producto eliminado correctamente');
        onClose();
      } else {
        toast.error('Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      toast.error('Error al eliminar el producto');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Capa de fondo oscura */}
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

          {/* Truco para centrar el modal verticalmente */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          {/* Contenido del modal con animación */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                {/* Icono de advertencia */}
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                
                {/* Texto de confirmación */}
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    Eliminar producto
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
                      Los clientes ya no podrán ver este producto en el menú.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                {/* Botón de eliminar */}
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={confirmDelete}
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
                
                {/* Botón de cancelar */}
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={onClose}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default DeleteProductModal; 
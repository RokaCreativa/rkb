"use client";

/**
 * @fileoverview Componente modal para la eliminación de categorías en el menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este componente proporciona una interfaz de usuario para confirmar y procesar
 * la eliminación de categorías en el sistema de gestión de menús. Incluye
 * advertencias sobre las consecuencias de la eliminación (pérdida de secciones
 * y productos relacionados).
 */

import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Category } from '@/app/types/menu';

/**
 * Props para el componente DeleteCategoryModal
 * 
 * @property {boolean} isOpen - Controla si el modal está abierto o cerrado
 * @property {Function} onClose - Función para cerrar el modal y restablecer el estado
 * @property {number | null} categoryToDelete - ID de la categoría que se va a eliminar
 * @property {Function} deleteCategory - Función que realiza la petición de eliminación a la API
 * @property {boolean} isDeletingCategory - Indica si hay una operación de eliminación en proceso
 * @property {Function} setCategories - Función para actualizar el estado global de categorías
 */
interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToDelete: number | null;
  deleteCategory: (categoryId: number) => Promise<any>;
  isDeletingCategory: boolean;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

/**
 * Componente modal para confirmar y procesar la eliminación de categorías
 * 
 * Este componente proporciona una interfaz de confirmación para eliminar
 * categorías del sistema, con las siguientes características:
 * 
 * - Modal de confirmación con advertencias claras sobre las consecuencias
 * - Gestión del estado de carga durante el proceso de eliminación
 * - Notificaciones de éxito/error al usuario mediante toast
 * - Actualización automática del estado global de categorías tras eliminación exitosa
 * - Prevención de eliminaciones accidentales mediante confirmación explícita
 * 
 * La eliminación de una categoría es una operación destructiva que también 
 * elimina todas las secciones y productos relacionados con ella.
 * 
 * @param {DeleteCategoryModalProps} props - Propiedades del componente
 * @returns {JSX.Element} Modal de confirmación para eliminar categorías
 */
const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToDelete,
  deleteCategory,
  isDeletingCategory,
  setCategories
}) => {
  /**
   * Estado local para controlar el proceso de eliminación
   * Este estado es independiente del isDeletingCategory que viene por props
   * para permitir un control más granular dentro del componente.
   */
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Procesa la solicitud de eliminación de la categoría
   * 
   * Este método:
   * 1. Verifica que exista un ID de categoría válido para eliminar
   * 2. Establece el estado de carga durante el proceso
   * 3. Realiza la llamada a la API para eliminar la categoría
   * 4. Actualiza el estado global eliminando la categoría de la lista
   * 5. Muestra una notificación del resultado al usuario
   * 6. Limpia el estado y cierra el modal al completar
   * 
   * En caso de error, captura la excepción y muestra un mensaje apropiado.
   */
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // Llamar a la función de eliminación
      await deleteCategory(categoryToDelete);
      
      // Actualizar el estado local para eliminar la categoría
      setCategories(prev => prev.filter(cat => cat.category_id !== categoryToDelete));
      
      toast.success('Categoría eliminada correctamente');
      onClose();
    } catch (error) {
      console.error('Error al eliminar la categoría:', error);
      toast.error('Error al eliminar la categoría');
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
                    Eliminar categoría
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      ¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.
                    </p>
                    <p className="text-sm text-red-500 font-medium mt-2">
                      ADVERTENCIA: Todas las secciones y productos contenidos en esta categoría también serán eliminados.
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

export default DeleteCategoryModal; 
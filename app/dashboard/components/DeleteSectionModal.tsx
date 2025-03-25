"use client";

/**
 * @fileoverview Componente modal para la eliminación de secciones en el menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este componente proporciona una interfaz de usuario para confirmar y procesar
 * la eliminación de secciones en el sistema de gestión de menús. Incluye
 * advertencias sobre las consecuencias de la eliminación (pérdida de todos
 * los productos asociados a la sección).
 */

import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Category, Section } from '@/app/types/menu';

/**
 * Props para el componente DeleteSectionModal
 * 
 * @property {boolean} isOpen - Controla si el modal está abierto o cerrado
 * @property {Function} onClose - Función para cerrar el modal y restablecer el estado
 * @property {number | null} sectionToDelete - ID de la sección que se va a eliminar
 * @property {Function} deleteSection - Función que realiza la petición de eliminación a la API
 * @property {boolean} isDeletingSection - Indica si hay una operación de eliminación en proceso
 * @property {Category | null} selectedCategory - Categoría a la que pertenece la sección a eliminar
 * @property {Function} setSections - Función para actualizar el estado global de secciones
 */
interface DeleteSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionToDelete: number | null;
  deleteSection: (sectionId: number) => Promise<boolean>;
  isDeletingSection: boolean;
  selectedCategory: Category | null;
  setSections: React.Dispatch<React.SetStateAction<Record<string, Section[]>>>;
}

/**
 * Componente modal para confirmar y procesar la eliminación de secciones
 * 
 * Este componente proporciona una interfaz de confirmación para eliminar
 * secciones del sistema de menú, con las siguientes características:
 * 
 * - Modal de confirmación con advertencias claras sobre las consecuencias
 * - Gestión del estado de carga durante el proceso de eliminación
 * - Notificaciones de éxito/error al usuario mediante toast
 * - Prevención de eliminaciones accidentales mediante confirmación explícita
 * - Integración con el sistema de gestión de estado de la aplicación
 * 
 * La eliminación de una sección es una operación destructiva que también 
 * elimina todos los productos relacionados con ella.
 * 
 * @param {DeleteSectionModalProps} props - Propiedades del componente
 * @returns {JSX.Element} Modal de confirmación para eliminar secciones
 */
const DeleteSectionModal: React.FC<DeleteSectionModalProps> = ({
  isOpen,
  onClose,
  sectionToDelete,
  deleteSection,
  isDeletingSection,
  selectedCategory,
  setSections
}) => {
  /**
   * Estado local para controlar el proceso de eliminación
   * Este estado es independiente del isDeletingSection que viene por props
   * para permitir un control más granular dentro del componente.
   */
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Procesa la solicitud de eliminación de la sección
   * 
   * Este método:
   * 1. Verifica que existan IDs válidos de sección y categoría para eliminar
   * 2. Establece el estado de carga durante el proceso
   * 3. Realiza la llamada a la API para eliminar la sección
   * 4. Muestra una notificación del resultado al usuario
   * 5. Cierra el modal si la operación es exitosa
   * 
   * La actualización del estado global ocurre dentro de la función deleteSection,
   * no en este método, para mantener la lógica de negocio separada.
   * 
   * IMPORTANTE: Al eliminar una sección se eliminarán también todos sus productos.
   */
  const confirmDelete = async () => {
    if (!sectionToDelete || !selectedCategory) return;
    
    setIsDeleting(true);
    
    try {
      // Llamar a la función de eliminación
      const success = await deleteSection(sectionToDelete);
      
      if (success) {
        // No es necesario actualizar el estado local aquí,
        // ya que la función deleteSection ya lo hace
        toast.success('Sección eliminada correctamente');
        onClose();
      } else {
        toast.error('Error al eliminar la sección');
      }
    } catch (error) {
      console.error('Error al eliminar la sección:', error);
      // No mostrar toast aquí, ya se muestra en la función deleteSection
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
                    Eliminar sección
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      ¿Estás seguro de que deseas eliminar esta sección? Esta acción no se puede deshacer.
                    </p>
                    <p className="text-sm text-red-500 font-medium mt-2">
                      ADVERTENCIA: Todos los productos contenidos en esta sección también serán eliminados.
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

export default DeleteSectionModal; 
/**
 * @file DeleteSectionConfirmation.tsx
 * @description Componente específico para confirmar eliminación de secciones
 * @author TuNombre
 * @version 1.0.0
 * @lastUpdated 2024-03-27
 */

"use client";

import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/outline';
import { deleteSection } from '@/lib/handlers/sectionEventHandlers';
import { toast } from 'react-hot-toast';
import SuccessMessage from '../ui/SuccessMessage';

interface DeleteSectionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: number;
  sectionName: string;
  categoryId: number;
  onDeleted: (sectionId: number) => void;
}

export default function DeleteSectionConfirmation({
  isOpen,
  onClose,
  sectionId,
  sectionName,
  categoryId,
  onDeleted
}: DeleteSectionConfirmationProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('No se pudo eliminar la sección');
      }
      
      // En caso de éxito mostrar mensaje antes de recargar
      const reloadWithFeedback = () => {
        // Primer mensaje de éxito
        setSuccessMessage(`Sección "${sectionName}" eliminada correctamente.`);
        
        // Después de un momento, avisar que vamos a recargar
        setTimeout(() => {
          setSuccessMessage(`Sección "${sectionName}" eliminada correctamente. Recargando...`);
          
          // Finalmente recargar después de un tiempo para que se vea el mensaje
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }, 800);
      };
      
      // Si hay callback onDeleted, ejecutarlo
      if (onDeleted) {
        onDeleted(sectionId);
      }
      
      // Iniciar secuencia de recarga con feedback
      reloadWithFeedback();
      
    } catch (error) {
      console.error('Error al eliminar sección:', error);
      toast.error('No se pudo eliminar la sección');
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
                <SuccessMessage 
                  message={successMessage} 
                  color="blue"
                  progressDuration={2.3} 
                />
              ) : (
                <>
                  <div className="sm:flex sm:items-start">
                    <div className="flex-shrink-0 text-teal-500">
                      <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Eliminar sección
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          ¿Estás seguro de que quieres eliminar la sección <span className="font-semibold">{sectionName}</span>?
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Esta acción eliminará también todos los productos asociados a esta sección.
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
                      className="inline-flex justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
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
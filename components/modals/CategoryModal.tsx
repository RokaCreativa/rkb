"use client"

/**
 * @fileoverview Componente modal para la creación y edición de categorías
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 */

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import CategoryForm from '../forms/CategoryForm'
import { Category } from '@/app/types/menu'

/**
 * Props para el componente CategoryModal
 * 
 * @property {boolean} isOpen - Indica si el modal está abierto o cerrado
 * @property {Function} onClose - Función que se ejecuta al cerrar el modal
 * @property {Function} onSubmit - Función que maneja el envío del formulario
 * @property {Category} [category] - Categoría a editar (opcional, solo en modo edición)
 * @property {boolean} [isLoading] - Indica si hay una operación en curso
 * @property {string} [title] - Título personalizado para el modal
 */
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  category?: Category;
  isLoading?: boolean;
  title?: string;
}

/**
 * Componente Modal para crear y editar categorías
 * 
 * Este componente proporciona una interfaz modal para que los administradores
 * puedan crear nuevas categorías o editar las existentes en el sistema de gestión
 * de menús. Utiliza el componente CategoryForm para la recogida de datos.
 * 
 * Características:
 * - Animaciones suaves de entrada y salida mediante Transition
 * - Gestión apropiada de accesibilidad con roles y atributos ARIA
 * - Cierre mediante botón X o haciendo clic fuera del modal
 * - Integración con el flujo de trabajo de categorías del dashboard
 * 
 * @param {CategoryModalProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente modal para gestión de categorías
 */
export default function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  isLoading = false,
  title
}: CategoryModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="p-6">
                  <CategoryForm
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    title={title || (category ? "Editar Categoría" : "Nueva Categoría")}
                    initialData={category ? {
                      name: category.name,
                      status: category.status === 1,
                      image: category.image || undefined
                    } : undefined}
                    isLoading={isLoading}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 
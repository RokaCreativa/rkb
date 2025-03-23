import { Dialog } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import BaseModal from './BaseModal';

/**
 * Propiedades del componente DeleteConfirmationModal
 * @property {boolean} isOpen - Controla si el modal está abierto o cerrado
 * @property {() => void} onClose - Función a llamar cuando se cierra el modal
 * @property {() => void} onConfirm - Función a llamar cuando se confirma la eliminación
 * @property {string} title - Título del modal
 * @property {string} message - Mensaje de confirmación
 * @property {boolean} isDeleting - Indica si se está procesando la eliminación (para mostrar estado de carga)
 */
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting?: boolean;
}

/**
 * Modal de confirmación para eliminar elementos
 * 
 * Este componente muestra un diálogo modal para confirmar la eliminación de algún elemento.
 * Incluye un mensaje de advertencia, botones para cancelar o confirmar, y un estado de carga.
 * 
 * Extiende BaseModal para mantener la consistencia visual con otros modales de la aplicación.
 * 
 * Uso:
 * ```tsx
 * <DeleteConfirmationModal
 *   isOpen={isDeleteModalOpen}
 *   onClose={() => setIsDeleteModalOpen(false)}
 *   onConfirm={handleDeleteConfirm}
 *   title="Eliminar categoría"
 *   message="Esta acción eliminará permanentemente la categoría y todos sus elementos asociados."
 *   isDeleting={isDeleting}
 * />
 * ```
 * 
 * @author Rodolfo - RokaMenu
 * @date 23-03-2025 (UTC+0 - Londres)
 */
export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false
}: DeleteConfirmationModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <div>
          <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
            ¿Estás seguro?
          </Dialog.Title>
          <p className="mt-2 text-sm text-gray-500">
            {message}
          </p>
        </div>
      </div>
    </BaseModal>
  );
} 
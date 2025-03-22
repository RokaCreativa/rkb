"use client"

import { useState } from 'react'
import { TrashIcon, AlertCircle, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

/**
 * Interfaz para las propiedades del botón de eliminar categoría
 */
interface DeleteCategoryButtonProps {
  /** ID de la categoría a eliminar */
  categoryId: number;
  /** Nombre de la categoría para mostrar en el diálogo de confirmación */
  categoryName?: string;
  /** Función a llamar después de eliminar exitosamente */
  onSuccess?: () => void;
}

/**
 * Botón para eliminar una categoría con confirmación de seguridad
 * 
 * Muestra un diálogo de confirmación antes de realizar la eliminación
 * para prevenir eliminaciones accidentales
 */
export default function DeleteCategoryButton({
  categoryId,
  categoryName = "esta categoría",
  onSuccess
}: DeleteCategoryButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Abrir el diálogo de confirmación
  const handleOpenConfirm = () => {
    setIsConfirmOpen(true)
  }

  // Cerrar el diálogo de confirmación
  const handleCloseConfirm = () => {
    setIsConfirmOpen(false)
  }

  // Eliminar la categoría
  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al eliminar la categoría')
      }
      
      toast.success(`La categoría "${categoryName}" ha sido eliminada`)
      
      if (onSuccess) {
        onSuccess()
      }
      
      setIsConfirmOpen(false)
    } catch (error) {
      console.error('Error al eliminar:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la categoría')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Botón para iniciar la eliminación */}
      <button
        onClick={handleOpenConfirm}
        className="inline-flex items-center justify-center p-2 text-red-600 bg-white rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label={`Eliminar ${categoryName}`}
        title={`Eliminar ${categoryName}`}
      >
        <TrashIcon className="w-5 h-5" />
      </button>

      {/* Diálogo de confirmación */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-semibold">Confirmar eliminación</h2>
              </div>
              <button
                onClick={handleCloseConfirm}
                className="p-1 rounded-full hover:bg-gray-100"
                disabled={isDeleting}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="mb-2 text-gray-700">
                ¿Estás seguro de que deseas eliminar la categoría <span className="font-semibold">{categoryName}</span>?
              </p>
              <p className="text-sm text-gray-500">
                Esta acción no se puede deshacer y eliminará la categoría permanentemente.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseConfirm}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 
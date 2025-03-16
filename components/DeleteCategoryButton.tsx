'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteCategoryButtonProps {
  categoryId: number
}

export function DeleteCategoryButton({ categoryId }: DeleteCategoryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la categoría')
      }

      router.refresh() // Actualiza la página para reflejar los cambios
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar la categoría')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`p-2 ${
        isDeleting ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
      } text-white rounded transition-colors`}
      title="Eliminar categoría"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  )
} 
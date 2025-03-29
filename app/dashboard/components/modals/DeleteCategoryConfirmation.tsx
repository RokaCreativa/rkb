/**
 * @file DeleteCategoryConfirmation.tsx
 * @description Modal de confirmación para eliminar categorías
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

import React, { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from './ConfirmationModal';
import { toast } from 'react-hot-toast';
import useCategories from '@/app/hooks/useCategories';
import { adaptDeleteCategory } from '@/lib/adapters/category-functions-adapter';

/**
 * Props para el componente DeleteCategoryConfirmation
 */
interface DeleteCategoryConfirmationProps {
  /**
   * Determina si el modal está abierto o cerrado
   */
  isOpen: boolean;
  
  /**
   * Función que se ejecuta al cerrar el modal
   */
  onClose: () => void;
  
  /**
   * ID de la categoría a eliminar
   */
  categoryId: number;
  
  /**
   * Nombre de la categoría (para mostrar en el mensaje)
   */
  categoryName: string;
  
  /**
   * Función que se ejecuta después de eliminar la categoría
   * @param categoryId ID de la categoría eliminada
   */
  onDeleted: (categoryId: number) => void;

  /**
   * ID del cliente (opcional)
   */
  clientId: number | null;
  
  /**
   * Función que maneja la confirmación de eliminación (opcional)
   * Si se proporciona, reemplaza la implementación predeterminada
   */
  onDeleteConfirmed?: (categoryId: number) => Promise<boolean>;
}

/**
 * Componente para confirmar la eliminación de una categoría
 * 
 * Muestra un modal con mensaje de advertencia y botones para confirmar o cancelar.
 * Si el usuario confirma, realiza la solicitud al API para eliminar la categoría.
 * 
 * @example
 * <DeleteCategoryConfirmation
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   categoryId={123}
 *   categoryName="Bebidas"
 *   onDeleted={(id) => console.log(`Categoría ${id} eliminada`)}
 * />
 */
const DeleteCategoryConfirmation: React.FC<DeleteCategoryConfirmationProps> = ({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  onDeleted,
  clientId,
  onDeleteConfirmed
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Integrar el hook useCategories
  const { deleteCategory: hookDeleteCategory } = useCategories(clientId);
  
  const handleDelete = async () => {
    if (!categoryId) return;
    
    setIsDeleting(true);
    
    try {
      // Si se proporciona una función personalizada, usarla
      if (onDeleteConfirmed) {
        const success = await onDeleteConfirmed(categoryId);
        if (success) {
          onDeleted(categoryId);
          onClose();
        }
      } else {
        // Usar el adaptador para deleteCategory
        const adaptedDeleteCategory = adaptDeleteCategory(hookDeleteCategory);
        
        // Llamar a la función adaptada
        const success = await adaptedDeleteCategory(
          categoryId,
          (updater) => {
            // Esta función será llamada por el adaptador para actualizar el estado local
            // pero nosotros solo notificamos al padre que la categoría fue eliminada
            onDeleted(categoryId);
          }
        );
        
        if (success) {
          toast.success('Categoría eliminada correctamente');
          onClose();
        } else {
          throw new Error('No se pudo eliminar la categoría');
        }
      }
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      
      // Intentar el método original como fallback
      try {
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Error al eliminar la categoría');
        }
        
        // El mensaje de éxito ya lo muestra el hook, no es necesario duplicarlo aquí
        onDeleted(categoryId);
        onClose();
      } catch (fallbackError) {
        console.error('Error en el fallback al eliminar categoría:', fallbackError);
        toast.error('No se pudo eliminar la categoría');
      }
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar categoría"
      message={`¿Estás seguro de que deseas eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer. Se eliminarán todas las secciones y productos asociados a esta categoría.`}
      itemName={categoryName}
      confirmText="Eliminar"
      variant="danger"
      cancelText="Cancelar"
      isProcessing={isDeleting}
      onConfirm={handleDelete}
    />
  );
};

export default DeleteCategoryConfirmation; 
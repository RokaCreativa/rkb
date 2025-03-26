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
  onDeleted
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!categoryId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la categoría');
      }
      
      toast.success('Categoría eliminada correctamente');
      onDeleted(categoryId);
      onClose();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      toast.error('No se pudo eliminar la categoría');
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
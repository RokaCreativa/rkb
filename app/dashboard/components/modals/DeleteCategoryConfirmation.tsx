/**
 * @file DeleteCategoryConfirmation.tsx
 * @description Componente específico para confirmar eliminación de categorías
 * @author TuNombre
 * @version 1.0.0
 * @lastUpdated 2024-03-27
 */

import React, { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Category } from '@/app/types/menu';
import { DeleteModal } from '../modals';
import { useDashboardService } from '@/lib/hooks/dashboard';

interface DeleteCategoryConfirmationProps {
  /**
   * ID de la categoría a eliminar
   */
  categoryId: number;
  
  /**
   * Nombre de la categoría a eliminar
   */
  categoryName: string;
  
  /**
   * Indica si el modal está abierto
   */
  isOpen: boolean;
  
  /**
   * Función para cerrar el modal
   */
  onClose: () => void;
  
  /**
   * Función a ejecutar después de eliminar correctamente
   */
  onDeleted?: (categoryId: number) => void;
}

/**
 * Componente para confirmar la eliminación de una categoría
 * 
 * Este componente utiliza el DeleteModal genérico con configuración específica
 * para el caso de eliminación de categorías, incluyendo:
 * - Llamada a la API del dashboard para eliminar la categoría
 * - Manejo de errores y mensajes de éxito/error
 * - Actualización del estado después de la eliminación
 */
const DeleteCategoryConfirmation: React.FC<DeleteCategoryConfirmationProps> = ({
  categoryId,
  categoryName,
  isOpen,
  onClose,
  onDeleted
}) => {
  // Obtener la función de eliminación del servicio del dashboard
  const { deleteCategory } = useDashboardService();
  
  /**
   * Función para eliminar la categoría
   */
  const handleDeleteCategory = useCallback(async (id: number) => {
    try {
      const success = await deleteCategory(id);
      
      if (success) {
        if (onDeleted) {
          onDeleted(id);
        }
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar la categoría:', error);
      return false;
    }
  }, [categoryName, deleteCategory, onDeleted]);
  
  return (
    <DeleteModal
      itemType="category"
      itemId={categoryId}
      itemName={categoryName}
      isOpen={isOpen}
      onClose={onClose}
      deleteFunction={handleDeleteCategory}
    />
  );
};

export default DeleteCategoryConfirmation; 
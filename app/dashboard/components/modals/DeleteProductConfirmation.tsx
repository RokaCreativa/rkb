/**
 * @file DeleteProductConfirmation.tsx
 * @description Componente específico para confirmar eliminación de productos
 * @author TuNombre
 * @version 1.0.0
 * @lastUpdated 2024-03-27
 */

import React, { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Product } from '@/app/types/menu';
import { DeleteModal } from '../modals';
import { useDashboardService } from '@/lib/hooks/dashboard';

interface DeleteProductConfirmationProps {
  /**
   * ID del producto a eliminar
   */
  productId: number;
  
  /**
   * Nombre del producto a eliminar
   */
  productName: string;
  
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
  onDeleted?: (productId: number) => void;
}

/**
 * Componente para confirmar la eliminación de un producto
 * 
 * Este componente utiliza el DeleteModal genérico con configuración específica
 * para el caso de eliminación de productos, incluyendo:
 * - Llamada a la API del dashboard para eliminar el producto
 * - Manejo de errores y mensajes de éxito/error
 * - Actualización del estado después de la eliminación
 */
const DeleteProductConfirmation: React.FC<DeleteProductConfirmationProps> = ({
  productId,
  productName,
  isOpen,
  onClose,
  onDeleted
}) => {
  // Obtener la función de eliminación del servicio del dashboard
  const { deleteProduct } = useDashboardService();
  
  /**
   * Función para eliminar el producto
   */
  const handleDeleteProduct = useCallback(async (id: number) => {
    try {
      const success = await deleteProduct(id);
      
      if (success) {
        if (onDeleted) {
          onDeleted(id);
        }
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      return false;
    }
  }, [productName, deleteProduct, onDeleted]);
  
  return (
    <DeleteModal
      itemType="product"
      itemId={productId}
      itemName={productName}
      isOpen={isOpen}
      onClose={onClose}
      deleteFunction={handleDeleteProduct}
    />
  );
};

export default DeleteProductConfirmation; 
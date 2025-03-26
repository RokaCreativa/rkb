/**
 * @file DeleteProductConfirmation.tsx
 * @description Modal de confirmación para eliminar productos
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

import React, { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from './ConfirmationModal';
import { toast } from 'react-hot-toast';

/**
 * Props para el componente DeleteProductConfirmation
 */
interface DeleteProductConfirmationProps {
  /**
   * Determina si el modal está abierto o cerrado
   */
  isOpen: boolean;
  
  /**
   * Función que se ejecuta al cerrar el modal
   */
  onClose: () => void;
  
  /**
   * ID del producto a eliminar
   */
  productId: number;
  
  /**
   * Nombre del producto (para mostrar en el mensaje)
   */
  productName: string;
  
  /**
   * Función para eliminar el producto
   * @param productId ID del producto a eliminar
   * @returns Promise con el resultado de la operación
   */
  deleteProduct?: (productId: number) => Promise<boolean>;
  
  /**
   * Función que se ejecuta después de eliminar el producto
   * @param productId ID del producto eliminado
   */
  onDeleted: (productId: number) => void;
}

/**
 * Componente para confirmar la eliminación de un producto
 * 
 * Muestra un modal con mensaje de advertencia y botones para confirmar o cancelar.
 * Si el usuario confirma, realiza la solicitud al API para eliminar el producto.
 * 
 * @example
 * <DeleteProductConfirmation
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   productId={123}
 *   productName="Hamburguesa"
 *   onDeleted={(id) => console.log(`Producto ${id} eliminado`)}
 * />
 */
const DeleteProductConfirmation: React.FC<DeleteProductConfirmationProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  deleteProduct,
  onDeleted
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!productId) return;
    
    setIsDeleting(true);
    try {
      let success = false;
      
      if (deleteProduct) {
        // Usar la función proporcionada por el padre
        success = await deleteProduct(productId);
      } else {
        // Fallback: Llamar directamente a la API si no se proporciona la función
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });
        
        success = response.ok;
      }
      
      if (success) {
        toast.success('Producto eliminado correctamente');
        onDeleted(productId);
        onClose();
      } else {
        throw new Error('Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('No se pudo eliminar el producto');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar producto"
      message={`¿Estás seguro de que deseas eliminar el producto "${productName}"? Esta acción no se puede deshacer.`}
      itemName={productName}
      confirmText="Eliminar"
      variant="danger"
      cancelText="Cancelar"
      isProcessing={isDeleting}
      onConfirm={handleDelete}
    />
  );
};

export default DeleteProductConfirmation; 
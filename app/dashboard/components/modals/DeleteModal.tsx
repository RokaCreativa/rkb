/**
 * @file DeleteModal.tsx
 * @description Componente modal para eliminar elementos del dashboard
 * @author TuNombre
 * @version 1.0.0
 * @lastUpdated 2024-03-27
 */

import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

/**
 * Tipo de elemento a eliminar
 */
export type DeleteItemType = 'category' | 'section' | 'product';

interface DeleteModalProps {
  /**
   * Tipo de elemento a eliminar
   */
  itemType: DeleteItemType;
  
  /**
   * ID del elemento a eliminar
   */
  itemId: number;
  
  /**
   * Nombre del elemento a eliminar
   */
  itemName: string;
  
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
  onDeleted?: () => void;
  
  /**
   * Función para eliminar el elemento (puede ser personalizada)
   */
  deleteFunction?: (id: number) => Promise<boolean>;
}

/**
 * Componente modal para eliminar elementos del dashboard
 * 
 * Proporciona una interfaz de confirmación para eliminar categorías,
 * secciones o productos, con mensajes específicos según el tipo.
 */
const DeleteModal: React.FC<DeleteModalProps> = ({
  itemType,
  itemId,
  itemName,
  isOpen,
  onClose,
  onDeleted,
  deleteFunction
}) => {
  // Estado para controlar si se está procesando la eliminación
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Textos según el tipo de elemento
  const typeConfig = {
    category: {
      title: 'Eliminar categoría',
      message: '¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer y eliminará todas las secciones y productos asociados.',
      buttonText: 'Eliminar categoría'
    },
    section: {
      title: 'Eliminar sección',
      message: '¿Estás seguro de que deseas eliminar esta sección? Esta acción no se puede deshacer y eliminará todos los productos asociados.',
      buttonText: 'Eliminar sección'
    },
    product: {
      title: 'Eliminar producto',
      message: '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
      buttonText: 'Eliminar producto'
    }
  };
  
  const { title, message, buttonText } = typeConfig[itemType];
  
  /**
   * Maneja la confirmación para eliminar el elemento
   */
  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      
      // Si se proporcionó una función de eliminación personalizada, usarla
      if (deleteFunction) {
        const success = await deleteFunction(itemId);
        if (success && onDeleted) {
          onDeleted();
        }
      } else {
        // En caso contrario, procesar según el tipo de elemento
        console.error('No se proporcionó una función de eliminación.');
      }
      
      onClose();
    } catch (error) {
      console.error(`Error al eliminar ${itemType}:`, error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <ConfirmationModal
      title={title}
      message={message}
      itemName={itemName}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmText={buttonText}
      variant="danger"
      isProcessing={isDeleting}
    />
  );
};

export default DeleteModal; 
/**
 * @file DeleteSectionConfirmation.tsx
 * @description Componente específico para confirmar eliminación de secciones
 * @author TuNombre
 * @version 1.0.0
 * @lastUpdated 2024-03-27
 */

import React, { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Section } from '@/app/types/menu';
import { DeleteModal } from '../modals';
import { useDashboardService } from '@/lib/hooks/dashboard';

interface DeleteSectionConfirmationProps {
  /**
   * ID de la sección a eliminar
   */
  sectionId: number;
  
  /**
   * Nombre de la sección a eliminar
   */
  sectionName: string;
  
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
  onDeleted?: (sectionId: number) => void;
}

/**
 * Componente para confirmar la eliminación de una sección
 * 
 * Este componente utiliza el DeleteModal genérico con configuración específica
 * para el caso de eliminación de secciones, incluyendo:
 * - Llamada a la API del dashboard para eliminar la sección
 * - Manejo de errores y mensajes de éxito/error
 * - Actualización del estado después de la eliminación
 */
const DeleteSectionConfirmation: React.FC<DeleteSectionConfirmationProps> = ({
  sectionId,
  sectionName,
  isOpen,
  onClose,
  onDeleted
}) => {
  // Obtener la función de eliminación del servicio del dashboard
  const { deleteSection } = useDashboardService();
  
  /**
   * Función para eliminar la sección
   */
  const handleDeleteSection = useCallback(async (id: number) => {
    try {
      const success = await deleteSection(id);
      
      if (success) {
        if (onDeleted) {
          onDeleted(id);
        }
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar la sección:', error);
      return false;
    }
  }, [sectionName, deleteSection, onDeleted]);
  
  return (
    <DeleteModal
      itemType="section"
      itemId={sectionId}
      itemName={sectionName}
      isOpen={isOpen}
      onClose={onClose}
      deleteFunction={handleDeleteSection}
    />
  );
};

export default DeleteSectionConfirmation; 
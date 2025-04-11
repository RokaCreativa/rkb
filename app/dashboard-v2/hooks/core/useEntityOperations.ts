/**
 * @fileoverview Hook genérico para operaciones de entidades
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-08-25
 * 
 * Este hook proporciona funcionalidad centralizada para las operaciones CRUD
 * en cualquier tipo de entidad del sistema (categorías, secciones, productos).
 * Sigue el patrón DDD (Domain-Driven Design) y evita la duplicación de código.
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Tipo para una función de eliminación
 * @template T - Tipo de ID (normalmente number)
 * @template A - Tipo de argumentos adicionales (opcional)
 */
export type DeleteFunction<T = number, A = unknown> = (id: T, ...args: A[]) => Promise<void | boolean>;

/**
 * Opciones para el hook useEntityOperations
 * @template T - Tipo de ID de la entidad
 * @template A - Tipo de argumentos adicionales para eliminar
 */
export interface EntityOperationsOptions<T = number, A = unknown> {
  /**
   * Nombre de la entidad (para mensajes)
   */
  entityName: string;
  
  /**
   * Función que realiza la eliminación real de la entidad
   */
  deleteFunction: DeleteFunction<T, A>;
  
  /**
   * Función a llamar después de una eliminación exitosa (opcional)
   */
  onDeleteSuccess?: () => void;
  
  /**
   * Mensajes personalizados (opcional)
   */
  messages?: {
    deleteSuccess?: string;
    deleteError?: string;
  };
}

/**
 * Hook genérico para operaciones de entidades
 * 
 * @template T - Tipo de ID de la entidad
 * @template A - Tipo de argumentos adicionales para la eliminación
 * @param options - Opciones para configurar el comportamiento
 * @returns Objeto con estados y funciones para operar con la entidad
 */
export function useEntityOperations<T = number, A = unknown>(
  options: EntityOperationsOptions<T, A>
) {
  const {
    entityName,
    deleteFunction,
    onDeleteSuccess,
    messages = {}
  } = options;
  
  // Estados para seguimiento
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  /**
   * Elimina una entidad por su ID
   * 
   * @param id - ID de la entidad a eliminar
   * @param args - Argumentos adicionales (si los requiere la función de eliminación)
   * @returns Promesa que se resuelve a true si es exitoso, false si hay error
   */
  const deleteEntity = useCallback(
    async (id: T, ...args: A[]): Promise<boolean> => {
      try {
        setIsDeleting(true);
        setDeleteError(null);
        
        // Llamar a la función de eliminación proporcionada
        await deleteFunction(id, ...args);
        
        // Mensaje de éxito y callback si existe
        toast.success(
          messages.deleteSuccess || `${entityName} eliminado correctamente`
        );
        onDeleteSuccess?.();
        
        return true;
      } catch (error) {
        console.error(`Error al eliminar ${entityName.toLowerCase()}:`, error);
        
        // Capturar el mensaje de error
        const errorMessage = error instanceof Error 
          ? error.message 
          : `Error al eliminar ${entityName.toLowerCase()}`;
        
        setDeleteError(errorMessage);
        toast.error(
          messages.deleteError || `Error al eliminar ${entityName.toLowerCase()}`
        );
        
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteFunction, entityName, messages, onDeleteSuccess]
  );
  
  return {
    // Estados
    isDeleting,
    deleteError,
    
    // Acciones
    deleteEntity
  };
} 
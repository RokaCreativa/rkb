/**
 * @fileoverview Hook genérico para operaciones CRUD de entidades
 * @author RokaMenu Team
 * @version 1.0.0
 * @created 2024-08-26
 * 
 * Este hook proporciona una interfaz unificada para operaciones CRUD
 * (Create, Read, Update, Delete) en diferentes tipos de entidades.
 * Implementa el mandamiento "No duplicarás lo que ya está creado" al
 * centralizar la lógica común de operaciones CRUD.
 */

import { useState } from 'react';
import { useI18n } from '../ui/useI18n';

/**
 * Tipo para funciones de eliminación genéricas
 */
export type DeleteFunction<T = number, A = unknown> = (id: T, ...args: A[]) => Promise<boolean>;

/**
 * Tipo para funciones de creación genéricas
 */
export type CreateFunction<T = number, D = any> = (data: D) => Promise<T>;

/**
 * Tipo para funciones de actualización genéricas
 */
export type UpdateFunction<T = number, D = any, A = unknown> = (id: T, data: D, ...args: A[]) => Promise<boolean>;

/**
 * Props para el hook de operaciones de entidades
 */
export interface UseEntityOperationsProps<T = number, D = any, A = unknown> {
  /**
   * Nombre de la entidad (para mensajes)
   */
  entityName: string;
  
  /**
   * Función para eliminar la entidad (opcional)
   */
  deleteFunction?: DeleteFunction<T, A>;
  
  /**
   * Función para crear la entidad (opcional)
   */
  createFunction?: CreateFunction<T, D>;
  
  /**
   * Función para actualizar la entidad (opcional)
   */
  updateFunction?: UpdateFunction<T, D, A>;
  
  /**
   * Función a llamar después de una eliminación exitosa
   */
  onDeleteSuccess?: () => void;
  
  /**
   * Función a llamar después de una creación exitosa
   */
  onCreateSuccess?: (id: T) => void;
  
  /**
   * Función a llamar después de una actualización exitosa
   */
  onUpdateSuccess?: () => void;
  
  /**
   * Mensajes personalizados (opcionales)
   */
  messages?: {
    createSuccess?: string;
    createError?: string;
    updateSuccess?: string;
    updateError?: string;
    deleteSuccess?: string;
    deleteError?: string;
  };
}

/**
 * Resultado del hook de operaciones de entidades
 */
export interface UseEntityOperationsResult<T = number, D = any, A = unknown> {
  /**
   * Indica si hay una operación de eliminación en curso
   */
  isDeleting: boolean;
  
  /**
   * Indica si hay una operación de creación en curso
   */
  isCreating: boolean;
  
  /**
   * Indica si hay una operación de actualización en curso
   */
  isUpdating: boolean;
  
  /**
   * Error actual (si existe)
   */
  error: string | null;
  
  /**
   * Función para eliminar una entidad
   */
  deleteEntity: DeleteFunction<T, A>;
  
  /**
   * Función para crear una entidad
   */
  createEntity: CreateFunction<T, D>;
  
  /**
   * Función para actualizar una entidad
   */
  updateEntity: UpdateFunction<T, D, A>;
  
  /**
   * Resetea el estado de error
   */
  resetError: () => void;
}

/**
 * Hook genérico para operaciones CRUD de entidades
 * 
 * @template T - Tipo del ID de la entidad (normalmente number)
 * @template D - Tipo de datos para crear/actualizar
 * @template A - Tipo de argumentos adicionales
 * 
 * @param props - Props para el hook
 * @returns Resultado con funciones y estado
 */
export function useEntityOperations<T = number, D = any, A = unknown>({
  entityName,
  deleteFunction,
  createFunction,
  updateFunction,
  onDeleteSuccess,
  onCreateSuccess,
  onUpdateSuccess,
  messages = {}
}: UseEntityOperationsProps<T, D, A>): UseEntityOperationsResult<T, D, A> {
  // Estados para operaciones en curso
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hook i18n para traducciones
  const { t } = useI18n();
  
  /**
   * Resetea el estado de error
   */
  const resetError = () => setError(null);
  
  /**
   * Maneja errores de operaciones y actualiza el estado
   */
  const handleError = (operation: string, err: any) => {
    console.error(`Error al ${operation} ${entityName}:`, err);
    const errorMessage = err?.message || `Error al ${operation} ${entityName}`;
    setError(errorMessage);
    return false;
  };
  
  /**
   * Función para eliminar una entidad
   */
  const deleteEntity: DeleteFunction<T, A> = async (id, ...args) => {
    // Si no se proporciona función de eliminación, retornar error
    if (!deleteFunction) {
      setError(`No se ha proporcionado función de eliminación para ${entityName}`);
      return false;
    }
    
    try {
      setIsDeleting(true);
      resetError();
      
      // Llamar a la función de eliminación
      const success = await deleteFunction(id, ...args);
      
      if (success) {
        // Si hay mensaje personalizado, mostrarlo usando notificación
        if (messages.deleteSuccess) {
          // Aquí se podría integrar con un sistema de notificaciones
          console.log(messages.deleteSuccess);
        } else {
          // Usar mensajes i18n estándar
          console.log(t(`notifications.${entityName}Deleted`));
        }
        
        // Llamar callback de éxito si existe
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      }
      
      return success;
    } catch (err) {
      return handleError('eliminar', err);
    } finally {
      setIsDeleting(false);
    }
  };
  
  /**
   * Función para crear una entidad
   */
  const createEntity: CreateFunction<T, D> = async (data) => {
    // Si no se proporciona función de creación, retornar error
    if (!createFunction) {
      setError(`No se ha proporcionado función de creación para ${entityName}`);
      throw new Error(`No se ha proporcionado función de creación para ${entityName}`);
    }
    
    try {
      setIsCreating(true);
      resetError();
      
      // Llamar a la función de creación
      const id = await createFunction(data);
      
      // Si hay mensaje personalizado, mostrarlo usando notificación
      if (messages.createSuccess) {
        // Aquí se podría integrar con un sistema de notificaciones
        console.log(messages.createSuccess);
      } else {
        // Usar mensajes i18n estándar
        console.log(t(`notifications.${entityName}Created`));
      }
      
      // Llamar callback de éxito si existe
      if (onCreateSuccess) {
        onCreateSuccess(id);
      }
      
      return id;
    } catch (err) {
      handleError('crear', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };
  
  /**
   * Función para actualizar una entidad
   */
  const updateEntity: UpdateFunction<T, D, A> = async (id, data, ...args) => {
    // Si no se proporciona función de actualización, retornar error
    if (!updateFunction) {
      setError(`No se ha proporcionado función de actualización para ${entityName}`);
      return false;
    }
    
    try {
      setIsUpdating(true);
      resetError();
      
      // Llamar a la función de actualización
      const success = await updateFunction(id, data, ...args);
      
      if (success) {
        // Si hay mensaje personalizado, mostrarlo usando notificación
        if (messages.updateSuccess) {
          // Aquí se podría integrar con un sistema de notificaciones
          console.log(messages.updateSuccess);
        } else {
          // Usar mensajes i18n estándar
          console.log(t(`notifications.${entityName}Updated`));
        }
        
        // Llamar callback de éxito si existe
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      }
      
      return success;
    } catch (err) {
      return handleError('actualizar', err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return {
    isDeleting,
    isCreating,
    isUpdating,
    error,
    deleteEntity,
    createEntity,
    updateEntity,
    resetError
  };
} 
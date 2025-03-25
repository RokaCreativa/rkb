"use client";

/**
 * @fileoverview Hook para gestionar los estados de modales del dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este hook proporciona funcionalidades para gestionar los estados de los
 * modales en toda la aplicación, optimizando la lógica de UI.
 */

import { useState, useCallback } from 'react';
import { Category, Section, Product } from '@/app/types/menu';

interface ModalOptions<T = any> {
  /**
   * Datos iniciales para el modal
   */
  initialData?: T;
}

/**
 * Hook para gestionar el estado de modales
 * 
 * @param initialState - Estado inicial (abierto/cerrado)
 * @returns Funciones y estado para controlar un modal
 */
export function useModalState<T = any>(initialState: boolean = false) {
  // Estado para controlar si el modal está abierto
  const [isOpen, setIsOpen] = useState<boolean>(initialState);
  
  // Estado para almacenar datos asociados al modal
  const [data, setData] = useState<T | undefined>(undefined);
  
  /**
   * Abre el modal
   * @param options - Opciones al abrir el modal
   */
  const open = useCallback((options?: ModalOptions<T>) => {
    if (options?.initialData !== undefined) {
      setData(options.initialData);
    }
    setIsOpen(true);
  }, []);
  
  /**
   * Cierra el modal y limpia los datos
   */
  const close = useCallback(() => {
    setIsOpen(false);
    // Opcional: se podría mantener los datos para animaciones de cierre
    // o limpiarlos inmediatamente
  }, []);
  
  /**
   * Alterna el estado del modal (abierto/cerrado)
   * @param options - Opciones al abrir el modal (si se abre)
   */
  const toggle = useCallback((options?: ModalOptions<T>) => {
    if (!isOpen && options?.initialData !== undefined) {
      setData(options.initialData);
    }
    setIsOpen(!isOpen);
  }, [isOpen]);
  
  /**
   * Actualiza los datos del modal
   * @param newData - Nuevos datos o función para actualizar los datos existentes
   */
  const updateData = useCallback((newData: T | ((prevData: T | undefined) => T)) => {
    if (typeof newData === 'function') {
      setData(newData as ((prevData: T | undefined) => T));
    } else {
      setData(newData);
    }
  }, []);
  
  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    updateData
  };
}

/**
 * Hook para gestionar múltiples modales
 * 
 * @returns Objeto con funciones para controlar múltiples modales
 */
export function useMultipleModals<T extends Record<string, any> = Record<string, any>>(
  modalNames: string[]
) {
  // Crear un objeto con un estado para cada modal
  const modalStates = modalNames.reduce((acc, modalName) => {
    const { isOpen, data, open, close, toggle, updateData } = useModalState<T[typeof modalName]>();
    
    acc[modalName] = {
      isOpen,
      data,
      open,
      close,
      toggle,
      updateData
    };
    
    return acc;
  }, {} as Record<string, ReturnType<typeof useModalState>>);
  
  /**
   * Cierra todos los modales
   */
  const closeAll = useCallback(() => {
    Object.values(modalStates).forEach(modal => modal.close());
  }, [modalStates]);
  
  return {
    modals: modalStates,
    closeAll
  };
}

export default useModalState; 
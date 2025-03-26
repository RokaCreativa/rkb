"use client";

/**
 * @fileoverview Hook personalizado para gestionar el estado de modales
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 * 
 * Este archivo proporciona hooks para gestionar el estado de modales en la aplicación.
 * Incluye:
 * 
 * - useModalState: Hook básico para gestionar un único modal
 * - useMultipleModals: Hook para gestionar múltiples modales con un solo estado
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
 * Hook para gestionar el estado de un modal (abierto/cerrado)
 * 
 * Proporciona funciones para abrir, cerrar y alternar el estado del modal,
 * así como el estado actual del modal.
 * 
 * @returns {Object} Un objeto con el estado actual del modal y funciones para manipularlo
 * @property {boolean} isOpen - Indica si el modal está abierto
 * @property {() => void} open - Función para abrir el modal
 * @property {() => void} close - Función para cerrar el modal
 * @property {() => void} toggle - Función para alternar el estado del modal
 * 
 * @example
 * // Uso básico en un componente
 * const ProductModal = () => {
 *   const { isOpen, open, close } = useModalState();
 *   
 *   return (
 *     <>
 *       <button onClick={open}>Abrir Modal</button>
 *       
 *       {isOpen && (
 *         <div className="modal">
 *           <h2>Detalles del Producto</h2>
 *           <button onClick={close}>Cerrar</button>
 *         </div>
 *       )}
 *     </>
 *   );
 * };
 */
export function useModalState(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return { isOpen, open, close, toggle };
}

/**
 * Interface para la configuración de modales múltiples
 */
export interface ModalConfig {
  [key: string]: boolean;
}

/**
 * Hook para gestionar múltiples modales con un solo estado
 * 
 * Útil cuando necesitas controlar varios modales en un componente
 * y asegurarte de que solo uno esté abierto a la vez.
 * 
 * @param {ModalConfig} initialState - Estado inicial de los modales (todos cerrados por defecto)
 * @returns {Object} Un objeto con funciones para manipular los modales y su estado actual
 * @property {ModalConfig} modalState - Estado actual de todos los modales
 * @property {(modalKey: string) => void} openModal - Abre un modal específico y cierra los demás
 * @property {(modalKey: string) => void} closeModal - Cierra un modal específico
 * @property {(modalKey: string) => void} toggleModal - Alterna el estado de un modal específico
 * @property {() => void} closeAll - Cierra todos los modales
 * 
 * @example
 * // Gestionar múltiples modales en un componente
 * const ProductManager = () => {
 *   const { modalState, openModal, closeModal } = useMultipleModals({
 *     create: false,
 *     edit: false,
 *     delete: false
 *   });
 *   
 *   return (
 *     <div>
 *       <button onClick={() => openModal('create')}>Crear Producto</button>
 *       <button onClick={() => openModal('edit')}>Editar Producto</button>
 *       <button onClick={() => openModal('delete')}>Eliminar Producto</button>
 *       
 *       {modalState.create && (
 *         <CreateProductModal onClose={() => closeModal('create')} />
 *       )}
 *       
 *       {modalState.edit && (
 *         <EditProductModal onClose={() => closeModal('edit')} />
 *       )}
 *       
 *       {modalState.delete && (
 *         <DeleteProductModal onClose={() => closeModal('delete')} />
 *       )}
 *     </div>
 *   );
 * };
 */
export function useMultipleModals(initialState: ModalConfig = {}) {
  const [modalState, setModalState] = useState<ModalConfig>(initialState);
  
  /**
   * Abre un modal específico y cierra todos los demás
   * 
   * @param {string} modalKey - Clave del modal a abrir
   */
  const openModal = useCallback((modalKey: string) => {
    setModalState(prev => {
      // Crear un nuevo objeto con todos los modales cerrados
      const newState: ModalConfig = {};
      
      // Copiar todos los modales actuales como cerrados
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      
      // Asegurarse de que el modal a abrir existe en el estado
      if (!(modalKey in newState)) {
        newState[modalKey] = true;
      } else {
        // Abrir el modal especificado
        newState[modalKey] = true;
      }
      
      return newState;
    });
  }, []);
  
  /**
   * Cierra un modal específico
   * 
   * @param {string} modalKey - Clave del modal a cerrar
   */
  const closeModal = useCallback((modalKey: string) => {
    setModalState(prev => ({
      ...prev,
      [modalKey]: false
    }));
  }, []);
  
  /**
   * Alterna el estado de un modal específico
   * 
   * @param {string} modalKey - Clave del modal a alternar
   */
  const toggleModal = useCallback((modalKey: string) => {
    setModalState(prev => ({
      ...prev,
      [modalKey]: !prev[modalKey]
    }));
  }, []);
  
  /**
   * Cierra todos los modales
   */
  const closeAll = useCallback(() => {
    setModalState(prev => {
      const newState: ModalConfig = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      return newState;
    });
  }, []);
  
  return {
    modalState,
    openModal,
    closeModal,
    toggleModal,
    closeAll
  };
}

// Exportación por defecto
export default useModalState; 
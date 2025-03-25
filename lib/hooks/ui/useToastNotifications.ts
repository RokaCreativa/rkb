"use client";

/**
 * @fileoverview Hook para gestionar notificaciones toast en la aplicación
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este hook proporciona una interfaz unificada para mostrar notificaciones
 * de éxito, error, información y advertencia en la aplicación utilizando
 * la biblioteca react-hot-toast.
 */

import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Hook que proporciona funciones para mostrar notificaciones toast
 * 
 * Este hook proporciona:
 * - Función para mostrar notificaciones de éxito
 * - Función para mostrar notificaciones de error
 * - Función para mostrar notificaciones de información
 * - Función para mostrar notificaciones de advertencia
 * - Función para descartar todas las notificaciones
 * 
 * Centraliza la configuración de los toasts y proporciona una API consistente
 * para mostrar notificaciones en toda la aplicación.
 * 
 * @returns Objeto con funciones para mostrar notificaciones
 */
export default function useToastNotifications() {
  /**
   * Muestra una notificación de éxito
   * @param message Mensaje a mostrar
   */
  const showSuccess = useCallback((message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right'
    });
  }, []);
  
  /**
   * Muestra una notificación de error
   * @param message Mensaje a mostrar
   */
  const showError = useCallback((message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right'
    });
  }, []);
  
  /**
   * Muestra una notificación de información
   * @param message Mensaje a mostrar
   */
  const showInfo = useCallback((message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right'
    });
  }, []);
  
  /**
   * Muestra una notificación de advertencia
   * @param message Mensaje a mostrar
   */
  const showWarning = useCallback((message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
        border: '1px solid #F59E0B'
      }
    });
  }, []);
  
  /**
   * Muestra una notificación de carga mientras se ejecuta una promesa
   * @param promise Promesa a ejecutar
   * @param messages Mensajes a mostrar (cargando, éxito, error)
   * @returns Resultado de la promesa
   */
  const showPromise = useCallback(<T>(
    promise: Promise<T>, 
    messages: { 
      loading: string; 
      success: string; 
      error: string | ((err: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error
    });
  }, []);
  
  /**
   * Descarta todas las notificaciones toast activas
   */
  const dismissAll = useCallback(() => {
    toast.dismiss();
  }, []);
  
  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showPromise,
    dismissAll
  };
} 
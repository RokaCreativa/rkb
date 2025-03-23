/**
 * Contexto de Notificaciones
 * 
 * Proporciona un sistema centralizado para mostrar notificaciones
 * y alertas al usuario.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * Tipos de notificación
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Estructura de una notificación
 */
export interface Notification {
  /** ID único de la notificación */
  id: string;
  /** Tipo de notificación */
  type: NotificationType;
  /** Título de la notificación */
  title?: string;
  /** Mensaje principal */
  message: string;
  /** Duración en ms (0 = no autodesaparece) */
  duration?: number;
}

/**
 * Opciones para crear una notificación
 */
export interface NotificationOptions {
  /** Título opcional */
  title?: string;
  /** Duración en ms (0 = no autodesaparece) */
  duration?: number;
  /** ID personalizado (si no se proporciona, se genera) */
  id?: string;
}

/**
 * Contexto para las notificaciones
 */
interface NotificationContextValue {
  /** Lista de notificaciones activas */
  notifications: Notification[];
  /** Mostrar una notificación de éxito */
  success: (message: string, options?: NotificationOptions) => string;
  /** Mostrar una notificación de error */
  error: (message: string, options?: NotificationOptions) => string;
  /** Mostrar una notificación informativa */
  info: (message: string, options?: NotificationOptions) => string;
  /** Mostrar una notificación de advertencia */
  warning: (message: string, options?: NotificationOptions) => string;
  /** Eliminar una notificación por su ID */
  remove: (id: string) => void;
  /** Eliminar todas las notificaciones */
  clearAll: () => void;
}

/**
 * Crear el contexto con un valor por defecto
 */
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

/**
 * Props para el proveedor de notificaciones
 */
interface NotificationProviderProps {
  /** Duración por defecto para las notificaciones (ms) */
  defaultDuration?: number;
  /** Número máximo de notificaciones simultáneas */
  maxNotifications?: number;
  /** Contenido hijo */
  children: ReactNode;
}

/**
 * Componente Proveedor para el contexto de notificaciones
 */
export function NotificationProvider({
  defaultDuration = 5000,
  maxNotifications = 5,
  children
}: NotificationProviderProps) {
  // Lista de notificaciones
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Generar ID único
  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Añadir nueva notificación
  const addNotification = useCallback((
    type: NotificationType, 
    message: string, 
    options?: NotificationOptions
  ): string => {
    const id = options?.id || generateId();
    
    const notification: Notification = {
      id,
      type,
      title: options?.title,
      message,
      duration: options?.duration || defaultDuration
    };
    
    setNotifications(current => {
      // Limitar número máximo de notificaciones
      const updatedNotifications = [...current, notification];
      return updatedNotifications.slice(-maxNotifications);
    });
    
    // Configurar temporizador para eliminar automáticamente
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        remove(id);
      }, notification.duration);
    }
    
    return id;
  }, [defaultDuration, maxNotifications]);
  
  // Eliminar notificación
  const remove = useCallback((id: string) => {
    setNotifications(notifications => 
      notifications.filter(notification => notification.id !== id)
    );
  }, []);
  
  // Eliminar todas las notificaciones
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Funciones específicas por tipo
  const success = useCallback((message: string, options?: NotificationOptions) => 
    addNotification('success', message, options), [addNotification]);
    
  const error = useCallback((message: string, options?: NotificationOptions) => 
    addNotification('error', message, options), [addNotification]);
    
  const info = useCallback((message: string, options?: NotificationOptions) => 
    addNotification('info', message, options), [addNotification]);
    
  const warning = useCallback((message: string, options?: NotificationOptions) => 
    addNotification('warning', message, options), [addNotification]);
  
  // Valor del contexto
  const contextValue = {
    notifications,
    success,
    error,
    info,
    warning,
    remove,
    clearAll
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook para usar el contexto de notificaciones
 * 
 * @returns Funciones para mostrar y gestionar notificaciones
 * @throws Error si se usa fuera del proveedor
 * 
 * @example
 * const { success, error } = useNotifications();
 * 
 * // Mostrar mensaje de éxito
 * success('Operación completada correctamente');
 * 
 * // Mostrar mensaje de error con título
 * error('No se pudo completar la operación', { 
 *   title: 'Error de conexión',
 *   duration: 10000 // 10 segundos
 * });
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications debe usarse dentro de un NotificationProvider');
  }
  
  return context;
}

/**
 * Componente para mostrar las notificaciones
 * 
 * @example
 * // En tu layout principal
 * <NotificationProvider>
 *   <div className="app-layout">
 *     {children}
 *     <NotificationContainer />
 *   </div>
 * </NotificationProvider>
 */
export function NotificationContainer() {
  const { notifications, remove } = useNotifications();
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-lg shadow-md w-80 transform transition-all 
            ${getNotificationClasses(notification.type)}
          `}
          role="alert"
        >
          {notification.title && (
            <h3 className="font-medium mb-1">{notification.title}</h3>
          )}
          <p className="text-sm">{notification.message}</p>
          <button
            className="absolute top-2 right-2 text-sm opacity-70 hover:opacity-100"
            onClick={() => remove(notification.id)}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * Obtiene clases CSS según el tipo de notificación
 */
function getNotificationClasses(type: NotificationType): string {
  switch (type) {
    case 'success':
      return 'bg-green-100 border border-green-300 text-green-800';
    case 'error':
      return 'bg-red-100 border border-red-300 text-red-800';
    case 'warning':
      return 'bg-amber-100 border border-amber-300 text-amber-800';
    case 'info':
      return 'bg-blue-100 border border-blue-300 text-blue-800';
    default:
      return 'bg-gray-100 border border-gray-300 text-gray-800';
  }
} 
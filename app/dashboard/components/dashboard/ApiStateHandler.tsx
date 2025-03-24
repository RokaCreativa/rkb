import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Props para el componente ApiStateHandler
 */
interface ApiStateHandlerProps {
  /**
   * Indica si hay una operación de carga en curso
   */
  isLoading: boolean;
  
  /**
   * Mensaje de error a mostrar
   */
  error: string | null;
  
  /**
   * Mensaje informativo a mostrar
   */
  message: string | null;
  
  /**
   * Función que se ejecuta para eliminar un mensaje de error
   */
  onDismissError: () => void;
  
  /**
   * Función que se ejecuta para eliminar un mensaje informativo
   */
  onDismissMessage: () => void;
}

/**
 * Componente que gestiona y muestra los estados de la API
 * Muestra indicadores de carga, mensajes de error y mensajes informativos
 */
const ApiStateHandler: React.FC<ApiStateHandlerProps> = ({
  isLoading,
  error,
  message,
  onDismissError,
  onDismissMessage
}) => {
  return (
    <div className="my-4 space-y-3">
      {isLoading && (
        <div className="p-4 bg-white shadow rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-700">Cargando datos...</span>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={onDismissError} className="text-red-700 hover:text-red-900">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {message && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
          </div>
          <button onClick={onDismissMessage} className="text-green-700 hover:text-green-900">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ApiStateHandler; 
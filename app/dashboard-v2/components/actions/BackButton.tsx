/**
 * @fileoverview Componente de botón para volver a la vista anterior
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BackButtonProps {
  /**
   * Texto a mostrar junto al icono (opcional)
   */
  label?: string;
  
  /**
   * Función a ejecutar al hacer clic en el botón
   */
  onClick: () => void;
  
  /**
   * Clases adicionales para personalizar el estilo (opcional)
   */
  className?: string;
}

/**
 * Botón para volver a la vista anterior
 * 
 * Componente reutilizable que muestra un botón con un icono de flecha hacia la izquierda
 * para navegar a la vista anterior.
 */
const BackButton: React.FC<BackButtonProps> = ({
  label,
  onClick,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 ${className}`}
    >
      <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
      {label && <span className="ml-1 text-sm">{label}</span>}
    </button>
  );
};

export default BackButton; 
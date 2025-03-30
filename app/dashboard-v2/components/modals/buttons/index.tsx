/**
 * Botones para modales de confirmación
 */

import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

interface DeleteButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'category' | 'section' | 'product';
  size?: 'sm' | 'md' | 'lg';
}

export const DeleteCategoryButton: React.FC<DeleteButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'p-1 rounded-full',
    md: 'px-3 py-1.5 rounded-md',
    lg: 'px-4 py-2 rounded-md'
  };

  return (
    <button
      type="button"
      className={`${sizeClasses[size]} bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex items-center`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className={size !== 'sm' ? 'ml-1' : 'sr-only'}>Eliminando...</span>
        </>
      ) : (
        <>
          <TrashIcon className="h-4 w-4" />
          {size !== 'sm' && <span className="ml-1">Eliminar</span>}
        </>
      )}
    </button>
  );
};

export const DeleteSectionButton = DeleteCategoryButton;
export const DeleteProductButton = DeleteCategoryButton; 
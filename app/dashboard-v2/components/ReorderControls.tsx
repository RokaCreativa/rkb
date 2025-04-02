import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface ReorderControlsProps {
  itemId: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  onSave?: () => void;
  onCancel?: () => void;
  showSaveCancel?: boolean;
  isLoading?: boolean;
}

/**
 * Componente que muestra controles para reordenar elementos (mover arriba/abajo)
 * Opcionalmente muestra botones de guardar/cancelar
 */
const ReorderControls: React.FC<ReorderControlsProps> = ({
  itemId,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onSave,
  onCancel,
  showSaveCancel = false,
  isLoading = false
}) => {
  return (
    <div className="flex space-x-1 items-center">
      <button
        type="button"
        onClick={() => onMoveUp(itemId)}
        disabled={isFirst || isLoading}
        className={`p-1 rounded ${
          isFirst 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-blue-600 hover:bg-blue-100'
        }`}
        title="Mover arriba"
      >
        <ArrowUpIcon className="h-4 w-4" />
      </button>
      
      <button
        type="button"
        onClick={() => onMoveDown(itemId)}
        disabled={isLast || isLoading}
        className={`p-1 rounded ${
          isLast 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-blue-600 hover:bg-blue-100'
        }`}
        title="Mover abajo"
      >
        <ArrowDownIcon className="h-4 w-4" />
      </button>
      
      {showSaveCancel && (
        <>
          <button
            type="button"
            onClick={onSave}
            disabled={isLoading}
            className="p-1 rounded text-green-600 hover:bg-green-100"
            title="Guardar cambios"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            ) : (
              <CheckIcon className="h-4 w-4" />
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 rounded text-red-600 hover:bg-red-100"
            title="Cancelar"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default ReorderControls; 
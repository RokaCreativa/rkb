/**
 * Componente Pagination
 * 
 * Sistema de paginación para tablas y listas con soporte para
 * navegación, tamaño de página y diferentes estilos.
 */

import React from 'react';
import { cn } from '@/lib/utils/tailwind';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/20/solid';

/**
 * Propiedades para el componente Pagination
 */
export interface PaginationProps {
  /** Número total de elementos */
  totalItems: number;
  /** Número de elementos por página */
  itemsPerPage: number;
  /** Página actual (comenzando en 1) */
  currentPage: number;
  /** Función que se llama cuando se cambia de página */
  onPageChange: (page: number) => void;
  /** Función que se llama cuando se cambia el tamaño de página */
  onPageSizeChange?: (pageSize: number) => void;
  /** Opciones de tamaño de página disponibles */
  pageSizeOptions?: number[];
  /** Número máximo de páginas a mostrar en la navegación (por defecto: 5) */
  maxPageButtons?: number;
  /** Deshabilitar todos los botones (útil durante carga de datos) */
  disabled?: boolean;
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

/**
 * Componente de paginación reutilizable
 * 
 * Proporciona controles para navegar entre páginas y cambiar el tamaño de página.
 * Diseñado siguiendo el estilo y las directrices de Tailwind UI.
 * 
 * @example
 * // Uso básico:
 * <Pagination
 *   totalItems={100}
 *   itemsPerPage={10}
 *   currentPage={1}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * 
 * // Con selector de tamaño de página:
 * <Pagination
 *   totalItems={100}
 *   itemsPerPage={10}
 *   currentPage={1}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   onPageSizeChange={(size) => setItemsPerPage(size)}
 *   pageSizeOptions={[5, 10, 25, 50]}
 * />
 */
export default function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  maxPageButtons = 5,
  disabled = false,
  className = '',
}: PaginationProps) {
  // Calcular el número total de páginas
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Asegurar que currentPage esté en el rango válido
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  
  // Calcular el rango de elementos mostrados
  const startItem = totalItems === 0 ? 0 : (validCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(validCurrentPage * itemsPerPage, totalItems);
  
  // Determinar qué números de página mostrar
  const getPageNumbers = (): (number | string)[] => {
    const pageNumbers: (number | string)[] = [];
    
    // Si hay pocas páginas, mostrar todas
    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }
    
    // Siempre mostrar la primera página
    pageNumbers.push(1);
    
    // Calcular el rango de páginas a mostrar alrededor de la página actual
    const leftSide = Math.floor(maxPageButtons / 2);
    const rightSide = maxPageButtons - leftSide - 1;
    
    // Si la página actual está cerca del inicio
    if (validCurrentPage <= leftSide + 1) {
      for (let i = 2; i <= maxPageButtons - 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
      return pageNumbers;
    }
    
    // Si la página actual está cerca del final
    if (validCurrentPage >= totalPages - rightSide) {
      pageNumbers.push('...');
      for (let i = totalPages - maxPageButtons + 2; i < totalPages; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push(totalPages);
      return pageNumbers;
    }
    
    // Si la página actual está en medio
    pageNumbers.push('...');
    for (
      let i = validCurrentPage - Math.floor((maxPageButtons - 4) / 2);
      i <= validCurrentPage + Math.ceil((maxPageButtons - 4) / 2);
      i++
    ) {
      pageNumbers.push(i);
    }
    pageNumbers.push('...');
    pageNumbers.push(totalPages);
    
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 px-4 py-3 sm:px-6 ${className}`}>
      <div className="flex items-center text-sm text-gray-700">
        <p className="sm:flex sm:items-center">
          Mostrando 
          <span className="font-medium mx-1">
            {totalItems === 0 ? 0 : startItem}
          </span>
          a
          <span className="font-medium mx-1">
            {endItem}
          </span>
          de
          <span className="font-medium mx-1">
            {totalItems}
          </span>
          resultados
          
          {/* Selector de tamaño de página */}
          {onPageSizeChange && (
            <select
              className="ml-2 border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              value={itemsPerPage}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={disabled}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} por página
                </option>
              ))}
            </select>
          )}
        </p>
      </div>
      
      <div>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginación">
          {/* Botón Anterior */}
          <button
            onClick={() => onPageChange(validCurrentPage - 1)}
            disabled={validCurrentPage === 1 || disabled}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
              validCurrentPage === 1 || disabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <span className="sr-only">Anterior</span>
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          
          {/* Números de página */}
          {pageNumbers.map((pageNumber, index) => {
            return typeof pageNumber === 'string' ? (
              // Mostrar puntos suspensivos para páginas omitidas
              <span
                key={`ellipsis-${index}`}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
              >
                ...
              </span>
            ) : (
              // Botón de número de página
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                disabled={disabled}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  pageNumber === validCurrentPage
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                {pageNumber}
              </button>
            );
          })}
          
          {/* Botón Siguiente */}
          <button
            onClick={() => onPageChange(validCurrentPage + 1)}
            disabled={validCurrentPage === totalPages || disabled}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
              validCurrentPage === totalPages || disabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <span className="sr-only">Siguiente</span>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  );
} 
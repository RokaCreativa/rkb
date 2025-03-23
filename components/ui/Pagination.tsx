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
  /** Página actual (1-indexed) */
  currentPage: number;
  /** Total de páginas */
  totalPages: number;
  /** Función para cambiar de página */
  onPageChange: (page: number) => void;
  /** Si debe mostrar los controles de primera/última página */
  showFirstLast?: boolean;
  /** Número de páginas a mostrar alrededor de la página actual */
  siblingCount?: number;
  /** Si debe mostrar el total de páginas */
  showPageCount?: boolean;
  /** Si debe tener un tamaño pequeño */
  small?: boolean;
  /** Si debe tener un borde */
  withBorder?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Genera un rango de números
 */
function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Componente Pagination
 * 
 * @example
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={handlePageChange}
 *   showFirstLast
 * />
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = false,
  siblingCount = 1,
  showPageCount = true,
  small = false,
  withBorder = false,
  className,
}: PaginationProps) {
  // Asegurar que currentPage está dentro de los límites
  const page = Math.max(1, Math.min(currentPage, totalPages));
  
  // Generar los botones de página a mostrar
  const getPageNumbers = () => {
    const totalPageNumbers = siblingCount * 2 + 3; // Incluye current + siblings + primero/último
    
    // Si hay suficiente espacio para mostrar todas las páginas
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }
    
    // Calcular los índices de los hermanos izquierdo y derecho
    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages);
    
    // No mostrar puntos suspensivos cuando solo hay una página entre ellos
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
    
    // Caso especial: mostrar últimas páginas
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      return [...range(1, leftItemCount), -1, totalPages];
    }
    
    // Caso especial: mostrar primeras páginas
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      return [1, -1, ...range(totalPages - rightItemCount + 1, totalPages)];
    }
    
    // Caso estándar: mostrar puntos suspensivos en ambos lados
    if (shouldShowLeftDots && shouldShowRightDots) {
      return [
        1,
        -1,
        ...range(leftSiblingIndex, rightSiblingIndex),
        -2,
        totalPages,
      ];
    }
    
    return [];
  };
  
  const pageNumbers = getPageNumbers();
  
  // Clases para los botones
  const buttonClasses = cn(
    "relative inline-flex items-center justify-center",
    small ? "min-w-8 h-8 text-xs" : "min-w-10 h-10 text-sm",
    "font-medium focus:z-10 focus:outline-none",
    withBorder
      ? "border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
      : "text-gray-700 hover:bg-gray-100",
    "transition-colors"
  );
  
  // Clases para el botón activo
  const activeButtonClasses = cn(
    "z-10",
    withBorder 
      ? "border-indigo-500 bg-indigo-50 text-indigo-600"
      : "bg-indigo-50 text-indigo-600"
  );
  
  // Clases para los botones deshabilitados
  const disabledButtonClasses = cn(
    "cursor-not-allowed opacity-50",
    withBorder 
      ? "border-gray-200 bg-gray-50"
      : "bg-gray-50"
  );
  
  return (
    <nav
      className={cn(
        "flex items-center justify-between",
        small ? "py-2" : "py-3",
        className
      )}
      aria-label="Paginación"
    >
      {/* Información de página para móviles */}
      {showPageCount && (
        <div className="sm:hidden">
          <p className="text-sm text-gray-700">
            Página <span className="font-medium">{page}</span> de{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
      )}
      
      {/* Controles de paginación */}
      <div className={cn(
        "flex flex-1 items-center justify-center sm:justify-between",
        !showPageCount && "justify-center"
      )}>
        {/* Información de página para escritorio */}
        {showPageCount && (
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Mostrando página <span className="font-medium">{page}</span> de{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
        )}
        
        {/* Botones de paginación */}
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Paginación"
          >
            {/* Botón de primera página */}
            {showFirstLast && (
              <button
                onClick={() => onPageChange(1)}
                disabled={page === 1}
                className={cn(
                  buttonClasses,
                  "rounded-l-md",
                  page === 1 ? disabledButtonClasses : ""
                )}
                aria-label="Primera página"
              >
                <ChevronDoubleLeftIcon className="h-4 w-4" />
              </button>
            )}
            
            {/* Botón anterior */}
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className={cn(
                buttonClasses,
                !showFirstLast && "rounded-l-md",
                page === 1 ? disabledButtonClasses : ""
              )}
              aria-label="Página anterior"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            {/* Números de página */}
            {pageNumbers.map((pageNumber, index) => {
              // Si es un indicador de elipsis
              if (pageNumber < 0) {
                return (
                  <span
                    key={`ellipsis-${pageNumber}-${index}`}
                    className={cn(
                      "relative inline-flex items-center justify-center px-4",
                      small ? "min-w-8 h-8 text-xs" : "min-w-10 h-10 text-sm",
                      withBorder 
                        ? "border border-gray-300 bg-white text-gray-700"
                        : "text-gray-700"
                    )}
                  >
                    ...
                  </span>
                );
              }
              
              const isActive = pageNumber === page;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={cn(
                    buttonClasses,
                    isActive ? activeButtonClasses : ""
                  )}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Página ${pageNumber}`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            {/* Botón siguiente */}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className={cn(
                buttonClasses,
                !showFirstLast && "rounded-r-md",
                page === totalPages ? disabledButtonClasses : ""
              )}
              aria-label="Página siguiente"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            
            {/* Botón de última página */}
            {showFirstLast && (
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={page === totalPages}
                className={cn(
                  buttonClasses,
                  "rounded-r-md",
                  page === totalPages ? disabledButtonClasses : ""
                )}
                aria-label="Última página"
              >
                <ChevronDoubleRightIcon className="h-4 w-4" />
              </button>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
} 
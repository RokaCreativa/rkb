/**
 * Componente Table
 * 
 * Sistema de tabla reutilizable con soporte para ordenamiento,
 * paginación y estados vacíos o de carga.
 */

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils/tailwind';
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

// Tipos
export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  /** Identificador único de la columna */
  id: string;
  /** Título de la columna */
  header: ReactNode;
  /** Función para renderizar el contenido de la celda */
  cell: (item: T, index: number) => ReactNode;
  /** Si la columna es ordenable */
  sortable?: boolean;
  /** Ancho de la columna (CSS) */
  width?: string;
  /** Alineación del contenido */
  align?: 'left' | 'center' | 'right';
  /** Clase CSS personalizada para la columna */
  className?: string;
}

export interface TableProps<T> {
  /** Columnas de la tabla */
  columns: Column<T>[];
  /** Datos a mostrar */
  data: T[];
  /** Clave única para cada fila */
  keyExtractor: (item: T, index: number) => string | number;
  /** Campo actual por el que se ordena */
  sortField?: string;
  /** Dirección de ordenamiento */
  sortDirection?: SortDirection;
  /** Función a llamar cuando cambia el ordenamiento */
  onSort?: (field: string, direction: SortDirection) => void;
  /** Si la tabla está en estado de carga */
  isLoading?: boolean;
  /** Componente a mostrar durante la carga */
  loadingComponent?: ReactNode;
  /** Mensaje para estado vacío */
  emptyMessage?: ReactNode;
  /** Función para manejar el clic en una fila */
  onRowClick?: (item: T, index: number) => void;
  /** Acciones a mostrar por fila */
  rowActions?: (item: T, index: number) => ReactNode;
  /** Clases CSS adicionales */
  className?: string;
  /** Clases para el contenedor */
  containerClassName?: string;
  /** Clases para la cabecera */
  headerClassName?: string;
  /** Clases para las filas */
  rowClassName?: (item: T, index: number) => string;
  /** Componente de pie de tabla */
  footer?: ReactNode;
  /** Componente para mostrar información adicional */
  caption?: ReactNode;
  /** Cantidad de filas de esqueleto durante la carga */
  skeletonRows?: number;
}

/**
 * Componente TableSkeleton
 */
function TableSkeleton<T>({ columns, rows = 5 }: { columns: Column<T>[]; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
          {columns.map((column, colIndex) => (
            <td
              key={`skeleton-${rowIndex}-${column.id}`}
              className={cn(
                "whitespace-nowrap px-3 py-4 text-sm text-gray-500",
                column.align === "left" || !column.align ? "text-left" : "",
                column.align === "center" ? "text-center" : "",
                column.align === "right" ? "text-right" : "",
                column.className
              )}
              style={{ width: column.width }}
            >
              <div className="h-4 bg-gray-200 rounded w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/**
 * Componente Table
 */
export default function Table<T>({
  columns,
  data,
  keyExtractor,
  sortField,
  sortDirection,
  onSort,
  isLoading = false,
  loadingComponent,
  emptyMessage = "No hay datos disponibles",
  onRowClick,
  rowActions,
  className,
  containerClassName,
  headerClassName,
  rowClassName,
  footer,
  caption,
  skeletonRows = 5,
}: TableProps<T>) {
  // Manejar el clic en el encabezado para ordenar
  const handleHeaderClick = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;
    
    let direction: SortDirection = 'asc';
    if (sortField === column.id && sortDirection === 'asc') {
      direction = 'desc';
    } else if (sortField === column.id && sortDirection === 'desc') {
      direction = null;
    }
    
    onSort(column.id, direction);
  };
  
  // Renderizar icono de ordenamiento
  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    if (sortField !== column.id) {
      return <ChevronUpDownIcon className="ml-1 h-4 w-4 text-gray-400" />;
    }
    
    if (sortDirection === 'asc') {
      return <ChevronUpIcon className="ml-1 h-4 w-4 text-indigo-500" />;
    }
    
    if (sortDirection === 'desc') {
      return <ChevronDownIcon className="ml-1 h-4 w-4 text-indigo-500" />;
    }
    
    return <ChevronUpDownIcon className="ml-1 h-4 w-4 text-gray-400" />;
  };
  
  return (
    <div className={cn("overflow-hidden rounded-lg shadow", containerClassName)}>
      <div className={cn("overflow-x-auto", className)}>
        <table className="min-w-full divide-y divide-gray-300">
          {caption && <caption className="px-3 py-2 text-sm text-gray-500">{caption}</caption>}
          
          <thead className={cn("bg-gray-50", headerClassName)}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "px-3 py-3.5 text-sm font-medium text-gray-900",
                    column.sortable && "cursor-pointer hover:bg-gray-100",
                    column.align === "left" || !column.align ? "text-left" : "",
                    column.align === "center" ? "text-center" : "",
                    column.align === "right" ? "text-right" : "",
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleHeaderClick(column)}
                >
                  <div className="flex items-center group">
                    <span>{column.header}</span>
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
              {rowActions && (
                <th scope="col" className="relative px-3 py-3.5">
                  <span className="sr-only">Acciones</span>
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              loadingComponent || <TableSkeleton columns={columns} rows={skeletonRows} />
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="px-3 py-4 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-gray-50",
                    typeof rowClassName === "function" ? rowClassName(item, index) : ""
                  )}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {columns.map((column) => (
                    <td
                      key={`${keyExtractor(item, index)}-${column.id}`}
                      className={cn(
                        "whitespace-nowrap px-3 py-4 text-sm text-gray-500",
                        column.align === "left" || !column.align ? "text-left" : "",
                        column.align === "center" ? "text-center" : "",
                        column.align === "right" ? "text-right" : "",
                        column.className
                      )}
                    >
                      {column.cell(item, index)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                      {rowActions(item, index)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          
          {footer && (
            <tfoot className="bg-gray-50">
              {footer}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
} 
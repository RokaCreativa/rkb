"use client";

/**
 * @fileoverview Hook para manejar operaciones de arrastrar y soltar
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 * 
 * Este hook proporciona utilidades para implementar drag and drop
 * en listas de elementos, especialmente útil para reordenar items.
 */

import { useCallback } from 'react';

/**
 * Hook para facilitar operaciones de arrastrar y soltar
 * 
 * @param onReorder - Función que se ejecuta cuando se reordena un elemento
 * @returns Objeto con manejadores de eventos para drag and drop
 */
export default function useDragAndDrop<T>(
  onReorder: (sourceIndex: number, destinationIndex: number) => void
) {
  /**
   * Genera manejadores de eventos para drag and drop para un ítem específico
   * 
   * @param index - Índice del elemento en la lista
   * @returns Objeto con manejadores de eventos drag and drop
   */
  const getDragHandlers = useCallback((index: number) => {
    return {
      draggable: true,
      onDragStart: (e: React.DragEvent<HTMLElement>) => {
        e.dataTransfer.setData('text/plain', index.toString());
        e.currentTarget.classList.add('bg-gray-100');
      },
      onDragEnd: (e: React.DragEvent<HTMLElement>) => {
        e.currentTarget.classList.remove('bg-gray-100');
      },
      onDragOver: (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-blue-50');
      },
      onDragLeave: (e: React.DragEvent<HTMLElement>) => {
        e.currentTarget.classList.remove('bg-blue-50');
      },
      onDrop: (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-blue-50');
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(sourceIndex) && sourceIndex !== index) {
          onReorder(sourceIndex, index);
        }
      }
    };
  }, [onReorder]);

  return {
    getDragHandlers
  };
} 
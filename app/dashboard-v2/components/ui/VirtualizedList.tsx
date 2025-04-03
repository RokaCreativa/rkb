"use client";

/**
 * @fileoverview Componente para renderizar listas virtualizadas
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import React, { CSSProperties, forwardRef, memo } from 'react';
import { useVirtualizedList } from '../../hooks/useVirtualizedList';

interface VirtualizedListProps<T> {
  items: T[];
  height: number | string;
  itemHeight: number;
  renderItem: (item: T, index: number, style: CSSProperties) => React.ReactNode;
  overscan?: number;
  className?: string;
  itemClassName?: string;
}

/**
 * Componente para renderizar listas virtualizadas, mejorando el rendimiento
 * al mostrar solo los elementos visibles en el viewport.
 * 
 * @param items Lista de elementos a renderizar
 * @param height Altura del contenedor de la lista
 * @param itemHeight Altura fija de cada elemento en píxeles
 * @param renderItem Función para renderizar cada elemento
 * @param overscan Número de elementos adicionales a renderizar fuera del viewport
 * @param className Clase CSS para el contenedor
 * @param itemClassName Clase CSS para cada elemento
 */
function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
  itemClassName = ''
}: VirtualizedListProps<T>) {
  const {
    virtualItems,
    totalHeight,
    containerRef
  } = useVirtualizedList({
    items,
    itemHeight,
    overscan
  });

  return (
    <div
      ref={containerRef}
      className={`overflow-auto relative ${className}`}
      style={{ height }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        {virtualItems.map(({ item, index }) => {
          const style: CSSProperties = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${itemHeight}px`,
            transform: `translateY(${index * itemHeight}px)`
          };
          
          return (
            <div 
              key={index} 
              className={itemClassName} 
              style={style}
            >
              {renderItem(item, index, style)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Aplicamos memoización para evitar re-renders innecesarios
export default memo(VirtualizedList) as typeof VirtualizedList; 
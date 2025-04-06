"use client";

/**
 * @fileoverview Hook para virtualización de listas largas
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { useState, useEffect, useRef, useCallback, RefObject } from 'react';

interface UseVirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  overscan?: number;
  windowHeight?: number;
}

interface UseVirtualizedListReturn<T> {
  virtualItems: {
    item: T;
    index: number;
  }[];
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  containerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Hook para virtualizar listas largas, mejorando el rendimiento
 * al renderizar solo los elementos visibles en el viewport.
 * 
 * @param items Lista completa de elementos
 * @param itemHeight Altura fija de cada elemento en píxeles
 * @param overscan Número de elementos adicionales a renderizar fuera del viewport
 * @param windowHeight Altura de la ventana de visualización (opcional)
 * @returns Objetos y propiedades necesarias para renderizar la lista virtualizada
 */
export function useVirtualizedList<T>({
  items,
  itemHeight,
  overscan = 3,
  windowHeight,
}: UseVirtualizedListProps<T>): UseVirtualizedListReturn<T> {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(windowHeight || 0);

  // Cálculo de los índices de inicio y fin
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + viewportHeight) / itemHeight) + overscan
  );

  // Crear la lista virtualizada
  const virtualItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    item,
    index: startIndex + index,
  }));

  // Altura total de todos los elementos (para el scrollbar)
  const totalHeight = items.length * itemHeight;

  // Manejar el evento de scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Configurar el listener de scroll y obtener la altura del viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Si no se proporcionó una altura de ventana, usar la altura del contenedor
    if (!windowHeight) {
      setViewportHeight(container.clientHeight);
    }

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, windowHeight]);

  // Actualizar la altura del viewport cuando cambie el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && !windowHeight) {
        setViewportHeight(containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [windowHeight]);

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    containerRef,
  };
} 
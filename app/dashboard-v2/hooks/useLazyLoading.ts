"use client";

/**
 * @fileoverview Hook para implementar carga diferida (lazy loading) de datos
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadingProps<T> {
  initialData?: T[];
  fetchFunction: (page: number, limit: number) => Promise<T[]>;
  limit?: number;
  dependencyArray?: any[];
}

interface UseLazyLoadingReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook para implementar carga diferida (lazy loading) de datos
 * 
 * Permite cargar datos en páginas a medida que el usuario las solicita,
 * mejorando el rendimiento y reduciendo la carga inicial.
 * 
 * @param initialData Datos iniciales (opcional)
 * @param fetchFunction Función para cargar datos paginados
 * @param limit Número de elementos por página
 * @param dependencyArray Array de dependencias para reiniciar la carga
 * @returns Objeto con datos, estado de carga, errores y funciones de control
 */
export function useLazyLoading<T>({
  initialData = [],
  fetchFunction,
  limit = 20,
  dependencyArray = [],
}: UseLazyLoadingProps<T>): UseLazyLoadingReturn<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  // Referencia para prevenir carreras de condiciones en cargas asíncronas
  const currentRequestRef = useRef<number>(0);
  
  // Función para cargar más datos
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Incrementamos el contador de solicitudes
      const requestId = currentRequestRef.current + 1;
      currentRequestRef.current = requestId;
      
      const nextPage = page + 1;
      const newData = await fetchFunction(nextPage, limit);
      
      // Verificar si esta respuesta es para la solicitud más reciente
      if (requestId !== currentRequestRef.current) return;
      
      if (newData.length < limit) {
        setHasMore(false);
      }
      
      setData(prevData => [...prevData, ...newData]);
      setPage(nextPage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error al cargar los datos');
      }
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, limit, fetchFunction]);
  
  // Función para reiniciar el estado
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    setHasMore(true);
    setPage(0);
    currentRequestRef.current += 1; // Invalidar solicitudes pendientes
  }, [initialData]);
  
  // Reiniciar el estado cuando cambien las dependencias
  useEffect(() => {
    reset();
  }, [...dependencyArray]);
  
  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  };
} 
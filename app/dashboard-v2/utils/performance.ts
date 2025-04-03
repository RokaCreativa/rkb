/**
 * @fileoverview Utilidades para optimizar el rendimiento de la aplicación
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

/**
 * Función para retrasar la ejecución de una función (debounce)
 * 
 * Útil para evitar múltiples llamadas a funciones costosas durante
 * eventos rápidos como scroll, resize o input.
 * 
 * @param func Función a ejecutar
 * @param wait Tiempo de espera en milisegundos
 * @returns Función con debounce aplicado
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Función para limitar la frecuencia de ejecución de una función (throttle)
 * 
 * Útil para operaciones que deben ejecutarse durante eventos continuos
 * como scroll o resize, pero con una frecuencia controlada.
 * 
 * @param func Función a ejecutar
 * @param limit Tiempo mínimo entre ejecuciones en milisegundos
 * @returns Función con throttle aplicado
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number = 0;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    const now = Date.now();
    
    if (now - lastRan >= limit) {
      func.apply(context, args);
      lastRan = now;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (now - lastRan));
    }
  };
}

/**
 * Función para medir el tiempo de ejecución de una función (profiling)
 * 
 * Útil para identificar cuellos de botella en el rendimiento.
 * Solo se utiliza en modo de desarrollo.
 * 
 * @param name Nombre identificativo de la función
 * @param func Función a medir
 * @returns Resultado de la función
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  name: string,
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  return function(...args: Parameters<T>): ReturnType<T> {
    if (process.env.NODE_ENV !== 'development') {
      return func(...args);
    }
    
    console.time(`⏱️ ${name}`);
    const result = func(...args);
    console.timeEnd(`⏱️ ${name}`);
    
    return result;
  };
}

/**
 * Clase para implementar una caché en memoria con tiempo de expiración
 * 
 * Útil para almacenar resultados de operaciones costosas que no cambian
 * frecuentemente, como llamadas a API o cálculos complejos.
 */
export class MemoryCache<T> {
  private cache: Map<string, { data: T; expiry: number }> = new Map();
  
  /**
   * Guarda un valor en la caché
   * 
   * @param key Clave para identificar el valor
   * @param data Datos a almacenar
   * @param ttl Tiempo de vida en milisegundos (por defecto 5 minutos)
   */
  set(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }
  
  /**
   * Obtiene un valor de la caché
   * 
   * @param key Clave del valor a obtener
   * @returns Datos almacenados o null si no existe o ha expirado
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    // No existe o ha expirado
    if (!item || Date.now() > item.expiry) {
      if (item) this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  /**
   * Elimina un valor de la caché
   * 
   * @param key Clave del valor a eliminar
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Limpia toda la caché
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Elimina todos los elementos expirados de la caché
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Exportamos una instancia de MemoryCache para usar en toda la aplicación
export const appCache = new MemoryCache(); 
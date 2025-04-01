import { useEffect } from 'react';
import eventBus, { Events } from './eventBus';

/**
 * Hook para suscribirse a eventos del EventBus
 * 
 * @param event Nombre del evento o array de eventos
 * @param callback Función a ejecutar cuando ocurra el evento
 */
export function useEventListener(event: string | string[], callback: (data?: any) => void) {
  useEffect(() => {
    const events = Array.isArray(event) ? event : [event];
    const unsubscribes = events.map(e => eventBus.subscribe(e, callback));
    
    // Limpiar suscripciones cuando el componente se desmonte
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [event, callback]);
}

export default useEventListener;
export { Events }; 
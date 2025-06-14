/**
 * Sistema de eventos simple para manejar comunicación entre componentes
 * y centralizar la actualización de datos sin recargar la página.
 */

type EventCallback = (data?: any) => void;
type EventMap = Record<string, EventCallback[]>;

class EventBus {
  private events: EventMap = {};

  /**
   * Suscribirse a un evento
   * @param event Nombre del evento
   * @param callback Función que se ejecutará cuando se emita el evento
   * @returns Función para cancelar la suscripción
   */
  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    
    // Devolver función para cancelar la suscripción
    return () => {
      this.events[event] = this.events[event].(cb => cb !== callback);
    };
  }

  /**
   * Emitir un evento
   * @param event Nombre del evento
   * @param data Datos a pasar a los callbacks
   */
  emit(event: string, data?: any): void {
    console.log(`[EventBus] Emitiendo evento: ${event}`, data);
    
    if (!this.events[event]) {
      return;
    }
    
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error en callback para evento ${event}:`, error);
      }
    });
  }

  /**
   * Limpiar todos los eventos o un evento específico
   * @param event Nombre del evento (opcional)
   */
  clear(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Eventos disponibles en la aplicación
export const Events = {
  // Categorías
  CATEGORY_CREATED: 'category:created',
  CATEGORY_UPDATED: 'category:updated',
  CATEGORY_DELETED: 'category:deleted',
  
  // Secciones
  SECTION_CREATED: 'section:created',
  SECTION_UPDATED: 'section:updated',
  SECTION_DELETED: 'section:deleted',
  
  // Productos
  PRODUCT_CREATED: 'product:created',
  PRODUCT_UPDATED: 'product:updated',
  PRODUCT_DELETED: 'product:deleted',
  
  // Global
  DATA_REFRESH_NEEDED: 'data:refresh-needed'
};

// Singleton para usar en toda la aplicación
export const eventBus = new EventBus();

export default eventBus; 
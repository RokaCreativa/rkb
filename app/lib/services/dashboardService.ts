/**
 * @fileoverview Servicios para el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @created 2024-06-16
 */

/**
 * Servicio para operaciones del dashboard
 */
export class DashboardService {
  /**
   * Reordena las secciones
   * 
   * @param sections Array de objetos con id y display_order
   * @returns Respuesta de la API
   */
  async reorderSections(sections: { id: number; display_order: number }[]) {
    try {
      const response = await fetch('/api/sections/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections }),
      });

      if (!response.ok) {
        throw new Error(`Error al reordenar secciones: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en reorderSections:', error);
      throw error;
    }
  }

  /**
   * Reordena las categorías
   * 
   * @param categories Array de objetos con id y display_order
   * @returns Respuesta de la API
   */
  async reorderCategories(categories: { id: number; display_order: number }[]) {
    try {
      const response = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories }),
      });

      if (!response.ok) {
        throw new Error(`Error al reordenar categorías: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en reorderCategories:', error);
      throw error;
    }
  }

  /**
   * Reordena los productos
   * 
   * @param products Array de objetos con id y display_order
   * @returns Respuesta de la API
   */
  async reorderProducts(products: { id: number; display_order: number }[]) {
    try {
      const response = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      });

      if (!response.ok) {
        throw new Error(`Error al reordenar productos: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en reorderProducts:', error);
      throw error;
    }
  }
} 
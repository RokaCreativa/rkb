/**
 * Servicio temporal para operaciones del dashboard
 * Esta es una implementación temporal para permitir que la aplicación funcione
 * mientras se migra a la nueva arquitectura.
 */

import { Section } from '@/app/types/menu';

/**
 * Servicio para operaciones del dashboard
 */
export const DashboardService = {
  /**
   * Reordena las secciones
   * @param sections Lista de secciones con el nuevo orden
   * @returns Objeto con resultado de la operación
   */
  reorderSections: async (sections: Section[]) => {
    try {
      const response = await fetch('/api/sections/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections }),
      });
      
      return { 
        success: response.ok,
        data: response.ok ? await response.json() : null
      };
    } catch (error) {
      console.error('Error al reordenar secciones:', error);
      return { 
        success: false, 
        error: 'Error al reordenar secciones' 
      };
    }
  }
}; 
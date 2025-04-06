/**
 * @fileoverview Servicio para operaciones del dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-15
 * 
 * Este servicio centraliza todas las operaciones de API relacionadas con el dashboard.
 * Proporciona métodos para interactuar con el backend, especialmente para operaciones
 * como reordenar elementos del menú (categorías, secciones, productos).
 * 
 * El servicio sigue un patrón de diseño de Servicio que abstrae la complejidad
 * de las llamadas HTTP, proporcionando una interfaz limpia y consistente
 * para los hooks y componentes.
 */

import { Category, Section, Product } from '@/app/dashboard-v2/types';

/**
 * Interfaz para la respuesta de la API
 * 
 * Define la estructura estándar para todas las respuestas de API
 * que devuelve el servicio.
 * 
 * @property success - Indica si la operación fue exitosa
 * @property data - Datos devueltos por la API en caso de éxito (opcional)
 * @property error - Mensaje de error en caso de fallo (opcional)
 */
type ApiResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

/**
 * Servicio para operaciones del dashboard
 * 
 * Proporciona métodos para interactuar con el backend, especialmente
 * para operaciones de reordenamiento de elementos del menú.
 * 
 * Todas las funciones siguen un patrón consistente:
 * 1. Realizan una llamada a la API correspondiente
 * 2. Manejan los errores de manera centralizada
 * 3. Devuelven un objeto ApiResponse con el resultado
 * 
 * @example
 * // Reordenar categorías
 * const result = await DashboardService.reorderCategories(updatedCategories);
 * if (result.success) {
 *   // Operación exitosa
 *   console.log('Categorías reordenadas:', result.data);
 * } else {
 *   // Error en la operación
 *   console.error('Error:', result.error);
 * }
 */
export const DashboardService = {
  /**
   * Reordena categorías en el servidor
   * 
   * Envía una lista de categorías con su nuevo orden al servidor,
   * para que se actualice en la base de datos.
   * 
   * @param categories - Lista de categorías ordenadas con sus display_order actualizados
   * @returns Promesa con la respuesta de la API (success, data o error)
   * 
   * @example
   * // Reordenar categorías después de una operación de arrastrar y soltar
   * const updatedCategories = categories.map((cat, index) => ({
   *   ...cat,
   *   display_order: index + 1
   * }));
   * const result = await DashboardService.reorderCategories(updatedCategories);
   */
  async reorderCategories(categories: Category[]): Promise<ApiResponse> {
    try {
      // Realizar petición POST al endpoint de reordenamiento de categorías
      const response = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories }),
      });
      
      // Verificar si la respuesta fue exitosa (código 2xx)
      if (!response.ok) {
        throw new Error(`Error al reordenar categorías: ${response.status}`);
      }
      
      // Procesar la respuesta como JSON
      const data = await response.json();
      
      // Devolver objeto de éxito con los datos recibidos
      return { success: true, data };
    } catch (error) {
      // Registrar el error para depuración
      console.error('Error in reorderCategories:', error);
      
      // Devolver objeto de error con mensaje
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al reordenar categorías' 
      };
    }
  },
  
  /**
   * Reordena secciones en el servidor
   * 
   * Envía una lista de secciones con su nuevo orden al servidor,
   * para que se actualice en la base de datos.
   * 
   * @param sections - Lista de secciones ordenadas con sus display_order actualizados
   * @returns Promesa con la respuesta de la API (success, data o error)
   * 
   * @example
   * // Reordenar secciones de una categoría específica
   * const sectionsToReorder = sections[categoryId];
   * const updatedSections = sectionsToReorder.map((section, index) => ({
   *   ...section,
   *   display_order: index + 1
   * }));
   * const result = await DashboardService.reorderSections(updatedSections);
   */
  async reorderSections(sections: Section[]): Promise<ApiResponse> {
    try {
      // Realizar petición POST al endpoint de reordenamiento de secciones
      const response = await fetch('/api/sections/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections }),
      });
      
      // Verificar si la respuesta fue exitosa (código 2xx)
      if (!response.ok) {
        throw new Error(`Error al reordenar secciones: ${response.status}`);
      }
      
      // Procesar la respuesta como JSON
      const data = await response.json();
      
      // Devolver objeto de éxito con los datos recibidos
      return { success: true, data };
    } catch (error) {
      // Registrar el error para depuración
      console.error('Error in reorderSections:', error);
      
      // Devolver objeto de error con mensaje
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al reordenar secciones' 
      };
    }
  },
  
  /**
   * Reordena productos en el servidor
   * 
   * Envía una lista de productos con su nuevo orden al servidor,
   * para que se actualice en la base de datos.
   * 
   * @param products - Lista de productos ordenados con sus display_order actualizados
   * @returns Promesa con la respuesta de la API (success, data o error)
   * 
   * @example
   * // Reordenar productos de una sección específica
   * const productsToReorder = products[sectionId];
   * const updatedProducts = productsToReorder.map((product, index) => ({
   *   ...product,
   *   display_order: index + 1
   * }));
   * const result = await DashboardService.reorderProducts(updatedProducts);
   */
  async reorderProducts(products: Product[]): Promise<ApiResponse> {
    try {
      // Realizar petición POST al endpoint de reordenamiento de productos
      const response = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      });
      
      // Verificar si la respuesta fue exitosa (código 2xx)
      if (!response.ok) {
        throw new Error(`Error al reordenar productos: ${response.status}`);
      }
      
      // Procesar la respuesta como JSON
      const data = await response.json();
      
      // Devolver objeto de éxito con los datos recibidos
      return { success: true, data };
    } catch (error) {
      // Registrar el error para depuración
      console.error('Error in reorderProducts:', error);
      
      // Devolver objeto de error con mensaje
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al reordenar productos' 
      };
    }
  }
}; 
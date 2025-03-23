/**
 * Servicio para gestionar categorías
 * 
 * Proporciona métodos para realizar operaciones CRUD
 * con las categorías del menú.
 */

import { ApiService } from './api';
import { Category } from '@/lib/types/entities';

/**
 * Servicio para gestionar categorías
 */
export const CategoryService = {
  /**
   * Obtiene todas las categorías del cliente
   * 
   * @param clientId - ID del cliente
   * @returns Promesa con la lista de categorías
   */
  async getAll(clientId: number): Promise<Category[]> {
    return ApiService.get<Category[]>('categories', { client_id: clientId });
  },
  
  /**
   * Obtiene una categoría por su ID
   * 
   * @param categoryId - ID de la categoría
   * @returns Promesa con los datos de la categoría
   */
  async getById(categoryId: number): Promise<Category> {
    return ApiService.get<Category>(`categories/${categoryId}`);
  },
  
  /**
   * Crea una nueva categoría
   * 
   * @param formData - Datos del formulario con la información de la categoría
   * @returns Promesa con la categoría creada
   */
  async create(formData: FormData): Promise<Category> {
    return ApiService.uploadForm<Category>('categories', formData);
  },
  
  /**
   * Actualiza una categoría existente
   * 
   * @param categoryId - ID de la categoría
   * @param formData - Datos del formulario con la información actualizada
   * @returns Promesa con la categoría actualizada
   */
  async update(categoryId: number, formData: FormData): Promise<Category> {
    // Añadir _method=PUT al formData para simular PUT con POST
    formData.append('_method', 'PUT');
    return ApiService.uploadForm<Category>(`categories/${categoryId}`, formData);
  },
  
  /**
   * Elimina una categoría
   * 
   * @param categoryId - ID de la categoría a eliminar
   */
  async delete(categoryId: number): Promise<void> {
    await ApiService.delete(`categories/${categoryId}`);
  },
  
  /**
   * Cambia la visibilidad de una categoría
   * 
   * @param categoryId - ID de la categoría
   * @param currentStatus - Estado actual (0: oculto, 1: visible)
   * @returns Promesa con la categoría actualizada
   */
  async toggleVisibility(categoryId: number, currentStatus: number): Promise<Category> {
    const newStatus = currentStatus === 1 ? 0 : 1;
    return ApiService.patch<Category>(`categories/${categoryId}/visibility`, { 
      status: newStatus 
    });
  },
  
  /**
   * Reordena las categorías
   * 
   * @param categories - Lista de categorías con nuevos órdenes
   * @returns Promesa con las categorías actualizadas
   */
  async reorder(categories: Pick<Category, 'category_id' | 'display_order'>[]): Promise<Category[]> {
    return ApiService.put<Category[]>('categories/reorder', { categories });
  }
}; 
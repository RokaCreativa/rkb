/**
 * Servicio para gestionar secciones
 * 
 * Proporciona métodos para realizar operaciones CRUD
 * con las secciones del menú.
 */

import { ApiService } from './api';
import { Section } from '@/lib/types/entities';

/**
 * Servicio para gestionar secciones
 */
export const SectionService = {
  /**
   * Obtiene todas las secciones de una categoría
   * 
   * @param categoryId - ID de la categoría
   * @returns Promesa con la lista de secciones
   */
  async getByCategoryId(categoryId: number): Promise<Section[]> {
    return ApiService.get<Section[]>('sections', { category_id: categoryId });
  },
  
  /**
   * Obtiene una sección por su ID
   * 
   * @param sectionId - ID de la sección
   * @returns Promesa con los datos de la sección
   */
  async getById(sectionId: number): Promise<Section> {
    return ApiService.get<Section>(`sections/${sectionId}`);
  },
  
  /**
   * Crea una nueva sección
   * 
   * @param formData - Datos del formulario con la información de la sección
   * @returns Promesa con la sección creada
   */
  async create(formData: FormData): Promise<Section> {
    return ApiService.uploadForm<Section>('sections', formData);
  },
  
  /**
   * Actualiza una sección existente
   * 
   * @param sectionId - ID de la sección
   * @param formData - Datos del formulario con la información actualizada
   * @returns Promesa con la sección actualizada
   */
  async update(sectionId: number, formData: FormData): Promise<Section> {
    // Añadir _method=PUT al formData para simular PUT con POST
    formData.append('_method', 'PUT');
    return ApiService.uploadForm<Section>(`sections/${sectionId}`, formData);
  },
  
  /**
   * Elimina una sección
   * 
   * @param sectionId - ID de la sección a eliminar
   */
  async delete(sectionId: number): Promise<void> {
    await ApiService.delete(`sections/${sectionId}`);
  },
  
  /**
   * Cambia la visibilidad de una sección
   * 
   * @param sectionId - ID de la sección
   * @param currentStatus - Estado actual (0: oculto, 1: visible)
   * @returns Promesa con la sección actualizada
   */
  async toggleVisibility(sectionId: number, currentStatus: number): Promise<Section> {
    const newStatus = currentStatus === 1 ? 0 : 1;
    return ApiService.patch<Section>(`sections/${sectionId}/visibility`, { 
      status: newStatus 
    });
  },
  
  /**
   * Reordena las secciones
   * 
   * @param sections - Lista de secciones con nuevos órdenes
   * @returns Promesa con las secciones actualizadas
   */
  async reorder(sections: Pick<Section, 'section_id' | 'display_order'>[]): Promise<Section[]> {
    return ApiService.put<Section[]>('sections/reorder', { sections });
  }
}; 
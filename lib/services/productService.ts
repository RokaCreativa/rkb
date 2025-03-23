/**
 * Servicio para gestionar productos
 * 
 * Proporciona métodos para realizar operaciones CRUD
 * con los productos del menú.
 */

import { ApiService } from './api';
import { Product } from '@/lib/types/entities';

/**
 * Servicio para gestionar productos
 */
export const ProductService = {
  /**
   * Obtiene todos los productos de una sección
   * 
   * @param sectionId - ID de la sección
   * @returns Promesa con la lista de productos
   */
  async getBySectionId(sectionId: number): Promise<Product[]> {
    return ApiService.get<Product[]>('products', { section_id: sectionId });
  },
  
  /**
   * Obtiene un producto por su ID
   * 
   * @param productId - ID del producto
   * @returns Promesa con los datos del producto
   */
  async getById(productId: number): Promise<Product> {
    return ApiService.get<Product>(`products/${productId}`);
  },
  
  /**
   * Crea un nuevo producto
   * 
   * @param formData - Datos del formulario con la información del producto
   * @returns Promesa con el producto creado
   */
  async create(formData: FormData): Promise<Product> {
    return ApiService.uploadForm<Product>('products', formData);
  },
  
  /**
   * Actualiza un producto existente
   * 
   * @param productId - ID del producto
   * @param formData - Datos del formulario con la información actualizada
   * @returns Promesa con el producto actualizado
   */
  async update(productId: number, formData: FormData): Promise<Product> {
    // Añadir _method=PUT al formData para simular PUT con POST
    formData.append('_method', 'PUT');
    return ApiService.uploadForm<Product>(`products/${productId}`, formData);
  },
  
  /**
   * Elimina un producto
   * 
   * @param productId - ID del producto a eliminar
   */
  async delete(productId: number): Promise<void> {
    await ApiService.delete(`products/${productId}`);
  },
  
  /**
   * Cambia la visibilidad de un producto
   * 
   * @param productId - ID del producto
   * @param currentStatus - Estado actual (0: oculto, 1: visible)
   * @returns Promesa con el producto actualizado
   */
  async toggleVisibility(productId: number, currentStatus: number): Promise<Product> {
    const newStatus = currentStatus === 1 ? 0 : 1;
    return ApiService.patch<Product>(`products/${productId}/visibility`, { 
      status: newStatus 
    });
  },
  
  /**
   * Reordena los productos
   * 
   * @param products - Lista de productos con nuevos órdenes
   * @returns Promesa con los productos actualizados
   */
  async reorder(products: Pick<Product, 'product_id' | 'display_order'>[]): Promise<Product[]> {
    return ApiService.put<Product[]>('products/reorder', { products });
  }
}; 
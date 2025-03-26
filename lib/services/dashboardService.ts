/**
 * @file dashboardService.ts
 * @description Servicio para manejar las operaciones de API del dashboard
 * @author TuNombre
 * @version 1.0.0
 * @lastUpdated 2024-03-27
 */

import { Category as BaseCategory, Section as BaseSection, Product as BaseProduct, Client } from '@/app/types/menu';

// Extender los tipos para incluir File en la propiedad image
interface Category extends Omit<BaseCategory, 'image'> {
  image?: File | string | null;
}

interface Section extends Omit<BaseSection, 'image'> {
  image?: File | string | null;
}

interface Product extends Omit<BaseProduct, 'image'> {
  image?: File | string | null;
}

/**
 * Interfaz para opciones de paginación
 */
interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Interfaz para respuesta paginada de categorías
 */
interface PaginatedCategoriesResponse {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Servicio para manejar las operaciones de API del dashboard
 */
export const DashboardService = {
  /**
   * Obtiene datos del cliente autenticado
   * 
   * @returns Promise con los datos del cliente
   */
  async fetchClientData(): Promise<{ client: Client }> {
    const response = await fetch('/api/client');
    if (!response.ok) throw new Error('Error al cargar datos del cliente');
    return await response.json();
  },

  /**
   * Obtiene las categorías del cliente autenticado
   * Soporta paginación opcional
   * 
   * @param options - Opciones de paginación (opcional)
   * @returns Promise con las categorías
   * 
   * @example
   * // Sin paginación (comportamiento original)
   * const result = await DashboardService.fetchCategories();
   * 
   * // Con paginación
   * const result = await DashboardService.fetchCategories({ page: 1, limit: 10 });
   */
  async fetchCategories(options?: PaginationOptions): Promise<{ categories: Category[] } | PaginatedCategoriesResponse> {
    // Construir URL con parámetros de paginación si se proporcionan
    let url = '/api/categories';
    
    if (options?.page || options?.limit) {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      url = `${url}?${params.toString()}`;
    }
    
    // Realizar la petición
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al cargar categorías');
    
    const data = await response.json();
    
    // Detectar si la respuesta es paginada o no
    if (data.data && data.meta) {
      // Respuesta paginada
      return data as PaginatedCategoriesResponse;
    } else {
      // Respuesta no paginada (formato original)
      return { categories: data } as { categories: Category[] };
    }
  },

  /**
   * Obtiene las secciones para una categoría específica
   * 
   * @param categoryId - ID de la categoría
   * @returns Promise con las secciones
   */
  async fetchSections(categoryId: number): Promise<{ sections: Section[] }> {
    const response = await fetch(`/api/sections?category_id=${categoryId}`);
    if (!response.ok) throw new Error('Error al cargar secciones');
    return await response.json();
  },

  /**
   * Obtiene los productos para una sección específica
   * 
   * @param sectionId - ID de la sección
   * @returns Promise con los productos
   */
  async fetchProducts(sectionId: number): Promise<{ products: Product[] }> {
    const response = await fetch(`/api/products?section_id=${sectionId}`);
    if (!response.ok) throw new Error('Error al cargar productos');
    return await response.json();
  },

  /**
   * Actualiza el orden de una categoría
   * 
   * @param categoryId - ID de la categoría
   * @param newDisplayOrder - Nuevo orden de visualización
   * @returns Promise con la categoría actualizada
   */
  async updateCategoryOrder(categoryId: number, newDisplayOrder: number): Promise<{ category: Category }> {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ display_order: newDisplayOrder }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el orden');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar el orden de la categoría:', error);
      throw error;
    }
  },

  /**
   * Actualiza la visibilidad de una categoría
   * 
   * @param categoryId - ID de la categoría
   * @param newStatus - Nuevo estado de visibilidad (0 o 1)
   * @returns Promise con la categoría actualizada
   */
  async updateCategoryVisibility(categoryId: number, newStatus: number): Promise<{ category: Category }> {
    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: categoryId,
          status: newStatus
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error en respuesta:', errorData);
        throw new Error('Error al actualizar la visibilidad');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar la visibilidad de la categoría:', error);
      throw error;
    }
  },

  /**
   * Elimina una categoría
   * 
   * @param categoryId - ID de la categoría a eliminar
   * @returns Promise con la respuesta de la API
   */
  async deleteCategory(categoryId: number): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la categoría');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al eliminar la categoría:', error);
      throw error;
    }
  },

  /**
   * Actualiza la visibilidad de una sección
   * 
   * @param sectionId - ID de la sección
   * @param newStatus - Nuevo estado de visibilidad (0 o 1)
   * @returns Promise con la sección actualizada
   */
  async updateSectionVisibility(sectionId: number, newStatus: number): Promise<{ section: Section }> {
    try {
      const response = await fetch('/api/sections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_id: sectionId,
          status: newStatus
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la visibilidad');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar la visibilidad de la sección:', error);
      throw error;
    }
  },

  /**
   * Actualiza la visibilidad de un producto
   * 
   * @param productId - ID del producto
   * @param newStatus - Nuevo estado de visibilidad (0 o 1)
   * @returns Promise con el producto actualizado
   */
  async updateProductVisibility(productId: number, newStatus: number): Promise<{ product: Product }> {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          status: newStatus
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la visibilidad');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar la visibilidad del producto:', error);
      throw error;
    }
  },

  /**
   * Actualiza el orden de las secciones
   * 
   * @param sections - Lista de secciones con su nuevo orden
   * @returns Promise con la respuesta de la API
   */
  async reorderSections(sections: Section[]): Promise<{ success: boolean }> {
    try {
      const data = sections.map((section, index) => ({
        id: section.section_id,
        order: index
      }));
      
      const response = await fetch('/api/sections/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections: data }),
      });
      
      if (!response.ok) {
        throw new Error('Error al reordenar secciones');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al reordenar secciones:', error);
      throw error;
    }
  },

  /**
   * Actualiza el orden de los productos
   * 
   * @param products - Lista de productos con su nuevo orden
   * @returns Promise con la respuesta de la API
   */
  async reorderProducts(products: Product[]): Promise<{ success: boolean }> {
    try {
      const data = products.map((product, index) => ({
        id: product.product_id,
        order: index
      }));
      
      const response = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: data }),
      });
      
      if (!response.ok) {
        throw new Error('Error al reordenar productos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al reordenar productos:', error);
      throw error;
    }
  },

  /**
   * Elimina un producto
   * 
   * @param productId - ID del producto a eliminar
   * @returns Promise con la respuesta de la API
   */
  async deleteProduct(productId: number): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      throw error;
    }
  },

  /**
   * Elimina una sección
   * 
   * @param sectionId - ID de la sección a eliminar
   * @returns Promise con la respuesta de la API
   */
  async deleteSection(sectionId: number): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la sección');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al eliminar la sección:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva categoría
   * 
   * @param category - Datos de la categoría a crear
   * @param clientId - ID del cliente (opcional)
   * @returns Promise con la respuesta de la API
   */
  async createCategory(category: Partial<Category>, clientId?: number): Promise<{ success: boolean }> {
    try {
      const formData = new FormData();
      
      // Agregar datos básicos
      formData.append('name', category.name || '');
      formData.append('status', String(category.status || 1));
      if (clientId) formData.append('client_id', String(clientId));
      
      // Agregar imagen si existe
      if (category.image instanceof File) {
        formData.append('image', category.image);
      }
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al crear la categoría');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al crear la categoría:', error);
      throw error;
    }
  },

  /**
   * Actualiza una categoría existente
   * 
   * @param categoryId - ID de la categoría a actualizar
   * @param data - Datos actualizados de la categoría
   * @returns Promise con la respuesta de la API
   */
  async updateCategory(categoryId: number, data: Partial<Category>): Promise<{ success: boolean }> {
    try {
      const formData = new FormData();
      
      // Agregar datos básicos
      formData.append('category_id', String(categoryId));
      if (data.name) formData.append('name', data.name);
      if (typeof data.status !== 'undefined') formData.append('status', String(data.status));
      
      // Agregar imagen si existe
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }
      
      const response = await fetch('/api/categories', {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la categoría');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar la categoría:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva sección
   * 
   * @param section - Datos de la sección a crear
   * @param categoryId - ID de la categoría padre
   * @returns Promise con la respuesta de la API
   */
  async createSection(section: Partial<Section>, categoryId: number): Promise<{ success: boolean }> {
    try {
      const formData = new FormData();
      
      // Agregar datos básicos
      formData.append('name', section.name || '');
      formData.append('status', String(section.status || 1));
      formData.append('category_id', String(categoryId));
      
      // Agregar imagen si existe
      if (section.image instanceof File) {
        formData.append('image', section.image);
      }
      
      const response = await fetch('/api/sections', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al crear la sección');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al crear la sección:', error);
      throw error;
    }
  },

  /**
   * Actualiza una sección existente
   * 
   * @param sectionId - ID de la sección a actualizar
   * @param data - Datos actualizados de la sección
   * @returns Promise con la respuesta de la API
   */
  async updateSection(sectionId: number, data: Partial<Section>): Promise<{ success: boolean }> {
    try {
      const formData = new FormData();
      
      // Agregar datos básicos
      formData.append('section_id', String(sectionId));
      if (data.name) formData.append('name', data.name);
      if (typeof data.status !== 'undefined') formData.append('status', String(data.status));
      
      // Agregar imagen si existe
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }
      
      const response = await fetch('/api/sections', {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la sección');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar la sección:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo producto
   * 
   * @param product - Datos del producto a crear
   * @param sectionId - ID de la sección padre
   * @returns Promise con la respuesta de la API
   */
  async createProduct(product: Partial<Product>, sectionId: number): Promise<{ success: boolean }> {
    try {
      const formData = new FormData();
      
      // Agregar datos básicos
      formData.append('name', product.name || '');
      formData.append('description', product.description || '');
      formData.append('price', String(product.price || 0));
      formData.append('status', String(product.status || 1));
      formData.append('section_id', String(sectionId));
      
      // Agregar imagen si existe
      if (product.image instanceof File) {
        formData.append('image', product.image);
      }
      
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el producto');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al crear el producto:', error);
      throw error;
    }
  },

  /**
   * Actualiza un producto existente
   * 
   * @param productId - ID del producto a actualizar
   * @param data - Datos actualizados del producto
   * @returns Promise con la respuesta de la API
   */
  async updateProduct(productId: number, data: Partial<Product>): Promise<{ success: boolean }> {
    try {
      const formData = new FormData();
      
      // Agregar datos básicos
      formData.append('product_id', String(productId));
      if (data.name) formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (typeof data.price !== 'undefined') formData.append('price', String(data.price));
      if (typeof data.status !== 'undefined') formData.append('status', String(data.status));
      
      // Agregar imagen si existe
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }
      
      const response = await fetch('/api/products', {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      throw error;
    }
  }
};

export default DashboardService; 
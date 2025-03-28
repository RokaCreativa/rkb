/**
 * Tipos y interfaces comunes para la aplicación
 * 
 * Centraliza las definiciones de tipos para mantener consistencia
 * a través de la aplicación.
 */

/**
 * Representa una categoría del menú
 */
export interface Category {
  category_id: number;
  name: string;
  image: string | null;
  status: number;
  display_order: number;
  client_id: number;
  sections_count?: number;
}

/**
 * Representa una sección dentro de una categoría
 */
export interface Section {
  section_id: number;
  name: string;
  image: string | null;
  status: number;
  display_order: number;
  category_id: number;
  client_id: number;
  products_count?: number;
  visible_products_count?: number;
  products?: Product[];
}

/**
 * Representa un producto dentro de una sección
 */
export interface Product {
  product_id: number;
  name: string;
  image: string | null;
  status: number;
  price: string | number;
  description?: string | null;
  display_order: number;
  section_id: number;
  client_id: number;
}

/**
 * Metadatos de paginación devueltos por la API
 */
export interface PaginationMeta {
  total: number;
  totalPages?: number;
  lastPage?: number;
  currentPage?: number;
  perPage?: number;
}

/**
 * Configuración de paginación para el estado de la aplicación
 */
export interface PaginationConfig {
  enabled: boolean;
  page: number;
  limit: number;
}

/**
 * Respuesta genérica paginada de la API
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
} 
/**
 * Tipos de entidades principales del sistema
 * 
 * Este archivo contiene las interfaces que representan
 * las entidades principales del sistema de menú digital.
 */

/**
 * Representa un cliente en el sistema
 */
export interface Client {
  client_id: number;
  name: string;
  active: number;
  api_token: string;
  created_at: string;
  updated_at: string;
}

/**
 * Representa una categoría en el menú
 */
export interface Category {
  category_id: number;
  client_id: number;
  name: string;
  display_order: number;
  photo: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

/**
 * Representa una sección dentro de una categoría
 */
export interface Section {
  section_id: number;
  category_id: number;
  name: string;
  display_order: number;
  photo: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

/**
 * Representa un producto dentro de una sección
 */
export interface Product {
  product_id: number;
  section_id: number;
  name: string;
  description: string | null;
  price: string;
  photo: string | null;
  display_order: number;
  status: number;
  created_at: string;
  updated_at: string;
}

/**
 * Representa un archivo adjunto (imagen)
 */
export interface Attachment {
  id: number;
  entity_type: 'category' | 'section' | 'product';
  entity_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
} 
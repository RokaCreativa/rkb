/**
 * Definición de tipos para las entidades principales del menú
 */

// Categoría
export interface Category {
  category_id: number;
  name: string;
  image: string | null;
  status: number;
  display_order: number;
  client_id: number;
  sections_count?: number;
  visible_sections_count?: number;
}

// Sección
export interface Section {
  section_id: number;
  name: string;
  image: string | null;
  category_id: number;
  client_id: number;
  display_order: number;
  status: number;
  created_at?: string;
  updated_at?: string;
  products_count?: number;
}

// Extensión de la interfaz para las operaciones que involucran archivos
export interface SectionWithFileUpload extends Omit<Section, 'image'> {
  image?: File | string | null;
}

// Producto
export interface Product {
  product_id: number;
  name: string;
  image: string | null;
  status: number;
  price: string;
  section_id: number;
  client_id: number;
  display_order: number;
  description?: string;
  sections?: any[]; // Para compatibilidad con algunos componentes
}

// Cliente
export interface Client {
  id: number;
  client_id?: number;
  name: string;
  main_logo: string | null;
  secondary_logo?: string | null;
  contact_email?: string;
  contact_phone?: string;
  business_type?: string;
  status: number;
} 
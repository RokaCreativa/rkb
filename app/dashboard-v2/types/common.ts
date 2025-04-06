/**
 * @fileoverview Tipos comunes para compatibilidad entre módulos
 * Este archivo contiene definiciones de tipos para facilitar la interoperabilidad
 * entre los diferentes módulos del sistema, especialmente entre app/types/menu.ts
 * y app/dashboard-v2/types/domain/*.ts
 */

// Tipo unificado para categorías que es compatible con todas las implementaciones
export interface UnifiedCategory {
  category_id: number;
  name: string;
  image: string | null | undefined;
  status: number;
  display_order: number;
  client_id: number;
  sections_count?: number;
  visible_sections_count?: number;
  description?: string;
}

// Tipo unificado para secciones
export interface UnifiedSection {
  section_id: number;
  name: string;
  image: string | null | undefined;
  category_id: number;
  client_id: number | undefined;
  display_order: number;
  status: number;
  created_at?: string;
  updated_at?: string;
  products_count?: number;
  visible_products_count?: number;
  description?: string;
}

// Tipo unificado para productos
export interface UnifiedProduct {
  product_id: number;
  name: string;
  image: string | null | undefined;
  status: number;
  price: string | number; // Puede ser string o number dependiendo del origen
  section_id: number;
  client_id: number | undefined;
  display_order: number;
  description?: string;
  discount_price?: string | null;
}

// Tipo unificado para clientes
export interface UnifiedClient {
  id: number;
  client_id?: number;
  name: string;
  business_name?: string;
  main_logo?: string | null;
  secondary_logo?: string | null;
  contact_email?: string;
  contact_phone?: string;
  business_type?: string;
  status: number;
  logo?: string | null;
}

// Funciones utilitarias para castear entre tipos para resolver incompatibilidades
export function asMenuCategory(category: any): import('@/app/types/menu').Category {
  return category as import('@/app/types/menu').Category;
}

export function asMenuSection(section: any): import('@/app/types/menu').Section {
  return section as import('@/app/types/menu').Section;
}

export function asMenuProduct(product: any): import('@/app/types/menu').Product {
  const result = { ...product };
  // Asegurar que price sea string
  if (typeof product.price === 'number') {
    result.price = String(product.price);
  }
  return result as import('@/app/types/menu').Product;
}

export function asDomainCategory(category: any): import('./domain/category').Category {
  return category as import('./domain/category').Category;
}

export function asDomainSection(section: any): import('./domain/section').Section {
  return section as import('./domain/section').Section;
}

export function asDomainProduct(product: any): import('./domain/product').Product {
  const result = { ...product };
  // Asegurar que price sea del tipo correcto si es necesario
  return result as import('./domain/product').Product;
}

// Funciones de conversión para mapas/records
export function asMenuSections(sections: Record<string, any[]>): Record<string, import('@/app/types/menu').Section[]> {
  const result: Record<string, import('@/app/types/menu').Section[]> = {};
  
  Object.entries(sections).forEach(([key, sectionArray]) => {
    result[key] = sectionArray.map(asMenuSection);
  });
  
  return result;
}

export function asMenuProducts(products: Record<string, any[]>): Record<string, import('@/app/types/menu').Product[]> {
  const result: Record<string, import('@/app/types/menu').Product[]> = {};
  
  Object.entries(products).forEach(([key, productArray]) => {
    result[key] = productArray.map(asMenuProduct);
  });
  
  return result;
} 
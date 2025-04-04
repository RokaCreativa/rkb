/**
 * @fileoverview Tipos legacy para compatibilidad con componentes antiguos
 * @author RokaMenu Team
 * @version 1.0.0
 * 
 * Este archivo contiene interfaces de tipo para mantener compatibilidad con componentes
 * que aún no han sido refactorizados completamente para usar los tipos oficiales.
 * Estos tipos son temporales y deberían ser eliminados una vez que la refactorización esté completa.
 */

import { Category as OfficialCategory, Section as OfficialSection, Product as OfficialProduct } from './index';

/**
 * Tipo de Category que usa status como string ('active'|'inactive') en lugar de number
 */
export interface LegacyCategory extends Omit<OfficialCategory, 'status'> {
  status: 'active' | 'inactive';
}

/**
 * Tipo de Section que usa status como string ('active'|'inactive') en lugar de number
 * y tiene campos adicionales como order e image_url
 */
export interface LegacySection extends Omit<OfficialSection, 'status' | 'image'> {
  status: 'active' | 'inactive';
  image_url?: string;
  order?: number;
}

/**
 * Tipo de Product que usa status como string ('active'|'inactive') en lugar de number
 * y tiene campos adicionales como image_url
 */
export interface LegacyProduct extends Omit<OfficialProduct, 'status' | 'image'> {
  status: 'active' | 'inactive';
  image_url?: string;
}

/**
 * Convierte una Category oficial a formato legacy
 */
export function toLegacyCategory(category: OfficialCategory): LegacyCategory {
  return {
    ...category,
    status: category.status === 1 ? 'active' : 'inactive'
  };
}

/**
 * Convierte una Section oficial a formato legacy
 */
export function toLegacySection(section: OfficialSection): LegacySection {
  return {
    ...section,
    status: section.status === 1 ? 'active' : 'inactive',
    image_url: section.image || '',
    order: section.display_order
  };
}

/**
 * Convierte un Product oficial a formato legacy
 */
export function toLegacyProduct(product: OfficialProduct): LegacyProduct {
  return {
    ...product,
    status: product.status === 1 ? 'active' : 'inactive',
    image_url: product.image || ''
  };
}

/**
 * Convierte una Category legacy a formato oficial
 */
export function toOfficialCategory(category: LegacyCategory): OfficialCategory {
  const { status, ...rest } = category;
  return {
    ...rest,
    status: status === 'active' ? 1 : 0
  };
}

/**
 * Convierte una Section legacy a formato oficial
 */
export function toOfficialSection(section: LegacySection): OfficialSection {
  // Extraer propiedades que no están en el tipo oficial
  const { status, order, image_url, ...rest } = section;
  
  return {
    ...rest,
    status: status === 'active' ? 1 : 0,
    image: image_url || null,
    display_order: order || rest.display_order
  };
}

/**
 * Convierte un Product legacy a formato oficial
 */
export function toOfficialProduct(product: LegacyProduct): OfficialProduct {
  // Extraer propiedades que no están en el tipo oficial
  const { status, image_url, ...rest } = product;
  
  return {
    ...rest,
    status: status === 'active' ? 1 : 0,
    image: image_url || null
  };
} 
/**
 * @fileoverview Adaptadores de tipos para compatibilidad entre definiciones inline y tipos globales
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { Category as MenuCategory, Section as MenuSection, Product as MenuProduct, Client as MenuClient } from '@/app/types/menu';

// Re-exportar los tipos de menu.ts para uso en el dashboard-v2
export type { MenuCategory, MenuSection, MenuProduct, MenuClient };

// Tipos del hook useDashboardState (inline)
export interface DashboardCategory {
  category_id: number;
  client_id: number;
  name: string;
  description?: string;
  display_order: number;
  status: number;
  sections_count?: number;
  visible_sections_count?: number;
  image: string;
}

export interface DashboardSection {
  section_id: number;
  category_id: number;
  name: string;
  description?: string;
  display_order: number;
  status: number;
  products_count?: number;
  visible_products_count?: number;
  image: string;
  client_id: number;
}

export interface DashboardProduct {
  product_id: number;
  section_id: number;
  name: string;
  description: string;
  price: number;
  display_order: number;
  status: number;
  image: string;
  client_id: number;
}

export interface DashboardClient {
  id: number;
  client_id: number;
  name: string;
  business_name: string;
  main_logo: string | null;
  status: number;
}

// Funciones adaptadoras para convertir entre tipos
export function adaptCategory(dashboardCategory: DashboardCategory): MenuCategory {
  return {
    ...dashboardCategory,
    image: dashboardCategory.image !== undefined ? dashboardCategory.image : null,
    id: dashboardCategory.category_id,
    client_id: dashboardCategory.client_id,
    status: dashboardCategory.status
  } as MenuCategory;
}

export function adaptSection(dashboardSection: DashboardSection): MenuSection {
  return {
    ...dashboardSection,
    id: dashboardSection.section_id,
    image: dashboardSection.image !== undefined ? dashboardSection.image : null,
    client_id: dashboardSection.client_id,
    status: dashboardSection.status
  } as MenuSection;
}

export function adaptProduct(dashboardProduct: DashboardProduct): MenuProduct {
  return {
    ...dashboardProduct,
    id: dashboardProduct.product_id,
    client_id: dashboardProduct.client_id,
    status: dashboardProduct.status,
    price: dashboardProduct.price.toString(),
    image: dashboardProduct.image !== undefined ? dashboardProduct.image : null
  } as MenuProduct;
}

export function adaptClient(dashboardClient: DashboardClient): MenuClient {
  return {
    ...dashboardClient,
    id: dashboardClient.id || dashboardClient.client_id,
    main_logo: dashboardClient.main_logo,
    status: dashboardClient.status
  } as MenuClient;
}

// Funciones para adaptar colecciones
export function adaptCategories(categories: DashboardCategory[]): MenuCategory[] {
  return categories.map(adaptCategory);
}

export function adaptSections(sections: Record<string, DashboardSection[]>): Record<number, MenuSection[]> {
  const result: Record<number, MenuSection[]> = {};
  
  Object.entries(sections).forEach(([key, sectionArray]) => {
    const numericKey = parseInt(key);
    result[numericKey] = sectionArray.map(adaptSection);
  });
  
  return result;
}

export function adaptProducts(products: Record<string, DashboardProduct[]>): Record<number, MenuProduct[]> {
  const result: Record<number, MenuProduct[]> = {};
  
  Object.entries(products).forEach(([key, productArray]) => {
    const numericKey = parseInt(key);
    result[numericKey] = productArray.map(adaptProduct);
  });
  
  return result;
}

// Funciones para la conversión inversa (de menu.ts a tipos inline)
export function fromMenuCategory(menuCategory: MenuCategory | Partial<MenuCategory>): DashboardCategory {
  return {
    category_id: (menuCategory as any).category_id || (menuCategory as any).id || 0,
    client_id: menuCategory.client_id || 0,
    name: menuCategory.name || '',
    display_order: menuCategory.display_order || 0,
    status: menuCategory.status || 0,
    image: menuCategory.image || '',
    sections_count: (menuCategory as any).sections_count || 0,
    visible_sections_count: (menuCategory as any).visible_sections_count || 0,
    description: (menuCategory as any).description || ''
  };
}

export function fromMenuSection(menuSection: MenuSection | Partial<MenuSection>): DashboardSection {
  return {
    section_id: (menuSection as any).section_id || (menuSection as any).id || 0,
    category_id: menuSection.category_id || 0,
    client_id: menuSection.client_id || 0,
    name: menuSection.name || '',
    display_order: menuSection.display_order || 0,
    status: menuSection.status || 0,
    image: menuSection.image || '',
    products_count: (menuSection as any).products_count || 0,
    visible_products_count: (menuSection as any).visible_products_count || 0,
    description: (menuSection as any).description || ''
  };
}

export function fromMenuProduct(menuProduct: MenuProduct | Partial<MenuProduct>): DashboardProduct {
  return {
    product_id: (menuProduct as any).product_id || (menuProduct as any).id || 0,
    section_id: menuProduct.section_id || 0,
    client_id: menuProduct.client_id || 0,
    name: menuProduct.name || '',
    display_order: menuProduct.display_order || 0,
    status: menuProduct.status || 0,
    price: typeof menuProduct.price === 'string' ? parseFloat(menuProduct.price || '0') : (menuProduct.price || 0),
    image: menuProduct.image || '',
    description: menuProduct.description || ''
  };
}

// Funciones para adaptar a los tipos de FloatingPhonePreview
export function toPreviewCategory(dashboardCategory: DashboardCategory): any {
  return {
    id: dashboardCategory.category_id,
    name: dashboardCategory.name,
    image: dashboardCategory.image
  };
}

export function toPreviewSection(dashboardSection: DashboardSection): any {
  return {
    id: dashboardSection.section_id,
    name: dashboardSection.name,
    image: dashboardSection.image
  };
}

export function toPreviewProduct(dashboardProduct: DashboardProduct): any {
  return {
    id: dashboardProduct.product_id,
    name: dashboardProduct.name,
    image: dashboardProduct.image,
    price: dashboardProduct.price.toString(),
    description: dashboardProduct.description
  };
}

export function toPreviewCategories(categories: DashboardCategory[]): any[] {
  return categories.map(toPreviewCategory);
}

export function toPreviewSections(sections: Record<string, DashboardSection[]>): Record<number, any[]> {
  const result: Record<number, any[]> = {};
  
  Object.entries(sections).forEach(([key, sectionArray]) => {
    const numericKey = parseInt(key);
    result[numericKey] = sectionArray.map(toPreviewSection);
  });
  
  return result;
}

export function toPreviewProducts(products: Record<string, DashboardProduct[]>): Record<number, any[]> {
  const result: Record<number, any[]> = {};
  
  Object.entries(products).forEach(([key, productArray]) => {
    const numericKey = parseInt(key);
    result[numericKey] = productArray.map(toPreviewProduct);
  });
  
  return result;
}

// Adaptadores para convertir tipos entre estados
export function convertCategoriesToDashboard(categories: MenuCategory[]): DashboardCategory[] {
  return categories.map(category => fromMenuCategory(category));
}

export function convertSectionsToDashboard(sections: Record<string, MenuSection[]>): Record<string, DashboardSection[]> {
  const result: Record<string, DashboardSection[]> = {};
  
  Object.entries(sections).forEach(([key, sectionArray]) => {
    result[key] = sectionArray.map(section => fromMenuSection(section));
  });
  
  return result;
}

export function convertProductsToDashboard(products: Record<string, MenuProduct[]>): Record<string, DashboardProduct[]> {
  const result: Record<string, DashboardProduct[]> = {};
  
  Object.entries(products).forEach(([key, productArray]) => {
    result[key] = productArray.map(product => fromMenuProduct(product));
  });
  
  return result;
} 
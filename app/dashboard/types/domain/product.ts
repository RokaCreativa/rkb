/**
 * @fileoverview Tipos específicos para la gestión de productos
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 * 
 * Este archivo contiene los tipos e interfaces relacionados con los productos.
 */

import { Category } from './category';
import { Section } from './section';

/**
 * Producto con tipos mejorados
 */
export interface Product {
  product_id: number;
  name: string;
  image: string | null;
  status: boolean;
  price: number;
  discount_price?: string | null;
  section_id: number | null;
  client_id: number;

  description: string | null;
  category_id: number | null;
  created_at: string;
  updated_at: string;
  is_showcased: boolean;
  multiple_prices?: MultiplePrice[];
  price1?: number | null;
  is_promotion?: boolean;
  sections?: {
    section_id: number;
    name: string;
  } | null;

  // 🎯 CAMPOS CONTEXTUALES: Orden específico por contexto donde aparece
  // PORQUÉ: Permite reordenamiento independiente en diferentes grids
  // COMPORTAMIENTO: 
  // - categories_display_order: Grid 1 (productos globales junto a categorías)
  // - sections_display_order: Grid 2 (productos locales junto a secciones)  
  // - products_display_order: Grid 3 (productos normales dentro de sección)
  categories_display_order?: number | null;
  sections_display_order?: number | null;
  products_display_order?: number | null;
}

/**
 * Estado para la gestión de productos
 */
export interface ProductState {
  products: { [key: string]: Product[] };
  isLoading: boolean;
  error: string | null;
  isUpdatingVisibility: number | null;
}

/**
 * Acciones para la gestión de productos
 */
export interface ProductActions {
  fetchProductsBySection: (sectionId: number) => Promise<Product[]>;
  createProduct: (data: FormData) => Promise<Product | null>;
  updateProduct: (formData: FormData, productId: number) => Promise<Product | null>;
  deleteProduct: (productId: number) => Promise<boolean>;
  toggleProductVisibility: (productId: number, status: boolean) => Promise<boolean>;
}

/**
 * Props para ProductView
 */
export interface ProductViewProps {
  selectedCategory: Category;
  selectedSection: Section;
  products: Product[];
  onBackToSections: () => void;
  onBackToCategories: () => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onToggleProductVisibility: (productId: number, status: boolean) => Promise<void>;
  isUpdatingVisibility: number | null;
  isReorderModeActive?: boolean;
  onReorderProduct?: (sourceIndex: number, destIndex: number) => void;
}

export interface ProductWithPriceLabels extends Product {
  // ... existing code ...
}

export interface MultiplePrice {
  id: number;
  product_id: number;
  price: number;
  label: string;
} 
/**
 * @fileoverview Tipos y interfaces centralizados para el dashboard v2
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 * 
 * Este archivo centraliza todos los tipos e interfaces utilizados en el dashboard v2,
 * asegurando consistencia en la nomenclatura y facilitando el mantenimiento.
 */

import { Client as BaseClient } from '@/app/types/menu';
import type { ViewType, InteractionMode, LoadingState, ExpansionState, SelectionState } from './dashboard';

// Re-exportamos tipos específicos que necesitamos 
export type { ViewType, InteractionMode, LoadingState, ExpansionState, SelectionState };

/**
 * Entidades principales
 */

// Cliente mejorado con tipado estricto
export interface Client extends BaseClient {
  id: number;
  name: string;
  main_logo: string | null;
  secondary_logo: string | null;
  contact_email: string;
  contact_phone: string;
  business_type: string;
  status: number;
}

// Categoría con tipos mejorados
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

// Sección con tipos mejorados
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
  visible_products_count?: number;
}

// Producto con tipos mejorados
export interface Product {
  product_id: number;
  name: string;
  image: string | null;
  status: number;
  price: string;
  discount_price?: string | null;
  section_id: number;
  client_id: number;
  display_order: number;
  description?: string;
}

/**
 * Estados del dashboard
 */

// Estado global del dashboard
export interface DashboardState {
  client: Client | null;
  categories: Category[];
  sections: { [key: string]: Section[] };
  products: { [key: string]: Product[] };
  selectedCategory: Category | null;
  selectedSection: Section | null;
  expandedCategories: { [key: number]: boolean };
  currentView: ViewType;
  isLoading: boolean;
  isSectionsLoading: boolean;
  isUpdatingVisibility: number | null;
  error: string | null;
  loadingSections: { [key: number]: boolean };
  isReorderModeActive: boolean;
}

// Estado para la gestión de categorías
export interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  isUpdatingVisibility: number | null;
}

// Estado para la gestión de secciones
export interface SectionState {
  sections: { [key: string]: Section[] };
  isLoading: boolean;
  error: string | null;
  isUpdatingVisibility: number | null;
}

// Estado para la gestión de productos
export interface ProductState {
  products: { [key: string]: Product[] };
  isLoading: boolean;
  error: string | null;
  isUpdatingVisibility: number | null;
}

/**
 * Acciones del dashboard
 */

// Acciones para la gestión de categorías
export interface CategoryActions {
  fetchCategories: () => Promise<Category[]>;
  createCategory: (data: Partial<Category>) => Promise<Category>;
  updateCategory: (categoryId: number, data: Partial<Category>) => Promise<Category>;
  deleteCategory: (categoryId: number) => Promise<void>;
  toggleCategoryVisibility: (categoryId: number, status: number) => Promise<void>;
}

// Acciones para la gestión de secciones
export interface SectionActions {
  fetchSectionsByCategory: (categoryId: number) => Promise<Section[]>;
  createSection: (data: Partial<Section>) => Promise<Section>;
  updateSection: (sectionId: number, data: Partial<Section>) => Promise<Section>;
  deleteSection: (sectionId: number) => Promise<void>;
  toggleSectionVisibility: (sectionId: number, status: number) => Promise<void>;
}

// Acciones para la gestión de productos
export interface ProductActions {
  fetchProductsBySection: (sectionId: number) => Promise<Product[]>;
  createProduct: (data: Partial<Product>) => Promise<Product>;
  updateProduct: (productId: number, data: Partial<Product>) => Promise<Product>;
  deleteProduct: (productId: number) => Promise<void>;
  toggleProductVisibility: (productId: number, status: number) => Promise<void>;
}

// Acciones globales del dashboard
export interface DashboardActions extends CategoryActions, SectionActions, ProductActions {
  setClient: (client: Client | null) => void;
  setCategories: (categories: Category[]) => void;
  setSections: (sections: { [key: string]: Section[] }) => void;
  setProducts: (products: { [key: string]: Product[] }) => void;
  setSelectedCategory: (category: Category | null) => void;
  setSelectedSection: (section: Section | null) => void;
  setExpandedCategories: (expandedCategories: { [key: number]: boolean }) => void;
  setCurrentView: (view: ViewType) => void;
  toggleCategoryExpansion: (categoryId: number) => void;
  handleCategoryClick: (category: Category) => Promise<void>;
  handleSectionClick: (section: Section) => void;
  toggleReorderMode: () => void;
  fetchClientData: () => Promise<Client | null>;
}

/**
 * Props para componentes
 */

// Props para CategoryView
export interface CategoryViewProps {
  categories: Category[];
  expandedCategories: { [key: number]: boolean };
  isUpdatingVisibility: number | null;
  onAddCategory: () => void;
  onCategoryClick: (category: Category) => void;
  onToggleCategoryVisibility: (categoryId: number, status: number) => Promise<void>;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: number) => void;
  sections: { [key: string]: Section[] };
  expandedSections: { [key: number]: boolean };
  onAddSection: (categoryId: number) => void;
  onSectionClick: (section: Section) => void;
  onToggleSectionVisibility: (sectionId: number, status: number) => Promise<void>;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: number) => void;
  onAddProduct: (sectionId: number) => void;
  onReorderCategory?: (sourceIndex: number, destIndex: number) => void;
  isReorderModeActive?: boolean;
}

// Props para SectionView
export interface SectionViewProps {
  selectedCategory: Category;
  sections: Section[];
  onBackToCategories: () => void;
  onAddSection: () => void;
  onSectionClick: (section: Section) => void;
  onToggleSectionVisibility: (sectionId: number, status: number) => Promise<void>;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: number) => void;
  isUpdatingVisibility: number | null;
  isReorderModeActive?: boolean;
  onReorderSection?: (sourceIndex: number, destIndex: number) => void;
}

// Props para ProductView
export interface ProductViewProps {
  selectedCategory: Category;
  selectedSection: Section;
  products: Product[];
  onBackToSections: () => void;
  onBackToCategories: () => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onToggleProductVisibility: (productId: number, status: number) => Promise<void>;
  isUpdatingVisibility: number | null;
  isReorderModeActive?: boolean;
  onReorderProduct?: (sourceIndex: number, destIndex: number) => void;
}

// Props para MobilePreview
export interface MobilePreviewProps {
  selectedCategory?: Category | null;
  selectedSection?: Section | null;
  products?: Product[];
}

// Props para Breadcrumbs
export interface BreadcrumbsProps {
  currentView: ViewType;
  selectedCategory: Category | null;
  selectedSection: Section | null;
  onBackToCategories: () => void;
  onBackToSections: () => void;
}

/**
 * Alias de exportación convenientes
 */ 
/**
 * @fileoverview Tipos para componentes modales del dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-14
 * 
 * Este archivo contiene tipos e interfaces para los modales de creación,
 * edición y eliminación de elementos del menú.
 */

import { Category } from '../domain/category';
import { Section } from '../domain/section';
import { Product } from '../domain/product';
import { Client } from '@/app/types/menu';

/**
 * Props básicas para todos los modales
 */
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Props para el modal de nueva categoría
 */
export interface NewCategoryModalProps extends BaseModalProps {
  client: Client | null;
  setCategories: (categories: Category[]) => void;
}

/**
 * Props para el modal de edición de categoría
 */
export interface EditCategoryModalProps extends BaseModalProps {
  categoryToEdit: Category;
  client: Client | null;
  setCategories: (categories: Category[]) => void;
}

/**
 * Props para el modal de eliminación de categoría
 */
export interface DeleteCategoryModalProps extends BaseModalProps {
  categoryId: number;
  categoryName: string;
  onConfirm: () => Promise<void>;
}

/**
 * Props para el modal de nueva sección
 */
export interface NewSectionModalProps extends BaseModalProps {
  categoryId: number;
  setSections: (sections: { [key: string]: Section[] }) => void;
}

/**
 * Props para el modal de edición de sección
 */
export interface EditSectionModalProps extends BaseModalProps {
  section: Section;
  updateSection: (formData: FormData, sectionId: number, categoryId: number) => Promise<boolean>;
}

/**
 * Props para el modal de eliminación de sección
 */
export interface DeleteSectionModalProps extends BaseModalProps {
  sectionId: number;
  sectionName: string;
  onConfirm: () => Promise<void>;
}

/**
 * Props para el modal de nuevo producto
 */
export interface NewProductModalProps extends BaseModalProps {
  sectionId: number;
  setProducts: (products: { [key: string]: Product[] }) => void;
}

/**
 * Props para el modal de edición de producto
 */
export interface EditProductModalProps extends BaseModalProps {
  product: Product;
  client: Client | null;
  selectedSection: Section | null;
  setProducts: (products: { [key: string]: Product[] }) => void;
}

/**
 * Props para el modal de eliminación de producto
 */
export interface DeleteProductModalProps extends BaseModalProps {
  productId: number;
  productName: string;
  onConfirm: () => Promise<void>;
} 
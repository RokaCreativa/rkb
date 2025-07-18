/**
 * @fileoverview Tipos específicos para la gestión de secciones
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 * 
 * Este archivo contiene los tipos e interfaces relacionados con las secciones.
 */

import { Category } from './category';

/**
 * Sección con tipos mejorados
 */
export interface Section {
  section_id: number;
  name: string | null;
  image: string | null;
  category_id: number;
  client_id: number;
  status: boolean;
  deleted?: boolean | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  is_virtual?: boolean | null;

  // 🧭 CAMPOS CONTEXTUALES PARA ORDENAMIENTO HÍBRIDO
  // PORQUÉ: El sistema híbrido requiere diferentes campos de orden según el contexto
  // COMPORTAMIENTO: sections_display_order se usa en Grid 2 (SectionGridView)
  sections_display_order?: number | null;
}

/**
 * Estado para la gestión de secciones
 */
export interface SectionState {
  sections: { [key: string]: Section[] };
  isLoading: boolean;
  error: string | null;
  isUpdatingVisibility: number | null;
}

/**
 * Acciones para la gestión de secciones
 */
export interface SectionActions {
  fetchSectionsByCategory: (categoryId: number) => Promise<Section[]>;
  createSection: (data: FormData) => Promise<Section | null>;
  updateSection: (formData: FormData, sectionId: number) => Promise<Section | null>;
  deleteSection: (sectionId: number, categoryId?: number) => Promise<boolean>;
  toggleSectionVisibility: (sectionId: number, status: boolean) => Promise<boolean>;
}

/**
 * Props para SectionView
 */
export interface SectionViewProps {
  selectedCategory: Category;
  sections: Section[];
  onBackToCategories: () => void;
  onAddSection: () => void;
  onSectionClick: (section: Section) => void;
  onToggleSectionVisibility: (sectionId: number, status: boolean) => Promise<void>;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: number) => void;
  isUpdatingVisibility: number | null;
  isReorderModeActive?: boolean;
  onReorderSection?: (sourceIndex: number, destIndex: number) => void;
} 
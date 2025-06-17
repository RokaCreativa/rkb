/**
 * @fileoverview Tipos e interfaces centralizados para el dashboard v2
 * @author RokaMenu Team
 * @version 1.2.0
 * @updated 2024-06-15
 * 
 * Este archivo centraliza todos los tipos e interfaces utilizados en el dashboard v2,
 * re-exportándolos desde sus ubicaciones específicas para mantener compatibilidad.
 * 
 * El sistema de tipos del dashboard sigue una arquitectura organizada por dominios:
 * 
 * 1. Tipos de dominio:
 *    - Categorías: Tipos específicos para categorías del menú
 *    - Secciones: Tipos específicos para secciones del menú
 *    - Productos: Tipos específicos para productos del menú
 * 
 * 2. Tipos de UI:
 *    - Tipos comunes: Utilizados en múltiples componentes
 *    - Tipos de modales: Específicos para los componentes de modal
 * 
 * 3. Adaptadores de tipos:
 *    - Conversión entre diferentes sistemas de tipos (backend/frontend)
 * 
 * El propósito de este archivo es proporcionar un punto único de importación
 * para todos los tipos, simplificando las importaciones en componentes y hooks.
 */

// =================================================================
// 📍 Charlas | types/index.ts
// -----------------------------------------------------------------
// Este archivo es el punto central para exportar todos los tipos
// de datos del dominio de la aplicaciÃ³n. No debe contener lÃ³gica,
// solo definiciones y exportaciones de tipos.
// =================================================================

export * from './domain/category';
export * from './domain/product';
export * from './domain/section';

// Interfaz para el estado de los modales en toda la aplicaciÃ³n.
export interface ModalState {
  editCategory: boolean;
  editSection: boolean;
  editProduct: boolean;
  deleteConfirmation: boolean;
}

// Opciones que se pueden pasar al abrir un modal para configurar su comportamiento.
export interface ModalOptions {
  item?: any;
  isDirect?: boolean;
  isPromotion?: boolean; // Mantenido por si se reutiliza en el futuro
  isGlobal?: boolean; // Para diferenciar productos directos globales de locales
  parentId?: number; // Para saber a quÃ© categorÃ­a o secciÃ³n pertenece un nuevo Ã­tem
}

// Re-exportar tipos de UI
/**
 * Re-exportamos tipos comunes de UI para componentes
 * 
 * Esto incluye:
 * - ViewType: Tipo para las diferentes vistas del dashboard
 * - LayoutProps: Props para componentes de layout
 * y otros tipos comunes de interfaz de usuario
 */
export * from './ui/common';

/**
 * Re-exportamos tipos específicos para modales
 * 
 * Esto incluye:
 * - BaseModalProps: Props básicas para todos los modales
 * - NewCategoryModalProps: Props específicas para modal de nueva categoría
 * - EditCategoryModalProps: Props específicas para modal de edición de categoría
 * y otros tipos relacionados con modales
 */
export * from './ui/modals';

// Re-exportar tipos de adaptadores
/**
 * Re-exportamos adaptadores de tipo para conversión entre diferentes sistemas
 * 
 * Los adaptadores proporcionan funciones para convertir entre:
 * - Tipos del backend y frontend
 * - Tipos antiguos y nuevos
 * - Diferentes representaciones de la misma entidad
 */
export * from './type-adapters';

// Cliente directamente importado para mantener compatibilidad
import { Client as BaseClient } from '@/app/types/menu';
import { CategoryActions } from './domain/category';
import { SectionActions } from './domain/section';
import { ProductActions } from './domain/product';
import { ViewType } from './ui/common';

/**
 * Interfaz extendida de Cliente
 * 
 * Extiende la interfaz base de Cliente para añadir propiedades
 * específicas requeridas por el dashboard v2.
 * 
 * @extends BaseClient - Interfaz base del cliente desde la app principal
 */
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

/**
 * Estado global del dashboard
 * 
 * Esta interfaz combina todos los estados específicos de dominio
 * (categorías, secciones, productos) en un único estado global.
 * Es utilizada principalmente por el hook useDashboardState que
 * actúa como fachada.
 * 
 * @property client - Información del cliente actual
 * @property categories - Lista de categorías disponibles
 * @property sections - Mapa de secciones organizadas por ID de categoría
 * @property products - Mapa de productos organizados por ID de sección
 * @property selectedCategory - Categoría seleccionada actualmente
 * @property selectedSection - Sección seleccionada actualmente
 * @property expandedCategories - Registro de qué categorías están expandidas
 * @property currentView - Vista actual del dashboard
 * @property isLoading - Indica si se está cargando información
 * @property isSectionsLoading - Indica si se están cargando secciones
 * @property isUpdatingVisibility - ID del elemento actualizando visibilidad
 * @property error - Mensaje de error si hay algún problema
 * @property loadingSections - Mapa de IDs de categoría que están cargando secciones
 * @property isReorderModeActive - Si el modo de reordenamiento está activo
 */
export interface DashboardState {
  client: Client | null;
  categories: import('./domain/category').Category[];
  sections: { [key: string]: import('./domain/section').Section[] };
  products: { [key: string]: import('./domain/product').Product[] };
  selectedCategory: import('./domain/category').Category | null;
  selectedSection: import('./domain/section').Section | null;
  expandedCategories: { [key: number]: boolean };
  currentView: ViewType;
  isLoading: boolean;
  isSectionsLoading: boolean;
  isUpdatingVisibility: number | null;
  error: string | null;
  loadingSections: { [key: number]: boolean };
  isReorderModeActive: boolean;
}

/**
 * Acciones globales del dashboard
 * 
 * Esta interfaz combina todas las acciones específicas de dominio
 * (categorías, secciones, productos) en un único conjunto de acciones.
 * Es utilizada principalmente por el hook useDashboardState que
 * actúa como fachada.
 * 
 * Extiende CategoryActions, SectionActions y ProductActions para
 * heredar todas las acciones específicas de cada dominio, y añade
 * acciones adicionales que son comunes o que coordinan entre dominios.
 * 
 * @extends CategoryActions - Acciones específicas para categorías
 * @extends SectionActions - Acciones específicas para secciones
 * @extends ProductActions - Acciones específicas para productos
 */
export interface DashboardActions extends CategoryActions, SectionActions, ProductActions {
  setClient: (client: Client | null) => void;
  setCategories: (categories: import('./domain/category').Category[]) => void;
  setSections: (sections: { [key: string]: import('./domain/section').Section[] }) => void;
  setProducts: (products: { [key: string]: import('./domain/product').Product[] }) => void;
  setSelectedCategory: (category: import('./domain/category').Category | null) => void;
  setSelectedSection: (section: import('./domain/section').Section | null) => void;
  setExpandedCategories: (expandedCategories: { [key: number]: boolean }) => void;
  setCurrentView: (view: ViewType) => void;
  toggleCategoryExpansion: (categoryId: number) => void;
  handleCategoryClick: (category: import('./domain/category').Category) => Promise<void>;
  handleSectionClick: (section: import('./domain/section').Section) => void;
  toggleReorderMode: () => void;
  fetchClientData: () => Promise<Client | null>;
}

/**
 * Props para componentes
 */

// Props para CategoryView
export interface CategoryViewProps {
  categories: import('./domain/category').Category[];
  expandedCategories: { [key: number]: boolean };
  isUpdatingVisibility: number | null;
  onAddCategory: () => void;
  onCategoryClick: (category: import('./domain/category').Category) => void;
  onToggleCategoryVisibility: (categoryId: number, status: number) => Promise<void>;
  onEditCategory: (category: import('./domain/category').Category) => void;
  onDeleteCategory: (categoryId: number) => void;
  sections: { [key: string]: import('./domain/section').Section[] };
  expandedSections: { [key: number]: boolean };
  onAddSection: (categoryId: number) => void;
  onSectionClick: (section: import('./domain/section').Section) => void;
  onToggleSectionVisibility: (sectionId: number, status: number) => Promise<void>;
  onEditSection: (section: import('./domain/section').Section) => void;
  onDeleteSection: (sectionId: number) => void;
  onAddProduct: (sectionId: number) => void;
  onReorderCategory?: (sourceIndex: number, destIndex: number) => void;
  isReorderModeActive?: boolean;
}

// Props para SectionView
export interface SectionViewProps {
  selectedCategory: import('./domain/category').Category;
  sections: import('./domain/section').Section[];
  onBackToCategories: () => void;
  onAddSection: () => void;
  onSectionClick: (section: import('./domain/section').Section) => void;
  onToggleSectionVisibility: (sectionId: number, status: number) => Promise<void>;
  onEditSection: (section: import('./domain/section').Section) => void;
  onDeleteSection: (sectionId: number) => void;
  isUpdatingVisibility: number | null;
  isReorderModeActive?: boolean;
  onReorderSection?: (sourceIndex: number, destIndex: number) => void;
}

// Props para ProductView
export interface ProductViewProps {
  selectedCategory: import('./domain/category').Category;
  selectedSection: import('./domain/section').Section;
  products: import('./domain/product').Product[];
  onBackToSections: () => void;
  onBackToCategories: () => void;
  onAddProduct: () => void;
  onEditProduct: (product: import('./domain/product').Product) => void;
  onDeleteProduct: (productId: number) => void;
  onToggleProductVisibility: (productId: number, status: number) => Promise<void>;
  isUpdatingVisibility: number | null;
  isReorderModeActive?: boolean;
  onReorderProduct?: (sourceIndex: number, destIndex: number) => void;
}

// Props para MobilePreview
export interface MobilePreviewProps {
  selectedCategory?: import('./domain/category').Category | null;
  selectedSection?: import('./domain/section').Section | null;
  products?: import('./domain/product').Product[];
}

// Props para Breadcrumbs
export interface BreadcrumbsProps {
  currentView: ViewType;
  selectedCategory: import('./domain/category').Category | null;
  selectedSection: import('./domain/section').Section | null;
  onBackToCategories: () => void;
  onBackToSections: () => void;
}

/**
 * Alias de exportación convenientes
 */

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  sectionId?: number;
  categoryId?: number;
  isDirect?: boolean;
  isPromotion?: boolean;
  isGlobal?: boolean;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, product, sectionId, categoryId, isDirect, isPromotion, isGlobal }) => {
  const store = useDashboardStore();

  const title = product ? (isDirect ? 'Editar Producto Directo' : 'Editar Producto') : (isDirect ? 'Nuevo Producto Directo' : 'Nuevo Producto');

  const handleSubmit = async (formData: FormData) => {
    if (product) {
      await store.updateProduct(formData);
    } else {
      await store.createProduct(formData);
    }
    onClose();
  };

  return (
    // ... existing code ...
  );
}; 
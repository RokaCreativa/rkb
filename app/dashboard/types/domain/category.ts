/**
 * @fileoverview Definiciones de tipos para el dominio de categorías
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-15
 * 
 * Este archivo contiene todas las interfaces y tipos relacionados con las categorías
 * del menú. Las categorías son el nivel más alto en la jerarquía del menú:
 * 
 * Cliente → Categorías → Secciones → Productos
 * 
 * Por ejemplo, en un restaurante:
 * - Categoría: "Platos Principales"
 * - Sección dentro de esa categoría: "Pastas"
 * - Producto dentro de esa sección: "Spaghetti Carbonara"
 */

/**
 * Cliente básico para compatibilidad
 */
interface Client {
  id: number;
  name: string;
  main_logo: string | null;
  contact_email: string;
  contact_phone: string;
  business_type: string;
  status: number;
}

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Tipos de Categoría
 * 
 * 📍 UBICACIÓN: app/dashboard-v2/types/domain/category.ts
 * 
 * 🎯 OBJETIVO: Definir los tipos TypeScript para las entidades de categoría.
 * 
 * 🔄 FLUJO DE DATOS:
 * 1. Estos tipos son utilizados por el store (dashboardStore.ts) para tipar el estado.
 * 2. Los componentes (CategoryGridView, CategoryTable) los utilizan para props e interfaces.
 * 3. Las APIs (/api/categories/*) los utilizan para validación y respuestas.
 * 
 * 🔗 CONEXIONES:
 * - `dashboardStore.ts` → líneas 25-30 (estado de categorías)
 * - `CategoryGridView.tsx` → líneas 15-20 (props de componente)
 * - `/api/categories/route.ts` → líneas 40-50 (validación Zod)
 * 
 * ⚠️ CONSIDERACIONES:
 * - `image` puede ser null (categorías sin imagen)
 * - `status` determina visibilidad (1 = visible, 0 = oculto)
 * - `client_id` es clave para multi-tenancy
 */

/**
 * Interfaz principal de Categoría
 * 
 * @property category_id - ID único de la categoría
 * @property name - Nombre de la categoría (ej: "Bebidas", "Comidas")
 * @property image - Ruta de la imagen de la categoría (puede ser null)
 * @property status - Estado de visibilidad (1 = visible, 0 = oculto)
 * @property categories_display_order - Posición de la categoría en el menú (para ordenamiento contextual)
 * @property client_id - ID del cliente al que pertenece la categoría
 * @property deleted - Indica si la categoría fue eliminada (soft delete)
 * @property created_at - Fecha de creación
 * @property updated_at - Fecha de última actualización
 */
export interface Category {
  category_id: number;
  name: string | null;
  image: string | null;
  status: boolean;
  client_id: number;
  deleted?: boolean | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  is_virtual_category?: boolean | null;

  // 🧭 CAMPOS CONTEXTUALES PARA ORDENAMIENTO HÍBRIDO
  // PORQUÉ: El sistema híbrido requiere diferentes campos de orden según el contexto
  // COMPORTAMIENTO: categories_display_order se usa en Grid 1 (CategoryGridView)
  categories_display_order?: number | null;
}

/**
 * Interfaz que representa el estado relacionado con las categorías
 * 
 * Esta interfaz se usa principalmente en hooks y componentes para
 * almacenar y gestionar el estado relacionado con las categorías.
 * 
 * @property categories - Lista de todas las categorías disponibles
 * @property isLoading - Indica si hay una operación de carga en curso
 * @property isUpdatingVisibility - ID de la categoría que está actualizando visibilidad, o null
 * @property error - Mensaje de error si ocurrió algún problema, o null
 * @property client - Información del cliente actual
 */
export interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  isUpdatingVisibility: number | null;
  error: string | null;
  client: Client | null;
}

/**
 * Interfaz que define todas las acciones posibles para gestionar categorías
 * 
 * Esta interfaz se usa principalmente en hooks para definir las funciones
 * que permiten manipular las categorías (crear, actualizar, eliminar, etc.)
 * 
 * @property fetchClientData - Carga datos del cliente
 * @property fetchCategories - Carga todas las categorías del cliente
 * @property createCategory - Crea una nueva categoría
 * @property updateCategory - Actualiza una categoría existente
 * @property deleteCategory - Elimina una categoría
 * @property toggleCategoryVisibility - Cambia el estado de visibilidad de una categoría
 */
export interface CategoryActions {
  fetchClientData: () => Promise<Client | null>;
  fetchCategories: () => Promise<Category[] | null>;
  createCategory: (formData: FormData) => Promise<Category | null>;
  updateCategory: (formData: FormData, categoryId: number) => Promise<Category | null>;
  deleteCategory: (categoryId: number) => Promise<boolean>;
  toggleCategoryVisibility: (categoryId: number, status: boolean) => Promise<boolean>;
}

/**
 * Tipo para representar los datos de una categoría en un formulario
 * 
 * Este tipo se usa principalmente para manejar los datos de un formulario
 * al crear o actualizar una categoría. Contiene sólo los campos que son
 * editables por el usuario.
 * 
 * @property name - Nombre de la categoría
 * @property description - Descripción opcional
 * @property image - Archivo de imagen para la categoría (opcional)
 * @property client_id - ID del cliente al que pertenece la categoría
 */
export type CategoryFormData = {
  name: string;
  description?: string;
  image?: File | null;
  client_id: number;
};

/**
 * Tipo para la respuesta de la API al listar categorías
 * 
 * Este tipo define la estructura de la respuesta JSON que viene
 * del servidor cuando se solicita la lista de categorías.
 * 
 * @property success - Indica si la operación fue exitosa
 * @property data - Array de categorías si la operación fue exitosa
 * @property error - Mensaje de error si la operación falló
 */
export type CategoryListResponse = {
  success: boolean;
  data?: Category[];
  error?: string;
};

/**
 * Tipo para la respuesta de la API al realizar operaciones CRUD en categorías
 * 
 * Este tipo define la estructura de la respuesta JSON que viene
 * del servidor cuando se crea, actualiza o elimina una categoría.
 * 
 * @property success - Indica si la operación fue exitosa
 * @property data - Datos de la categoría si la operación fue exitosa
 * @property error - Mensaje de error si la operación falló
 */
export type CategoryResponse = {
  success: boolean;
  data?: Category;
  error?: string;
};

/**
 * Props para CategoryView
 */
export interface CategoryViewProps {
  categories: Category[];
  expandedCategories: { [key: number]: boolean };
  isUpdatingVisibility: number | null;
  onAddCategory: () => void;
  onCategoryClick: (category: Category) => void;
  onToggleCategoryVisibility: (categoryId: number, status: boolean) => Promise<void>;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: number) => void;
  sections: { [key: string]: any[] };
  expandedSections: { [key: number]: boolean };
  onAddSection: (categoryId: number) => void;
  onSectionClick: (section: any) => void;
  onToggleSectionVisibility: (sectionId: number, status: number) => Promise<void>;
  onEditSection: (section: any) => void;
  onDeleteSection: (sectionId: number) => void;
  onAddProduct: (sectionId: number) => void;
  onReorderCategory?: (sourceIndex: number, destIndex: number) => void;
  isReorderModeActive?: boolean;
} 
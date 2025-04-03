"use client";

/**
 * @fileoverview Componente de vista para la visualización y gestión de categorías
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { PlusIcon } from "@heroicons/react/24/outline";
import CategoryTable from "../CategoryTable";
import { Category, Section } from "@/app/types/menu";

/**
 * Props para el componente CategoryView
 */
interface CategoryViewProps {
  categories: Category[];
  expandedCategories: { [key: number]: boolean };
  isUpdatingVisibility: number | null;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onCategoryClick: (category: Category) => void;
  onToggleCategoryExpansion: (categoryId: number) => void;
  isLoading?: boolean;
}

/**
 * Componente que gestiona la visualización y acciones relacionadas con categorías
 * 
 * Esta vista centraliza la interacción con las categorías del menú, incluyendo:
 * - Lista de categorías con sus propiedades
 * - Acciones para añadir, editar y eliminar categorías
 * - Navegación a la vista de secciones
 * - Delegación de eventos a los componentes padres a través de callbacks
 * 
 * @param {CategoryViewProps} props - Propiedades del componente
 * @returns {JSX.Element} La vista de categorías renderizada
 */
export default function CategoryView({
  categories,
  expandedCategories,
  isUpdatingVisibility,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onCategoryClick,
  onToggleCategoryExpansion,
  isLoading = false
}: CategoryViewProps) {
  const handleDeleteCategory = (categoryId: number) => {
    const category = categories.find(c => c.category_id === categoryId);
    if (category) {
      onDeleteCategory(category);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        
        <button
          onClick={onAddCategory}
          className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md shadow-sm"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Añadir categoría
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40 bg-white rounded-lg border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <CategoryTable 
          categories={categories}
          onEditCategory={onEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onCategoryClick={(categoryOrId) => {
            // Si es un número, encontrar la categoría primero
            if (typeof categoryOrId === 'number') {
              const category = categories.find(c => c.category_id === categoryOrId);
              if (category) {
                onCategoryClick(category);
              }
            } else {
              onCategoryClick(categoryOrId);
            }
          }}
          expandedCategories={expandedCategories}
          isUpdatingVisibility={isUpdatingVisibility}
          sections={{}} // Pasamos un objeto vacío porque la navegación ahora es diferente
          expandedSections={{}}
          onAddSection={() => {}} // No usado directamente en esta implementación
          onSectionClick={() => {}} // No usado directamente en esta implementación
          onToggleSectionVisibility={async () => {}} // No usado directamente en esta implementación
          onEditSection={() => {}} // No usado directamente en esta implementación
          onDeleteSection={() => {}} // No usado directamente en esta implementación
          onAddProduct={() => {}} // No usado directamente en esta implementación
          onToggleCategoryVisibility={() => {}} // No usado directamente en esta implementación
        />
      )}
    </>
  );
} 
"use client";

/**
 * @fileoverview Componente para la visualización y gestión de categorías en el dashboard de RokaMenu
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

import React from 'react';
import { useDashboard } from '../../context';
import { Category } from '@/app/types/menu';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useDragAndDrop } from '@/lib/hooks/ui';
import { CategoryTable } from '../tables';
import { CategoryActions } from '../actions';
import { toast } from 'react-hot-toast';

/**
 * Props para el componente CategoriesView
 */
interface CategoriesViewProps {
  /**
   * Lista de categorías a mostrar
   */
  categories: Category[];
  
  /**
   * Registro de categorías expandidas por ID
   */
  expandedCategories: Record<number, boolean>;
  
  /**
   * Función que se ejecuta al hacer clic en una categoría
   * @param categoryId ID de la categoría seleccionada
   */
  onCategoryClick: (categoryId: number) => void;
  
  /**
   * Función que se ejecuta para crear una nueva categoría
   */
  onNewCategory: () => void;
  
  /**
   * Función que se ejecuta para editar una categoría
   * @param category Categoría a editar
   */
  onEditCategory: (category: Category) => void;
  
  /**
   * Función que se ejecuta para eliminar una categoría
   * @param categoryId ID de la categoría a eliminar
   */
  onDeleteCategory: (categoryId: number) => void;
  
  /**
   * Función que se ejecuta para cambiar la visibilidad de una categoría
   * @param categoryId ID de la categoría
   */
  onToggleVisibility: (categoryId: number) => Promise<void>;
  
  /**
   * ID de la categoría que está actualizando su visibilidad
   */
  isUpdatingVisibility: number | null;
  
  /**
   * Función que se ejecuta para reordenar categorías
   * @param sourceIndex Índice de origen
   * @param destinationIndex Índice de destino
   */
  onReorderCategory: (sourceIndex: number, destinationIndex: number) => void;
}

/**
 * Componente que muestra la lista de categorías
 * Permite la navegación, expansión, creación, edición y eliminación de categorías
 * 
 * Este componente presenta todas las categorías disponibles en formato de lista,
 * con capacidades de expansión/contracción para mostrar detalles adicionales.
 * También proporciona controles para gestionar categorías: crear nuevas, editar
 * existentes, cambiar su visibilidad y eliminarlas.
 * 
 * Incluye funcionalidad de arrastrar y soltar (drag and drop) para reordenar
 * las categorías según las necesidades del usuario.
 * 
 * @example
 * // Uso básico:
 * <CategoriesView
 *   categories={[
 *     { category_id: 1, name: 'Comidas', status: 1, image: '/images/comidas.jpg' }
 *   ]}
 *   expandedCategories={{}}
 *   onCategoryClick={(id) => console.log(`Categoría ${id} seleccionada`)}
 *   onNewCategory={() => console.log('Nueva categoría')}
 *   onEditCategory={(cat) => console.log(`Editar categoría ${cat.name}`)}
 *   onDeleteCategory={(id) => console.log(`Eliminar categoría ${id}`)}
 *   onToggleVisibility={async (id) => console.log(`Cambiar visibilidad de ${id}`)}
 *   isUpdatingVisibility={null}
 *   onReorderCategory={(src, dst) => console.log(`Mover de ${src} a ${dst}`)}
 * />
 * 
 * @see {@link DashboardLayout} Contenedor principal donde se utiliza este componente
 * @see {@link SectionsView} Componente relacionado para gestionar secciones dentro de categorías
 */
const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  expandedCategories,
  onCategoryClick,
  onNewCategory,
  onEditCategory,
  onDeleteCategory
}) => {
  const {
    toggleCategoryExpanded,
    isLoading
  } = useDashboard();
  
  // Usar el hook de drag and drop para manejar el reordenamiento
  const { getDragHandlers } = useDragAndDrop<Category>({
    items: categories,
    idField: 'category_id',
    onReorder: async (reordered) => {
      try {
        // Actualizar visualmente el orden inmediatamente
        // (esto se maneja internamente en el hook)
        
        // Enviar los cambios al servidor
        const updatePromises = reordered.map((category, index) => 
          fetch(`/api/categories/${category.category_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              display_order: index + 1,
              name: category.name,
              client_id: category.client_id,
              image: category.image || null,
              status: category.status
            }),
          })
        );
        
        await Promise.all(updatePromises);
        toast.success('Orden de categorías actualizado');
      } catch (error) {
        console.error('Error al reordenar categorías:', error);
        toast.error('Error al actualizar el orden de las categorías');
      }
    }
  });
  
  // Función para actualizar la visibilidad de una categoría
  const toggleCategoryVisibility = async (categoryId: number, currentStatus: number) => {
    try {
      // Llamar a la API para actualizar el estado
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: categoryId,
          status: currentStatus === 1 ? 0 : 1
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la visibilidad');
      }
      
      toast.success('Estado actualizado correctamente');
      
      // La actualización del estado local se manejará en el contexto
      // a través de la recarga de categorías
    } catch (error) {
      console.error('Error al actualizar visibilidad:', error);
      toast.error('Error al actualizar el estado');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div className="w-full px-4">
      <CategoryActions onNewCategory={onNewCategory} />
      
      <CategoryTable
        categories={categories}
        expandedCategories={expandedCategories}
        onCategoryClick={toggleCategoryExpanded}
        onEditCategory={onEditCategory}
        onDeleteCategory={onDeleteCategory}
        onToggleVisibility={toggleCategoryVisibility}
        isUpdatingVisibility={null}
        onReorderCategory={getDragHandlers().onDragEnd}
      />
    </div>
  );
};

export default CategoriesView; 
 
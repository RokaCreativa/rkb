import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Category {
  category_id: number;
  name: string;
  display_order: number;
  [key: string]: any;
}

interface UseCategoryReorderProps {
  categories: Category[];
  onReorderSuccess?: (updatedCategories: Category[]) => void;
}

interface ReorderResult {
  success: boolean;
  message: string;
  categories?: Category[];
}

/**
 * Hook personalizado para manejar el reordenamiento de categorías
 * Proporciona funciones para cambiar el orden de las categorías y guardar los cambios
 */
export default function useCategoryReorder({ 
  categories: initialCategories,
  onReorderSuccess 
}: UseCategoryReorderProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isReordering, setIsReordering] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  /**
   * Mueve una categoría hacia arriba en el orden
   * @param categoryId - ID de la categoría a mover
   */
  const moveUp = (categoryId: number) => {
    setCategories(prevCategories => {
      const index = prevCategories.findIndex(cat => cat.category_id === categoryId);
      
      // No hacer nada si la categoría ya está en la primera posición
      if (index <= 0) return prevCategories;
      
      const newCategories = [...prevCategories];
      
      // Intercambiar con la categoría anterior
      const temp = newCategories[index];
      newCategories[index] = newCategories[index - 1];
      newCategories[index - 1] = temp;
      
      // Actualizar display_order en ambas categorías
      newCategories[index].display_order = index + 1;
      newCategories[index - 1].display_order = index;
      
      setIsChanged(true);
      return newCategories;
    });
  };

  /**
   * Mueve una categoría hacia abajo en el orden
   * @param categoryId - ID de la categoría a mover
   */
  const moveDown = (categoryId: number) => {
    setCategories(prevCategories => {
      const index = prevCategories.findIndex(cat => cat.category_id === categoryId);
      
      // No hacer nada si la categoría ya está en la última posición
      if (index === -1 || index >= prevCategories.length - 1) return prevCategories;
      
      const newCategories = [...prevCategories];
      
      // Intercambiar con la categoría siguiente
      const temp = newCategories[index];
      newCategories[index] = newCategories[index + 1];
      newCategories[index + 1] = temp;
      
      // Actualizar display_order en ambas categorías
      newCategories[index].display_order = index + 1;
      newCategories[index + 1].display_order = index + 2;
      
      setIsChanged(true);
      return newCategories;
    });
  };

  /**
   * Restablece el orden de las categorías al estado inicial
   */
  const resetOrder = () => {
    setCategories(initialCategories);
    setIsChanged(false);
  };

  /**
   * Guarda el nuevo orden de categorías en el servidor
   */
  const saveOrder = async (): Promise<ReorderResult> => {
    if (!isChanged) {
      return { success: true, message: 'No hay cambios que guardar' };
    }

    setIsReordering(true);
    
    try {
      // Preparar datos para enviar al servidor
      const reorderData = {
        categories: categories.map(cat => ({
          category_id: cat.category_id,
          display_order: cat.display_order
        }))
      };

      // Enviar solicitud al servidor
      const response = await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reorderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el orden');
      }

      // Procesar respuesta
      const result = await response.json();
      
      // Actualizar state con las categorías actualizadas
      if (result.categories) {
        setCategories(result.categories);
      }
      
      setIsChanged(false);
      
      // Notificar éxito
      toast.success('Orden de categorías actualizado correctamente');
      
      // Llamar al callback si existe
      if (onReorderSuccess && result.categories) {
        onReorderSuccess(result.categories);
      }
      
      return { 
        success: true, 
        message: 'Orden guardado correctamente',
        categories: result.categories
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el orden';
      toast.error(errorMessage);
      
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setIsReordering(false);
    }
  };

  return {
    categories,
    moveUp,
    moveDown,
    resetOrder,
    saveOrder,
    isReordering,
    isChanged
  };
} 
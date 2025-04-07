/**
 * @fileoverview Hook centralizado para operaciones de drag and drop
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-04-21
 */

import { useState, useCallback, SetStateAction, Dispatch } from 'react';
import { toast } from 'react-hot-toast';
import { DropResult } from '@hello-pangea/dnd';
import { DashboardCategory, DashboardSection, DashboardProduct } from '@/app/dashboard-v2/types/type-adapters';

/**
 * Interface para las operaciones de drag and drop
 */
interface DragAndDropOperations {
  isReorderModeActive: boolean;
  setIsReorderModeActive: (isActive: boolean) => void;
  handleGlobalDragEnd: (result: DropResult) => void;
  handleReorderCategories: (sourceIndex: number, destinationIndex: number) => Promise<boolean>;
  handleReorderSections: (categoryId: number, sourceIndex: number, destinationIndex: number) => Promise<boolean>;
  handleReorderProducts: (sectionId: number, sourceIndex: number, destinationIndex: number) => Promise<boolean>;
}

/**
 * Hook para manejar todas las operaciones de drag and drop de manera centralizada
 * 
 * @param categories - Las categorías disponibles
 * @param sections - Las secciones disponibles agrupadas por categoría
 * @param products - Los productos disponibles agrupados por sección
 * @param setLocalCategories - Función para actualizar las categorías locales
 * @param setLocalSections - Función para actualizar las secciones locales
 * @param setLocalProducts - Función para actualizar los productos locales
 * @returns Operaciones de drag and drop
 */
export default function useDragAndDrop(
  categories: DashboardCategory[],
  sections: Record<string, DashboardSection[]>,
  products: Record<string, DashboardProduct[]>,
  setLocalCategories: Dispatch<SetStateAction<DashboardCategory[]>>,
  setLocalSections: Dispatch<SetStateAction<Record<string, DashboardSection[]>>>,
  setLocalProducts: Dispatch<SetStateAction<Record<string, DashboardProduct[]>>>,
): DragAndDropOperations {
  // Estado para controlar el modo de reordenamiento
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);

  /**
   * Manejador para reordenar categorías
   */
  const handleReorderCategories = useCallback(async (sourceIndex: number, destinationIndex: number): Promise<boolean> => {
    console.log(`🔄 Reordenando categoría de índice ${sourceIndex} a ${destinationIndex}`);
    
    try {
      // Obtener solo las categorías visibles (status 1)
      const visibleCategories = categories.filter(cat => cat.status === 1);
      
      if (visibleCategories.length === 0) {
        console.error("No hay categorías visibles para reordenar");
        return false;
      }
      
      // Crear una copia del array para manipular
      const updatedCategories = [...visibleCategories];
      
      // Mover la categoría de la posición origen a la posición destino
      const [movedCategory] = updatedCategories.splice(sourceIndex, 1);
      updatedCategories.splice(destinationIndex, 0, movedCategory);
      
      // Actualizar el display_order de todas las categorías
      const categoriesWithUpdatedOrder = updatedCategories.map((category, index) => ({
        ...category,
        display_order: index + 1
      }));
      
      console.log("Categorías reordenadas:", categoriesWithUpdatedOrder.map(c => `${c.name} (${c.display_order})`));
      
      // Llamar a la API para guardar el nuevo orden
      const response = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          categories: categoriesWithUpdatedOrder.map(c => ({ 
            id: c.category_id, 
            order: c.display_order 
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al reordenar categorías');
      }
      
      // Actualizar el estado local combinando categorías visibles actualizadas con no visibles sin cambios
      const nonVisibleCategories = categories.filter(cat => cat.status !== 1);
      const allUpdatedCategories = [...categoriesWithUpdatedOrder, ...nonVisibleCategories];
      
      setLocalCategories(allUpdatedCategories);
      
      toast.success('Categorías reordenadas correctamente');
      return true;
    } catch (error) {
      console.error('Error al reordenar categorías:', error);
      toast.error('Error al reordenar categorías');
      return false;
    }
  }, [categories, setLocalCategories]);

  /**
   * Manejador para reordenar secciones dentro de una categoría
   */
  const handleReorderSections = useCallback(async (categoryId: number, sourceIndex: number, destinationIndex: number): Promise<boolean> => {
    console.log(`🔄 Reordenando sección de categoría ${categoryId} desde índice ${sourceIndex} a ${destinationIndex}`);
    
    try {
      // Obtener la categoría por ID
      const targetCategory = categories.find(cat => cat.category_id === categoryId);
      if (!targetCategory) {
        console.error(`No se encontró la categoría con ID ${categoryId}`);
        return false;
      }
      
      // Obtener solo las secciones visibles (status 1) de esa categoría
      const currentCategorySections = sections[categoryId] || [];
      const visibleSections = currentCategorySections.filter(sec => sec.status === 1);
      if (visibleSections.length === 0) {
        console.error(`No hay secciones visibles para reordenar en categoría ${categoryId}`);
        return false;
      }
      
      // Crear una copia del array de visibles para manipular
      const updatedVisibleSections = [...visibleSections];
      
      // Mover la sección de la posición origen a la posición destino
      const [movedSection] = updatedVisibleSections.splice(sourceIndex, 1);
      updatedVisibleSections.splice(destinationIndex, 0, movedSection);
      
      // Actualizar el display_order de todas las secciones visibles
      const visibleWithOrder = updatedVisibleSections.map((section, index) => ({
        ...section,
        display_order: index + 1
      }));
      
      console.log(`Secciones visibles reordenadas en categoría ${categoryId}:`, 
        visibleWithOrder.map(s => `${s.name} (${s.display_order})`));
      
      // Combinar con las no visibles para obtener el array final de la categoría
      const nonVisibleSections = currentCategorySections.filter(sec => sec.status !== 1);
      const finalCategorySections = [...visibleWithOrder, ...nonVisibleSections];
      
      // Llamar a la API para guardar el nuevo orden
      const response = await fetch('/api/sections/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sections: visibleWithOrder.map(s => ({ 
            id: s.section_id, 
            order: s.display_order 
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al reordenar secciones en la API');
      }
      
      // Actualizar el estado local con el array final de la categoría
      setLocalSections(prev => {
        const newState = { ...prev };
        newState[categoryId] = finalCategorySections;
        return newState;
      });
      
      toast.success('Secciones reordenadas correctamente');
      return true;
    } catch (error) {
      console.error(`Error al reordenar secciones en categoría ${categoryId}:`, error);
      toast.error('Error al reordenar secciones');
      return false;
    }
  }, [categories, sections, setLocalSections]);

  /**
   * Manejador para reordenar productos dentro de una sección
   */
  const handleReorderProducts = useCallback(async (sectionId: number, sourceIndex: number, destinationIndex: number): Promise<boolean> => {
    console.log(`🔄 Reordenando producto en sección ${sectionId} de índice ${sourceIndex} a ${destinationIndex}`);
    
    try {
      // Obtener los productos de la sección específica del estado
      const sectionProducts = products[sectionId] || [];
      if (sectionProducts.length === 0) {
        console.error(`No hay productos en la sección ${sectionId} para reordenar`);
        return false;
      }
      
      // Obtener solo los productos visibles (status 1) de esa sección
      const visibleProducts = sectionProducts.filter(prod => prod.status === 1);
      if (visibleProducts.length === 0) {
        console.error(`No hay productos visibles en la sección ${sectionId} para reordenar`);
        return false;
      }
      
      // Crear una copia del array de visibles para manipular
      const updatedVisibleProducts = [...visibleProducts];
      
      // Mover el producto de la posición origen a la posición destino dentro de visibles
      const [movedProduct] = updatedVisibleProducts.splice(sourceIndex, 1);
      updatedVisibleProducts.splice(destinationIndex, 0, movedProduct);
      
      // Actualizar el display_order de todos los productos visibles
      const visibleWithOrder = updatedVisibleProducts.map((product, index) => ({
        ...product,
        display_order: index + 1
      }));
      
      console.log("Productos visibles reordenados:", visibleWithOrder.map(p => `${p.name} (${p.display_order})`));
      
      // Combinar con los no visibles para obtener el array final de la sección
      const nonVisibleProducts = sectionProducts.filter(prod => prod.status !== 1);
      const finalSectionProducts = [...visibleWithOrder, ...nonVisibleProducts];
      
      // Llamar a la API para guardar el nuevo orden de los visibles
      const response = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          products: visibleWithOrder.map(p => ({ 
            id: p.product_id, 
            order: p.display_order 
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al reordenar productos en la API');
      }
      
      // Actualizar el estado local con el array final de la sección
      setLocalProducts(prev => {
        const newState = { ...prev };
        newState[sectionId] = finalSectionProducts;
        return newState;
      });
      
      toast.success('Productos reordenados correctamente');
      return true;
    } catch (error) {
      console.error(`Error al reordenar productos en sección ${sectionId}:`, error);
      toast.error('Error al reordenar productos');
      return false;
    }
  }, [products, setLocalProducts]);

  /**
   * Manejador global para el evento de finalización de arrastre
   */
  const handleGlobalDragEnd = useCallback((result: DropResult) => {
    // Log informativo para depuración con información detallada
    console.log("🔍 [DRAG DEBUG] Resultado del drag and drop:", { 
      source: result.source, 
      destination: result.destination, 
      type: result.type,
      draggableId: result.draggableId
    });
    
    // Extraer información relevante del resultado
    const { source, destination, type } = result;
    
    // Indicar que ya no estamos arrastrando
    setIsReorderModeActive(false);
    
    // Cancelar si no hay destino (se soltó fuera de un área válida)
    // o si el origen y destino son el mismo (no hubo cambio real)
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      console.log("🚫 [DRAG DEBUG] Operación cancelada: sin destino o sin cambio de posición");
      return;
    }
    
    // Determinar qué tipo de elemento se está arrastrando y llamar a la función adecuada
    // IMPORTANTE: Los tipos son en minúsculas
    if (type === 'category') {
      console.log("📊 [DRAG DEBUG] Reordenando categoría:", { 
        sourceIndex: source.index, 
        destinationIndex: destination.index 
      });
      handleReorderCategories(source.index, destination.index);
    } else if (type === 'section') {
      const categoryId = parseInt(source.droppableId.replace('category-', ''));
      console.log("📋 [DRAG DEBUG] Reordenando sección:", { 
        categoryId, 
        sourceIndex: source.index, 
        destinationIndex: destination.index 
      });
      handleReorderSections(categoryId, source.index, destination.index);
    } else if (type === 'product') {
      const sectionId = parseInt(source.droppableId.replace('section-', ''));
      console.log("🍔 [DRAG DEBUG] Reordenando producto:", { 
        sectionId, 
        sourceIndex: source.index, 
        destinationIndex: destination.index 
      });
      handleReorderProducts(sectionId, source.index, destination.index);
    } else {
      console.warn("⚠️ [DRAG DEBUG] Tipo de elemento desconocido:", type);
    }
  }, [handleReorderCategories, handleReorderSections, handleReorderProducts]);

  return {
    isReorderModeActive,
    setIsReorderModeActive,
    handleGlobalDragEnd,
    handleReorderCategories,
    handleReorderSections,
    handleReorderProducts,
  };
} 
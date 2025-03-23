/**
 * Hook personalizado para manejar elementos ordenables
 * 
 * Proporciona funciones para reordenar elementos mediante drag and drop
 * y sincronizar el nuevo orden con la API.
 */

import { useState, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';

/**
 * Opciones para el hook useReorderableItems
 */
interface UseReorderableItemsOptions<T> {
  /** Servicio de API para guardar los cambios de orden */
  reorderService: (items: any[]) => Promise<T[]>;
  /** Función para extraer el ID de un elemento */
  getItemId: (item: T) => string | number;
  /** Propiedad del elemento que contiene el orden */
  orderProperty?: string;
  /** Función a llamar después de una reordenación exitosa */
  onReorderSuccess?: (items: T[]) => void;
  /** Función a llamar si ocurre un error */
  onReorderError?: (error: any) => void;
}

/**
 * Hook useReorderableItems
 * 
 * @param initialItems - Lista inicial de elementos
 * @param options - Opciones de configuración
 * @returns Funciones y estado para manejar elementos reordenables
 * 
 * @example
 * const { 
 *   items, 
 *   isReordering,
 *   handleDragEnd,
 *   setItems
 * } = useReorderableItems(
 *   categories,
 *   {
 *     reorderService: CategoryService.reorder,
 *     getItemId: (category) => category.category_id,
 *     orderProperty: 'display_order',
 *     onReorderSuccess: (newCategories) => {
 *       toast.success('Categorías reordenadas con éxito');
 *     },
 *     onReorderError: (error) => {
 *       toast.error('Error al reordenar categorías');
 *     }
 *   }
 * );
 * 
 * // En tu componente
 * <DragDropContext onDragEnd={handleDragEnd}>
 *   <Droppable droppableId="categories">
 *     {(provided) => (
 *       <div ref={provided.innerRef} {...provided.droppableProps}>
 *         {items.map((category, index) => (
 *           <Draggable 
 *             key={category.category_id}
 *             draggableId={String(category.category_id)}
 *             index={index}
 *           >
 *             {(provided) => (
 *               <div
 *                 ref={provided.innerRef}
 *                 {...provided.draggableProps}
 *                 {...provided.dragHandleProps}
 *               >
 *                 {category.name}
 *               </div>
 *             )}
 *           </Draggable>
 *         ))}
 *         {provided.placeholder}
 *       </div>
 *     )}
 *   </Droppable>
 * </DragDropContext>
 */
export function useReorderableItems<T extends Record<string, any>>(
  initialItems: T[],
  options: UseReorderableItemsOptions<T>
) {
  // Extraer opciones
  const { 
    reorderService, 
    getItemId, 
    orderProperty = 'display_order',
    onReorderSuccess,
    onReorderError
  } = options;
  
  // Estado para los elementos y el estado de carga
  const [items, setItems] = useState<T[]>(initialItems);
  const [isReordering, setIsReordering] = useState(false);
  
  // Manejar el final de un arrastre
  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source } = result;
    
    // Si no hay destino o es el mismo que el origen, no hacer nada
    if (!destination || destination.index === source.index) {
      return;
    }
    
    try {
      // Actualizar localmente
      const newItems = Array.from(items);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      
      // Actualizar el orden de visualización
      const itemsWithNewOrder = newItems.map((item, index) => ({
        ...item,
        [orderProperty]: index + 1
      }));
      
      // Actualizar el estado local antes de la llamada a la API
      setItems(itemsWithNewOrder);
      
      // Preparar los datos para la API
      const reorderData = itemsWithNewOrder.map(item => ({
        [getItemId(item).toString().replace(/.*_/, '')]: getItemId(item),
        [orderProperty]: item[orderProperty]
      }));
      
      // Marcar como cargando
      setIsReordering(true);
      
      // Llamar al servicio de API
      const result = await reorderService(reorderData);
      
      // Actualizar con la respuesta de la API
      setItems(result);
      
      // Llamar al callback de éxito
      onReorderSuccess?.(result);
    } catch (error) {
      console.error('Error reordering items:', error);
      
      // Restaurar el estado original
      setItems(initialItems);
      
      // Llamar al callback de error
      onReorderError?.(error);
    } finally {
      setIsReordering(false);
    }
  }, [
    items, 
    initialItems, 
    reorderService, 
    getItemId, 
    orderProperty, 
    onReorderSuccess, 
    onReorderError
  ]);
  
  // Actualizar los elementos si cambian los iniciales
  if (initialItems !== items && initialItems.length !== items.length) {
    setItems(initialItems);
  }
  
  return {
    items,
    setItems,
    isReordering,
    handleDragEnd
  };
} 
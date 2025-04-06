/**
 * @fileoverview Hook para gestionar la funcionalidad de arrastrar y soltar en el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-15
 * 
 * Este hook proporciona funcionalidades completas para implementar operaciones
 * de arrastrar y soltar (drag and drop) para categorías, secciones y productos.
 * 
 * Permite a los usuarios reorganizar elementos visualmente y persiste los cambios
 * en el servidor a través del DashboardService.
 */

import { useState, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import { 
  Category, 
  Section, 
  Product 
} from '@/app/dashboard-v2/types';
import { DashboardService } from '@/lib/services/dashboardService';

/**
 * Interfaz para el resultado de una operación de reordenamiento
 * Esta interfaz se usa para tipos de retorno en operaciones de reordenamiento
 * 
 * @property success - Indica si la operación tuvo éxito (true) o falló (false)
 * @property data - Datos devueltos por el servidor en caso de éxito (opcional)
 * @property error - Mensaje de error en caso de fallo (opcional)
 */
interface ReorderResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Hook personalizado para gestionar las operaciones de arrastrar y soltar
 * 
 * Este hook encapsula toda la lógica necesaria para:
 * - Manejar eventos de arrastrar y soltar
 * - Actualizar el estado local para reflejar los cambios inmediatamente
 * - Enviar los cambios al servidor para persistencia
 * - Revertir cambios en caso de error
 * - Mostrar notificaciones de éxito/error
 * 
 * @param categories - Array de categorías del menú
 * @param sections - Objeto que mapea IDs de categoría a arrays de secciones
 * @param products - Objeto que mapea IDs de sección a arrays de productos
 * @param setCategories - Función para actualizar el estado de categorías
 * @param setSections - Función para actualizar el estado de secciones
 * @param setProducts - Función para actualizar el estado de productos
 * @returns Conjunto de estados y funciones para gestionar el arrastrar y soltar
 * 
 * @example
 * // Uso básico en un componente
 * const dragDropFunctions = useDragAndDrop(
 *   categories,
 *   sections,
 *   products,
 *   setCategories,
 *   setSections,
 *   setProducts
 * );
 * 
 * // Usar con el contexto de DragDropContext de la biblioteca
 * // Ver documentación de @hello-pangea/dnd para más detalles
 */
export default function useDragAndDrop(
  categories: Category[],
  sections: { [key: string]: Section[] },
  products: { [key: string]: Product[] },
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
  setSections: React.Dispatch<React.SetStateAction<{ [key: string]: Section[] }>>,
  setProducts: React.Dispatch<React.SetStateAction<{ [key: string]: Product[] }>>
) {
  /**
   * Estado que indica si el modo de reordenamiento está activo
   * Cuando es true, los elementos pueden ser arrastrados y reorganizados.
   */
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);
  
  /**
   * Estado que indica si actualmente hay una operación de arrastre en curso
   * Es útil para aplicar estilos visuales durante el arrastre.
   */
  const [isDragging, setIsDragging] = useState(false);
  
  /**
   * Maneja el final de una operación de arrastrar y soltar
   * 
   * Esta función es el punto de entrada principal para procesar todas las operaciones
   * de arrastrar y soltar. Detecta el tipo de elemento arrastrado (categoría, sección o producto)
   * y llama a la función específica de reordenamiento correspondiente.
   * 
   * @param result - Resultado de la operación de arrastrar y soltar proporcionado por la biblioteca DnD
   * 
   * @example
   * // Pasar esta función al DragDropContext como el callback onDragEnd
   * // Ver documentación de @hello-pangea/dnd para detalles de implementación
   */
  const handleGlobalDragEnd = useCallback((result: DropResult) => {
    // Extraer información relevante del resultado
    const { source, destination, type } = result;
    
    // Indicar que ya no estamos arrastrando
    setIsDragging(false);
    
    // Cancelar si no hay destino (se soltó fuera de un área válida)
    // o si el origen y destino son el mismo (no hubo cambio real)
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }
    
    // Determinar qué tipo de elemento se está arrastrando y llamar a la función adecuada
    if (type === 'category') {
      // Reordenar categorías
      handleReorderCategories(source.index, destination.index);
    } else if (type === 'section') {
      // Extraer el ID de categoría del ID de la zona donde se puede soltar
      // Por ejemplo, de "category-5" obtenemos "5"
      const categoryId = parseInt(source.droppableId.replace('category-', ''));
      // Reordenar secciones dentro de esa categoría
      handleReorderSections(categoryId, source.index, destination.index);
    } else if (type === 'product') {
      // Extraer el ID de sección del ID de la zona donde se puede soltar
      // Por ejemplo, de "section-10" obtenemos "10"
      const sectionId = parseInt(source.droppableId.replace('section-', ''));
      // Reordenar productos dentro de esa sección
      handleReorderProducts(sectionId, source.index, destination.index);
    }
  }, []);
  
  /**
   * Reordena categorías después de una operación de arrastrar y soltar
   * 
   * Esta función:
   * 1. Actualiza el estado local de categorías para reflejar el nuevo orden (optimista)
   * 2. Envía la actualización al servidor
   * 3. Muestra una notificación de éxito
   * 4. En caso de error, revierte los cambios y muestra una notificación de error
   * 
   * @param sourceIndex - Índice original del elemento antes de arrastrar
   * @param destinationIndex - Índice final del elemento después de soltar
   * 
   * @example
   * // Reordenar manualmente (no a través de DnD)
   * handleReorderCategories(2, 5); // Mover la categoría en posición 2 a posición 5
   */
  const handleReorderCategories = useCallback(async (sourceIndex: number, destinationIndex: number) => {
    // Crear una copia de las categorías para no mutar el estado directamente
    const reorderedCategories = [...categories];
    
    // Reordenar localmente usando la técnica de array.splice
    // 1. Primero eliminamos el elemento de la posición de origen
    const [movedCategory] = reorderedCategories.splice(sourceIndex, 1);
    // 2. Luego insertamos ese elemento en la posición de destino
    reorderedCategories.splice(destinationIndex, 0, movedCategory);
    
    // Actualizar los display_order de todas las categorías para reflejar el nuevo orden
    // Esto es importante para persistencia y ordenamiento correcto en el backend
    const updatedCategories = reorderedCategories.map((category, index) => ({
      ...category,
      display_order: index + 1 // Los órdenes empiezan en 1, no en 0
    }));
    
    // Actualizar el estado local inmediatamente (actualización optimista)
    // Esto permite que la UI refleje los cambios inmediatamente, sin esperar al servidor
    setCategories(updatedCategories);
    
    try {
      // Enviar la actualización al servidor
      const result = await DashboardService.reorderCategories(updatedCategories);
      
      // Verificar si la operación fue exitosa
      if (result.success) {
        toast.success('Categorías reordenadas correctamente');
      } else {
        // Si ocurrió un error en el servidor, revertir a las categorías originales
        toast.error('Error al reordenar categorías');
        setCategories(categories); // Revertir cambios
      }
    } catch (error) {
      // Capturar y manejar errores de red o excepciones
      console.error('Error reordering categories:', error);
      toast.error('Error al reordenar categorías');
      setCategories(categories); // Revertir cambios en caso de error
    }
  }, [categories, setCategories]);
  
  /**
   * Reordena secciones dentro de una categoría específica
   * 
   * Funciona de manera similar al reordenamiento de categorías, pero opera
   * sobre las secciones de una categoría específica.
   * 
   * @param categoryId - ID de la categoría que contiene las secciones a reordenar
   * @param sourceIndex - Índice original de la sección antes de arrastrar
   * @param destinationIndex - Índice final de la sección después de soltar
   * 
   * @example
   * // Reordenar manualmente las secciones de la categoría con ID 3
   * handleReorderSections(3, 0, 2); // Mover la primera sección a la tercera posición
   */
  const handleReorderSections = useCallback(async (categoryId: number, sourceIndex: number, destinationIndex: number) => {
    // Convertir el ID de categoría a string para usar como clave en el objeto de secciones
    const categoryIdStr = categoryId.toString();
    
    // Verificar que existen secciones para esta categoría
    if (!sections[categoryIdStr]) {
      console.error(`No sections found for category ${categoryId}`);
      return;
    }
    
    // Crear una copia de las secciones para esta categoría
    const reorderedSections = [...sections[categoryIdStr]];
    
    // Reordenar localmente usando la técnica de array.splice
    const [movedSection] = reorderedSections.splice(sourceIndex, 1);
    reorderedSections.splice(destinationIndex, 0, movedSection);
    
    // Actualizar los display_order de todas las secciones
    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      display_order: index + 1
    }));
    
    // Actualizar el estado local inmediatamente (actualización optimista)
    setSections(prev => ({
      ...prev,
      [categoryIdStr]: updatedSections
    }));
    
    try {
      // Enviar la actualización al servidor
      const result = await DashboardService.reorderSections(updatedSections);
      
      // Verificar si la operación fue exitosa
      if (result.success) {
        toast.success('Secciones reordenadas correctamente');
      } else {
        // Si ocurrió un error en el servidor, revertir a las secciones originales
        toast.error('Error al reordenar secciones');
        // Revertir cambios
        setSections(prev => ({
          ...prev,
          [categoryIdStr]: sections[categoryIdStr]
        }));
      }
    } catch (error) {
      // Capturar y manejar errores de red o excepciones
      console.error('Error reordering sections:', error);
      toast.error('Error al reordenar secciones');
      // Revertir cambios en caso de error
      setSections(prev => ({
        ...prev,
        [categoryIdStr]: sections[categoryIdStr]
      }));
    }
  }, [sections, setSections]);
  
  /**
   * Reordena productos dentro de una sección específica
   * 
   * Funciona de manera similar al reordenamiento de categorías y secciones,
   * pero opera sobre los productos de una sección específica.
   * 
   * @param sectionId - ID de la sección que contiene los productos a reordenar
   * @param sourceIndex - Índice original del producto antes de arrastrar
   * @param destinationIndex - Índice final del producto después de soltar
   * 
   * @example
   * // Reordenar manualmente los productos de la sección con ID 8
   * handleReorderProducts(8, 4, 1); // Mover el quinto producto a la segunda posición
   */
  const handleReorderProducts = useCallback(async (sectionId: number, sourceIndex: number, destinationIndex: number) => {
    // Convertir el ID de sección a string para usar como clave en el objeto de productos
    const sectionIdStr = sectionId.toString();
    
    // Verificar que existen productos para esta sección
    if (!products[sectionIdStr]) {
      console.error(`No products found for section ${sectionId}`);
      return;
    }
    
    // Crear una copia de los productos para esta sección
    const reorderedProducts = [...products[sectionIdStr]];
    
    // Reordenar localmente usando la técnica de array.splice
    const [movedProduct] = reorderedProducts.splice(sourceIndex, 1);
    reorderedProducts.splice(destinationIndex, 0, movedProduct);
    
    // Actualizar los display_order de todos los productos
    const updatedProducts = reorderedProducts.map((product, index) => ({
      ...product,
      display_order: index + 1
    }));
    
    // Actualizar el estado local inmediatamente (actualización optimista)
    setProducts(prev => ({
      ...prev,
      [sectionIdStr]: updatedProducts
    }));
    
    try {
      // Enviar la actualización al servidor
      const result = await DashboardService.reorderProducts(updatedProducts);
      
      // Verificar si la operación fue exitosa
      if (result.success) {
        toast.success('Productos reordenados correctamente');
      } else {
        // Si ocurrió un error en el servidor, revertir a los productos originales
        toast.error('Error al reordenar productos');
        // Revertir cambios
        setProducts(prev => ({
          ...prev,
          [sectionIdStr]: products[sectionIdStr]
        }));
      }
    } catch (error) {
      // Capturar y manejar errores de red o excepciones
      console.error('Error reordering products:', error);
      toast.error('Error al reordenar productos');
      // Revertir cambios en caso de error
      setProducts(prev => ({
        ...prev,
        [sectionIdStr]: products[sectionIdStr]
      }));
    }
  }, [products, setProducts]);
  
  // Devolver todas las funciones y estados necesarios para implementar
  // la funcionalidad de arrastrar y soltar en componentes
  return {
    // Estados
    isReorderModeActive,   // Si el modo de reordenamiento está activo
    setIsReorderModeActive, // Función para activar/desactivar el modo de reordenamiento
    isDragging,            // Si hay una operación de arrastre en curso
    setIsDragging,         // Función para actualizar el estado de arrastre
    
    // Funciones principales
    handleGlobalDragEnd,   // Función principal para manejar el final de una operación de arrastre
    handleReorderCategories, // Función para reordenar categorías
    handleReorderSections,   // Función para reordenar secciones
    handleReorderProducts    // Función para reordenar productos
  };
} 
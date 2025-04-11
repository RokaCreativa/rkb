/**
 * @fileoverview Hook simplificado para gestionar la funcionalidad de arrastrar y soltar en el dashboard
 * @author RokaMenu Team
 * @version 2.1.0
 * @updated 2024-08-20
 * 
 * Este hook proporciona funcionalidades para implementar operaciones
 * de arrastrar y soltar (drag and drop) para categorías, secciones y productos.
 * Se ha mejorado para proporcionar mejor diagnóstico y soporte para dispositivos móviles.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import { 
  DashboardCategory, 
  DashboardSection, 
  DashboardProduct 
} from '@/app/dashboard-v2/types/type-adapters';
import { DashboardService } from '@/lib/services/dashboardService';
import { 
  formatDroppableId, 
  DRAG_TYPES, 
  enhanceTouchFeedback 
} from "@/app/dashboard-v2/utils/dragUtils";

/**
 * Mapa de secciones indexado por el ID de categoría (como string)
 */
type SectionsMap = Record<string, DashboardSection[]>;

/**
 * Mapa de productos indexado por el ID de sección (como string)
 */
type ProductsMap = Record<string, DashboardProduct[]>;

/**
 * Hook mejorado para gestionar las operaciones de arrastrar y soltar
 * con soporte optimizado para dispositivos móviles
 * 
 * @param categories - Array de categorías del menú
 * @param sections - Objeto que mapea IDs de categoría a arrays de secciones
 * @param products - Objeto que mapea IDs de sección a arrays de productos
 * @param setCategories - Función para actualizar el estado de categorías
 * @param setSections - Función para actualizar el estado de secciones
 * @param setProducts - Función para actualizar el estado de productos
 * @returns Objeto con estados y funciones para gestionar drag and drop
 */
export default function useDragAndDrop(
  categories: DashboardCategory[],
  sections: SectionsMap,
  products: ProductsMap,
  setCategories: React.Dispatch<React.SetStateAction<DashboardCategory[]>>,
  setSections: React.Dispatch<React.SetStateAction<SectionsMap>>,
  setProducts: React.Dispatch<React.SetStateAction<ProductsMap>>
) {
  // Estado que indica si el modo de reordenamiento está activo
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);
  
  // Estado que indica si hay una operación de arrastre en curso
  const [isDragging, setIsDragging] = useState(false);
  
  // Referencias a los elementos de drag handles para mejorar experiencia táctil
  const dragHandleRefs = useRef<Map<string, HTMLElement>>(new Map());
  
  // Efecto para mejorar la experiencia táctil en dragHandles registrados
  useEffect(() => {
    // Aplicar mejoras táctiles a todos los drag handles registrados
    dragHandleRefs.current.forEach((element, key) => {
      enhanceTouchFeedback(element);
    });
    
    // Limpieza al desmontar
    return () => {
      dragHandleRefs.current.clear();
    };
  }, [isReorderModeActive]); // Re-aplicar cuando se active/desactive el modo reordenamiento
  
  /**
   * Registra un elemento drag handle para aplicarle mejoras táctiles
   * @param id Identificador único del elemento
   * @param element Referencia al elemento DOM
   */
  const registerDragHandle = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      dragHandleRefs.current.set(id, element);
      enhanceTouchFeedback(element);
    }
  }, []);
  
  /**
   * Reordena categorías y actualiza el estado local
   */
  const handleReorderCategories = useCallback(async (sourceIndex: number, destinationIndex: number) => {
    console.debug(`🔄 [DragAndDrop] Reordenando categorías de ${sourceIndex} a ${destinationIndex}`);
    
    // Solo trabajar con las categorías visibles (status 1)
    const visibleCategories = categories.filter(cat => cat.status === 1);
    
    if (visibleCategories.length === 0) {
      console.error("❌ No hay categorías visibles para reordenar");
      return;
    }
    
    // Crear una copia del array para manipular
    const reorderedCategories = [...visibleCategories];
    
    // Aplicar el reordenamiento
    const [movedCategory] = reorderedCategories.splice(sourceIndex, 1);
    reorderedCategories.splice(destinationIndex, 0, movedCategory);
    
    // Actualizar display_order en cada categoría
    const updatedCategories = reorderedCategories.map((category, index) => ({
      ...category,
      display_order: index + 1
    }));
    
    // Actualizar el estado local inmediatamente (actualización optimista)
    const nonVisibleCategories = categories.filter(cat => cat.status !== 1);
    const allUpdatedCategories = [...updatedCategories, ...nonVisibleCategories];
    
    setCategories(allUpdatedCategories);
    
    try {
      // Enviar actualización al servidor
      const result = await DashboardService.reorderCategories(updatedCategories);
      
      if (result.success) {
        toast.success('Categorías reordenadas correctamente');
        console.debug('✅ [DragAndDrop] Reordenamiento de categorías exitoso');
      } else {
        toast.error('Error al reordenar categorías');
        console.error('❌ [DragAndDrop] Error al reordenar categorías:', result.error);
        setCategories(categories); // Revertir cambios
      }
    } catch (error) {
      console.error('❌ [DragAndDrop] Error reordering categories:', error);
      toast.error('Error al reordenar categorías');
      setCategories(categories); // Revertir cambios en caso de error
    }
  }, [categories, setCategories]);
  
  /**
   * Reordena secciones dentro de una categoría
   */
  const handleReorderSections = useCallback(async (categoryId: number, sourceIndex: number, destinationIndex: number) => {
    console.debug(`🔄 [DragAndDrop] Reordenando secciones de categoría ${categoryId} de ${sourceIndex} a ${destinationIndex}`);
    
    const categoryIdStr = categoryId.toString();
    
    // Verificar que existan secciones para esta categoría
    if (!sections[categoryIdStr] || sections[categoryIdStr].length === 0) {
      console.error(`❌ [DragAndDrop] No se encontraron secciones para la categoría ${categoryId}`);
      return;
    }
    
    // Obtener solo las secciones visibles
    const visibleSections = sections[categoryIdStr].filter(section => section.status === 1);
    
    if (visibleSections.length === 0) {
      console.error(`❌ [DragAndDrop] No hay secciones visibles para la categoría ${categoryId}`);
      return;
    }
    
    // Crear una copia para manipular
    const reorderedSections = [...visibleSections];
    
    // Aplicar el reordenamiento
    const [movedSection] = reorderedSections.splice(sourceIndex, 1);
    reorderedSections.splice(destinationIndex, 0, movedSection);
    
    // Actualizar display_order
    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      display_order: index + 1
    }));
    
    // Actualizar el estado local
    const nonVisibleSections = sections[categoryIdStr].filter(section => section.status !== 1);
    const allUpdatedSections = [...updatedSections, ...nonVisibleSections];
    
    setSections(prev => ({
      ...prev,
      [categoryIdStr]: allUpdatedSections
    }));
    
    try {
      // Enviar actualización al servidor
      const result = await DashboardService.reorderSections(updatedSections);
      
      if (result.success) {
        toast.success('Secciones reordenadas correctamente');
        console.debug('✅ [DragAndDrop] Reordenamiento de secciones exitoso');
      } else {
        toast.error('Error al reordenar secciones');
        console.error('❌ [DragAndDrop] Error al reordenar secciones:', result.error);
        // Revertir cambios
        setSections(prev => ({
          ...prev,
          [categoryIdStr]: sections[categoryIdStr]
        }));
      }
    } catch (error) {
      console.error('❌ [DragAndDrop] Error reordering sections:', error);
      toast.error('Error al reordenar secciones');
      // Revertir cambios
      setSections(prev => ({
        ...prev,
        [categoryIdStr]: sections[categoryIdStr]
      }));
    }
  }, [sections, setSections]);
  
  /**
   * Reordena productos dentro de una sección
   */
  const handleReorderProducts = useCallback(async (sectionId: number, sourceIndex: number, destinationIndex: number) => {
    console.debug(`🔄 [DragAndDrop] Reordenando productos de sección ${sectionId} de ${sourceIndex} a ${destinationIndex}`);
    
    const sectionIdStr = sectionId.toString();
    
    // Verificar que existan productos para esta sección
    if (!products[sectionIdStr] || products[sectionIdStr].length === 0) {
      console.error(`❌ [DragAndDrop] No se encontraron productos para la sección ${sectionId}`);
      return;
    }
    
    // Obtener solo los productos visibles
    const visibleProducts = products[sectionIdStr].filter(product => product.status === 1);
    
    if (visibleProducts.length === 0) {
      console.error(`❌ [DragAndDrop] No hay productos visibles para la sección ${sectionId}`);
      return;
    }
    
    // Crear una copia para manipular
    const reorderedProducts = [...visibleProducts];
    
    // Información de diagnóstico
    console.debug("ℹ️ [DragAndDrop] Productos antes de reordenar:", 
      reorderedProducts.map(p => ({
        id: p.product_id,
        name: p.name,
        order: p.display_order
      }))
    );
    
    // Aplicar el reordenamiento
    const [movedProduct] = reorderedProducts.splice(sourceIndex, 1);
    reorderedProducts.splice(destinationIndex, 0, movedProduct);
    
    // Actualizar display_order
    const updatedProducts = reorderedProducts.map((product, index) => ({
      ...product,
      display_order: index + 1
    }));
    
    // Información de diagnóstico
    console.debug("ℹ️ [DragAndDrop] Productos después de reordenar:", 
      updatedProducts.map(p => ({
        id: p.product_id,
        name: p.name,
        order: p.display_order
      }))
    );
    
    // Actualizar el estado local
    const nonVisibleProducts = products[sectionIdStr].filter(product => product.status !== 1);
    const allUpdatedProducts = [...updatedProducts, ...nonVisibleProducts];
    
    setProducts(prev => ({
      ...prev,
      [sectionIdStr]: allUpdatedProducts
    }));
    
    try {
      // Enviar actualización al servidor
      const result = await DashboardService.reorderProducts(updatedProducts);
      
      if (result.success) {
        toast.success('Productos reordenados correctamente');
        console.debug('✅ [DragAndDrop] Reordenamiento de productos exitoso');
      } else {
        toast.error('Error al reordenar productos');
        console.error('❌ [DragAndDrop] Error al reordenar productos:', result.error);
        // Revertir cambios
        setProducts(prev => ({
          ...prev,
          [sectionIdStr]: products[sectionIdStr]
        }));
      }
    } catch (error) {
      console.error('❌ [DragAndDrop] Error reordering products:', error);
      toast.error('Error al reordenar productos');
      // Revertir cambios
      setProducts(prev => ({
        ...prev,
        [sectionIdStr]: products[sectionIdStr]
      }));
    }
  }, [products, setProducts]);
  
  /**
   * Manejador maestro para operaciones de drag and drop
   * Determina el tipo de operación y dirige a la función específica
   */
  const handleDragEnd = useCallback((result: DropResult) => {
    setIsDragging(false);
    
    // Utilizar la utilidad de diagnóstico mejorada
    formatDroppableId.debugDropResult(result);
    
    // Validar el resultado del drag and drop
    if (!formatDroppableId.validateDropResult(result)) {
      return; // No continuar si hay problemas con el resultado
    }
    
    const { source, destination, type } = result;
    
    // Si no hay destino, el usuario canceló la operación
    if (!destination) {
      console.debug('ℹ️ [DragAndDrop] Operación de arrastrar y soltar cancelada');
      return;
    }
    
    // Si el origen y destino son iguales (misma posición), no hacer nada
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      console.debug('ℹ️ [DragAndDrop] No hay cambio de posición');
      return;
    }
    
    // Determinar el tipo de reordenamiento basado en el tipo del item arrastrado
    switch (type) {
      case DRAG_TYPES.CATEGORY:
        return handleReorderCategories(source.index, destination.index);
        
      case DRAG_TYPES.SECTION: {
        // Extraer ID de categoría del droppableId
        const categoryId = formatDroppableId.extractCategoryIdFromSection(source.droppableId);
        
        if (categoryId === null) {
          console.error('❌ [DragAndDrop] No se pudo extraer ID de categoría para reordenar secciones');
          return;
        }
        
        // Solo permitir reordenar dentro de la misma categoría
        if (source.droppableId !== destination.droppableId) {
          console.warn('⚠️ [DragAndDrop] No se permite mover secciones entre categorías');
          return;
        }
        
        return handleReorderSections(categoryId, source.index, destination.index);
      }
        
      case DRAG_TYPES.PRODUCT: {
        // Extraer ID de sección del droppableId
        const sectionId = formatDroppableId.extractSectionId(source.droppableId);
        
        if (sectionId === null) {
          console.error('❌ [DragAndDrop] No se pudo extraer ID de sección para reordenar productos');
          return;
        }
        
        // Solo permitir reordenar dentro de la misma sección
        if (source.droppableId !== destination.droppableId) {
          console.warn('⚠️ [DragAndDrop] No se permite mover productos entre secciones');
          return;
        }
        
        return handleReorderProducts(sectionId, source.index, destination.index);
      }
        
      default:
        console.warn(`⚠️ [DragAndDrop] Tipo de drag and drop no reconocido: ${type}`);
    }
  }, [handleReorderCategories, handleReorderSections, handleReorderProducts]);
  
  /**
   * Manejador para el inicio de una operación de arrastre
   */
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    // Añadir clase al body para indicar arrastre activo (útil para estilos móviles)
    document.body.classList.add('is-dragging');
  }, []);
  
  /**
   * Manejador para la actualización durante el arrastre
   * Útil para detectar si se está arrastrando sobre un elemento válido
   */
  const handleDragUpdate = useCallback(() => {
    // Se puede usar para aplicar efectos visuales durante el arrastre
  }, []);
  
  /**
   * Limpieza al finalizar una operación de arrastre
   */
  const handleDragCleanup = useCallback(() => {
    setIsDragging(false);
    document.body.classList.remove('is-dragging');
  }, []);
  
  /**
   * Toggle para activar/desactivar el modo de reordenamiento
   */
  const toggleReorderMode = useCallback(() => {
    setIsReorderModeActive(prev => !prev);
  }, []);
  
  // Cleanup cuando el componente se desmonta
  useEffect(() => {
    return () => {
      document.body.classList.remove('is-dragging');
    };
  }, []);
  
  return {
    // Estados
    isReorderModeActive,
    isDragging,
    
    // Manejadores principales
    handleDragEnd,
    handleDragStart,
    handleDragUpdate,
    
    // Manejadores específicos
    handleReorderCategories,
    handleReorderSections,
    handleReorderProducts,
    
    // Utilidades
    toggleReorderMode,
    registerDragHandle,
  };
} 
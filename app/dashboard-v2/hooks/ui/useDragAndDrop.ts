/**
 * @fileoverview Hook simplificado para gestionar la funcionalidad de arrastrar y soltar en el dashboard
 * @author RokaMenu Team
 * @version 2.0.0
 * @updated 2024-06-25
 * 
 * Este hook proporciona funcionalidades para implementar operaciones
 * de arrastrar y soltar (drag and drop) para categorías, secciones y productos.
 * Se ha reconstruido para mejorar el rendimiento y simplificar la implementación.
 */

import { useState, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import { 
  DashboardCategory, 
  DashboardSection, 
  DashboardProduct 
} from '@/app/dashboard-v2/types/type-adapters';
import { DashboardService } from '@/lib/services/dashboardService';

/**
 * Mapa de secciones indexado por el ID de categoría (como string)
 */
type SectionsMap = Record<string, DashboardSection[]>;

/**
 * Mapa de productos indexado por el ID de sección (como string)
 */
type ProductsMap = Record<string, DashboardProduct[]>;

/**
 * Hook simplificado para gestionar las operaciones de arrastrar y soltar
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
  
  /**
   * Reordena categorías y actualiza el estado local
   */
  const handleReorderCategories = useCallback(async (sourceIndex: number, destinationIndex: number) => {
    // Solo trabajar con las categorías visibles (status 1)
    const visibleCategories = categories.filter(cat => cat.status === 1);
    
    if (visibleCategories.length === 0) {
      console.error("No hay categorías visibles para reordenar");
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
      } else {
        toast.error('Error al reordenar categorías');
        setCategories(categories); // Revertir cambios
      }
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast.error('Error al reordenar categorías');
      setCategories(categories); // Revertir cambios en caso de error
    }
  }, [categories, setCategories]);
  
  /**
   * Reordena secciones dentro de una categoría
   */
  const handleReorderSections = useCallback(async (categoryId: number, sourceIndex: number, destinationIndex: number) => {
    const categoryIdStr = categoryId.toString();
    
    // Verificar que existan secciones para esta categoría
    if (!sections[categoryIdStr] || sections[categoryIdStr].length === 0) {
      console.error(`No sections found for category ${categoryId}`);
      return;
    }
    
    // Obtener solo las secciones visibles
    const visibleSections = sections[categoryIdStr].filter(section => section.status === 1);
    
    if (visibleSections.length === 0) {
      console.error(`No visible sections found for category ${categoryId}`);
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
      } else {
        toast.error('Error al reordenar secciones');
        // Revertir cambios
        setSections(prev => ({
          ...prev,
          [categoryIdStr]: sections[categoryIdStr]
        }));
      }
    } catch (error) {
      console.error('Error reordering sections:', error);
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
    console.log("🔍 [CRITICAL] Ejecutando handleReorderProducts con:", {
      sectionId, sourceIndex, destinationIndex
    });
    
    const sectionIdStr = sectionId.toString();
    
    // Verificar que existan productos para esta sección
    if (!products[sectionIdStr] || products[sectionIdStr].length === 0) {
      console.error(`❌ [CRITICAL] No products found for section ${sectionId}`);
      return;
    }
    
    // Obtener solo los productos visibles
    const visibleProducts = products[sectionIdStr].filter(product => product.status === 1);
    
    if (visibleProducts.length === 0) {
      console.error(`❌ [CRITICAL] No visible products found for section ${sectionId}`);
      return;
    }
    
    // Crear una copia para manipular
    const reorderedProducts = [...visibleProducts];
    
    console.log("🔍 [CRITICAL] Antes de reordenar:", reorderedProducts.map(p => ({
      id: p.product_id,
      name: p.name,
      order: p.display_order
    })));
    
    // Aplicar el reordenamiento
    const [movedProduct] = reorderedProducts.splice(sourceIndex, 1);
    reorderedProducts.splice(destinationIndex, 0, movedProduct);
    
    console.log("🔍 [CRITICAL] Después de reordenar:", reorderedProducts.map(p => ({
      id: p.product_id,
      name: p.name,
      order: p.display_order
    })));
    
    // Actualizar display_order
    const updatedProducts = reorderedProducts.map((product, index) => ({
      ...product,
      display_order: index + 1
    }));
    
    console.log("🔍 [CRITICAL] Productos con nuevo orden:", updatedProducts.map(p => ({
      id: p.product_id,
      name: p.name,
      order: p.display_order
    })));
    
    // Actualizar el estado local
    const nonVisibleProducts = products[sectionIdStr].filter(product => product.status !== 1);
    const allUpdatedProducts = [...updatedProducts, ...nonVisibleProducts];
    
    // ¡IMPORTANTE! Actualizamos el estado ANTES de la llamada al API para que la interfaz responda inmediatamente
    setProducts(prev => ({
      ...prev,
      [sectionIdStr]: allUpdatedProducts
    }));
    
    console.log("🔍 [CRITICAL] Estado local actualizado con nuevos productos ordenados");
    
    try {
      // Preparar productos para API, enviando SOLO product_id y display_order
      const productsForApi = updatedProducts.map(product => {
        // Asegurar que tengamos el ID correcto (solamente product_id es válido en este contexto)
        const productId = product.product_id;
          
        if (!productId || typeof productId !== 'number') {
          console.error('❌ [CRITICAL] Producto sin product_id válido:', product);
          return null; // Este null será filtrado después
        }
        
        return {
          product_id: productId,
          display_order: product.display_order || 0
        };
      }).filter((p): p is {product_id: number, display_order: number} => p !== null); // Eliminar productos inválidos
      
      if (productsForApi.length === 0) {
        console.error('❌ [CRITICAL] No hay productos válidos para reordenar');
        return;
      }
      
      console.log('📊 [CRITICAL] Productos enviados a API:', productsForApi);
      
      // Enviar actualización al servidor
      const result = await DashboardService.reorderProducts(productsForApi);
      
      if (result.success) {
        toast.success('Productos reordenados correctamente');
      } else {
        toast.error('Error al reordenar productos: ' + (result.error || 'Error desconocido'));
        console.error('Error al reordenar productos:', result.error);
        // Revertir cambios
        setProducts(prev => ({
          ...prev,
          [sectionIdStr]: products[sectionIdStr]
        }));
      }
    } catch (error) {
      console.error('Error reordering products:', error);
      toast.error('Error al reordenar productos');
      // Revertir cambios
      setProducts(prev => ({
        ...prev,
        [sectionIdStr]: products[sectionIdStr]
      }));
    }
  }, [products, setProducts]);
  
  /**
   * Maneja el final de una operación de arrastrar y soltar
   * Esta función determina qué tipo de elemento se arrastró y llama
   * a la función específica para reordenar
   */
  const handleGlobalDragEnd = useCallback((result: DropResult) => {
    // DIAGNÓSTICO ULTRA DETALLADO
    console.log('🔥🔥🔥 [DIAGNÓSTICO CRÍTICO] RAW DATA EN handleGlobalDragEnd:', JSON.stringify({
      type: result.type,
      draggableId: result.draggableId,
      source: {
        droppableId: result.source.droppableId,
        index: result.source.index
      },
      destination: result.destination ? {
        droppableId: result.destination.droppableId,
        index: result.destination.index
      } : null,
      mode: result.mode,
      reason: result.reason,
      combine: result.combine
    }, null, 2));
    
    // DIAGNÓSTICO CRÍTICO
    console.log('🚨 [DIAGNOSTIC] handleGlobalDragEndExists:', typeof handleGlobalDragEnd === 'function');
    console.log('🚨 [DIAGNOSTIC] handleReorderCategoriesExists:', typeof handleReorderCategories === 'function');
    console.log('🚨 [DIAGNOSTIC] handleReorderSectionsExists:', typeof handleReorderSections === 'function');
    console.log('🚨 [DIAGNOSTIC] handleReorderProductsExists:', typeof handleReorderProducts === 'function');
    console.log('🚨 [DIAGNOSTIC] isReorderModeActive:', isReorderModeActive);

    // Limpiar el estado de arrastre
    setIsDragging(false);
    
    // Extraer información relevante
    const { source, destination, type } = result;
    
    // Log detallado para depuración
    console.log('🔍 [DRAG DEBUG] handleGlobalDragEnd:', {
      result,
      type,
      source,
      destination,
      normalizedType: typeof type === 'string' ? type.toLowerCase() : String(type).toLowerCase(),
      isReorderModeActive,
      droppableIdSource: source.droppableId,
      droppableIdDestination: destination?.droppableId,
      handleReorderCategoriesExists: typeof handleReorderCategories === 'function',
      handleReorderSectionsExists: typeof handleReorderSections === 'function',
      handleReorderProductsExists: typeof handleReorderProducts === 'function',
    });
    
    // Cancelar si no hay destino o no hubo cambio real
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      console.log('🛑 [DRAG INFO] Operación cancelada: Sin destino o sin cambio real');
      return;
    }
    
    // Solo procesar si el modo reordenamiento está activo
    if (!isReorderModeActive) {
      console.log('⚠️ [DRAG WARN] Ignorando drag and drop porque isReorderModeActive es false');
      return;
    }
    
    // Normalizar el tipo a minúsculas para asegurar compatibilidad
    const normalizedType = typeof type === 'string' ? type.toLowerCase() : String(type).toLowerCase();
    
    // Determinar qué tipo de elemento se arrastró y llamar a la función adecuada
    console.log('🔄 [DRAG INFO] Procesando tipo:', normalizedType);
    
    if (normalizedType === 'category') {
      console.log('🔄 [DRAG INFO] Reordenando CATEGORÍA:', source.index, '->', destination.index);
      
      // Verificar función antes de llamar
      if (typeof handleReorderCategories === 'function') {
        console.log('✅ [DRAG INFO] Llamando a handleReorderCategories');
        handleReorderCategories(source.index, destination.index);
      } else {
        console.error('❌ [DRAG ERROR] handleReorderCategories no es una función');
      }
    } else if (normalizedType === 'section') {
      // Extraer categoryId del droppableId (formato: "section-category-{id}" o "sections-category-{id}")
      const sectionCategoryMatch = source.droppableId.match(/sections?-category-(\d+)/);
      const categoryId = sectionCategoryMatch ? parseInt(sectionCategoryMatch[1]) : parseInt(source.droppableId.replace(/\D/g, ''));
      
      console.log('🔄 [DRAG INFO] Reordenando SECCIÓN:', {
        categoryId, 
        sourceIndex: source.index, 
        destIndex: destination.index,
        droppableIdMatch: sectionCategoryMatch
      });
      
      if (typeof handleReorderSections === 'function') {
        console.log('✅ [DRAG INFO] Llamando a handleReorderSections');
        handleReorderSections(categoryId, source.index, destination.index);
      } else {
        console.error('❌ [DRAG ERROR] handleReorderSections no es una función');
      }
    } else if (normalizedType === 'product') {
      // Extraer el sectionId del formato "products-section-{number}"
      console.log('📊 [useDragAndDrop] Procesando producto con droppableId:', source.droppableId);
      
      // Verificar si el droppableId está vacío (caso cuando sectionId es undefined)
      if (!source.droppableId) {
        console.error('❌ [useDragAndDrop] droppableId está vacío, no se puede extraer sectionId');
        return;
      }
      
      // Extraer el sectionId usando regex
      const productSectionMatch = source.droppableId.match(/products-section-(\d+)/);
      
      // Usar el sectionId extraído o 0 como fallback (última opción)
      const sectionId = productSectionMatch && productSectionMatch[1] 
        ? parseInt(productSectionMatch[1]) 
        : 0;
      
      console.log('📊 [useDragAndDrop] Extracción de sectionId:', sectionId, 
        productSectionMatch ? '(regex match exitoso)' : '(regex match falló)');
      
      // Reordenar los productos usando el sectionId extraído
      handleReorderProducts(sectionId, source.index, destination.index);
    } else {
      console.warn('⚠️ [DRAG WARN] Tipo desconocido en handleGlobalDragEnd:', type);
    }
  }, [handleReorderCategories, handleReorderSections, handleReorderProducts, isReorderModeActive]);
  
  return {
    // Estados
    isReorderModeActive,
    setIsReorderModeActive,
    isDragging,
    setIsDragging,
    
    // Funciones principales
    handleGlobalDragEnd,
    handleReorderCategories,
    handleReorderSections,
    handleReorderProducts
  };
} 
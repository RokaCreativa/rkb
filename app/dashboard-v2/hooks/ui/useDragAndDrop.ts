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
    const sectionIdStr = sectionId.toString();
    
    // Verificar que existan productos para esta sección
    if (!products[sectionIdStr] || products[sectionIdStr].length === 0) {
      console.error(`No products found for section ${sectionId}`);
      return;
    }
    
    // Obtener solo los productos visibles
    const visibleProducts = products[sectionIdStr].filter(product => product.status === 1);
    
    if (visibleProducts.length === 0) {
      console.error(`No visible products found for section ${sectionId}`);
      return;
    }
    
    // Crear una copia para manipular
    const reorderedProducts = [...visibleProducts];
    
    // Aplicar el reordenamiento
    const [movedProduct] = reorderedProducts.splice(sourceIndex, 1);
    reorderedProducts.splice(destinationIndex, 0, movedProduct);
    
    // Actualizar display_order
    const updatedProducts = reorderedProducts.map((product, index) => ({
      ...product,
      display_order: index + 1
    }));
    
    // Actualizar el estado local
    const nonVisibleProducts = products[sectionIdStr].filter(product => product.status !== 1);
    const allUpdatedProducts = [...updatedProducts, ...nonVisibleProducts];
    
    setProducts(prev => ({
      ...prev,
      [sectionIdStr]: allUpdatedProducts
    }));
    
    try {
      // Enviar actualización al servidor
      // Asegurar que price sea string para compatibilidad con API
      const productsForApi = updatedProducts.map(product => ({
        ...product,
        price: typeof product.price === 'number' ? product.price.toString() : product.price
      }));
      
      const result = await DashboardService.reorderProducts(productsForApi);
      
      if (result.success) {
        toast.success('Productos reordenados correctamente');
      } else {
        toast.error('Error al reordenar productos');
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
    // Limpiar el estado de arrastre
    setIsDragging(false);
    
    // Extraer información relevante
    const { source, destination, type } = result;
    
    // Cancelar si no hay destino o no hubo cambio real
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }
    
    // Normalizar el tipo a minúsculas para asegurar compatibilidad
    const normalizedType = String(type).toLowerCase();
    
    // Determinar qué tipo de elemento se arrastró y llamar a la función adecuada
    if (normalizedType === 'category') {
      handleReorderCategories(source.index, destination.index);
    } else if (normalizedType === 'section') {
      // Extraer categoryId del droppableId (formato: "category-{id}")
      const categoryId = parseInt(source.droppableId.replace(/\D/g, ''));
      handleReorderSections(categoryId, source.index, destination.index);
    } else if (normalizedType === 'product') {
      // Extraer sectionId del droppableId (formato: "section-{id}")
      const sectionId = parseInt(source.droppableId.replace(/\D/g, ''));
      handleReorderProducts(sectionId, source.index, destination.index);
    }
  }, [handleReorderCategories, handleReorderSections, handleReorderProducts]);
  
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
/**
 * Utilidades para estandarizar y simplificar operaciones de drag and drop
 * 
 * Estas utilidades garantizan que los formatos de IDs sean consistentes
 * en todos los componentes que implementan drag and drop, siguiendo el
 * mandamiento de no duplicación y el plan de optimización móvil.
 * 
 * @author RokaMenu Team
 * @updated 2024-08-20
 */

// Constantes para nombres de tipo de drag and drop
export const DRAG_TYPES = {
  CATEGORY: 'category',
  SECTION: 'section',
  PRODUCT: 'product'
} as const;

// Tipo para los patrones de expresiones regulares para mayor seguridad
type RegExpPatterns = Record<string, RegExp[]>;

// Patrones para extracción de IDs mejorados
const ID_PATTERNS: RegExpPatterns = {
  category: [
    /^categories$/,
    /^categories-(\d+)$/,
    /^category-(\d+)$/
  ],
  section: [
    /^sections-category-(\d+)$/,
    /^section-category-(\d+)$/,
    /^sections?-(\d+)$/
  ],
  product: [
    /^products-section-(\d+)$/,
    /^product-section-(\d+)$/,
    /^products?-(\d+)$/,
    /^section-(\d+)$/
  ],
  item: [
    /^[a-z]+-(\d+)$/,
    /^drag-item-(\d+)$/
  ]
};

/**
 * Utilidad para estandarizar formatos de IDs para drag and drop
 */
export const formatDroppableId = {
  // Formatos estandarizados y consistentes para droppableId
  category: () => `categories`,
  section: (categoryId: number) => `sections-category-${categoryId}`,
  product: (sectionId: number) => `products-section-${sectionId}`,
  
  // Formatos estandarizados para draggableId
  categoryItem: (categoryId: number) => `category-${categoryId}`,
  sectionItem: (sectionId: number) => `section-${sectionId}`,
  productItem: (productId: number) => `product-${productId}`,
  
  // Extractores seguros de IDs con diagnóstico mejorado
  extractCategoryId: (droppableId: string): number | null => {
    if (!droppableId) {
      console.warn('🔍 [DragUtils] extractCategoryId recibió un droppableId vacío');
      return null;
    }
    
    // Intentar extraer ID usando los patrones definidos
    for (const pattern of ID_PATTERNS.category) {
      const matches = droppableId.match(pattern);
      if (matches) {
        // Si es solo 'categories' sin ID, devolver null (para drop zones genéricas)
        if (matches.length === 1 && matches[0] === 'categories') {
          return null;
        }
        // Si hay un grupo capturado, extraer el ID
        if (matches[1]) {
          const id = parseInt(matches[1], 10);
          console.debug(`✅ [DragUtils] extractCategoryId: '${droppableId}' → ${id}`);
          return id;
        }
      }
    }
    
    console.warn(`❌ [DragUtils] No se pudo extraer categoryId de '${droppableId}'`);
    return null;
  },
  
  extractCategoryIdFromSection: (droppableId: string): number | null => {
    if (!droppableId) {
      console.warn('🔍 [DragUtils] extractCategoryIdFromSection recibió un droppableId vacío');
      return null;
    }
    
    // Intentar extraer usando los patrones definidos
    for (const pattern of ID_PATTERNS.section) {
      const matches = droppableId.match(pattern);
      if (matches && matches[1]) {
        const id = parseInt(matches[1], 10);
        console.debug(`✅ [DragUtils] extractCategoryIdFromSection: '${droppableId}' → ${id}`);
        return id;
      }
    }
    
    console.warn(`❌ [DragUtils] No se pudo extraer categoryId de sección '${droppableId}'`);
    return null;
  },
  
  extractSectionId: (droppableId: string): number | null => {
    if (!droppableId) {
      console.warn('🔍 [DragUtils] extractSectionId recibió un droppableId vacío');
      return null;
    }
    
    // Intentar extraer usando los patrones definidos
    for (const pattern of ID_PATTERNS.product) {
      const matches = droppableId.match(pattern);
      if (matches && matches[1]) {
        const id = parseInt(matches[1], 10);
        console.debug(`✅ [DragUtils] extractSectionId: '${droppableId}' → ${id}`);
        return id;
      }
    }
    
    // Último recurso: intentar extraer cualquier número
    const anyNumber = droppableId.match(/\d+/);
    if (anyNumber) {
      const id = parseInt(anyNumber[0], 10);
      console.warn(`⚠️ [DragUtils] extractSectionId fallback para '${droppableId}' → ${id}`);
      return id;
    }
    
    console.warn(`❌ [DragUtils] No se pudo extraer sectionId de '${droppableId}'`);
    return null;
  },
  
  extractItemId: (draggableId: string): number | null => {
    if (!draggableId) {
      console.warn('🔍 [DragUtils] extractItemId recibió un draggableId vacío');
      return null;
    }
    
    // Intentar extraer usando los patrones definidos
    for (const pattern of ID_PATTERNS.item) {
      const matches = draggableId.match(pattern);
      if (matches && matches[1]) {
        const id = parseInt(matches[1], 10);
        console.debug(`✅ [DragUtils] extractItemId: '${draggableId}' → ${id}`);
        return id;
      }
    }
    
    console.warn(`❌ [DragUtils] No se pudo extraer itemId de '${draggableId}'`);
    return null;
  },
  
  // Nuevas funciones para validar resultados de drag & drop
  validateDropResult: (result: any): boolean => {
    if (!result) {
      console.warn('🔍 [DragUtils] validateDropResult recibió un resultado vacío');
      return false;
    }
    
    const { source, destination, draggableId, type } = result;
    
    if (!source) {
      console.warn('❌ [DragUtils] El resultado no contiene source');
      return false;
    }
    
    if (!destination) {
      console.debug('ℹ️ [DragUtils] El resultado no contiene destination (drop cancelado)');
      return false; // No es un error, simplemente se canceló el drop
    }
    
    if (!draggableId) {
      console.warn('❌ [DragUtils] El resultado no contiene draggableId');
      return false;
    }
    
    if (!type) {
      console.warn('❌ [DragUtils] El resultado no contiene type');
      return false;
    }
    
    return true;
  },
  
  // Función para depurar problemas de drag and drop
  debugDropResult: (result: any): void => {
    console.debug('🔍 [DragUtils] DropResult completo:', result);
    
    if (!result) {
      console.error('❌ [DragUtils] DropResult es null o undefined');
      return;
    }
    
    const { source, destination, draggableId, type } = result;
    
    console.debug(`
    === DIAGNÓSTICO DE DRAG AND DROP ===
    Tipo: ${type || 'NO DEFINIDO'}
    ID Arrastrable: ${draggableId || 'NO DEFINIDO'}
    Origen: ${source ? `${source.droppableId} (índice ${source.index})` : 'NO DEFINIDO'}
    Destino: ${destination ? `${destination.droppableId} (índice ${destination.index})` : 'CANCELADO O NO DEFINIDO'}
    `);
    
    // Intentar extraer IDs para diagnóstico
    if (source && source.droppableId) {
      const categoryId = formatDroppableId.extractCategoryId(source.droppableId);
      const categoryIdFromSection = formatDroppableId.extractCategoryIdFromSection(source.droppableId);
      const sectionId = formatDroppableId.extractSectionId(source.droppableId);
      
      console.debug(`
      Análisis del origen (source.droppableId = "${source.droppableId}"):
      - Posible ID de categoría: ${categoryId !== null ? categoryId : 'NO ENCONTRADO'}
      - Posible ID de categoría desde sección: ${categoryIdFromSection !== null ? categoryIdFromSection : 'NO ENCONTRADO'}
      - Posible ID de sección: ${sectionId !== null ? sectionId : 'NO ENCONTRADO'}
      `);
    }
    
    if (destination && destination.droppableId) {
      const categoryId = formatDroppableId.extractCategoryId(destination.droppableId);
      const categoryIdFromSection = formatDroppableId.extractCategoryIdFromSection(destination.droppableId);
      const sectionId = formatDroppableId.extractSectionId(destination.droppableId);
      
      console.debug(`
      Análisis del destino (destination.droppableId = "${destination.droppableId}"):
      - Posible ID de categoría: ${categoryId !== null ? categoryId : 'NO ENCONTRADO'}
      - Posible ID de categoría desde sección: ${categoryIdFromSection !== null ? categoryIdFromSection : 'NO ENCONTRADO'}
      - Posible ID de sección: ${sectionId !== null ? sectionId : 'NO ENCONTRADO'}
      `);
    }
    
    if (draggableId) {
      const itemId = formatDroppableId.extractItemId(draggableId);
      console.debug(`
      Análisis del elemento arrastrado (draggableId = "${draggableId}"):
      - ID del elemento: ${itemId !== null ? itemId : 'NO ENCONTRADO'}
      `);
    }
  }
};

/**
 * Verifica si se trata de un tipo específico de drag and drop
 * @param type Tipo a verificar
 * @param expectedType Tipo esperado 
 */
export const isDragType = (type: string, expectedType: 'category' | 'section' | 'product'): boolean => {
  if (!type) return false;
  const normalizedType = type.toLowerCase();
  return normalizedType === expectedType;
};

/**
 * Genera clases CSS para elementos durante el arrastre
 * @param isDragging Si el elemento está siendo arrastrado
 * @param type Tipo de elemento (category, section, product)
 */
export const getDragStyles = (
  isDragging: boolean, 
  type: 'category' | 'section' | 'product'
): string => {
  if (!isDragging) return '';
  
  switch (type) {
    case 'category':
      return 'grid-item-dragging-category';
    case 'section':
      return 'grid-item-dragging-section';
    case 'product':
      return 'grid-item-dragging-product';
    default:
      return '';
  }
}; 

/**
 * Mejora el feedback táctil para drag and drop en dispositivos móviles
 * @param element Elemento DOM al que aplicar las mejoras
 */
export const enhanceTouchFeedback = (element: HTMLElement | null): void => {
  if (!element) return;
  
  // Añadir clases para dar feedback visual al usuario
  element.classList.add('touch-optimized');
  
  // Manejar eventos táctiles
  const handleTouchStart = () => {
    element.classList.add('draggable-content');
  };
  
  const handleTouchEnd = () => {
    element.classList.remove('draggable-content');
  };
  
  // Limpiar listeners previos para evitar duplicados
  element.removeEventListener('touchstart', handleTouchStart);
  element.removeEventListener('touchend', handleTouchEnd);
  element.removeEventListener('touchcancel', handleTouchEnd);
  
  // Añadir listeners
  element.addEventListener('touchstart', handleTouchStart);
  element.addEventListener('touchend', handleTouchEnd);
  element.addEventListener('touchcancel', handleTouchEnd);
}; 
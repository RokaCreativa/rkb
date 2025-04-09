/**
 * Utilidades para estandarizar y simplificar operaciones de drag and drop
 * 
 * Estas utilidades garantizan que los formatos de IDs sean consistentes
 * en todos los componentes que implementan drag and drop, siguiendo el
 * mandamiento de no duplicación y el plan de optimización móvil.
 * 
 * @author RokaMenu Team
 * @updated 2024-08-10
 */

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
  
  // Extractores seguros de IDs
  extractCategoryId: (droppableId: string): number | null => {
    const matches = droppableId.match(/^categories-(\d+)$/);
    return matches ? parseInt(matches[1], 10) : null;
  },
  
  extractCategoryIdFromSection: (droppableId: string): number | null => {
    // Intentar diferentes formatos posibles
    const formats = [
      /^sections-category-(\d+)$/,
      /^section-category-(\d+)$/,
      /^sections?-(\d+)$/
    ];
    
    for (const format of formats) {
      const matches = droppableId.match(format);
      if (matches && matches[1]) {
        return parseInt(matches[1], 10);
      }
    }
    
    return null;
  },
  
  extractSectionId: (droppableId: string): number | null => {
    // Intentar diferentes formatos posibles
    const formats = [
      /^products-section-(\d+)$/,
      /^product-section-(\d+)$/,
      /^products?-(\d+)$/,
      /^section-(\d+)$/
    ];
    
    for (const format of formats) {
      const matches = droppableId.match(format);
      if (matches && matches[1]) {
        return parseInt(matches[1], 10);
      }
    }
    
    // Último recurso: intentar extraer cualquier número
    const anyNumber = droppableId.match(/\d+/);
    return anyNumber ? parseInt(anyNumber[0], 10) : null;
  },
  
  extractItemId: (draggableId: string): number | null => {
    // Extrae el ID numérico de cualquier draggableId con formato tipo-número
    const matches = draggableId.match(/^[a-z]+-(\d+)$/);
    return matches ? parseInt(matches[1], 10) : null;
  }
};

/**
 * Verifica si se trata de un tipo específico de drag and drop
 * @param type Tipo a verificar
 * @param expectedType Tipo esperado 
 */
export const isDragType = (type: string, expectedType: 'category' | 'section' | 'product'): boolean => {
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
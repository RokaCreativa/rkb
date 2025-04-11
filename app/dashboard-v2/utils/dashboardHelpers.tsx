/**
 * @fileoverview Utilidades y funciones auxiliares para el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-29
 */

import { Category, Section } from '@/app/types/menu';
import { ViewType } from '../types/dashboard';

/**
 * Función auxiliar que enriquece las categorías con información sobre sus secciones
 * Calcula el número total de secciones y cuántas están visibles para cada categoría
 * 
 * @param categories - Lista de categorías a procesar
 * @param sections - Mapa de secciones por ID de categoría
 * @returns Lista de categorías con datos adicionales sobre sus secciones
 */
export function getCategoryTableData(categories: Category[], sections: Record<string | number, Section[]>) {
  return categories.map(category => {
    // Obtener las secciones para esta categoría (o un array vacío si no hay ninguna)
    const categorySections = sections[category.category_id] || [];
    
    // Contar cuántas secciones están visibles (status = 1 o status = true)
    const visibleSections = categorySections.filter(section => 
      section.status === 1 || Boolean(section.status) === true
    );
    
    // Devolver la categoría con información adicional
    return {
      ...category,
      sections_count: categorySections.length,
      visible_sections_count: visibleSections.length
    };
  });
}

/**
 * Función auxiliar para obtener las categorías paginadas
 * Filtra las categorías según la configuración de paginación actual
 * 
 * @param allCategories - Lista completa de categorías
 * @param pagination - Configuración de paginación (habilitada, página, límite)
 * @returns Lista filtrada de categorías según la paginación
 */
export function getPaginatedCategories(allCategories: Category[], pagination: { enabled: boolean, page: number, limit: number }) {
  // Si la paginación está deshabilitada, mostrar todas las categorías
  if (!pagination.enabled) {
    return allCategories;
  }
  
  // Calcular índices para el slice
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  
  // Devolver solo las categorías de la página actual
  return allCategories.slice(startIndex, endIndex);
}

/**
 * Genera los elementos para la navegación de migas de pan (breadcrumbs)
 */
export function getBreadcrumbItems(
  currentView: ViewType,
  selectedCategory: Category | null,
  selectedSection: Section | null,
  handlers: {
    goToCategories: () => void;
    goToSections: (category: Category) => void;
    goToProducts: (section: Section) => void;
  }
) {
  const items = [
    { 
      id: 'categories', 
      name: 'Categorías', 
      key: 'categories',
      current: currentView === 'CATEGORIES',
      onClick: handlers.goToCategories
    }
  ];
  
  if (selectedCategory) {
    items.push({ 
      id: `category-${selectedCategory.category_id}`, 
      name: selectedCategory.name, 
      key: 'sections',
      current: currentView === 'SECTIONS',
      onClick: () => handlers.goToSections(selectedCategory)
    });
  }
  
  if (selectedSection && currentView === 'PRODUCTS') {
    // Asegurarse de que el item de categoría no esté marcado como actual
    if (items.length > 1) {
      items[1].current = false;
    }
    
    items.push({ 
      id: `section-${selectedSection.section_id}`, 
      name: selectedSection.name, 
      key: 'products',
      current: true,
      onClick: () => handlers.goToProducts(selectedSection)
    });
  }
  
  return items;
}

/**
 * Genera una representación legible de la estructura de categorías, secciones y productos
 * para facilitar la depuración
 */
export function getDataStructureDebugInfo(
  categories: any[],
  sections: Record<string | number, any[]>,
  products: Record<string | number, any[]>,
  expandedCategories: Record<number, boolean>,
  expandedSections: Record<number, boolean>
) {
  const structureInfo = {
    categoriesCount: categories.length,
    categoriesExpanded: Object.keys(expandedCategories).filter(id => expandedCategories[parseInt(id)]).length,
    categoriesData: categories.map(cat => ({
      id: cat.category_id,
      name: cat.name,
      isExpanded: expandedCategories[cat.category_id] || false,
      sectionsCount: sections[cat.category_id]?.length || 0,
      sectionIds: sections[cat.category_id]?.map(s => s.section_id) || []
    })),
    sectionsCount: Object.values(sections).reduce((acc, arr) => acc + arr.length, 0),
    sectionsExpanded: Object.keys(expandedSections).filter(id => expandedSections[parseInt(id)]).length,
    productsCount: Object.values(products).reduce((acc, arr) => acc + arr.length, 0)
  };
  
  return structureInfo;
} 
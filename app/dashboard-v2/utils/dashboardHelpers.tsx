/**
 * @fileoverview Utilidades y funciones auxiliares para el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-29
 */

import { Category, Section } from '@/app/types/menu';

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
    
    // Contar cuántas secciones están visibles (status = 1)
    const visibleSections = categorySections.filter(section => section.status === 1);
    
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
 * Genera los elementos para el componente de breadcrumbs
 * 
 * @param currentView - Vista actual ('categories', 'sections', 'products')
 * @param selectedCategory - Categoría seleccionada (si aplica)
 * @param selectedSection - Sección seleccionada (si aplica)
 * @param onNavigate - Función de callback para navegar entre vistas
 * @returns Array de elementos para el componente de breadcrumbs
 */
export function getBreadcrumbItems(
  currentView: 'categories' | 'sections' | 'products',
  selectedCategory: Category | null,
  selectedSection: Section | null,
  onNavigate: {
    toCategories: () => void,
    toSections: (category: Category) => void,
    toProducts: (section: Section) => void,
    back: () => void
  }
) {
  const items = [
    { 
      id: 'categories', 
      name: 'Categorías', 
      onClick: onNavigate.toCategories, 
      current: currentView === 'categories' 
    }
  ];
  
  if (currentView === 'sections' && selectedCategory) {
    items.push({ 
      id: `category-${selectedCategory.category_id}`, 
      name: selectedCategory.name, 
      onClick: () => {}, 
      current: true 
    });
  }
  
  if (currentView === 'products' && selectedCategory && selectedSection) {
    items.push({ 
      id: `category-${selectedCategory.category_id}`, 
      name: selectedCategory.name, 
      onClick: onNavigate.back, 
      current: false 
    });
    
    items.push({ 
      id: `section-${selectedSection.section_id}`, 
      name: selectedSection.name, 
      onClick: () => {}, 
      current: true 
    });
  }
  
  return items;
} 
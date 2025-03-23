/**
 * Hook personalizado para manejar el estado expandido/colapsado de elementos
 * 
 * Proporciona funciones para gestionar qué elementos están expandidos
 * y funciones para expandir/colapsar individualmente o en grupo.
 */

import { useState, useCallback } from 'react';

/**
 * Opciones para el hook useExpandableState
 */
interface UseExpandableStateOptions {
  /** Lista de IDs inicialmente expandidos */
  initialExpandedIds?: (string | number)[];
  /** Si los elementos deben estar todos expandidos inicialmente */
  initiallyAllExpanded?: boolean;
  /** Si se permite tener múltiples elementos expandidos a la vez */
  allowMultiple?: boolean;
}

/**
 * Hook useExpandableState
 * 
 * @param options - Opciones de configuración
 * @returns Funciones y estado para manejar expandibles
 * 
 * @example
 * const { 
 *   expandedIds, 
 *   isExpanded, 
 *   toggleExpanded, 
 *   expandAll, 
 *   collapseAll 
 * } = useExpandableState({ allowMultiple: true });
 * 
 * // En el render
 * categories.map(category => (
 *   <ExpandableCard
 *     key={category.id}
 *     title={category.name}
 *     expanded={isExpanded(category.id)}
 *     onToggle={() => toggleExpanded(category.id)}
 *   >
 *     Contenido
 *   </ExpandableCard>
 * ))
 * 
 * // Botones para expandir/colapsar todos
 * <button onClick={expandAll}>Expandir todos</button>
 * <button onClick={collapseAll}>Colapsar todos</button>
 */
export function useExpandableState({
  initialExpandedIds = [],
  initiallyAllExpanded = false,
  allowMultiple = false
}: UseExpandableStateOptions = {}) {
  // Estado para los IDs expandidos
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(
    initiallyAllExpanded
      ? new Set() // Se inicializará con expandAll si es necesario
      : new Set(initialExpandedIds)
  );
  
  // Verificar si un elemento está expandido
  const isExpanded = useCallback((id: string | number): boolean => {
    return expandedIds.has(id);
  }, [expandedIds]);
  
  // Expandir un elemento
  const expand = useCallback((id: string | number): void => {
    setExpandedIds(prevIds => {
      const newIds = allowMultiple
        ? new Set(prevIds)
        : new Set<string | number>();
      
      newIds.add(id);
      return newIds;
    });
  }, [allowMultiple]);
  
  // Colapsar un elemento
  const collapse = useCallback((id: string | number): void => {
    setExpandedIds(prevIds => {
      const newIds = new Set(prevIds);
      newIds.delete(id);
      return newIds;
    });
  }, []);
  
  // Alternar el estado expandido de un elemento
  const toggleExpanded = useCallback((id: string | number): void => {
    setExpandedIds(prevIds => {
      const newIds = allowMultiple
        ? new Set(prevIds)
        : new Set<string | number>();
      
      if (prevIds.has(id)) {
        if (allowMultiple) {
          newIds.delete(id);
        }
        // Si no se permite múltiples, ya tenemos un nuevo Set vacío
      } else {
        newIds.add(id);
      }
      
      return newIds;
    });
  }, [allowMultiple]);
  
  // Expandir todos los elementos proporcionados
  const expandAll = useCallback((allIds: (string | number)[] = []): void => {
    setExpandedIds(new Set(allIds));
  }, []);
  
  // Colapsar todos los elementos
  const collapseAll = useCallback((): void => {
    setExpandedIds(new Set());
  }, []);
  
  // Gestionar la inicialización de expandAll si se solicitó
  if (initiallyAllExpanded && expandedIds.size === 0) {
    // Nota: esto sólo se ejecutará en la primera renderización
    // No podemos expandirlos directamente porque aún no tenemos la lista
    // Se debe llamar a expandAll(allIds) cuando los datos estén disponibles
  }
  
  return {
    expandedIds: Array.from(expandedIds),
    expandedIdsSet: expandedIds,
    isExpanded,
    expand,
    collapse,
    toggleExpanded,
    expandAll,
    collapseAll
  };
} 
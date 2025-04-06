"use client";

import React from 'react';
import { IconType, ICONS } from '../../constants/iconConfig';
import { GridIcon, GridType } from '../../components/ui/grid/GridIcon';

/**
 * Tipos de resultado del hook useGridIcons
 */
interface UseGridIconsResult {
  /**
   * Obtiene el componente de ícono para un tipo específico
   * @param iconType - Tipo de ícono a obtener
   * @returns Componente React para el ícono solicitado
   */
  getIconComponent: (iconType: IconType) => React.ComponentType<React.SVGProps<SVGSVGElement>>;
  
  /**
   * Renderiza un ícono con los estilos apropiados para un tipo de grid
   * @param type - Tipo de grid (category, section, product)
   * @param icon - Tipo de ícono a renderizar
   * @param props - Propiedades adicionales para el ícono
   * @returns Componente de ícono renderizado
   */
  renderIcon: (type: GridType, icon: IconType, props?: Omit<React.ComponentProps<typeof GridIcon>, 'type' | 'icon'>) => React.ReactElement | null;
  
  /**
   * Verifica si un tipo de ícono está disponible
   * @param iconType - Tipo de ícono a verificar
   * @returns true si el ícono está disponible
   */
  isIconAvailable: (iconType: IconType) => boolean;
}

/**
 * Hook para manejar los íconos en componentes grid
 * 
 * Este hook centraliza la lógica de selección y renderizado de íconos,
 * facilitando cambios globales y manteniendo una experiencia visual consistente.
 * 
 * @example
 * // Uso básico
 * const { renderIcon } = useGridIcons();
 * return (
 *   <button>
 *     {renderIcon('category', 'edit', { size: 'small' })}
 *     Editar
 *   </button>
 * );
 * 
 * @returns {UseGridIconsResult} Funciones para trabajar con íconos
 */
export const useGridIcons = (): UseGridIconsResult => {
  /**
   * Obtiene el componente de ícono para un tipo específico
   */
  const getIconComponent = (iconType: IconType): React.ComponentType<React.SVGProps<SVGSVGElement>> => {
    return ICONS[iconType];
  };
  
  /**
   * Verifica si un tipo de ícono está disponible
   */
  const isIconAvailable = (iconType: IconType): boolean => {
    return !!ICONS[iconType];
  };
  
  /**
   * Renderiza un ícono con los estilos apropiados para un tipo de grid
   */
  const renderIcon = (
    type: GridType,
    icon: IconType,
    props?: Omit<React.ComponentProps<typeof GridIcon>, 'type' | 'icon'>
  ): React.ReactElement | null => {
    if (!isIconAvailable(icon)) {
      console.warn(`Icono "${icon}" no encontrado en la configuración`);
      return null;
    }
    
    return <GridIcon type={type} icon={icon} {...props} />;
  };
  
  return {
    getIconComponent,
    renderIcon,
    isIconAvailable
  };
};

export default useGridIcons; 
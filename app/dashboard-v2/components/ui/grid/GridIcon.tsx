"use client";

import React from 'react';
import { ICONS, IconType } from '../../../constants/iconConfig';

/**
 * Tipos de grid disponibles en el sistema
 */
export type GridType = 'category' | 'section' | 'product';

/**
 * Tamaños disponibles para los íconos
 */
export type IconSize = 'small' | 'medium' | 'large';

/**
 * Propiedades para el componente GridIcon
 * 
 * @typedef {Object} GridIconProps
 * @property {GridType} type - Tipo de grid ('category', 'section', 'product')
 * @property {IconType} icon - Tipo de ícono a mostrar
 * @property {IconSize} [size='medium'] - Tamaño del ícono
 * @property {string} [className] - Clases CSS adicionales
 * @property {React.MouseEventHandler<SVGSVGElement>} [onClick] - Manejador para el evento click
 * @property {string} [title] - Texto para el atributo title (tooltip)
 */
export interface GridIconProps {
  type: GridType;
  icon: IconType;
  size?: IconSize;
  className?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  title?: string;
}

/**
 * Componente para renderizar íconos con estilos consistentes según el tipo de grid
 * 
 * Este componente centraliza la visualización de íconos en los componentes grid,
 * facilitando cambios globales y manteniendo estilos consistentes. Utiliza el
 * archivo de configuración iconConfig.ts para determinar qué componente de ícono
 * renderizar para cada tipo de ícono.
 * 
 * @example
 * // Renderizar un ícono de edición para el grid de categorías
 * <GridIcon type="category" icon="edit" />
 * 
 * // Renderizar un ícono grande de visibilidad para el grid de secciones
 * <GridIcon type="section" icon="visibility" size="large" />
 * 
 * @param {GridIconProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de ícono con estilos apropiados
 */
export const GridIcon: React.FC<GridIconProps> = ({
  type,
  icon,
  size = 'medium',
  className = '',
  onClick,
  title
}) => {
  // Obtener el componente de ícono apropiado
  const IconComponent = ICONS[icon];
  
  if (!IconComponent) {
    console.warn(`Icono "${icon}" no encontrado en la configuración`);
    return null;
  }
  
  // Determinar las clases de tamaño
  const sizeClasses = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  };
  
  // Determinar las clases de color según el tipo de grid
  const colorClasses = {
    category: 'text-indigo-600 hover:text-indigo-800',
    section: 'text-teal-600 hover:text-teal-800',
    product: 'text-yellow-600 hover:text-yellow-800'
  };
  
  return (
    <IconComponent 
      className={`${sizeClasses[size]} ${onClick ? colorClasses[type] : ''} ${className}`}
      onClick={onClick}
      title={title}
      aria-hidden={!title}
    />
  );
};

export default GridIcon; 
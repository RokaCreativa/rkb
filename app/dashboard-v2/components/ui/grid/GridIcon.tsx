"use client";

/**
 * @fileoverview Componente de Iconos para Tablas y Grids
 * @author RokaMenu Team
 * @version 1.0.0
 * @description Este componente centraliza la visualización de iconos en las tablas y grids,
 *              proporcionando estilos consistentes según el tipo de grid y facilitando
 *              la administración global de iconos.
 */

import React from 'react';
import { ICONS, IconType } from '../../../constants/iconConfig';

/**
 * Tipos de grid disponibles en el sistema
 * Cada tipo de grid tiene sus propios estilos visuales
 * 
 * @typedef GridType
 */
export type GridType = 
  | 'category' // Grids para mostrar y gestionar categorías
  | 'section'  // Grids para mostrar y gestionar secciones
  | 'product';  // Grids para mostrar y gestionar productos

/**
 * Tamaños disponibles para los íconos
 * Controla las dimensiones del icono
 * 
 * @typedef IconSize
 */
export type IconSize = 
  | 'small'   // Iconos pequeños (16px)
  | 'medium'  // Iconos medianos (20px)
  | 'large';  // Iconos grandes (24px)

/**
 * Propiedades para el componente GridIcon
 * 
 * @interface GridIconProps
 * @property {GridType} type - Tipo de grid donde se mostrará el icono
 * @property {IconType} icon - Tipo de ícono a mostrar (definido en iconConfig.ts)
 * @property {IconSize} [size='medium'] - Tamaño del ícono
 * @property {string} [className] - Clases CSS adicionales
 * @property {React.MouseEventHandler<SVGSVGElement>} [onClick] - Función a ejecutar al hacer clic en el icono
 * @property {string} [title] - Texto para mostrar como tooltip al pasar el mouse
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
 * Componente GridIcon - Sistema centralizado de iconos para grids
 * 
 * Este componente proporciona una forma estandarizada de mostrar iconos en las tablas y grids
 * del dashboard con estilos consistentes según el tipo de entidad (categoría, sección, producto).
 * 
 * Ventajas de usar este componente:
 * - Centraliza la gestión de iconos en toda la aplicación
 * - Aplica automáticamente colores y tamaños según el contexto
 * - Facilita cambios globales de iconos (solo hay que modificar iconConfig.ts)
 * - Mantiene una identidad visual coherente por tipo de entidad
 * 
 * Los iconos se obtienen del objeto ICONS definido en constants/iconConfig.ts,
 * lo que permite cambiar globalmente cualquier icono modificando una sola ubicación.
 * 
 * @example
 * // Icono de edición para una categoría
 * <GridIcon type="category" icon="edit" onClick={handleEdit} />
 * 
 * // Icono grande de visibilidad para una sección con tooltip
 * <GridIcon type="section" icon="visibility" size="large" title="Ver sección" />
 * 
 * @param {GridIconProps} props - Las propiedades del componente
 * @returns {JSX.Element|null} El componente de icono o null si el icono no se encuentra
 */
export const GridIcon: React.FC<GridIconProps> = ({
  type,
  icon,
  size = 'medium',
  className = '',
  onClick,
  title
}) => {
  // Obtener el componente de icono desde la configuración central
  const IconComponent = ICONS[icon];
  
  // Si el icono no existe en la configuración, mostrar advertencia y no renderizar nada
  if (!IconComponent) {
    console.warn(`Icono "${icon}" no encontrado en la configuración`);
    return null;
  }
  
  /**
   * Mapa de clases CSS según el tamaño del icono
   * Estas clases definen las dimensiones exactas del icono
   */
  const sizeClasses = {
    small: 'h-3 w-3',    // 12px x 12px
    medium: 'h-4 w-4',   // 16px x 16px
    large: 'h-5 w-5'     // 20px x 20px
  };
  
  /**
   * Mapa de clases CSS de color según el tipo de grid
   * Cada tipo de entidad tiene su propio esquema de color para mantener
   * una identidad visual coherente en toda la aplicación
   */
  const colorClasses = {
    category: 'text-indigo-600 hover:text-indigo-800', // Morado/indigo para categorías
    section: 'text-teal-600 hover:text-teal-800',      // Verde azulado para secciones
    product: 'text-amber-600 hover:text-amber-800'     // Ámbar/naranja para productos
  };
  
  // Renderizar el componente de icono con las clases apropiadas
  return (
    <IconComponent 
      // Combinamos las clases de tamaño, color (solo si es clickeable) y clases adicionales
      className={`${sizeClasses[size]} ${onClick ? colorClasses[type] : ''} ${className}`}
      // Función para el evento click (si se proporciona)
      onClick={onClick}
      // Texto para tooltip (atributo title de HTML)
      title={title}
      // Atributo de accesibilidad: ocultar de lectores de pantalla si no tiene título
      aria-hidden={!title}
    />
  );
};

export default GridIcon; 
/**
 * @fileoverview Configuración centralizada de íconos para los componentes de grid
 * @author RokaMenu Team
 * @version 1.0.0
 * 
 * Este archivo centraliza la configuración de íconos utilizados en los componentes 
 * de grid (categorías, secciones, productos) del dashboard. Para cambiar un ícono
 * en toda la aplicación, simplemente se debe modificar su valor en este objeto.
 */

import {
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ViewColumnsIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';

/**
 * Tipos de íconos disponibles en el sistema
 */
export type IconType = 
  | 'expand'        // Icono para expandir un elemento
  | 'collapse'      // Icono para colapsar un elemento
  | 'edit'          // Icono para editar un elemento
  | 'delete'        // Icono para eliminar un elemento
  | 'visibility'    // Icono para elementos visibles
  | 'hidden'        // Icono para elementos ocultos
  | 'add'           // Icono para añadir nuevos elementos
  | 'drag'          // Icono para arrastrar/reordenar
  | 'column'        // Icono para encabezados de columna
  | 'moveUp'        // Icono para mover hacia arriba
  | 'moveDown'      // Icono para mover hacia abajo
  | 'photo';        // Icono para representar imágenes

/**
 * Mapa de íconos del sistema
 * 
 * Para cambiar globalmente un ícono, simplemente se debe actualizar
 * el valor correspondiente en este objeto.
 * 
 * @example
 * // Cambiar el ícono de visibilidad a un componente personalizado
 * export const ICONS = {
 *   // ... otros íconos
 *   visibility: MiIconoDeVisibilidadPersonalizado,
 * };
 */
export const ICONS = {
  expand: ChevronRightIcon,
  collapse: ChevronDownIcon,
  edit: PencilIcon,
  delete: TrashIcon,
  visibility: EyeIcon,
  hidden: EyeSlashIcon,
  add: PlusIcon,
  drag: Bars3Icon,
  column: ViewColumnsIcon,
  moveUp: ArrowUpIcon,
  moveDown: ArrowDownIcon,
  photo: PhotoIcon
}; 
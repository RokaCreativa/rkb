/**
 * Utilidad para combinar clases de Tailwind
 * 
 * Esta función combina múltiples strings de clases CSS,
 * eliminando duplicados y controlando condicionales.
 * Inspirado en la librería clsx/tailwind-merge.
 */

/**
 * Combina múltiples clases CSS, filtrando valores falsy
 * y uniendo todo en un único string separado por espacios.
 * 
 * @param inputs - Lista de strings de clases o expresiones condicionales
 * @returns String con todas las clases combinadas
 * 
 * @example
 * cn('text-red-500', isActive && 'bg-blue-200', 'p-4 rounded')
 * // Si isActive es true: 'text-red-500 bg-blue-200 p-4 rounded'
 * // Si isActive es false: 'text-red-500 p-4 rounded'
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs
    .filter(Boolean) // Elimina valores falsy (false, null, undefined, '', 0, NaN)
    .join(' ')
    .trim()
    .replace(/\s+/g, ' '); // Reemplaza múltiples espacios con uno solo
}

/**
 * Obtiene las clases correspondientes a una variante desde un mapa
 * 
 * @param variantMap - Mapa de variantes a clases
 * @param variant - Variante seleccionada
 * @param defaultVariant - Variante por defecto
 * @returns Clases CSS correspondientes a la variante
 * 
 * @example
 * const buttonVariants = {
 *   primary: 'bg-blue-500 text-white',
 *   secondary: 'bg-gray-200 text-gray-800',
 * };
 * 
 * getVariantClasses(buttonVariants, 'primary', 'secondary')
 * // 'bg-blue-500 text-white'
 */
export function getVariantClasses<T extends Record<string, string>>(
  variantMap: T,
  variant: keyof T | (string & {}),
  defaultVariant?: keyof T
): string {
  return variantMap[variant as keyof T] || 
         (defaultVariant ? variantMap[defaultVariant] : '');
} 
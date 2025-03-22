/**
 * Utilidades para manejar rutas de imágenes en la aplicación
 * 
 * Este archivo contiene funciones auxiliares para gestionar correctamente
 * las rutas de imágenes y evitar problemas de duplicación de prefijos.
 * 
 * @author GX
 * @date 2023-10-27 22:30
 */

/**
 * Devuelve una ruta de imagen válida y sin duplicaciones
 * 
 * Esta función:
 * 1. Maneja casos donde la imagen es nula devolviendo un placeholder
 * 2. Evita duplicación de rutas como /images/category/images/category/...
 * 3. Permite diferentes tipos de imágenes (categorías, productos, secciones)
 * 
 * @param imagePath Ruta de la imagen que puede estar completa o ser sólo el nombre
 * @param type Tipo de imagen (categoría, producto, sección)
 * @returns Ruta correcta sin duplicaciones
 */
export function getImagePath(
  imagePath: string | null, 
  type: 'categories' | 'products' | 'sections' = 'categories'
): string {
  // Si no hay imagen, devolver placeholder
  if (!imagePath) return '/placeholder.png';
  
  // Si la ruta ya incluye el prefijo completo, devolverla tal cual
  const prefixes = ['/images/categories/', '/images/products/', '/images/sections/'];
  if (prefixes.some(prefix => imagePath.startsWith(prefix))) {
    return imagePath;
  }
  
  // Si sólo tenemos el nombre del archivo, añadir el prefijo correcto
  return `/images/${type}/${imagePath}`;
}

/**
 * Manejador de errores para imágenes que no se pueden cargar
 * 
 * @param event Evento de error
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>): void {
  const target = event.target as HTMLImageElement;
  target.src = '/placeholder.png';
} 
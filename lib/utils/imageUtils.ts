/**
 * Utilidades para manejo de imágenes
 * 
 * Funciones para obtener rutas de imágenes y manejar errores
 * de carga de imágenes en la aplicación.
 */

/**
 * URL base para el servidor de imágenes
 */
export const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Obtiene la ruta completa de una imagen
 * 
 * @param path - Ruta relativa de la imagen
 * @param defaultImage - Imagen por defecto si path es null/undefined
 * @returns URL completa de la imagen
 */
export function getImagePath(
  path: string | null | undefined,
  defaultImage: string = '/images/no-image.png'
): string {
  // Si no hay ruta o es vacía, devolver imagen por defecto
  if (!path || path.trim() === '') {
    return defaultImage;
  }
  
  // Si la ruta ya es una URL completa, devolverla tal cual
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Si es una ruta local que comienza con /, devolverla tal cual
  if (path.startsWith('/') && !path.startsWith('/storage/')) {
    return path;
  }
  
  // Normalizar ruta si comienza con /storage/
  const normalizedPath = path.startsWith('/storage/') ? path : `/storage/${path}`;
  
  // Combinar con la URL base
  return `${IMAGE_BASE_URL}${normalizedPath}`;
}

/**
 * Maneja errores de carga de imágenes sustituyendo por una imagen de fallback
 * 
 * @param event - Evento de error de imagen
 * @param fallbackSrc - Ruta de la imagen de fallback
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = '/images/no-image.png'
): void {
  const imgElement = event.currentTarget;
  
  // Si ya estamos mostrando la imagen de fallback, no hacer nada
  if (imgElement.src === fallbackSrc || imgElement.src.endsWith(fallbackSrc)) {
    return;
  }
  
  // Cambiar a la imagen de fallback
  imgElement.src = fallbackSrc;
  
  // Opcional: Agregar clase para estilizar imágenes fallidas
  imgElement.classList.add('img-fallback');
  
  // Prevenir futuros errores con la imagen de fallback
  imgElement.onerror = null;
}

/**
 * Formatea el tamaño de un archivo para mostrar en interfaz
 * 
 * @param bytes - Tamaño en bytes
 * @param decimals - Número de decimales a mostrar
 * @returns String formateado (ej: "1.5 MB")
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
} 
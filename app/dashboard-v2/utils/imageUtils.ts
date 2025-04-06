/**
 * Utilidades para el manejo de imágenes en dashboard-v2
 * 
 * Este módulo implementa funciones para gestionar rutas de imágenes y
 * manejar errores de carga de manera consistente siguiendo los principios
 * de arquitectura limpia.
 * 
 * @module dashboard-v2/utils/imageUtils
 */

/**
 * Obtiene la ruta de imagen adecuada para un tipo específico
 * 
 * @param imageUrl URL o nombre de archivo de la imagen
 * @param type Tipo de imagen ('products', 'sections', 'categories', etc.)
 * @returns URL completa de la imagen
 */
export const getImagePath = (imageUrl: string | null, type: string): string => {
  if (!imageUrl) {
    console.log(`No image provided for ${type}, using placeholder`);
    return '/images/placeholder.png';
  }

  // Si ya es una URL completa, devolverla directamente
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/')) {
    return imageUrl;
  }

  // Construir la ruta según el tipo
  return `/images/${type}/${imageUrl}`;
}

/**
 * Maneja errores al cargar imágenes, estableciendo una imagen de marcador de posición
 * 
 * @param event Evento de error de la imagen
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>): void => {
  console.error('Error loading image:', event.currentTarget.src);
  event.currentTarget.src = '/images/placeholder.png';
  // Añadir clases para indicar que es una imagen de reemplazo
  event.currentTarget.classList.add('placeholder-image');
}

/**
 * Obtiene la URL de logo de cliente
 * 
 * @param logoPath Ruta o nombre de la imagen del logo
 * @returns Ruta completa del logo
 */
export function getClientLogoPath(logoPath: string | null | undefined): string | undefined {
  if (!logoPath) return undefined;
  return getImagePath(logoPath, 'clients');
}

/**
 * Obtiene la URL de logo principal de cliente
 * 
 * @param logoPath Ruta o nombre de la imagen del logo principal
 * @returns Ruta completa del logo principal
 */
export function getMainLogoPath(logoPath: string | null | undefined): string | undefined {
  if (!logoPath) return undefined;
  return getImagePath(logoPath, 'main_logo');
} 
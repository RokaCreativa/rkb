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
 * Normaliza la ruta de una imagen para asegurar que siempre sea una URL válida.
 * Si la ruta de la imagen ya es una URL completa (comienza con "http" o "/"),
 * la devuelve sin cambios. Si es solo un nombre de archivo, construye la ruta
 * completa usando el tipo de entidad (ej: /images/products/nombre.jpg).
 *
 * @param imagePath La ruta de la imagen desde la API (puede ser nombre o URL completa).
 * @param type El tipo de entidad ('categories', 'sections', 'products').
 * @returns Una URL de imagen siempre válida para usar en el frontend.
 */
export const getImagePath = (imagePath: string | null | undefined, type: 'categories' | 'sections' | 'products' | 'clients' | 'main_logo'): string => {
  const placeholder = '/images/placeholder.png';

  if (!imagePath) {
    return placeholder;
  }

  // Si ya es una URL completa o una ruta absoluta, la devolvemos tal cual.
  if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
    return imagePath;
  }

  // Si es solo un nombre de archivo, construimos la ruta.
  return `/images/${type}/${imagePath}`;
};

/**
 * Maneja errores al cargar imágenes, estableciendo una imagen de marcador de posición
 * 
 * @param event Evento de error de la imagen
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>): void => {
  const img = event.currentTarget;
  const currentSrc = img.src;

  // Prevenir bucles infinitos: si ya es un placeholder, no hacer nada
  if (currentSrc.includes('placeholder.png') || img.classList.contains('placeholder-image')) {
    console.warn('Placeholder image also failed to load, skipping replacement');
    return;
  }

  console.error('Error loading image:', currentSrc);
  img.src = '/images/placeholder.png';
  // Añadir clases para indicar que es una imagen de reemplazo
  img.classList.add('placeholder-image');
}

/**
 * Obtiene la URL de logo de cliente
 * 
 * @param logoPath Ruta o nombre de la imagen del logo
 * @returns Ruta completa del logo
 */
export function getClientLogoPath(logoPath: string | null | undefined): string {
  if (!logoPath) return '/images/placeholder.png';
  return getImagePath(logoPath, 'clients');
}

/**
 * Obtiene la URL de logo principal de cliente
 * 
 * @param logoPath Ruta o nombre de la imagen del logo principal
 * @returns Ruta completa del logo principal
 */
export function getMainLogoPath(logoPath: string | null | undefined): string {
  if (!logoPath) return '/images/placeholder.png';
  return getImagePath(logoPath, 'main_logo');
} 
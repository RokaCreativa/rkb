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
 * Obtiene la ruta correcta para una imagen según su tipo
 * 
 * Esta función:
 * 1. Maneja casos donde la imagen es nula devolviendo un placeholder
 * 2. Evita duplicación de rutas
 * 3. Construye correctamente las rutas según el tipo de imagen
 * 
 * @param imagePath Ruta o nombre de la imagen
 * @param type Tipo de imagen (categoría, producto, sección, etc.)
 * @returns Ruta completa y correcta de la imagen
 */
export function getImagePath(
  imagePath: string | null | undefined, 
  type: 'categories' | 'products' | 'sections' | 'clients' | 'main_logo' = 'categories'
): string {
  // Si no hay imagen, devolver placeholder
  if (!imagePath || imagePath.trim() === '') {
    return '/images/no-image.png';
  }
  
  // Si es una URL completa, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Mapeo de tipos a directorios
  const typeToDir: Record<string, string> = {
    'categories': 'categories',
    'products': 'products',
    'sections': 'sections',
    'clients': 'clientes',
    'main_logo': 'main_logo'
  };
  
  // Si la ruta ya incluye el prefijo completo, devolverla tal cual
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  // Construir la ruta correcta
  return `/images/${typeToDir[type]}/${imagePath}`;
}

/**
 * Maneja errores de carga de imágenes
 * 
 * Esta función se asigna al evento onError de imágenes para mostrar
 * una imagen de fallback cuando la imagen original no se puede cargar.
 * También incluye logging para facilitar la depuración.
 * 
 * @param event Evento de error de imagen
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>): void {
  const target = event.target as HTMLImageElement;
  console.debug(`[dashboard-v2] Error cargando imagen: ${target.src}`);
  
  // Comprobar si ya estamos mostrando la imagen de fallback
  if (target.src.includes('no-image.png')) {
    return; // Evitar bucle infinito
  }
  
  // Establecer imagen de fallback
  target.src = '/images/no-image.png';
  target.onerror = null; // Evitar bucle infinito
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
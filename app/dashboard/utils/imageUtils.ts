/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Utilidades de Gestión de Imágenes Centralizadas
 *
 * 📍 UBICACIÓN: utils/imageUtils.ts → Utilidades de Imágenes
 *
 * 🎯 PORQUÉ EXISTE:
 * Centraliza la lógica de manejo de rutas de imágenes y errores de carga para todas
 * las entidades del dashboard (categorías, secciones, productos, clientes). Resuelve
 * inconsistencias en rutas de imágenes y proporciona fallbacks robustos. Implementa
 * Mandamiento #3 (DRY) evitando duplicación de lógica de imágenes.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Componente UI → getImagePath(imagePath, type) → ESTA FUNCIÓN
 * 2. Normalización → URL completa vs nombre archivo vs null
 * 3. Construcción ruta → /images/{type}/{filename} si necesario
 * 4. Next.js Image → src normalizada → renderizado
 * 5. Error handling → handleImageError() → placeholder automático
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: GenericRow.tsx → getImagePath() para todas las imágenes
 * - ENTRADA: Todos los componentes con imágenes → import imageUtils
 * - SALIDA: Next.js Image component → src optimizada
 * - ERROR: handleImageError() → placeholder.png fallback
 * - TIPOS: 'categories' | 'sections' | 'products' | 'clients' | 'main_logo'
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #40 - Odisea de la Imagen):
 * - Antes: Rutas de imágenes inconsistentes y errores de carga sin manejo
 * - Error: URLs rotas, placeholders no funcionando, bucles infinitos
 * - Solución: Normalización centralizada + error handling robusto
 * - Beneficio: Imágenes consistentes + fallbacks automáticos
 * - Fecha: 2025-01-12 - Centralización gestión imágenes
 *
 * 🎯 CASOS DE USO REALES:
 * - imagePath: null → '/images/placeholder.png'
 * - imagePath: 'logo.jpg' → '/images/categories/logo.jpg'
 * - imagePath: '/images/custom/logo.jpg' → '/images/custom/logo.jpg' (sin cambios)
 * - imagePath: 'https://cdn.example.com/logo.jpg' → URL externa (sin cambios)
 * - Error de carga → handleImageError() → placeholder automático
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - getImagePath() SIEMPRE retorna string válido (nunca null)
 * - URLs absolutas (/ o http) se devuelven sin modificar
 * - Solo nombres de archivo se construyen con /images/{type}/
 * - handleImageError() previene bucles infinitos con clase CSS
 * - Placeholder por defecto: '/images/placeholder.png'
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: Estructura de carpetas /images/{type}/ en public/
 * - REQUIERE: placeholder.png existente en /images/
 * - REQUIERE: Next.js Image component como consumidor
 * - ROMPE SI: tipos no coinciden con carpetas backend
 * - ROMPE SI: placeholder.png no existe
 *
 * 📊 PERFORMANCE:
 * - Funciones puras → sin efectos secundarios
 * - String operations → O(1) para normalización
 * - Error handling → previene re-renders por imágenes rotas
 * - Next.js optimization → aprovecha optimización automática
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #3 (DRY): Centraliza lógica de imágenes en un lugar
 * - Mandamiento #8 (Calidad): Error handling robusto y predecible
 * - Mandamiento #6 (Consistencia): URLs uniformes en toda la app
 * - Mandamiento #7 (Separación): Utilidades separadas de componentes UI
 */

/**
 * Utilidades para el manejo de imágenes en dashboard
 * 
 * Este módulo implementa funciones para gestionar rutas de imágenes y
 * manejar errores de carga de manera consistente siguiendo los principios
 * de arquitectura limpia.
 * 
 * @module dashboard/utils/imageUtils
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
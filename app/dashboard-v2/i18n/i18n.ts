/**
 * @fileoverview Configuración del sistema de internacionalización
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-08-25
 * 
 * Este archivo configura el sistema de internacionalización (i18n) para RokaMenu
 * usando i18next y react-i18next. Permite la traducción dinámica de la interfaz
 * a múltiples idiomas manteniendo una base de código única.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar archivos de traducción
import esTranslation from './locales/es.json';
import enTranslation from './locales/en.json';

/**
 * Inicialización de i18next
 * 
 * Se configura con:
 * - Detector de idioma del navegador
 * - Soporte para carga dinámica de traducciones
 * - Integración con React
 * - Traducciones iniciales para español e inglés
 */
i18n
  // Cargar traducciones bajo demanda
  .use(Backend)
  // Detectar automáticamente el idioma del usuario
  .use(LanguageDetector)
  // Pasar i18n a react-i18next
  .use(initReactI18next)
  // Inicializar i18next
  .init({
    // Recursos de traducción precargados
    resources: {
      es: {
        translation: esTranslation
      },
      en: {
        translation: enTranslation
      }
    },
    // Opciones de configuración
    fallbackLng: 'es',        // Idioma por defecto si no se detecta ninguno
    debug: process.env.NODE_ENV === 'development',  // Modo debug solo en desarrollo
    interpolation: {
      escapeValue: false       // No escapar valores HTML en traducciones
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie']
    },
    react: {
      useSuspense: false     // Deshabilitar Suspense para evitar problemas con SSR
    }
  });

/**
 * Función para cambiar el idioma activo
 * @param lng Código del idioma ('es', 'en', etc.)
 */
export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
};

/**
 * Hook personalizado para obtener la función de traducción actual
 * (Esta función es una conveniencia para importación más simple)
 */
export const useTranslation = () => {
  return i18n.t.bind(i18n);
};

export default i18n; 
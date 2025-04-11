/**
 * @fileoverview Hook para facilitar el uso de i18n en los componentes
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-08-25
 * 
 * Este hook provee una interfaz unificada para acceder a las funcionalidades
 * de internacionalización (i18n) en los componentes de la aplicación.
 */

import { useTranslation as useI18nTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';

/**
 * Interfaces para el sistema de i18n
 */
export interface I18nState {
  currentLanguage: string;
  availableLanguages: string[];
  t: (key: string, options?: any) => string;
  changeLanguage: (language: string) => void;
}

/**
 * Hook personalizado para el sistema de i18n
 * 
 * Proporciona funciones para:
 * - Obtener traducciones
 * - Cambiar el idioma actual
 * - Consultar el idioma activo
 * - Obtener la lista de idiomas disponibles
 * 
 * @returns Objeto con las funciones y estado del sistema i18n
 */
export function useI18n(): I18nState {
  // Usar el hook de react-i18next
  const { t } = useI18nTranslation();
  
  /**
   * Obtiene el idioma actual del usuario
   * @returns Código del idioma actual (ej: 'es', 'en')
   */
  const getCurrentLanguage = (): string => {
    return i18n.language || 'es';
  };

  /**
   * Obtiene la lista de idiomas disponibles
   * @returns Lista de códigos de idiomas disponibles
   */
  const getAvailableLanguages = (): string[] => {
    // Por ahora solo español e inglés, pero se pueden añadir más
    return ['es', 'en'];
  };

  /**
   * Cambia el idioma de la aplicación
   * @param language Código del idioma a activar
   */
  const changeLanguage = (language: string): void => {
    if (getAvailableLanguages().includes(language)) {
      i18n.changeLanguage(language);
      // Guardar preferencia en localStorage para persistencia
      localStorage.setItem('i18nextLng', language);
    } else {
      console.warn(`Idioma '${language}' no disponible. Idiomas disponibles: ${getAvailableLanguages().join(', ')}`);
    }
  };
  
  // Devolver el estado y funciones
  return {
    currentLanguage: getCurrentLanguage(),
    availableLanguages: getAvailableLanguages(),
    t, // Función de traducción
    changeLanguage
  };
} 
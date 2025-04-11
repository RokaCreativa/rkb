"use client";

/**
 * @fileoverview Componente para cambiar el idioma de la aplicación
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-08-25
 * 
 * Este componente permite al usuario cambiar entre los idiomas disponibles
 * en la aplicación (español e inglés).
 */

import React from 'react';
import { useI18n } from '../../hooks/ui/useI18n';

// Mapa de nombres de idiomas
const LANGUAGE_NAMES: Record<string, string> = {
  es: 'Español',
  en: 'English'
};

// Mapa de banderas de idiomas (emojis)
const LANGUAGE_FLAGS: Record<string, string> = {
  es: '🇪🇸',
  en: '🇬🇧'
};

interface LanguageSwitcherProps {
  /**
   * Estilo adicional para el componente
   */
  className?: string;
  
  /**
   * Indica si se debe mostrar el texto del idioma junto a la bandera
   */
  showText?: boolean;
  
  /**
   * Indica si se debe mostrar como un menú desplegable o botones
   */
  variant?: 'dropdown' | 'buttons';
  
  /**
   * Tamaño del componente
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente para cambiar el idioma de la aplicación
 * 
 * @param props Propiedades del componente
 * @returns Componente React
 */
export default function LanguageSwitcher({
  className = '',
  showText = true,
  variant = 'dropdown',
  size = 'md'
}: LanguageSwitcherProps) {
  // Obtener funciones y estado de i18n
  const { currentLanguage, availableLanguages, changeLanguage } = useI18n();
  
  // Función para manejar el cambio de idioma
  const handleLanguageChange = (language: string) => {
    changeLanguage(language);
  };
  
  // Tamaños de fuente según el tamaño del componente
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  // Si el variant es 'dropdown', mostrar un menú desplegable
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={currentLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className={`appearance-none rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${sizeClasses[size]}`}
          aria-label="Cambiar idioma"
        >
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {LANGUAGE_FLAGS[lang]} {showText && LANGUAGE_NAMES[lang]}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
          </svg>
        </div>
      </div>
    );
  }
  
  // Si el variant es 'buttons', mostrar botones para cada idioma
  return (
    <div className={`flex space-x-2 ${className}`}>
      {availableLanguages.map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`px-3 py-2 rounded-md transition-colors ${
            currentLanguage === lang
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          } ${sizeClasses[size]}`}
          aria-label={`Cambiar a ${LANGUAGE_NAMES[lang]}`}
          title={LANGUAGE_NAMES[lang]}
        >
          <span className="mr-1">{LANGUAGE_FLAGS[lang]}</span>
          {showText && <span>{LANGUAGE_NAMES[lang]}</span>}
        </button>
      ))}
    </div>
  );
} 
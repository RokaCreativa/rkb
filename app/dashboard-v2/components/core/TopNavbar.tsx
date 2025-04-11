"use client";

import React, { useState } from 'react';
import { PaintBrushIcon, PhoneIcon, LanguageIcon, Bars3Icon } from '@heroicons/react/24/outline';
import CustomizationModal from '@/app/dashboard-v2/components/modals/CustomizationModal';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import MobileMenu from '../ui/MobileMenu';
import { useI18n } from '../../hooks/ui/useI18n';

interface TopNavbarProps {
  isReorderModeActive?: boolean;
  onToggleReorderMode?: () => void;
  clientLogo?: string | null;
  clientName?: string;
}

/**
 * Barra de navegación superior del dashboard
 * Incluye soporte para menú móvil colapsable en pantallas pequeñas
 * 
 * @param props Propiedades del componente
 * @returns Componente React
 */
export function TopNavbar({ 
  isReorderModeActive = false, 
  onToggleReorderMode = () => {},
  clientLogo = null,
  clientName = 'RokaMenu'
}: TopNavbarProps) {
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  // Estado para controlar la visibilidad del menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useI18n(); // Hook para traducciones
  
  // Función para mostrar/ocultar la vista previa
  const handleTogglePreview = () => {
    // Disparar evento personalizado para activar la vista previa
    window.dispatchEvent(new Event('toggle-preview'));
  };
  
  // Función para manejar el reordenamiento con logs
  const handleReorderModeToggle = () => {
    console.log('🔄 [REORDER DEBUG] Botón de reordenamiento clickeado');
    console.log('🔄 [REORDER DEBUG] Estado actual isReorderModeActive:', isReorderModeActive);
    console.log('🔄 [REORDER DEBUG] Cambio a:', !isReorderModeActive);
    
    // Llamar a la función original para activar/desactivar el modo
    onToggleReorderMode();
  };
  
  return (
    <>
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo y menú izquierdo */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src="/images/logo_rokamenu.png" alt="RokaMenu" />
                {clientName && (
                  <div className="ml-4 px-3 py-1 border-l border-gray-200 hidden sm:block">
                    <span className="text-sm font-medium text-gray-900">{clientName}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Menú derecho */}
            <div className="flex items-center">
              {/* Botón de menú hamburguesa - visible solo en móviles */}
              <div className="sm:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-expanded="false"
                >
                  <span className="sr-only">{t('navigation.openMenu')}</span>
                  <Bars3Icon className="block h-8 w-8" aria-hidden="true" />
                </button>
              </div>
              
              {/* Selector de idioma - visible en todos los tamaños */}
              <div className="mr-4 flex items-center">
                <LanguageSwitcher 
                  variant="dropdown" 
                  showText={false}
                  size="sm"
                  className="mr-2"
                />
              </div>
              
              {/* Botones de acción - visibles solo en tablets/desktop */}
              <div className="hidden sm:flex sm:items-center">
                {/* Botón de vista previa */}
                <button
                  type="button"
                  onClick={handleTogglePreview}
                  className="inline-flex items-center px-3 py-2 border border-indigo-100 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PhoneIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  {t('dashboard.preview')}
                </button>
                
                {/* Botón de personalización */}
                <button
                  type="button"
                  onClick={() => setIsCustomizationModalOpen(true)}
                  className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PaintBrushIcon className="h-5 w-5 mr-2 text-gray-500" />
                  {t('dashboard.customize')}
                </button>
                
                {/* Botón de modo reordenamiento - solo mostrar si se proporciona la función */}
                {onToggleReorderMode !== undefined && (
                  <button
                    type="button"
                    onClick={handleReorderModeToggle}
                    className={`ml-3 inline-flex items-center px-4 py-2 border ${
                      isReorderModeActive 
                        ? 'bg-red-100 border-red-300 text-red-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    } text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    <svg 
                      className={`-ml-1 mr-2 h-5 w-5 ${isReorderModeActive ? 'text-red-500' : 'text-gray-500'}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    {isReorderModeActive ? t('dragAndDrop.disableReorderMode') : t('dragAndDrop.reorderMode')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal de personalización */}
        <CustomizationModal 
          isOpen={isCustomizationModalOpen} 
          onClose={() => setIsCustomizationModalOpen(false)} 
        />
      </div>
      
      {/* Menú móvil */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        clientName={clientName}
        clientLogo={clientLogo}
      >
        {/* Contenido personalizado para el menú móvil */}
        <nav className="flex flex-col space-y-1">
          {/* Acción: Vista previa - acción implementada */}
          <button
            onClick={() => {
              handleTogglePreview();
              setIsMobileMenuOpen(false);
            }}
            className="text-base py-4 px-4 rounded-md hover:bg-gray-100 flex items-center justify-start w-full text-left"
          >
            <PhoneIcon className="h-6 w-6 mr-3 text-indigo-500" />
            {t('dashboard.preview')}
          </button>
          
          {/* Acción: Personalizar - acción implementada */}
          <button
            onClick={() => {
              setIsCustomizationModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="text-base py-4 px-4 rounded-md hover:bg-gray-100 flex items-center justify-start w-full text-left"
          >
            <PaintBrushIcon className="h-6 w-6 mr-3 text-gray-500" />
            {t('dashboard.customize')}
          </button>
          
          {/* Acción: Modo reordenamiento - solo mostrar si se proporciona la función */}
          {onToggleReorderMode !== undefined && (
            <button
              onClick={() => {
                handleReorderModeToggle();
                setIsMobileMenuOpen(false);
              }}
              className={`text-base py-4 px-4 rounded-md hover:bg-gray-100 flex items-center justify-start w-full text-left ${
                isReorderModeActive ? 'bg-red-50' : ''
              }`}
            >
              <svg 
                className={`h-6 w-6 mr-3 ${isReorderModeActive ? 'text-red-500' : 'text-gray-500'}`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              {isReorderModeActive ? t('dragAndDrop.disableReorderMode') : t('dragAndDrop.reorderMode')}
            </button>
          )}
        </nav>
      </MobileMenu>
    </>
  );
} 
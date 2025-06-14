"use client";

/**
 * @fileoverview Barra de navegación superior del dashboard con soporte móvil mejorado
 * @author RokaMenu Team
 * @version 1.2.0
 * @updated 2025-04-11
 * @changelog Integración completa con menú móvil optimizado
 */

import React, { useState, useCallback } from 'react';
import { 
  PaintBrushIcon, 
  PhoneIcon, 
  LanguageIcon, 
  Bars3Icon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import CustomizationModal from '@/app/dashboard-v2/components/modals/CustomizationModal';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import MobileMenu, { MenuItem } from '../ui/MobileMenu';
import { useI18n } from '../../hooks/ui/useI18n';

/**
 * Props para el componente TopNavbar
 * @interface TopNavbarProps
 */
interface TopNavbarProps {
  /** Indica si el modo de reordenamiento está activo */
  isReorderModeActive?: boolean;
  /** Función para alternar el modo de reordenamiento */
  onToggleReorderMode?: () => void;
  /** URL del logo del cliente (opcional) */
  clientLogo?: string | null;
  /** Nombre del cliente */
  clientName?: string;
}

/**
 * Barra de navegación superior del dashboard
 * Incluye soporte completo para menú móvil colapsable optimizado
 * 
 * @param {TopNavbarProps} props - Propiedades del componente
 * @returns Componente React
 */
export function TopNavbar({ 
  isReorderModeActive = false, 
  onToggleReorderMode = () => {},
  clientLogo = null,
  clientName = 'RokaMenu'
}: TopNavbarProps) {
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useI18n(); // Hook para traducciones
  
  /**
   * Activa/desactiva la vista previa móvil
   * Dispara un evento personalizado que es capturado por el componente de vista previa
   */
  const handleTogglePreview = useCallback(() => {
    // Disparar evento personalizado para activar la vista previa
    window.dispatchEvent(new Event('toggle-preview'));
  }, []);
  
  /**
   * Maneja la activación/desactivación del modo de reordenamiento
   * Incluye logs de depuración para diagnóstico
   */
  const handleReorderModeToggle = useCallback(() => {
    console.log('🔄 [REORDER DEBUG] Botón de reordenamiento clickeado');
    console.log('🔄 [REORDER DEBUG] Estado actual isReorderModeActive:', isReorderModeActive);
    console.log('🔄 [REORDER DEBUG] Cambio a:', !isReorderModeActive);
    
    // Llamar a la función original para activar/desactivar el modo
    onToggleReorderMode();
  }, [isReorderModeActive, onToggleReorderMode]);
  
  /**
   * Cierra el menú móvil
   */
  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);
  
  // Definir los elementos del menú móvil
  const mobileMenuItems: MenuItem[] = [
    {
      id: 'preview',
      label: t('dashboard.preview'),
      icon: <PhoneIcon className="h-6 w-6 text-indigo-500" />,
      onClick: () => {
        handleTogglePreview();
        handleCloseMobileMenu();
      }
    },
    {
      id: 'customize',
      label: t('dashboard.customize'),
      icon: <PaintBrushIcon className="h-6 w-6 text-gray-500" />,
      onClick: () => {
        setIsCustomizationModalOpen(true);
        handleCloseMobileMenu();
      }
    }
  ];
  
  // Añadir el botón de reordenamiento solo si la función está disponible
  if (onToggleReorderMode !== undefined) {
    mobileMenuItems.push({
      id: 'reorder',
      label: isReorderModeActive ? t('dragAndDrop.disableReorderMode') : t('dragAndDrop.reorderMode'),
      icon: (
        <ArrowPathIcon 
          className={`h-6 w-6 ${isReorderModeActive ? 'text-red-500' : 'text-gray-500'}`} 
        />
      ),
      isActive: isReorderModeActive,
      onClick: handleReorderModeToggle
    });
  }
  
  return (
    <>
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo y menú izquierdo */}
            <div className="flex">
              <div className="shrink-0 flex items-center">
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
              {/* Botón de menú hamburguesa optimizado para móviles */}
              <div className="sm:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-3 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 touch-action-manipulation"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-expanded={isMobileMenuOpen}
                  aria-label={t('navigation.openMenu')}
                >
                  <span className="sr-only">{t('navigation.openMenu')}</span>
                  <Bars3Icon className="h-7 w-7" aria-hidden="true" />
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
                  className="inline-flex items-center px-3 py-2 border border-indigo-100 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-0 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PhoneIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  {t('dashboard.preview')}
                </button>
                
                {/* Botón de personalización */}
                <button
                  type="button"
                  onClick={() => setIsCustomizationModalOpen(true)}
                  className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-0 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                    } text-sm font-medium rounded-md shadow-sm focus:outline-0 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    <ArrowPathIcon 
                      className={`h-5 w-5 mr-2 ${isReorderModeActive ? 'text-red-500' : 'text-gray-500'}`} 
                    />
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
      
      {/* Menú móvil optimizado */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
        clientName={clientName}
        clientLogo={clientLogo}
        position="right"
        maxWidth={300}
        menuItems={mobileMenuItems}
      />
    </>
  );
} 
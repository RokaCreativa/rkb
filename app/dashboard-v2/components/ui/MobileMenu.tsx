"use client";

/**
 * @fileoverview Componente de Menú Móvil Colapsable Optimizado
 * @author RokaMenu Team
 * @version 1.1.0
 * @updated 2025-04-11
 * @description Este componente implementa un menú lateral adaptado para dispositivos móviles,
 *              con soporte para gestos táctiles, animaciones fluidas y estructura visual optimizada.
 *              Es ideal para proporcionar navegación accesible en pantallas pequeñas.
 */

import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, HomeIcon, Cog6ToothIcon, UserIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useI18n } from '@/app/dashboard-v2/hooks/ui/useI18n';

/**
 * Posición del menú móvil en la pantalla
 * Determina si el menú se desliza desde la izquierda o desde la derecha
 * 
 * @typedef MobileMenuPosition
 */
export type MobileMenuPosition = 'left' | 'right';

/**
 * Estructura de un elemento de menú
 * Define cómo se representa y comporta cada opción en el menú móvil
 * 
 * @interface MenuItem
 */
export interface MenuItem {
  /** Identificador único del elemento (para key de React) */
  id: string;
  /** Texto visible que se muestra en el menú */
  label: string;
  /** Componente de icono a mostrar junto al texto */
  icon?: React.ReactNode;
  /** Función que se ejecuta al hacer clic en el elemento */
  onClick?: () => void;
  /** Indica si el elemento está actualmente seleccionado/activo */
  isActive?: boolean;
  /** Color personalizado para el icono (sobreescribe el estilo predeterminado) */
  iconColor?: string;
}

/**
 * Propiedades para el componente de menú móvil
 * 
 * @interface MobileMenuProps
 */
interface MobileMenuProps {
  /** Indica si el menú está abierto (visible) o cerrado */
  isOpen: boolean;
  /** Función que se llama cuando el usuario cierra el menú */
  onClose: () => void;
  /** Nombre del restaurante o negocio que se mostrará en la cabecera */
  clientName?: string;
  /** URL de la imagen del logo a mostrar en la cabecera */
  clientLogo?: string | null;
  /** Posición desde donde se desliza el menú ('left' o 'right') */
  position?: MobileMenuPosition;
  /** Array de elementos personalizados para el menú */
  menuItems?: MenuItem[];
  /** Contenido personalizado para el cuerpo del menú (alternativa a menuItems) */
  children?: React.ReactNode;
  /** Ancho máximo del panel del menú en píxeles */
  maxWidth?: number;
}

/**
 * Componente MobileMenu - Menú deslizable para dispositivos móviles
 * 
 * Este componente implementa un menú lateral optimizado para dispositivos móviles con:
 * - Transiciones y animaciones suaves al abrir/cerrar
 * - Soporte para gestos táctiles (deslizar para cerrar)
 * - Adaptable a ambos lados de la pantalla (izquierda o derecha)
 * - Diseño visual moderno con cabecera, contenido y pie personalizables
 * - Fondo con efecto blur para mejorar la legibilidad
 * - Optimizaciones específicas para pantallas táctiles
 * 
 * El menú puede contener elementos predefinidos (menuItems) o contenido completamente
 * personalizado (mediante la prop children).
 * 
 * @example
 * // Menú básico con elementos predeterminados
 * <MobileMenu isOpen={isMenuOpen} onClose={handleClose} />
 * 
 * // Menú personalizado con elementos específicos
 * <MobileMenu 
 *   isOpen={isMenuOpen} 
 *   onClose={handleClose}
 *   position="left"
 *   clientName="Mi Restaurante"
 *   clientLogo="/img/logo.png"
 *   menuItems={[
 *     { id: 'home', label: 'Inicio', icon: <HomeIcon />, isActive: true },
 *     { id: 'menu', label: 'Menú', icon: <MenuIcon />, onClick: navigateToMenu }
 *   ]}
 * />
 * 
 * @param {MobileMenuProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente de menú móvil
 */
export default function MobileMenu({
  isOpen,
  onClose,
  clientName = 'RokaMenu',
  clientLogo = null,
  position = 'right',
  menuItems,
  children,
  maxWidth = 320,
}: MobileMenuProps) {
  // Hook para traducciones
  const { t } = useI18n(); 
  
  // Referencias para manejar gestos táctiles
  const touchStartX = useRef<number | null>(null);
  const touchMoveX = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Estado para controlar la visualización de indicadores de elementos activos
  const [showActiveIndicator, setShowActiveIndicator] = useState(true);
  
  /**
   * Manejador del evento touchstart
   * Guarda la posición X inicial del toque
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  /**
   * Manejador del evento touchmove
   * Actualiza la posición X actual del toque
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    touchMoveX.current = e.touches[0].clientX;
  };
  
  /**
   * Manejador del evento touchend
   * Calcula la dirección y distancia del deslizamiento para determinar
   * si el usuario intentó cerrar el menú con un gesto
   */
  const handleTouchEnd = () => {
    // Solo procesar si tenemos posiciones inicial y final
    if (touchStartX.current && touchMoveX.current) {
      // Calcular la distancia del deslizamiento horizontal
      const deltaX = touchMoveX.current - touchStartX.current;
      
      // Cerrar el menú si se cumple la condición según la posición:
      // - Para menú a la derecha: deslizar hacia la derecha (deltaX > 0)
      // - Para menú a la izquierda: deslizar hacia la izquierda (deltaX < 0)
      // La distancia debe ser suficiente (>100px) para confirmar la intención
      if ((position === 'right' && deltaX > 100) || 
          (position === 'left' && deltaX < -100)) {
        onClose();
      }
    }
    
    // Resetear valores para el próximo gesto
    touchStartX.current = null;
    touchMoveX.current = null;
  };
  
  /**
   * Efecto para controlar el scroll del body
   * Evita que se pueda hacer scroll en el fondo cuando el menú está abierto
   */
  useEffect(() => {
    if (isOpen) {
      // Bloquear scroll del body cuando el menú está abierto
      document.body.classList.add('overflow-hidden');
    } else {
      // Permitir scroll cuando el menú está cerrado
      document.body.classList.remove('overflow-hidden');
    }
    
    // Cleanup: asegurar que se elimina la clase al desmontar el componente
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);
  
  /**
   * Elementos de menú por defecto
   * Se utilizan cuando no se proporcionan elementos personalizados
   */
  const defaultMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: t('navigation.dashboard'),
      icon: <HomeIcon className="h-6 w-6 text-indigo-600" />,
      isActive: true
    },
    {
      id: 'menu',
      label: t('navigation.menu'),
      icon: <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
    },
    {
      id: 'settings',
      label: t('navigation.settings'),
      icon: <Cog6ToothIcon className="h-6 w-6 text-indigo-600" />
    },
    {
      id: 'statistics',
      label: t('navigation.statistics'),
      icon: <ChartBarIcon className="h-6 w-6 text-indigo-600" />
    },
    {
      id: 'profile',
      label: t('navigation.profile'),
      icon: <UserIcon className="h-6 w-6 text-indigo-600" />
    }
  ];
  
  // Determinar qué elementos de menú mostrar (personalizados o predeterminados)
  const itemsToShow = menuItems || defaultMenuItems;
  
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      {/* Dialog de Headless UI para gestionar el modal */}
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay de fondo con animación de fade */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Fondo semi-transparente con blur que cubre toda la pantalla */}
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        {/* Contenedor para el panel deslizable */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {/* Contenedor posicionado según la propiedad 'position' */}
            <div 
              className={`pointer-events-none fixed inset-y-0 ${position}-0 flex max-w-full ${
                position === 'left' ? 'pr-10' : 'pl-10'
              }`}
            >
              {/* Animación de deslizamiento del panel */}
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom={position === 'right' ? 'translate-x-full' : '-translate-x-full'}
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-x-0"
                leaveTo={position === 'right' ? 'translate-x-full' : '-translate-x-full'}
              >
                {/* Panel principal del menú */}
                <Dialog.Panel 
                  className={`pointer-events-auto relative w-screen max-w-sm`}
                  style={{ maxWidth: `${maxWidth}px` }} // Ancho personalizable
                  ref={panelRef}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Contenedor principal con estilos y bordes redondeados */}
                  <div className={`flex h-full flex-col overflow-y-auto bg-white shadow-2xl ${
                    position === 'right' ? 'rounded-l-2xl' : 'rounded-r-2xl'
                  }`}>
                    {/* Cabecera del menú con logo y nombre del cliente */}
                    <div className="px-6 pt-6 pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-semibold leading-6 text-gray-900">
                          <div className="flex items-center">
                            {/* Logo del cliente o logo predeterminado */}
                            <img 
                              className="h-8 w-auto" 
                              src={clientLogo || "/images/logo_rokamenu.png"} 
                              alt={clientName} 
                            />
                            {/* Nombre del cliente (si existe) */}
                            {clientName && (
                              <div className="ml-4 px-3 py-1 border-l border-gray-200">
                                <span className="text-sm font-medium text-gray-900">{clientName}</span>
                              </div>
                            )}
                          </div>
                        </Dialog.Title>
                        
                        {/* Botón para cerrar el menú */}
                        <div className="ml-3 flex h-12 w-12 items-center justify-center rounded-full touch-action-manipulation">
                          <button
                            type="button"
                            className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onClick={onClose}
                          >
                            <span className="sr-only">{t('common.close')}</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contenido principal del menú */}
                    <div className="relative flex-1 px-6 py-6">
                      {/* Renderizar contenido personalizado o elementos de menú predeterminados */}
                      {children ? (
                        <div className="space-y-6">{children}</div>
                      ) : (
                        <nav className="flex flex-col space-y-1">
                          {/* Mapear y renderizar cada elemento del menú */}
                          {itemsToShow.map((item) => (
                            <div key={item.id} className="relative">
                              {/* Indicador visual para el elemento activo */}
                              {showActiveIndicator && item.isActive && (
                                <div className="absolute left-0 top-1/2 w-1 h-8 bg-indigo-600 rounded-r-full transform -translate-y-1/2" />
                              )}
                              {/* Botón del elemento de menú */}
                              <button
                                onClick={() => {
                                  if (item.onClick) {
                                    item.onClick();
                                    onClose(); // Cerrar el menú después de hacer clic
                                  }
                                }}
                                className={`group relative w-full text-base py-4 px-4 rounded-lg flex items-center justify-start text-left transition-all duration-150 ${
                                  item.isActive 
                                    ? 'bg-indigo-50 text-indigo-800 font-medium' 
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {/* Icono del elemento de menú */}
                                <span className="mr-4 flex-shrink-0">
                                  {item.icon || <div className="w-6 h-6" />}
                                </span>
                                
                                {/* Texto del elemento de menú */}
                                <span className="truncate">{item.label}</span>
                                
                                {/* Texto para lectores de pantalla si el elemento está activo */}
                                {item.isActive && (
                                  <span className="sr-only">(actual)</span>
                                )}
                              </button>
                            </div>
                          ))}
                        </nav>
                      )}
                    </div>
                    
                    {/* Pie del menú con información de versión y copyright */}
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>v2.0</span>
                        <span>© 2025 RokaMenu</span>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 
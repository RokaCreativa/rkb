"use client";

import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useI18n } from '@/app/dashboard-v2/hooks/ui/useI18n';

/**
 * Interfaz para las propiedades del menú móvil
 * @interface MobileMenuProps
 * @property {boolean} isOpen - Indica si el menú está abierto
 * @property {Function} onClose - Función para cerrar el menú
 * @property {string} clientName - Nombre del cliente actual
 * @property {string|null} clientLogo - URL del logo del cliente (opcional)
 * @property {React.ReactNode} [children] - Elementos hijos para el contenido del menú
 */
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
  clientLogo?: string | null;
  children?: React.ReactNode;
}

/**
 * Componente de menú móvil colapsable.
 * Implementa un panel deslizable con opciones de navegación
 * y controles optimizados para dispositivos móviles.
 * 
 * @param {MobileMenuProps} props Propiedades del componente
 * @returns Componente React
 */
export default function MobileMenu({
  isOpen,
  onClose,
  clientName = 'RokaMenu',
  clientLogo = null,
  children
}: MobileMenuProps) {
  const { t } = useI18n(); // Hook para traducciones
  
  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    // Cleanup al desmontar
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay de fondo oscuro */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        {/* Panel deslizable */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    {/* Cabecera del menú */}
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                          <div className="flex items-center">
                            <img className="h-8 w-auto" src="/images/logo_rokamenu.png" alt="RokaMenu" />
                            {clientName && (
                              <div className="ml-4 px-3 py-1 border-l border-gray-200">
                                <span className="text-sm font-medium text-gray-900">{clientName}</span>
                              </div>
                            )}
                          </div>
                        </Dialog.Title>
                        {/* Botón de cierre - área táctil optimizada */}
                        <div className="ml-3 flex h-12 w-12 items-center justify-center rounded-full">
                          <button
                            type="button"
                            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={onClose}
                          >
                            <span className="sr-only">{t('common.close')}</span>
                            <XMarkIcon className="h-8 w-8" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contenido del menú */}
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <div className="space-y-6">
                        {/* Si se proporcionan hijos, renderizarlos. De lo contrario, mostrar opciones por defecto */}
                        {children || (
                          <nav className="flex flex-col space-y-3">
                            <a href="#" className="text-lg py-3 px-4 rounded-md hover:bg-gray-100 flex items-center">
                              <span className="mr-3 text-indigo-600">🏠</span> {t('navigation.dashboard')}
                            </a>
                            <a href="#" className="text-lg py-3 px-4 rounded-md hover:bg-gray-100 flex items-center">
                              <span className="mr-3 text-indigo-600">🧾</span> {t('navigation.menu')}
                            </a>
                            <a href="#" className="text-lg py-3 px-4 rounded-md hover:bg-gray-100 flex items-center">
                              <span className="mr-3 text-indigo-600">⚙️</span> {t('navigation.settings')}
                            </a>
                            <a href="#" className="text-lg py-3 px-4 rounded-md hover:bg-gray-100 flex items-center">
                              <span className="mr-3 text-indigo-600">📊</span> {t('navigation.statistics')}
                            </a>
                            <a href="#" className="text-lg py-3 px-4 rounded-md hover:bg-gray-100 flex items-center">
                              <span className="mr-3 text-indigo-600">👤</span> {t('navigation.profile')}
                            </a>
                            <a href="#" className="text-lg py-3 px-4 rounded-md hover:bg-gray-100 flex items-center">
                              <span className="mr-3 text-indigo-600">📱</span> {t('navigation.preview')}
                            </a>
                          </nav>
                        )}
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
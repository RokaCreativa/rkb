"use client";

/**
 * @fileoverview Componente de vista previa móvil flotante para el menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import React, { useState, useRef, useEffect } from 'react';
import { PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Draggable from 'react-draggable';
import { Category, Section, Product } from "@/app/types/menu";
import Image from 'next/image';
import { ChevronLeft, Globe, Clock, Wifi, Battery } from 'lucide-react';

/**
 * Props para el componente FloatingPhonePreview
 */
interface FloatingPhonePreviewProps {
  clientName: string;
  clientLogo?: string;
  clientMainLogo?: string;
  categories: Category[];
  selectedCategory: Category | null;
  selectedSection: Section | null;
  language?: string;
  sections: Record<number, Section[]>;
  products: Record<number, Product[]>;
}

/**
 * Componente de vista previa del móvil flotante y arrastrable
 * 
 * Muestra una previsualización del menú en un dispositivo móvil que se puede mover por la pantalla.
 * Se activa mediante un botón flotante y permite visualizar categorías, secciones y productos.
 * 
 * @param {FloatingPhonePreviewProps} props - Propiedades del componente
 * @returns {JSX.Element} El componente de vista previa móvil flotante
 */
export default function FloatingPhonePreview({ 
  clientName, 
  clientLogo,
  clientMainLogo,
  categories = [],
  selectedCategory = null,
  selectedSection = null,
  language = "Español",
  sections = {},
  products = {}
}: FloatingPhonePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  
  // Estados para navegación
  const [currentScreen, setCurrentScreen] = useState<'home' | 'category' | 'section'>('home');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [logoError, setLogoError] = useState<boolean>(false);
  const [mainLogoError, setMainLogoError] = useState<boolean>(false);
  
  // Efecto para escuchar el evento personalizado para activar la vista previa
  useEffect(() => {
    const handleTogglePreview = () => {
      setIsPreviewOpen(prev => !prev);
    };
    
    // Escuchar el evento personalizado
    window.addEventListener('toggle-preview', handleTogglePreview);
    
    // Limpiar el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('toggle-preview', handleTogglePreview);
    };
  }, []);

  // Actualizar la hora actual cada minuto
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Cuando cambia selectedCategory o selectedSection en las props, actualizar el estado interno
  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
      setCurrentScreen('category');
      
      if (selectedSection) {
        setActiveSection(selectedSection);
        setCurrentScreen('section');
      }
    }
  }, [selectedCategory, selectedSection]);

  // Manejar errores de carga del logo
  const handleLogoError = () => {
    setLogoError(true);
  };

  // Manejar errores de carga del logo principal
  const handleMainLogoError = () => {
    setMainLogoError(true);
  };

  // Manejar clic en categoría
  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
    setCurrentScreen('category');
  };
  
  // Manejar clic en sección
  const handleSectionClick = (section: Section) => {
    setActiveSection(section);
    setCurrentScreen('section');
  };

  // Volver a la pantalla anterior
  const handleBackClick = () => {
    if (currentScreen === 'section') {
      setCurrentScreen('category');
      setActiveSection(null);
    } else if (currentScreen === 'category') {
      setCurrentScreen('home');
      setActiveCategory(null);
    }
  };

  // Formatear precio para mostrar
  const formatPrice = (price: string | number): string => {
    if (typeof price === 'number') {
      return price.toFixed(2) + '€';
    }
    
    // Si ya es string, asegurarse de que tiene el símbolo de euro
    return price.toString().includes('€') ? price.toString() : price.toString() + '€';
  };

  // Renderizar contenido según la pantalla actual
  const renderContent = () => {
    if (currentScreen === 'home') {
      return (
        <div className="grid grid-cols-2 gap-3 p-3">
          {categories.map((category) => (
            <div 
              key={category.category_id} 
              className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="relative h-20 w-full bg-gray-100">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/no-image.png';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <span className="text-xs text-gray-500">Sin imagen</span>
                  </div>
                )}
              </div>
              <div className="p-2 text-center">
                <p className="text-xs font-medium truncate">{category.name}</p>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (currentScreen === 'category' && activeCategory) {
      const categorySections = sections[activeCategory.category_id] || [];
      
      return (
        <div className="flex flex-col h-full bg-gray-50">
          <div 
            className="bg-indigo-600 text-white p-3 flex items-center"
            onClick={handleBackClick}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">{activeCategory.name}</span>
          </div>
          
          {categorySections.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 p-3">
              {categorySections.map((section) => (
                <div 
                  key={section.section_id} 
                  className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSectionClick(section)}
                >
                  <div className="relative h-20 w-full bg-gray-100">
                    {section.image ? (
                      <Image
                        src={section.image}
                        alt={section.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/no-image.png';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-200">
                        <span className="text-xs text-gray-500">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-xs font-medium truncate">{section.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-4 text-gray-500 text-center">
              No hay secciones en esta categoría
            </div>
          )}
        </div>
      );
    } else if (currentScreen === 'section' && activeSection && activeCategory) {
      const sectionProducts = products[activeSection.section_id] || [];
      
      return (
        <div className="flex flex-col h-full bg-gray-50">
          <div 
            className="bg-indigo-600 text-white p-3 flex items-center"
            onClick={handleBackClick}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">{activeSection.name}</span>
          </div>
          
          {sectionProducts.length > 0 ? (
            <div className="p-3 space-y-3">
              {sectionProducts.map((product) => (
                <div 
                  key={product.product_id} 
                  className="bg-white rounded-lg overflow-hidden shadow-sm flex"
                >
                  {product.image ? (
                    <div className="relative h-20 w-20 bg-gray-100 shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/no-image.png';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 shrink-0 flex items-center justify-center bg-gray-200">
                      <span className="text-xs text-gray-500">Sin imagen</span>
                    </div>
                  )}
                  
                  <div className="p-2 flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-sm font-bold text-indigo-600 ml-2">{formatPrice(product.price)}</p>
                    </div>
                    {product.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-4 text-gray-500 text-center">
              No hay productos en esta sección
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-full p-4 text-gray-500 text-center">
        No hay contenido para mostrar
      </div>
    );
  };
  
  return (
    <>
      {/* Botón flotante fijo en la esquina inferior derecha */}
      <button
        onClick={() => setIsPreviewOpen(true)}
        className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 focus:outline-0 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50"
        aria-label="Ver previsualización"
      >
        <PhoneIcon className="h-6 w-6" />
      </button>
      
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Draggable 
            nodeRef={nodeRef as React.RefObject<HTMLElement>} 
            handle=".handle"
            defaultPosition={{x: window.innerWidth - 300, y: 100}}
            bounds="parent"
          >
            <div 
              ref={nodeRef} 
              className="absolute pointer-events-auto"
              style={{ width: '280px' }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                {/* Barra de control con manija para arrastrar */}
                <div className="handle flex justify-between items-center p-2 bg-indigo-600 text-white cursor-move">
                  <div className="text-sm font-medium flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4" />
                    <span>Vista previa</span>
                  </div>
                  <button 
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-1 rounded-full hover:bg-indigo-500 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Marcos del teléfono */}
                <div className="relative w-full h-[450px] mx-auto bg-white">
                  {/* Notch superior */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[18px] bg-black rounded-b-xl z-30 flex justify-center items-end pb-1">
                    <div className="w-10 h-1 rounded-full bg-gray-700"></div>
                  </div>
                  
                  {/* Barra de estado */}
                  <div className="absolute top-0 inset-x-0 h-7 flex items-center justify-between px-5 bg-gray-900 z-20 text-white">
                    <div className="text-[10px] font-medium flex items-center">
                      {currentTime}
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center space-x-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                      </div>
                      <Wifi className="w-2.5 h-2.5" />
                      <div className="w-3 h-1.5 border border-white rounded-sm relative">
                        <div className="absolute inset-0 bg-white m-0.5 rounded-sm w-2"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Área de idioma */}
                  <div className="absolute top-7 inset-x-0 h-6 flex items-center px-2 bg-gray-100 z-10">
                    <button className="flex items-center text-[10px] text-gray-600 font-medium space-x-1 bg-white px-1.5 py-0.5 rounded-full shadow-sm">
                      <Globe className="w-3 h-3" />
                      <span>{language}</span>
                    </button>
                  </div>
                  
                  {/* Contenedor del contenido */}
                  <div className="absolute top-13 inset-x-0 bottom-0 overflow-y-auto scrollbar-hide bg-white mt-7">
                    {/* Header del menú */}
                    <div className="relative h-28 w-full bg-white shadow-sm">
                      {clientMainLogo && !mainLogoError ? (
                        <div className="absolute inset-0 bg-linear-to-b from-gray-900/20 to-gray-900/5 flex items-center justify-center">
                          <Image
                            src={clientMainLogo}
                            alt={`Logo principal de ${clientName}`}
                            width={150}
                            height={80}
                            className="object-contain max-h-full"
                            onError={handleMainLogoError}
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-b from-indigo-600/20 to-indigo-600/5 flex items-center justify-center">
                          <h2 className="text-2xl font-bold text-indigo-900">{clientName}</h2>
                        </div>
                      )}
                    </div>
                    
                    {/* Título del menú */}
                    <div className="p-3 text-center">
                      <h1 className="text-xl font-bold text-gray-900 mb-1">{clientName}</h1>
                      <p className="text-xs text-gray-500">Menú digital</p>
                    </div>
                    
                    {/* Contenido principal */}
                    <div className="h-[300px] overflow-y-auto">
                      <h2 className="text-center text-lg font-bold mb-3 text-gray-800">
                        {currentScreen === 'home' ? 'MENÚ' : (
                          currentScreen === 'category' && activeCategory ? activeCategory.name : (
                            currentScreen === 'section' && activeSection ? activeSection.name : 'MENÚ'
                          )
                        )}
                      </h2>
                      
                      {renderContent()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Draggable>
        </div>
      )}
    </>
  );
} 
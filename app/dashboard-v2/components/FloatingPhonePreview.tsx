"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface CategoryPreview {
  id: number;
  name: string;
  image?: string;
}

interface SectionPreview {
  id: number;
  name: string;
  image?: string;
}

interface FloatingPhonePreviewProps {
  clientName?: string;
  clientLogo?: string;
  clientMainLogo?: string;
  categories: CategoryPreview[];
  selectedCategory: CategoryPreview | null;
  selectedSection: SectionPreview | null;
  language?: string;
}

export function FloatingPhonePreview({
  clientName = 'Restaurante',
  clientLogo,
  clientMainLogo,
  categories = [],
  selectedCategory,
  selectedSection,
  language = 'es'
}: FloatingPhonePreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Títulos según idioma
  const translations = {
    es: {
      categories: 'Categorías',
      menu: 'Menú',
      welcomeTitle: '¡Bienvenido!',
      welcomeMessage: 'Selecciona una categoría para ver los productos'
    },
    en: {
      categories: 'Categories',
      menu: 'Menu',
      welcomeTitle: 'Welcome!',
      welcomeMessage: 'Select a category to view products'
    }
  };
  
  const text = translations[language as keyof typeof translations] || translations.es;
  
  // Escuchar evento personalizado para mostrar/ocultar
  useEffect(() => {
    const handleToggle = () => {
      setIsVisible(prev => !prev);
      setIsMinimized(false);
    };
    
    window.addEventListener('toggle-preview', handleToggle);
    return () => window.removeEventListener('toggle-preview', handleToggle);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className={`fixed bottom-20 right-4 z-50 transition-all ${isMinimized ? 'w-16 h-16' : 'w-80 h-[600px]'}`}>
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </button>
      ) : (
        <div className="w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
          {/* Barra de acciones */}
          <div className="flex justify-between items-center px-4 py-2 bg-indigo-600 text-white">
            <span className="text-sm font-medium">{text.menu}</span>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-white hover:text-indigo-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white hover:text-indigo-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Cabecera del restaurante */}
          <div className="bg-gray-800 text-white p-4">
            <div className="flex items-center">
              {clientLogo && (
                <div className="mr-3">
                  <img
                    src={clientLogo}
                    alt={clientName}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold">{clientName}</h2>
                <p className="text-xs text-gray-300">Preview</p>
              </div>
            </div>
          </div>
          
          {/* Contenido principal */}
          <div className="flex-1 overflow-y-auto bg-gray-100">
            {clientMainLogo && (
              <div className="p-4 flex justify-center">
                <img
                  src={clientMainLogo}
                  alt={clientName}
                  className="max-h-32 object-contain"
                />
              </div>
            )}
            
            {/* Categorías */}
            {!selectedCategory ? (
              <div className="p-4">
                <h3 className="text-lg font-bold mb-4">{text.categories}</h3>
                
                {categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <p className="text-gray-500">No hay categorías disponibles</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {categories.map(category => (
                      <div key={category.id} className="bg-white rounded-lg overflow-hidden shadow">
                        <div className="h-20 bg-gray-200 relative">
                          {category.image ? (
                            <img 
                              src={category.image} 
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <h4 className="text-sm font-medium text-center truncate">{category.name}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <button className="mr-2 p-1 rounded-full hover:bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 className="text-lg font-bold">{selectedCategory.name}</h3>
                </div>
                
                {selectedSection ? (
                  <div>
                    <div className="flex items-center mb-4">
                      <h4 className="text-base font-medium">{selectedSection.name}</h4>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      {/* Productos de ejemplo */}
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg overflow-hidden shadow flex">
                          <div className="w-20 h-20 bg-gray-200">
                            <div className="w-full h-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="p-2 flex-1">
                            <h5 className="text-sm font-medium">Ejemplo Producto {i+1}</h5>
                            <p className="text-xs text-gray-500 line-clamp-2">Descripción del producto</p>
                            <p className="text-sm font-bold mt-1 text-indigo-600">$10.99</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    {/* Secciones de ejemplo */}
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg overflow-hidden shadow">
                        <div className="h-32 bg-gray-200">
                          <div className="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="text-base font-medium">Sección {i+1}</h4>
                          <p className="text-xs text-gray-500">3 productos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
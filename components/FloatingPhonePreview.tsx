import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { PhoneIcon, XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';

interface Category {
  id: number;
  name: string;
  image?: string;
}

interface FloatingPhonePreviewProps {
  clientName: string;
  clientLogo?: string;
  categories: Category[];
}

/**
 * Componente de vista previa del móvil flotante y arrastrable
 * Implementa funcionalidad de arrastrar, redimensionar y minimizar
 * Creado: 29-05-2024 (UTC+0 - Londres/Tenerife)
 */
export default function FloatingPhonePreview({ clientName, clientLogo, categories }: FloatingPhonePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Cerrar el modal al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        // No cerrar al hacer clic fuera, para facilitar el arrastre
        // Solo cerramos con el botón X
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Definir tamaños para la vista de móvil
  const defaultSize = { width: 280, height: 560 };
  const expandedSize = { width: 320, height: 640 };
  
  return (
    <>
      {/* Botón flotante fijo en la esquina inferior derecha */}
      <button
        onClick={() => setIsPreviewOpen(true)}
        className="fixed bottom-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-40"
        aria-label="Ver previsualización"
      >
        <PhoneIcon className="h-6 w-6" />
      </button>
      
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Draggable nodeRef={nodeRef} handle=".handle">
            <div ref={nodeRef} className="relative">
              <Resizable
                defaultSize={isExpanded ? expandedSize : defaultSize}
                minWidth={240}
                minHeight={480}
                maxWidth={480}
                maxHeight={800}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl border-8 border-gray-800"
              >
                <div ref={modalRef} className="flex flex-col h-full">
                  {/* Barra de control con manija para arrastrar */}
                  <div className="handle flex justify-between items-center p-2 bg-gray-800 text-white cursor-move">
                    <div className="text-sm font-medium">Previsualización</div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 rounded hover:bg-gray-700 text-gray-300"
                        aria-label={isExpanded ? "Reducir" : "Ampliar"}
                      >
                        {isExpanded ? 
                          <ArrowsPointingInIcon className="h-4 w-4" /> : 
                          <ArrowsPointingOutIcon className="h-4 w-4" />
                        }
                      </button>
                      <button 
                        onClick={() => setIsPreviewOpen(false)}
                        className="p-1 rounded hover:bg-gray-700 text-gray-300"
                        aria-label="Cerrar"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Contenido del móvil */}
                  <div className="flex-1 overflow-y-auto bg-white">
                    {/* Cabecera del menú */}
                    <div className="bg-indigo-600 text-white p-4 flex items-center">
                      {clientLogo ? (
                        <div className="w-10 h-10 mr-3 bg-white rounded-full flex items-center justify-center overflow-hidden">
                          <Image 
                            src={clientLogo} 
                            alt={clientName} 
                            width={32} 
                            height={32} 
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 mr-3 bg-white rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-bold text-xl">
                            {clientName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <h1 className="text-lg font-bold">{clientName}</h1>
                    </div>
                    
                    {/* Lista de categorías */}
                    <div className="p-4">
                      <h2 className="text-sm font-semibold text-gray-500 mb-2">CATEGORÍAS</h2>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                              {category.image ? (
                                <Image 
                                  src={category.image} 
                                  alt={category.name} 
                                  width={40} 
                                  height={40} 
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <span className="text-gray-400 text-lg">{category.name.charAt(0)}</span>
                              )}
                            </div>
                            <span className="text-gray-600 font-medium">{category.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Resizable>
            </div>
          </Draggable>
        </div>
      )}
    </>
  );
} 
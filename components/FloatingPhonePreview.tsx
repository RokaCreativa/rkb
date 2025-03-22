import React, { useState, useRef, useEffect } from 'react';
import { PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PhonePreview } from './PhonePreview';
import Draggable from 'react-draggable';

interface Category {
  id: number;
  category_id?: number;
  name: string;
  image?: string;
}

interface FloatingPhonePreviewProps {
  clientName?: string;
  clientLogo?: string;
  categories?: Category[];
  selectedCategory?: Category | null;
  selectedSection?: any | null;
  language?: string;
}

/**
 * Componente de vista previa del móvil flotante y arrastrable
 * Muestra una previsualización del menú en tiempo real
 * Creado: 29-05-2024 (UTC+0 - Londres/Tenerife)
 */
export default function FloatingPhonePreview({ 
  clientName = "Mi Restaurante", 
  clientLogo,
  categories = [],
  selectedCategory = null,
  selectedSection = null,
  language = "Español"
}: FloatingPhonePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Adaptar categorías al formato esperado por PhonePreview
  const adaptedCategories = categories.map(cat => ({
    id: cat.category_id || cat.id,
    name: cat.name,
    image: cat.image
  }));
  
  return (
    <>
      {/* Botón flotante fijo en la esquina inferior derecha */}
      <button
        onClick={() => setIsPreviewOpen(true)}
        className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50"
        aria-label="Ver previsualización"
      >
        <PhoneIcon className="h-6 w-6" />
      </button>
      
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Draggable 
            nodeRef={nodeRef} 
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
                
                {/* Contenido del móvil */}
                <div className="p-2 bg-gray-100">
                  <PhonePreview
                    clientName={clientName}
                    clientLogo={clientLogo}
                    categories={adaptedCategories}
                    language={language}
                  />
                </div>
              </div>
            </div>
          </Draggable>
        </div>
      )}
    </>
  );
} 
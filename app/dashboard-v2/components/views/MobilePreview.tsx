"use client";

/**
 * @fileoverview Componente de vista previa móvil para el menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { PhoneIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Image from "next/image";

/**
 * Props para el componente MobilePreview
 */
interface MobilePreviewProps {
  restaurantId: string;
  previewImage?: string;
}

/**
 * Componente que muestra una vista previa del menú en formato móvil
 * 
 * Permite a los usuarios visualizar cómo se verá su menú en dispositivos móviles,
 * con opciones para mostrar el menú en un iframe o una imagen de previsualización
 * 
 * @param {MobilePreviewProps} props - Propiedades del componente
 * @returns {JSX.Element} El componente de vista previa móvil
 */
export default function MobilePreview({
  restaurantId,
  previewImage
}: MobilePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const togglePreview = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-10">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-2 bg-gray-50 border-b">
            <h3 className="text-sm font-medium text-gray-700">Vista previa móvil</h3>
            <button 
              onClick={togglePreview}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="relative" style={{ width: '320px', height: '568px' }}>
            {previewImage ? (
              <div className="w-full h-full relative">
                <Image 
                  src={previewImage} 
                  alt="Vista previa móvil" 
                  layout="fill" 
                  objectFit="contain"
                />
              </div>
            ) : (
              <iframe 
                src={`/menu/${restaurantId}`}
                className="w-full h-full border-0"
                title="Vista previa móvil"
              />
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={togglePreview}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
          title="Vista previa móvil"
        >
          <PhoneIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
} 
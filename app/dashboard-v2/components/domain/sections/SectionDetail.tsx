import React, { useState } from 'react';
import { PencilIcon, TrashIcon, PhotoIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { LegacySection } from '../types/legacy';
import ProductManager from './ProductManager';
import useDataState from '../hooks/useDataState';

interface SectionDetailProps {
  section: LegacySection;
  onEditClick: (section: LegacySection) => void;
  onDeleteClick: (section: LegacySection) => void;
}

export default function SectionDetail({ 
  section, 
  onEditClick, 
  onDeleteClick 
}: SectionDetailProps) {
  const [showProducts, setShowProducts] = useState(true);
  const { toggleSectionVisibility } = useDataState();
  
  const handleToggleVisibility = async () => {
    try {
      // Convertir status string a number para la API
      const newStatus = section.status === 'active' ? 'inactive' : 'active';
      // En este punto necesitamos convertir al valor numérico para la API
      const statusNumber = section.status === 'active' ? 1 : 0;
      await toggleSectionVisibility(section.section_id, statusNumber);
      toast.success(section.status === 'active' ? 'Sección oculta' : 'Sección visible');
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error);
      toast.error('Error al cambiar visibilidad');
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Cabecera de la sección */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Imagen de la sección */}
            <div className="shrink-0 h-12 w-12 relative rounded-md overflow-hidden bg-gray-100">
              {section.image_url ? (
                <Image
                  src={section.image_url}
                  alt={section.name}
                  fill
                  className="object-cover"
                  priority
                  onError={(e: any) => {
                    e.target.src = '/images/no-image.png';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-gray-200">
                  <PhotoIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Información de la sección */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                {section.name}
                {section.status === 'inactive' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Oculta
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500">
                Orden: {section.display_order} • ID: {section.section_id}
              </p>
            </div>
          </div>
          
          {/* Acciones de la sección */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50"
              onClick={() => onEditClick(section)}
              title="Editar sección"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50"
              onClick={handleToggleVisibility}
              title={section.status === 'active' ? 'Ocultar sección' : 'Mostrar sección'}
            >
              <span className="sr-only">
                {section.status === 'active' ? 'Ocultar' : 'Mostrar'}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                {section.status === 'active' ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                )}
              </svg>
            </button>
            
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50"
              onClick={() => setShowProducts(!showProducts)}
              title={showProducts ? 'Ocultar productos' : 'Mostrar productos'}
            >
              <ArrowsUpDownIcon className="h-5 w-5" />
            </button>
            
            <button
              type="button"
              className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50"
              onClick={() => onDeleteClick(section)}
              title="Eliminar sección"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenido de la sección (Productos) */}
      {showProducts && (
        <div className="p-4 sm:p-6">
          <ProductManager section={section} />
        </div>
      )}
    </div>
  );
} 
import React from 'react';
import Image from 'next/image';
import { PencilIcon, TrashIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import { getImagePath, handleImageError } from '@/lib/imageUtils';

// Tipos para las propiedades
interface Section {
  section_id: number;
  name: string;
  image: string | null;
  status: number;
  display_order: number;
  products_count?: number;
}

interface SectionGridProps {
  sections: Section[];
  onSectionClick?: (section: Section) => void;
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (section: Section) => void;
  loading?: boolean;
}

/**
 * Componente para mostrar secciones en un grid con tarjetas.
 * Permite la navegación a los productos de cada sección.
 */
export default function SectionGrid({
  sections,
  onSectionClick,
  onEditSection,
  onDeleteSection,
  loading = false
}: SectionGridProps) {
  // Si está cargando, mostrar esqueletos de carga
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
            <div className="h-40 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {sections.map((section) => (
        <div 
          key={section.section_id}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md"
        >
          {/* Imagen de la sección */}
          <div 
            className="relative h-40 bg-gray-100 cursor-pointer"
            onClick={() => onSectionClick && onSectionClick(section)}
          >
            <Image
              src={getImagePath(section.image, 'sections')}
              alt={section.name || ''}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="object-cover"
              onError={handleImageError}
            />
            
            {/* Indicador de estado */}
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
              section.status === 1 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-400 text-white'
            }`}>
              {section.status === 1 ? 'Activo' : 'Inactivo'}
            </div>
          </div>
          
          {/* Información de la sección */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <h3 
                className="text-base font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => onSectionClick && onSectionClick(section)}
              >
                {section.name}
              </h3>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => onSectionClick && onSectionClick(section)}
                  className="p-1 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors"
                  title="Ver productos"
                >
                  <ViewColumnsIcon className="h-4 w-4" />
                </button>
                
                {onEditSection && (
                  <button
                    onClick={() => onEditSection(section)}
                    className="p-1 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors"
                    title="Editar sección"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                
                {onDeleteSection && (
                  <button
                    onClick={() => onDeleteSection && onDeleteSection(section)}
                    className="p-1 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50"
                    title="Eliminar sección"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Orden: {section.display_order}</span>
              {section.products_count !== undefined && (
                <span>{section.products_count} productos</span>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {sections.length === 0 && !loading && (
        <div className="col-span-full text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No hay secciones disponibles</p>
        </div>
      )}
    </div>
  );
} 
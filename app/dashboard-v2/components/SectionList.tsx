"use client";

import React from 'react';
import { Section } from '@/app/types/menu';
import Image from 'next/image';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/core/utils/imageUtils';

interface SectionListProps {
  sections: Section[];
  onSectionClick: (section: Section) => void;
  selectedSection: Section | null;
  isLoading: boolean;
}

export function SectionList({ sections, onSectionClick, selectedSection, isLoading }: SectionListProps) {
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!sections || sections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No hay secciones disponibles para esta categoría.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-3">Secciones</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div 
            key={section.section_id} 
            className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
              selectedSection?.section_id === section.section_id ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => onSectionClick(section)}
          >
            <div className="relative h-32">
              {section.image ? (
                <Image
                  src={getImagePath(section.image, 'sections')}
                  alt={section.name}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Sin imagen</span>
                </div>
              )}
              
              {typeof section.status !== 'undefined' && section.status === 0 && (
                <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  Oculta
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-gray-900">{section.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">Orden: {section.display_order}</span>
                {selectedSection?.section_id === section.section_id && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    Seleccionada
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
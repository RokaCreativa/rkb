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
import { Category, Section, Product } from "@/app/types/menu";

/**
 * Props para el componente MobilePreview
 */
interface MobilePreviewProps {
  clientName: string;
  categories: Category[];
  sections: { [key: number]: Section[] };
  products: Record<string, Product[]>;
  selectedCategory: Category | null;
  selectedSection: Section | null;
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
  clientName,
  categories,
  sections,
  products,
  selectedCategory,
  selectedSection,
  previewImage
}: MobilePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const togglePreview = () => {
    setIsOpen(!isOpen);
  };

  // Transformar los datos para mostrar en la vista previa
  const getPreviewData = () => {
    // Si hay una categoría y sección seleccionada, mostrar los productos de esa sección
    if (selectedCategory && selectedSection && selectedSection.section_id) {
      const sectionProducts = products[selectedSection.section_id] || [];
      return {
        title: `${clientName} - ${selectedCategory.name} - ${selectedSection.name}`,
        items: sectionProducts.map(p => p.name)
      };
    }
    
    // Si solo hay una categoría seleccionada, mostrar sus secciones
    if (selectedCategory && selectedCategory.category_id) {
      const categorySections = sections[selectedCategory.category_id] || [];
      return {
        title: `${clientName} - ${selectedCategory.name}`,
        items: categorySections.map(s => s.name)
      };
    }
    
    // Por defecto, mostrar las categorías
    return {
      title: clientName,
      items: categories.map(c => c.name)
    };
  };

  const previewData = getPreviewData();
  
  return (
    <div className="fixed bottom-4 right-4 z-10">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-2 bg-indigo-600 text-white">
            <h3 className="text-sm font-medium">Vista previa móvil</h3>
            <button 
              onClick={togglePreview}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="relative" style={{ width: '320px', height: '568px' }}>
            <div className="w-full h-full flex flex-col">
              {/* Header del móvil */}
              <div className="bg-indigo-700 text-white p-4 text-center">
                <h4 className="font-bold">{previewData.title}</h4>
              </div>
              
              {/* Contenido del móvil */}
              <div className="flex-1 overflow-auto p-3 bg-gray-100">
                {previewData.items.length > 0 ? (
                  <ul className="space-y-2">
                    {previewData.items.map((item, index) => (
                      <li key={index} className="bg-white rounded-lg p-3 shadow-sm">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No hay elementos para mostrar
                  </div>
                )}
              </div>
            </div>
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
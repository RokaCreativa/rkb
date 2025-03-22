import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDownIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { getImagePath, handleImageError } from '@/lib/imageUtils';

// Tipos para las propiedades
interface Product {
  product_id: number;
  name: string;
  description?: string | null;
  price: number;
  image: string | null;
  status: number;
  display_order: number;
  client_id: number;
  sections: {
    section_id: number;
    name: string;
  }[];
}

interface Section {
  section_id: number;
  name: string;
  image: string | null;
  status: number;
  display_order: number;
  client_id: number;
  category_id: number;
  products_count: number;
}

interface MenuSectionProductsProps {
  sections: Section[];
  products: Record<number, Product[]>;
  loadingProducts: Record<number, boolean>;
  onSectionClick?: (sectionId: number) => void;
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (section: Section) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
}

export default function MenuSectionProducts({
  sections,
  products,
  loadingProducts,
  onSectionClick,
  onEditSection,
  onDeleteSection,
  onEditProduct,
  onDeleteProduct
}: MenuSectionProductsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));

    if (!expandedSections[sectionId] && onSectionClick) {
      onSectionClick(sectionId);
    }
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div 
          key={section.section_id} 
          className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          {/* Encabezado de sección */}
          <div 
            className={`group cursor-pointer transition-all duration-200 ${
              expandedSections[section.section_id] 
                ? 'bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => toggleSection(section.section_id)}
          >
            <div className="flex items-center px-5 py-4">
              {/* Imagen de sección */}
              <div className="relative h-14 w-14 rounded-full overflow-hidden mr-4 shadow-md border-2 border-white transition-transform group-hover:scale-105">
                <Image
                  src={getImagePath(section.image, 'sections')}
                  alt={section.name || ''}
                  fill
                  sizes="56px"
                  className="object-cover"
                  onError={handleImageError}
                />
              </div>
              
              {/* Información de sección */}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800 mb-0.5">{section.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="inline-flex items-center mr-3">
                    <span className="font-medium mr-1">Orden:</span> {section.display_order}
                  </span>
                  <span className="inline-flex items-center">
                    <span className="font-medium mr-1">Productos:</span> {section.products_count}
                  </span>
                </div>
              </div>

              {/* Estado y botones */}
              <div className="flex items-center space-x-3">
                {/* Indicador de estado */}
                <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  section.status === 1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className={`h-2 w-2 rounded-full mr-1.5 ${
                    section.status === 1 ? 'bg-green-500' : 'bg-gray-400'
                  }`}></span>
                  {section.status === 1 ? 'Activo' : 'Inactivo'}
                </div>
                
                {/* Botones de acción */}
                <div className="flex space-x-2">
                  {onEditSection && (
                    <button 
                      className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSection(section);
                      }}
                      title="Editar sección"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  )}
                  
                  {onDeleteSection && (
                    <button 
                      className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSection(section);
                      }}
                      title="Eliminar sección"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                  
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg text-gray-500 group-hover:bg-gray-100 transition-colors">
                    <ChevronDownIcon 
                      className={`h-6 w-6 transition-transform duration-300 ${
                        expandedSections[section.section_id] ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Productos de la sección */}
          {expandedSections[section.section_id] && (
            <div className="bg-gray-50 py-4 px-5 border-t border-gray-100 transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base font-medium text-gray-700">Productos en esta sección</h4>
              </div>
              
              {/* Cargando productos */}
              {loadingProducts[section.section_id] ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mr-3"></div>
                  <span className="text-sm text-gray-600">Cargando productos...</span>
                </div>
              ) : products[section.section_id]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products[section.section_id].map((product) => (
                    <div 
                      key={product.product_id} 
                      className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                      onMouseEnter={() => setHoveredProductId(product.product_id)}
                      onMouseLeave={() => setHoveredProductId(null)}
                    >
                      {/* Contenedor del producto */}
                      <div className="flex p-4">
                        {/* Imagen del producto */}
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 mr-3">
                          <Image
                            src={getImagePath(product.image, 'products')}
                            alt={product.name || ''}
                            fill
                            sizes="64px"
                            className="object-cover"
                            onError={handleImageError}
                          />
                        </div>
                        
                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-medium text-gray-800 mb-1 line-clamp-1">
                            {product.name}
                          </h4>

                          {product.description && (
                            <div className={`text-sm text-gray-600 ${
                              hoveredProductId === product.product_id ? 'line-clamp-none' : 'line-clamp-2'
                            }`}>
                              {product.description}
                            </div>
                          )}
                          
                          {!product.description && (
                            <div className="text-sm text-gray-400 italic">
                              Sin descripción
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Pie del producto */}
                      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center">
                          {/* Estado del producto */}
                          <div className={`rounded-full w-2.5 h-2.5 mr-2 ${
                            product.status === 1 ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-xs font-medium text-gray-600">
                            Orden: {product.display_order}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {/* Precio */}
                          {product.price > 0 && (
                            <span className="text-sm font-bold text-indigo-700">
                              €{product.price.toFixed(2)}
                            </span>
                          )}
                          
                          {/* Botones de acción */}
                          <div className="flex space-x-2">
                            {onEditProduct && (
                              <button 
                                className="p-1 text-gray-500 hover:text-indigo-600 transition-colors"
                                onClick={() => onEditProduct(product)}
                                title="Editar producto"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}
                            
                            {onDeleteProduct && (
                              <button 
                                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                onClick={() => onDeleteProduct(product)}
                                title="Eliminar producto"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                  <p>No hay productos en esta sección</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      
      {sections.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
          <p className="text-gray-500">No hay secciones disponibles</p>
        </div>
      )}
    </div>
  );
} 
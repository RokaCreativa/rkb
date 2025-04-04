import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Section, Product } from '@/app/types/menu';
import SectionListItem from './SectionListItem';
import ProductListItem from './ProductListItem';

interface SectionListProps {
  sections: Section[];
  expandedSections: Record<number, boolean>;
  onSectionClick: (sectionId: number) => void;
  onAddSection?: () => void;
  onToggleSectionVisibility: (sectionId: number, currentStatus: number) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  onAddProduct: (sectionId: number) => void;
  products: Record<string, Product[]>;
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  isUpdatingVisibility: number | null;
  isUpdatingProductVisibility?: number | null;
  categoryName?: string;
  categoryId?: number;
}

/**
 * Componente para mostrar una lista de secciones con sus productos
 * Este componente puede usarse tanto dentro de CategoryTable como de forma independiente
 */
const SectionList: React.FC<SectionListProps> = ({
  sections,
  expandedSections,
  onSectionClick,
  onAddSection,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  onAddProduct,
  products,
  onToggleProductVisibility,
  onEditProduct,
  onDeleteProduct,
  isUpdatingVisibility,
  isUpdatingProductVisibility,
  categoryName,
  categoryId
}) => {
  const [showHiddenSections, setShowHiddenSections] = useState(true);
  
  // Separar secciones visibles y ocultas
  const visibleSections = sections.filter(s => s.status === 1);
  const hiddenSections = sections.filter(s => s.status !== 1);
  
  if (!sections || sections.length === 0) {
    return (
      <div className="bg-white p-4 text-center text-gray-500 rounded-lg border border-gray-200">
        No hay secciones disponibles
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 bg-green-50 border-b border-green-100">
        <h3 className="text-sm font-medium text-green-700">
          {categoryName 
            ? `Secciones: ${categoryName}` 
            : categoryId 
              ? `Secciones: Categoría #${categoryId}` 
              : 'Secciones'
          }
        </h3>
        
        <div className="flex items-center space-x-3">
          <div className="text-xs text-green-600">
            ({visibleSections.length}/{sections.length} visibles)
          </div>
          
          <button
            type="button"
            onClick={() => setShowHiddenSections(!showHiddenSections)}
            className="text-xs text-green-600 hover:text-green-700"
          >
            {showHiddenSections ? 'Ocultar no visibles' : 'Mostrar no visibles'}
          </button>
          
          {onAddSection && (
            <button
              type="button"
              onClick={onAddSection}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded shadow-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Agregar sección
            </button>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {/* Secciones visibles */}
        {visibleSections.map((section) => (
          <div 
            key={`section-${section.section_id}`}
            className={expandedSections[section.section_id] ? 'bg-green-50' : ''}
          >
            <SectionListItem 
              section={section}
              isExpanded={expandedSections[section.section_id] || false}
              visibleProductsCount={
                products[section.section_id]
                  ? products[section.section_id].filter(p => p.status === 1).length
                  : section.visible_products_count || 0
              }
              totalProductsCount={
                products[section.section_id]
                  ? products[section.section_id].length
                  : section.products_count || 0
              }
              onSectionClick={onSectionClick}
              onAddProduct={onAddProduct}
              onToggleSectionVisibility={onToggleSectionVisibility}
              onEditSection={onEditSection}
              onDeleteSection={onDeleteSection}
            />
            
            {/* Lista de productos de la sección */}
            {expandedSections[section.section_id] && (
              <div className="px-4 py-3 bg-white border-t border-green-100">
                <div className="mb-3 flex justify-between items-center">
                  <h4 className="text-sm font-medium text-green-700">
                    Productos: {section.name}
                  </h4>
                  <button
                    type="button"
                    onClick={() => onAddProduct(section.section_id)}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Añadir producto
                  </button>
                </div>
                
                {/* Lista de productos */}
                <div className="mt-3 bg-yellow-50 rounded-lg border border-yellow-100 overflow-hidden">
                  {products[section.section_id.toString()] && products[section.section_id.toString()].length > 0 ? (
                    <div className="divide-y divide-yellow-100">
                      {products[section.section_id.toString()].map((product) => (
                        <ProductListItem
                          key={`product-${product.product_id}`}
                          product={product}
                          sectionId={section.section_id}
                          onToggleProductVisibility={onToggleProductVisibility}
                          onEditProduct={onEditProduct}
                          onDeleteProduct={onDeleteProduct}
                          isUpdatingProductVisibility={isUpdatingProductVisibility}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-yellow-700 text-sm">
                      No hay productos disponibles
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Secciones ocultas */}
        {showHiddenSections && hiddenSections.length > 0 && (
          <>
            <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
              Secciones no visibles ({hiddenSections.length})
            </div>
            
            {hiddenSections.map((section) => (
              <div 
                key={`hidden-section-${section.section_id}`}
                className={expandedSections[section.section_id] ? 'bg-gray-50' : ''}
              >
                <SectionListItem 
                  section={section}
                  isExpanded={expandedSections[section.section_id] || false}
                  visibleProductsCount={
                    products[section.section_id]
                      ? products[section.section_id].filter(p => p.status === 1).length
                      : section.visible_products_count || 0
                  }
                  totalProductsCount={
                    products[section.section_id]
                      ? products[section.section_id].length
                      : section.products_count || 0
                  }
                  onSectionClick={onSectionClick}
                  onAddProduct={onAddProduct}
                  onToggleSectionVisibility={onToggleSectionVisibility}
                  onEditSection={onEditSection}
                  onDeleteSection={onDeleteSection}
                />
                
                {/* Lista de productos de la sección oculta */}
                {expandedSections[section.section_id] && (
                  <div className="px-4 py-3 bg-white border-t border-gray-100">
                    <div className="mb-3 flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-500">
                        Productos: {section.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onAddProduct(section.section_id)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-md"
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Añadir producto
                      </button>
                    </div>
                    
                    {/* Lista de productos */}
                    <div className="mt-3 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      {products[section.section_id.toString()] && products[section.section_id.toString()].length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {products[section.section_id.toString()].map((product) => (
                            <ProductListItem
                              key={`product-${product.product_id}`}
                              product={product}
                              sectionId={section.section_id}
                              onToggleProductVisibility={onToggleProductVisibility}
                              onEditProduct={onEditProduct}
                              onDeleteProduct={onDeleteProduct}
                              isUpdatingProductVisibility={isUpdatingProductVisibility}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No hay productos disponibles
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default SectionList; 
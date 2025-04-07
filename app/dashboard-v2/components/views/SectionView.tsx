"use client";

/**
 * @fileoverview Componente de vista para mostrar y gestionar las secciones de una categoría
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-20
 * 
 * Este componente proporciona una interfaz para ver y gestionar las secciones
 * dentro de una categoría específica, con funcionalidades para expandir y mostrar
 * los productos dentro de cada sección.
 */

import React, { useState, useEffect } from 'react';
import { Section } from '@/app/dashboard-v2/types/domain/section';
import { Category } from '@/app/dashboard-v2/types/domain/category';
import { Product } from '@/app/types/menu';
import { CompatibleProduct } from '@/app/dashboard-v2/types/type-adapters';
import { 
  ChevronLeftIcon as ArrowLeftIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from '@heroicons/react/24/outline';
import { Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import ProductList from '@/app/dashboard-v2/components/domain/products/ProductList';

/**
 * Props para el componente SectionView
 */
interface SectionViewProps {
  selectedCategory: Category;
  sections: Section[];
  products: Record<number, Product[]>;
  categoryName?: string;
  categoryId?: number;
  expandedSections?: { [key: number]: boolean };
  onBackToCategories: () => void;
  onAddSection: (categoryId?: number) => void;
  onSectionClick: (section: Section) => void;
  onToggleSectionVisibility: (sectionId: number, status: number, categoryId?: number) => Promise<void>;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: number) => void;
  isUpdatingVisibility: number | null;
  isReorderModeActive?: boolean;
  onAddProduct?: (sectionId: number) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onToggleProductVisibility?: (productId: number, status: number, sectionId?: number) => Promise<void>;
  isUpdatingProductVisibility?: number | null;
  onSectionReorder?: (categoryId: number, sourceIndex: number, destIndex: number) => void;
  onProductReorder?: (sectionId: number, sourceIndex: number, destIndex: number) => void;
  isLoading?: boolean;
  category?: Category;
}

/**
 * Componente SectionView - Muestra y gestiona las secciones de una categoría
 */
const SectionView: React.FC<SectionViewProps> = ({
  selectedCategory,
  sections,
  products,
  categoryName,
  categoryId,
  expandedSections = {},
  onBackToCategories,
  onAddSection,
  onSectionClick,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  isUpdatingVisibility,
  isReorderModeActive = false,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleProductVisibility,
  isUpdatingProductVisibility,
  onSectionReorder,
  onProductReorder,
  isLoading = false,
  category
}) => {
  const [expandedSectionsRecord, setExpandedSectionsRecord] = useState<Record<number, boolean>>({});
  const [expandedSectionIds, setExpandedSectionIds] = useState<number[]>([]);

  // Actualizar el registro de secciones expandidas cuando cambia el prop expandedSections
  useEffect(() => {
    if (expandedSections) {
      setExpandedSectionsRecord(expandedSections);
      setExpandedSectionIds(
        Object.entries(expandedSections)
          .filter(([, expanded]) => expanded)
          .map(([id]) => parseInt(id))
      );
    }
  }, [expandedSections]);

  // Si está cargando, mostrar indicador
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Si no hay secciones, mostrar mensaje
  if (sections.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={onBackToCategories}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" /> Volver a categorías
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{categoryName || "Comidas"}</h1>
          <button
            onClick={() => onAddSection(category?.category_id || selectedCategory.category_id)}
            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" /> Añadir sección
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No hay secciones</h2>
          <p className="text-gray-500 mb-4">Esta categoría no tiene secciones aún</p>
          <button
            onClick={() => onAddSection(category?.category_id || selectedCategory.category_id)}
            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5 inline mr-1" /> Añadir sección
          </button>
        </div>
      </div>
    );
  }

  // Manejar clics en secciones (para expandir/colapsar)
  const handleSectionClick = (section: Section) => {
    onSectionClick(section);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con navegación y botón de añadir */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBackToCategories}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Volver a categorías
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{categoryName || "Comidas"}</h1>
        <button
          onClick={() => onAddSection(category?.category_id || selectedCategory.category_id)}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" /> Añadir sección
        </button>
      </div>

      {/* Lista de secciones con soporte para drag & drop */}
      <Droppable droppableId={`category-${categoryId || selectedCategory.category_id}`} type="section">
        {(provided: DroppableProvided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {sections.map((section, index) => (
              <Draggable
                key={section.section_id.toString()}
                draggableId={`section-${section.section_id}`}
                index={index}
                isDragDisabled={!isReorderModeActive}
              >
                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-white rounded-lg shadow overflow-hidden ${
                      snapshot.isDragging ? 'border-2 border-teal-500 shadow-lg' : ''
                    } ${section.status === 0 ? 'opacity-60' : ''}`}
                  >
                    {/* Cabecera de la sección con imagen, nombre y acciones */}
                    <div
                      className="p-4 bg-teal-50 cursor-pointer"
                      onClick={() => handleSectionClick(section)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {section.image && (
                            <div className="h-12 w-12 rounded-md overflow-hidden mr-4">
                              <img
                                src={section.image}
                                alt={section.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h2 className="text-lg font-medium text-gray-900">{section.name}</h2>
                            <p className="text-sm text-gray-500">
                              {section.products_count || 0} productos
                              {section.products_count && section.visible_products_count !== undefined && (
                                <span> ({section.visible_products_count} visibles)</span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        {/* Botones de acción */}
                        <div className="flex space-x-2">
                          {/* Botón para añadir producto */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onAddProduct) onAddProduct(section.section_id);
                            }}
                            className="bg-yellow-100 text-yellow-700 p-2 rounded-full hover:bg-yellow-200"
                            title="Añadir producto"
                          >
                            <PlusIcon className="h-5 w-5" />
                          </button>
                          
                          {/* Botón de visibilidad */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSectionVisibility(section.section_id, section.status, category?.category_id || selectedCategory.category_id);
                            }}
                            className={`p-2 rounded-full ${
                              section.status === 1
                                ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                            title={section.status === 1 ? 'Ocultar sección' : 'Mostrar sección'}
                            disabled={isUpdatingVisibility === section.section_id}
                          >
                            {isUpdatingVisibility === section.section_id ? (
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : section.status === 1 ? (
                              <EyeIcon className="h-5 w-5" />
                            ) : (
                              <EyeSlashIcon className="h-5 w-5" />
                            )}
                          </button>
                          
                          {/* Botón de editar */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditSection(section);
                            }}
                            className="bg-teal-100 text-teal-700 p-2 rounded-full hover:bg-teal-200"
                            title="Editar sección"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          
                          {/* Botón de eliminar */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSection(section.section_id);
                            }}
                            className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"
                            title="Eliminar sección"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contenido expandible con lista de productos */}
                    {(expandedSections && expandedSections[section.section_id]) && (
                      <div className="p-3 border-t border-gray-100">
                        {/* Usar directamente ProductList sin un Droppable adicional */}
                        {products[section.section_id] && products[section.section_id].length > 0 ? (
                          <ProductList
                            products={products[section.section_id]}
                            onAddProduct={() => onAddProduct && onAddProduct(section.section_id)}
                            onEditProduct={(product: CompatibleProduct) => onEditProduct && onEditProduct(product as Product)}
                            onDeleteProduct={(product: CompatibleProduct) => onDeleteProduct && onDeleteProduct(product as Product)}
                            onToggleVisibility={(productId: number, status: number, sectionId: number) => {
                              onToggleProductVisibility && onToggleProductVisibility(productId, status, sectionId);
                            }}
                            isUpdatingVisibility={isUpdatingProductVisibility || null}
                            isReorderModeActive={isReorderModeActive}
                            onProductsReorder={
                              onProductReorder 
                                ? (sectionId: number, sourceIndex: number, destIndex: number) => onProductReorder(sectionId, sourceIndex, destIndex) 
                                : undefined
                            }
                            sectionId={section.section_id}
                            sectionName={section.name}
                          />
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <p>No hay productos en esta sección</p>
                            {onAddProduct && (
                              <button
                                onClick={() => onAddProduct(section.section_id)}
                                className="mt-2 inline-flex items-center p-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                              >
                                <PlusIcon className="h-5 w-5 mr-1" />
                                Añadir producto
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default SectionView; 
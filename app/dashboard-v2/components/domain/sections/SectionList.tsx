/**
 * @fileoverview Componente SectionList - Lista de secciones con soporte para arrastrar y soltar (drag and drop)
 * Este componente muestra las secciones de una categoría específica en formato de tabla
 * y permite arrastrar y reordenar las secciones visibles.
 * 
 * IMPORTANTE: Este componente NO incluye su propio DragDropContext.
 * Debe ser usado dentro del DragDropContext global definido en DashboardView.tsx.
 * 
 * @autor RokaMenu Team
 * @version 2.0
 * @updated 2024-06-18
 */

import React, { useState, useEffect } from 'react';
import { Section, Product } from '@/app/types/menu';
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import Image from 'next/image';
import ProductList from '@/app/dashboard-v2/components/domain/products/ProductList';

/**
 * Props para el componente SectionList
 */
export interface SectionListProps {
  /** Lista de secciones a mostrar */
  sections: Section[];
  /** Registro de secciones expandidas (mostrar/ocultar productos) */
  expandedSections: Record<number, boolean>;
  /** Función para manejar clic en una sección (expandir/colapsar) */
  onSectionClick: (sectionId: number) => void;
  /** Función para alternar visibilidad de una sección */
  onToggleSectionVisibility: (sectionId: number, status: number) => void | Promise<void>;
  /** Función para editar una sección */
  onEditSection: (section: Section) => void;
  /** Función para eliminar una sección */
  onDeleteSection: (section: Section) => void;
  /** Función para agregar un producto a una sección */
  onAddProduct: (sectionId: number) => void;
  /** Mapa de productos por sección */
  products: Record<number | string, Product[]>;
  /** Función para alternar visibilidad de un producto */
  onToggleProductVisibility?: (productId: number, status: number, sectionId: number) => void | Promise<void>;
  /** Función para editar un producto */
  onEditProduct?: (product: Product) => void;
  /** Función para eliminar un producto */
  onDeleteProduct?: (product: Product) => void;
  /** ID de la sección cuya visibilidad está siendo actualizada */
  isUpdatingVisibility?: number | null;
  /** ID del producto cuya visibilidad está siendo actualizada */
  isUpdatingProductVisibility?: number | null;
  /** Nombre de la categoría a la que pertenecen las secciones */
  categoryName?: string;
  /** ID de la categoría a la que pertenecen las secciones */
  categoryId?: number;
  /** Función para reordenar secciones (arrastrar y soltar) */
  onSectionsReorder?: (categoryId: number, sourceIndex: number, destinationIndex: number) => void;
  /** Función para agregar una sección a la categoría */
  onAddSectionToCategory?: (categoryId: number) => void;
  /** Indica si el modo de reordenamiento está activo */
  isReorderModeActive?: boolean;
}

/**
 * Componente SectionList - Muestra secciones en formato de tabla con soporte para drag & drop
 * 
 * Este componente recibe una lista de secciones y las muestra en una tabla interactiva.
 * Cada sección puede ser:
 * - Expandida/colapsada para mostrar sus productos
 * - Arrastrada para cambiar su orden
 * - Editada, eliminada o se puede cambiar su visibilidad
 * 
 * IMPORTANTE: Este componente NO incluye su propio DragDropContext,
 * debe ser utilizado dentro del DragDropContext global en DashboardView.
 */
const SectionList: React.FC<SectionListProps> = ({
  sections,
  expandedSections,
  onSectionClick,
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
  categoryId,
  onSectionsReorder,
  onAddSectionToCategory,
  isReorderModeActive = false,
}) => {
  // Log de diagnóstico al renderizar el componente
  console.log("🔍 [RENDER DEBUG] SectionList renderizado con:", {
    sectionsCount: sections?.length || 0,
    expandedSectionsKeys: Object.keys(expandedSections || {}),
    categoryId,
    categoryName,
    sectionsSample: sections?.slice(0, 2).map(s => ({ id: s.section_id, name: s.name })) || [],
  });

  // Estado local para mostrar/ocultar secciones no visibles
  const [showHiddenSections, setShowHiddenSections] = useState(true);
  // Estado local para mostrar/ocultar productos no visibles
  const [showHiddenProducts, setShowHiddenProducts] = useState(true);

  // Separar secciones visibles y ocultas
  const visibleSections = sections.filter(s => s.status === 1);
  const hiddenSections = sections.filter(s => s.status !== 1);

  // Verificar si el drag and drop debe estar habilitado (necesitamos onSectionsReorder y categoryId)
  const isDragEnabled = !!onSectionsReorder && !!categoryId;

  // Log para debug
  console.log("isDragEnabled:", {
    isDragEnabled,
    hasOnSectionsReorder: !!onSectionsReorder,
    hasCategoryId: !!categoryId,
    categoryId,
    sectionCount: sections.length,
    onSectionsReorderType: onSectionsReorder ? typeof onSectionsReorder : 'undefined'
  });

  // Logs adicionales para debug de drag and drop
  useEffect(() => {
    console.log("🔍 [DRAG DEBUG] SectionList inicializado con:", {
      categoryId,
      dragEnabled: isDragEnabled,
      visibleSections: visibleSections.length,
      droppableId: `sections-category-${categoryId || "default"}`,
      totalSections: sections.length,
      droppableType: "section", // Confirmar el tipo usado
    });

    // Log detallado para depuración
    if (sections && sections.length > 0) {
      console.log("📊 Secciones disponibles:", sections.map(s => ({
        id: s.section_id,
        name: s.name,
        status: s.status
      })));
    } else {
      console.warn("⚠️ No hay secciones disponibles para mostrar");
    }
  }, [categoryId, isDragEnabled, visibleSections.length, sections]);

  // Mostrar mensaje cuando no hay secciones
  if (!sections || sections.length === 0) {
    return (
      <div className="bg-white p-4 text-center text-gray-500 rounded-lg border section-border">
        <div className="py-8">
          <p className="text-gray-600 mb-3">No hay secciones disponibles</p>
          {categoryId && onAddSectionToCategory && (
            <button
              onClick={() => onAddSectionToCategory(categoryId)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Añadir sección
            </button>
          )}
        </div>
      </div>
    );
  }

  /**
   * Renderiza los productos para una sección específica
   * @param {number} sectionId - ID de la sección
   * @returns {JSX.Element|null} Tabla de productos o null si la sección no está expandida
   */
  const renderProducts = (sectionId: number) => {
    // Log de diagnóstico para verificar el estado de expansión y disponibilidad de productos
    console.log(`🔍 [RENDER DEBUG] renderProducts para sección ${sectionId}:`, {
      estaExpandida: expandedSections[sectionId] ? "Sí" : "No",
      tieneProductos: products[sectionId] ? `Sí (${products[sectionId]?.length || 0})` : "No",
      expandedSections: expandedSections,
      productosDisponibles: Object.keys(products || {}).length ? "Sí, keys: " + Object.keys(products).join(", ") : "No"
    });

    if (!expandedSections[sectionId] || !products[sectionId]) {
      return null;
    }

    // Usar el componente ProductList con los productos adaptados
    return (
      <div className="mt-1 pl-0 pb-2 border-t section-border">
        <ProductList
          sectionId={sectionId}
          products={products[sectionId] || []}
          sectionName={sections.find(s => s.section_id === sectionId)?.name || ""}
          onAddProduct={() => onAddProduct(sectionId)}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
          onToggleVisibility={onToggleProductVisibility}
          isUpdatingVisibility={isUpdatingProductVisibility}
          isReorderModeActive={isReorderModeActive}
        />
      </div>
    );
  };

  // ID único para el Droppable de esta lista de secciones, basado en categoría
  const droppableId = `sections-category-${categoryId || "default"}`;

  // Log adicional para mostrar el ID formateado
  console.log("🔍 [DRAG DEBUG] Usando droppableId formateado:", {
    droppableId,
    categoryId: categoryId || 0
  });

  return (
    <div className="space-y-4">
      <div className="bg-white overflow-hidden rounded-lg shadow section-border">
        <div className="flex justify-between items-center p-4 section-bg border-b section-border">
          <h2 className="text-sm font-medium section-title">
            Secciones {categoryName ? `en ${categoryName}` : ''} ({sections.length})
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs section-title">
              ({visibleSections.length}/{sections.length} visibles)
            </span>
            <button
              className="text-xs section-title hover:section-text flex items-center ml-2"
              onClick={() => setShowHiddenSections(!showHiddenSections)}
            >
              {showHiddenSections ? 'Ocultar' : 'Mostrar'} no visibles
            </button>
            <button
              onClick={() => onAddSectionToCategory && categoryId !== undefined && onAddSectionToCategory(categoryId)}
              className="p-1 section-action section-icon-hover rounded-full"
              title="Agregar sección"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* TABLA PRINCIPAL - Note que NO hay DragDropContext aquí */}
        <table
          className="min-w-full divide-y section-border"
        >
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium section-title uppercase tracking-wider w-10"></th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium section-title uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <ArrowUpIcon className="h-3 w-3 section-title" />
                  <span>Nombre</span>
                </div>
              </th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium section-title uppercase tracking-wider w-16">Orden</th>
              <th scope="col" className="px-3 py-2 text-center text-xs font-medium section-title uppercase tracking-wider w-16">Foto</th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium section-title uppercase tracking-wider w-16">
                <EyeIcon className="h-4 w-4 mx-auto section-title" />
              </th>
              <th scope="col" className="px-3 py-2 text-center text-xs font-medium section-title uppercase tracking-wider w-20">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y section-border">
            {/* Primero renderizar las secciones visibles (arrastrables) */}
            {visibleSections.length > 0 ? (
              visibleSections.map((section, index) => (
                <React.Fragment key={`section-${section.section_id}`}>
                  <tr>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                      <div className="flex items-center">
                        <button
                          onClick={() => onSectionClick(section.section_id)}
                          className={`p-1 rounded-full transition-colors ${expandedSections[section.section_id]
                            ? "bg-teal-100 section-title"
                            : "hover:bg-gray-200 text-gray-500"
                            }`}
                          aria-label={expandedSections[section.section_id] ? "Colapsar" : "Expandir"}
                        >
                          {expandedSections[section.section_id] ? (
                            <ArrowDownIcon className="h-5 w-5" />
                          ) : (
                            <ArrowUpIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td
                      className="px-3 py-2 cursor-pointer"
                      onClick={() => !isReorderModeActive && onSectionClick(section.section_id)}
                    >
                      <div className="flex items-center">
                        <div
                          className={`mr-2 px-1 ${isReorderModeActive ? 'section-drag-handle touch-optimized' : ''}`}
                          title={isReorderModeActive ? "Arrastrar para reordenar" : ""}
                        >
                          <ArrowUpIcon
                            className={`h-4 w-4 ${isReorderModeActive ? "text-teal-600" : "text-gray-400"}`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${expandedSections[section.section_id]
                            ? "section-text"
                            : "text-gray-700"
                            }`}>{section.name}</span>
                          <span className="text-xs text-gray-500">
                            ({section.visible_products_count || 0}/{section.products_count || 0} productos visibles)
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">{section.display_order || index + 1}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex justify-center">
                        <div className="section-image-container">
                          {section.image ? (
                            <Image
                              src={getImagePath(section.image, 'sections')}
                              alt={section.name || ''}
                              width={40}
                              height={40}
                              className="section-image object-cover! w-full! h-full!"
                              onError={handleImageError}
                            />
                          ) : (
                            <span className="text-xs text-gray-400">Sin img</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <button
                        onClick={() => onToggleSectionVisibility(section.section_id, section.status)}
                        className={`inline-flex items-center justify-center h-6 w-6 rounded ${section.status === 1
                          ? 'section-action section-icon-hover'
                          : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        disabled={isUpdatingVisibility === section.section_id}
                        aria-label={section.status === 1 ? "Ocultar sección" : "Mostrar sección"}
                      >
                        {isUpdatingVisibility === section.section_id ? (
                          <div className="w-4 h-4 border-2 border-t-transparent border-teal-500 rounded-full animate-spin"></div>
                        ) : (
                          section.status === 1 ? (
                            <EyeIcon className="h-4 w-4" />
                          ) : (
                            <EyeSlashIcon className="h-4 w-4" />
                          )
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-1">
                        <button
                          onClick={() => onAddProduct(section.section_id)}
                          className="p-1 section-action section-icon-hover rounded-full"
                          title="Agregar producto"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEditSection(section)}
                          className="section-action-edit"
                          title="Editar sección"
                        >
                          <ArrowUpIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteSection(section)}
                          className="section-action-delete"
                          title="Eliminar sección"
                        >
                          <ArrowUpIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Renderizar productos debajo de cada sección si está expandida */}
                  {expandedSections[section.section_id] && (
                    <tr className="section-products-container">
                      <td colSpan={6} className="p-0 border-t section-border">
                        {renderProducts(section.section_id)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No hay secciones visibles
                </td>
              </tr>
            )}

            {/* Luego renderizar las secciones ocultas (no arrastrables) */}
            {showHiddenSections && hiddenSections.length > 0 && (
              <tr className="bg-gray-100">
                <td colSpan={6} className="px-6 py-2 text-xs text-gray-500 font-medium">
                  Secciones ocultas ({hiddenSections.length})
                </td>
              </tr>
            )}

            {showHiddenSections && hiddenSections.map((section, index) => (
              <React.Fragment key={`hidden-section-${section.section_id}`}>
                <tr
                  className="text-gray-400 hover:bg-gray-50"
                >
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                    <div className="flex items-center">
                      <button
                        onClick={() => onSectionClick(section.section_id)}
                        className="p-1 rounded-full hover:bg-gray-200 text-gray-400"
                        aria-label={expandedSections[section.section_id] ? "Colapsar" : "Expandir"}
                      >
                        {expandedSections[section.section_id] ? (
                          <ArrowDownIcon className="h-5 w-5" />
                        ) : (
                          <ArrowUpIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-2 bg-gray-200 rounded-full p-2 cursor-not-allowed">
                        <ArrowUpIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div
                        className="flex flex-col cursor-pointer"
                        onClick={() => onSectionClick(section.section_id)}
                      >
                        <span className="text-sm font-medium text-gray-400">{section.name}</span>
                        <span className="text-xs text-gray-400">
                          ({section.visible_products_count || 0}/{section.products_count || 0} productos visibles)
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-400 text-center">{section.display_order || index + visibleSections.length + 1}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex justify-center">
                      <div className="section-image-container">
                        {section.image ? (
                          <Image
                            src={getImagePath(section.image, 'sections')}
                            alt={section.name || ''}
                            width={40}
                            height={40}
                            className="section-image object-cover! w-full! h-full!"
                            onError={handleImageError}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">Sin img</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-center">
                    <button
                      onClick={() => onToggleSectionVisibility(section.section_id, section.status)}
                      className="inline-flex items-center justify-center h-6 w-6 rounded text-gray-400 hover:bg-gray-100"
                      disabled={isUpdatingVisibility === section.section_id}
                      aria-label="Mostrar sección"
                    >
                      {isUpdatingVisibility === section.section_id ? (
                        <div className="w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
                      ) : (
                        <EyeSlashIcon className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-1">
                      <button
                        onClick={() => onAddProduct(section.section_id)}
                        className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"
                        title="Agregar producto"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditSection(section)}
                        className="section-action-edit"
                        title="Editar sección"
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSection(section)}
                        className="section-action-delete"
                        title="Eliminar sección"
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Renderizar productos debajo de cada sección si está expandida */}
                {expandedSections[section.section_id] && (
                  <tr className="section-products-container bg-gray-50">
                    <td colSpan={6} className="p-0 border-t section-border">
                      {renderProducts(section.section_id)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SectionList; 
/**
 * @fileoverview Componente ProductTable - Tabla de productos con soporte para arrastrar y soltar (drag and drop)
 * Este componente muestra los productos de una sección específica en formato de tabla
 * y permite arrastrar y reordenar los productos visibles.
 * 
 * IMPORTANTE: Este componente NO incluye su propio DragDropContext.
 * Debe ser usado dentro del DragDropContext global definido en DashboardView.tsx.
 * 
 * @autor RokaMenu Team
 * @version 2.1
 * @updated 2024-07-06
 */

"use client";

import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, ChevronDownIcon, ChevronRightIcon, ViewColumnsIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import Image from 'next/image';
import { GridIcon } from '@/app/dashboard-v2/components/ui/grid/GridIcon';
import { useGridIcons } from '@/app/dashboard-v2/hooks/ui/useGridIcons';

/**
 * Interfaz para los productos en la tabla
 */
interface Product {
  id: number;
  product_id?: number;
  name: string;
  description?: string;
  price: number | string;
  discount_price?: string | null;
  image: string | null;
  status: number;
  display_order?: number;
  section_id?: number;
}

/**
 * Props para el componente ProductTable
 */
interface ProductTableProps {
  /** Lista de productos a mostrar */
  products: Product[];
  /** ID de la sección a la que pertenecen los productos */
  sectionId?: number;
  /** Nombre de la sección a la que pertenecen los productos */
  sectionName?: string;
  /** ID del producto cuya visibilidad está siendo actualizada */
  isUpdatingVisibility?: number | null;
  /** Función para alternar la visibilidad de un producto */
  onToggleVisibility?: (productId: number, status: number, sectionId?: number) => void;
  /** Función para editar un producto */
  onEditProduct?: (product: Product) => void;
  /** Función para eliminar un producto */
  onDeleteProduct?: (productId: number) => Promise<boolean>;
  /** Función para reordenar productos (arrastrar y soltar) */
  onReorderProduct?: (sourceIndex: number, destinationIndex: number) => void;
  /** Indica si el modo de reordenamiento está activo */
  isReorderModeActive?: boolean;
}

/**
 * Componente ProductTable - Muestra productos en formato de tabla con soporte para drag & drop
 * 
 * Este componente recibe una lista de productos y los muestra en una tabla interactiva.
 * Cada producto puede ser:
 * - Arrastrado para cambiar su orden (cuando isReorderModeActive es true)
 * - Editado, eliminado o se puede cambiar su visibilidad
 * 
 * IMPORTANTE: Este componente NO incluye su propio DragDropContext,
 * debe ser utilizado dentro del DragDropContext global en DashboardView.
 * 
 * @param {ProductTableProps} props - Propiedades del componente
 * @returns {JSX.Element} La tabla de productos renderizada
 */
export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  sectionId,
  sectionName,
  isUpdatingVisibility,
  onToggleVisibility,
  onEditProduct,
  onDeleteProduct,
  onReorderProduct,
  isReorderModeActive = false
}) => {
  // Estado local para mostrar/ocultar productos no visibles
  const [showHiddenProducts, setShowHiddenProducts] = useState(true);
  const { renderIcon } = useGridIcons();
  
  // Separar productos visibles y ocultos
  const visibleProducts = products.filter(product => product.status === 1);
  const hiddenProducts = products.filter(product => product.status === 0);
  
  // ID único para el Droppable de esta lista de productos, basado en la sección
  const droppableId = `products-section-${sectionId || "default"}`;
  
  // Efecto para mostrar información de diagnóstico sobre la capacidad de arrastre
  useEffect(() => {
    console.log("🚨 [CRITICAL] ProductTable - Estado de reordenamiento:", {
      isReorderModeActive, 
      onReorderProductExists: !!onReorderProduct,
      visibleProductsCount: visibleProducts.length,
      droppableId,
      type: "product" // Confirmar que coincide con el tipo en useDragAndDrop.ts
    });
  }, [isReorderModeActive, onReorderProduct, visibleProducts.length, droppableId]);
  
  // Debug log para verificar que estamos renderizando correctamente
  console.log("🔍 [DRAG DEBUG] ProductTable renderizando:", {
    visibles: visibleProducts.length,
    ocultos: hiddenProducts.length,
    total: products.length,
    dragEnabled: isReorderModeActive && !!onReorderProduct
  });
  
  /**
   * Función de utilidad para manejar el evento de arrastre y llamar a onReorderProduct con los índices correctos.
   * Esta función solo maneja el registro de la acción, el arrastre real es manejado por el DragDropContext global.
   * 
   * @param {number} sourceIndex - Índice original del producto
   * @param {number} destinationIndex - Índice destino después de soltar
   */
  const handleReorderProduct = (sourceIndex: number, destinationIndex: number) => {
    console.log("🔄 [DRAG DEBUG] ProductTable.handleReorderProduct:", { 
      sourceIndex, 
      destinationIndex,
      sectionId,
      onReorderProductExists: !!onReorderProduct,
      isReorderModeActive
    });
    
    if (onReorderProduct && isReorderModeActive) {
      // Llamar a la función de reordenamiento con los índices correctos
      onReorderProduct(sourceIndex, destinationIndex);
    } else {
      console.warn("⚠️ [DRAG WARN] No se puede reordenar:", {
        onReorderProductExists: !!onReorderProduct,
        isReorderModeActive
      });
    }
  };
  
  return (
    <div className="grid-container product-border">
      <div className="grid-header product-bg product-border">
        <h2 className="grid-title product-title">
          {sectionName ? `Productos en ${sectionName}` : 'Productos'} ({products.length})
          {isReorderModeActive && (
            <span className="ml-2 text-xs font-normal bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              Modo reordenación activo
            </span>
          )}
        </h2>
        <div className="flex items-center space-x-3">
          <span className="grid-subtitle product-text">
            ({visibleProducts.length}/{products.length} visibles)
          </span>
          <button
            onClick={() => setShowHiddenProducts(!showHiddenProducts)}
            className="text-xs product-action hover:product-text flex items-center"
          >
            {showHiddenProducts ? 'Ocultar' : 'Mostrar'} no visibles
            {renderIcon('product', 'expand', { className: "ml-1" })}
          </button>
        </div>
      </div>
      
      {/* 
       * IMPORTANTE: No hay DragDropContext aquí, solo Droppable
       * El Droppable debe tener un type que coincida con handleGlobalDragEnd en useDragAndDrop.ts
       */}
      <Droppable droppableId={droppableId} type="product" isDropDisabled={!isReorderModeActive || !onReorderProduct}>
        {(provided, snapshot) => (
          <table className={`grid-table product-border ${snapshot.isDraggingOver ? 'bg-amber-50/30' : ''}`} 
            {...provided.droppableProps} 
            ref={provided.innerRef}
          >
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium product-title uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <span>Nombre</span>
                  </div>
                </th>
                <th scope="col" className="px-2 py-2 text-center text-xs font-medium product-title uppercase tracking-wider w-16">Orden</th>
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium product-title uppercase tracking-wider w-28">Precio</th>
                <th scope="col" className="px-2 py-2 text-center text-xs font-medium product-title uppercase tracking-wider w-16">
                  {renderIcon('product', 'visibility', { className: "mx-auto" })}
                </th>
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium product-title uppercase tracking-wider w-16">Foto</th>
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium product-title uppercase tracking-wider w-20">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y product-border">
              {/* Primero renderizar los productos visibles (arrastrables) */}
              {visibleProducts.map((product, index) => (
                <Draggable 
                  key={`product-${product.id || product.product_id}`}
                  draggableId={`product-${product.id || product.product_id}`}
                  index={index}
                  isDragDisabled={!isReorderModeActive || !onReorderProduct}
                >
                  {(provided, snapshot) => (
                    <tr
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${
                        snapshot.isDragging 
                          ? 'grid-item-dragging-product !bg-amber-50 shadow-md z-50' 
                          : 'product-hover !bg-white hover:!bg-amber-50'
                      }`}
                    >
                      <td className="grid-cell">
                        <div className="flex items-center">
                          {/* 
                           * IMPORTANTE: Handle de arrastre con stopPropagation y estilos robustos 
                           * Este elemento es el que el usuario arrastrará para mover el producto
                           */}
                          <div 
                            {...provided.dragHandleProps} 
                            className={`
                              product-drag-handle mr-2 p-2 rounded-lg
                              ${isReorderModeActive 
                                ? '!bg-amber-100 border border-amber-300 shadow-sm cursor-grab hover:!bg-amber-200' 
                                : 'text-gray-400'
                              }
                            `}
                            title={isReorderModeActive ? "Arrastrar para reordenar" : ""}
                            style={{
                              touchAction: 'none',
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              MozUserSelect: 'none',
                              msUserSelect: 'none'
                            }}
                            onClick={(e) => {
                              // Detener la propagación para evitar conflictos
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            onMouseDown={(e) => {
                              // Detener la propagación para asegurar que solo el drag handle inicie el arrastre
                              e.stopPropagation();
                            }}
                            onTouchStart={(e) => {
                              // Detener la propagación para compatibilidad con dispositivos táctiles
                              e.stopPropagation();
                            }}
                          >
                            <Bars3Icon className={`h-5 w-5 ${isReorderModeActive ? '!text-amber-600 animate-pulse' : 'text-gray-400'}`} />
                          </div>
                          <div className="ml-1">
                            <div className="text-sm font-medium product-text">{product.name}</div>
                            {product.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="grid-cell-center text-sm text-gray-500">
                        {product.display_order || index + 1}
                      </td>
                      <td className="grid-cell-center text-sm">
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-gray-700">
                            {typeof product.price === 'number' 
                              ? `$${(product.price as number).toFixed(2)}` 
                              : `$${product.price}`}
                          </span>
                          {product.discount_price && (
                            <span className="text-xs text-gray-500 line-through">
                              ${product.discount_price}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="grid-cell-center">
                        <button
                          onClick={() => onToggleVisibility && onToggleVisibility(
                            product.id || (product.product_id as number), 
                            product.status,
                            sectionId
                          )}
                          className="action-button product-action product-icon-hover !text-amber-600 hover:!bg-amber-100"
                          disabled={isUpdatingVisibility === product.id || isUpdatingVisibility === product.product_id}
                        >
                          {isUpdatingVisibility === product.id || isUpdatingVisibility === product.product_id ? (
                            <div className="w-4 h-4 border-2 border-t-transparent !border-amber-500 rounded-full animate-spin"></div>
                          ) : (
                            renderIcon('product', 'visibility', { size: 'large', className: '!text-amber-600' })
                          )}
                        </button>
                      </td>
                      <td className="grid-cell-center">
                        <div className="flex justify-center">
                          <div className="product-image-container">
                            {product.image ? (
                              <Image
                                src={getImagePath(product.image, 'products')}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="product-image"
                                onError={handleImageError}
                              />
                            ) : (
                              <span className="text-xs text-gray-400">Sin img</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="grid-cell-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => onEditProduct && onEditProduct(product)}
                            className="product-action-edit !text-amber-600 hover:!bg-amber-100"
                          >
                            {renderIcon('product', 'edit', { className: '!text-amber-600' })}
                          </button>
                          <button
                            onClick={() => onDeleteProduct && onDeleteProduct(product.id || (product.product_id as number))}
                            className="product-action-delete"
                          >
                            {renderIcon('product', 'delete', { className: '!text-amber-600' })}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Draggable>
              ))}

              {/* Luego renderizar los productos ocultos (no arrastrables) */}
              {showHiddenProducts && hiddenProducts.map((product) => (
                <tr
                  key={`hidden-product-${product.id || product.product_id}`}
                  className="grid-item-hidden hover:bg-gray-50"
                >
                  <td className="grid-cell">
                    <div className="flex items-center">
                      <div className="mr-2 p-2 rounded-lg bg-gray-50 text-gray-300">
                        <Bars3Icon className="h-5 w-5" />
                      </div>
                      <div className="ml-1">
                        <div className="text-sm font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-xs truncate max-w-xs">{product.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="grid-cell-center text-sm">
                    {product.display_order || "-"}
                  </td>
                  <td className="grid-cell-center text-sm">
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-gray-700">
                        {typeof product.price === 'number' 
                          ? `$${(product.price as number).toFixed(2)}` 
                          : `$${product.price}`}
                      </span>
                      {product.discount_price && (
                        <span className="text-xs text-gray-500 line-through">
                          ${product.discount_price}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="grid-cell-center">
                    <button
                      onClick={() => onToggleVisibility && onToggleVisibility(
                        product.id || (product.product_id as number), 
                        product.status,
                        sectionId
                      )}
                      className="action-button text-gray-400 hover:bg-gray-100"
                      disabled={isUpdatingVisibility === product.id || isUpdatingVisibility === product.product_id}
                    >
                      {isUpdatingVisibility === product.id || isUpdatingVisibility === product.product_id ? (
                        <div className="w-4 h-4 border-2 border-t-transparent border-gray-300 rounded-full animate-spin"></div>
                      ) : (
                        renderIcon('product', 'hidden')
                      )}
                    </button>
                  </td>
                  <td className="grid-cell-center">
                    <div className="flex justify-center">
                      <div className="product-image-container">
                        {product.image ? (
                          <Image
                            src={getImagePath(product.image, 'products')}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="product-image opacity-50 grayscale"
                            onError={handleImageError}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">Sin img</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="grid-cell-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onEditProduct && onEditProduct(product)}
                        className="action-button text-gray-400 hover:bg-gray-100"
                      >
                        {renderIcon('product', 'edit', { className: 'text-gray-400' })}
                      </button>
                      <button
                        onClick={() => onDeleteProduct && onDeleteProduct(product.id || (product.product_id as number))}
                        className="action-button text-gray-400 hover:bg-gray-100"
                      >
                        {renderIcon('product', 'delete', { className: 'text-gray-400' })}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Placeholder para drag and drop */}
              {provided.placeholder}
            </tbody>
          </table>
        )}
      </Droppable>
    </div>
  );
}; 
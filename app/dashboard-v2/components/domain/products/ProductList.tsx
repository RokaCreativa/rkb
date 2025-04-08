/**
 * @fileoverview Componente ProductList - Lista de productos con soporte para arrastrar y soltar (drag and drop)
 * Este componente muestra los productos de una sección específica en formato de tabla
 * y permite arrastrar y reordenar los productos visibles.
 * 
 * IMPORTANTE: Este componente NO incluye su propio DragDropContext.
 * Debe ser usado dentro del DragDropContext global definido en DashboardView.tsx.
 * 
 * @autor RokaMenu Team
 * @version 2.0
 * @updated 2024-07-22
 */

import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, ChevronDownIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import Image from 'next/image';
import { Product as MenuProduct } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import ProductListItem from './ProductListItem';
import { GridIcon } from '@/app/dashboard-v2/components/ui/grid/GridIcon';
import { CompatibleProduct } from '@/app/dashboard-v2/types/type-adapters';

/**
 * Props para el componente ProductList
 */
export interface ProductListProps {
  /** Lista de productos a mostrar */
  products: MenuProduct[] | CompatibleProduct[];
  /** ID de la sección a la que pertenecen los productos */
  sectionId?: number;
  /** Nombre de la sección a la que pertenecen los productos */
  sectionName?: string;
  /** ID del producto cuya visibilidad está siendo actualizada */
  isUpdatingVisibility?: number | null;
  /** Función para alternar la visibilidad de un producto */
  onToggleVisibility?: (productId: number, status: number, sectionId: number) => void | Promise<void>;
  /** Función para editar un producto */
  onEditProduct?: (product: CompatibleProduct) => void;
  /** Función para eliminar un producto */
  onDeleteProduct?: (product: CompatibleProduct) => void;
  /** Indica si el modo de reordenamiento está activo */
  isReorderModeActive?: boolean;
  /** Función para reordenar productos (arrastrar y soltar) */
  onProductsReorder?: (sectionId: number, sourceIndex: number, destinationIndex: number) => void;
  /** Función para agregar un producto a una sección */
  onAddProduct?: (sectionId: number) => void;
}

/**
 * Componente ProductList - Muestra productos en formato de tabla con soporte para drag & drop
 * 
 * Este componente recibe una lista de productos y los muestra en una tabla interactiva.
 * Cada producto puede ser:
 * - Arrastrado para cambiar su orden
 * - Editado, eliminado o se puede cambiar su visibilidad
 * 
 * IMPORTANTE: Este componente NO incluye su propio DragDropContext,
 * debe ser utilizado dentro del DragDropContext global en DashboardView.
 */
const ProductList: React.FC<ProductListProps> = ({
  products,
  sectionId,
  sectionName,
  isUpdatingVisibility,
  onToggleVisibility,
  onEditProduct,
  onDeleteProduct,
  isReorderModeActive = false,
  onProductsReorder,
  onAddProduct
}) => {
  // Estado local para mostrar/ocultar productos no visibles
  const [showHiddenProducts, setShowHiddenProducts] = useState(true);
  
  // Separar productos visibles y ocultos
  const visibleProducts = products.filter(p => p.status === 1);
  const hiddenProducts = products.filter(p => p.status !== 1);
  
  // Verificar si el drag and drop debe estar habilitado
  const isDragEnabled = !!onProductsReorder && isReorderModeActive;
  
  // ID para el droppable context - Usando formato que sabemos funciona con secciones
  // Secciones usa: sections-category-${categoryId}
  // Para productos, siguiendo mismo patrón: products-section-${sectionId}
  const droppableId = `products-section-${sectionId ?? 0}`;
  
  // Añadir más logs para diagnóstico
  useEffect(() => {
    console.log("🔥🔥🔥 [DIAGNOSTIC CRÍTICO] ProductList DROPPABLE ID:", droppableId);
    console.log("🔥🔥🔥 [DIAGNOSTIC CRÍTICO] ProductList SECTION ID:", sectionId);
    console.log("🔥🔥🔥 [DIAGNOSTIC CRÍTICO] ProductList DRAG ENABLED:", isDragEnabled);
  }, [droppableId, sectionId, isDragEnabled]);
  
  // Log para diagnóstico
  useEffect(() => {
    console.log("🔍 ProductList renderizado con:", {
      productsCount: products?.length || 0,
      sectionId,
      droppableId,
      isDragEnabled,
      onProductsReorderExists: !!onProductsReorder,
      isReorderModeActive
    });
  }, [products, sectionId, droppableId, isDragEnabled, onProductsReorder, isReorderModeActive]);
  
  // Mostrar mensaje cuando no hay productos
  if (!products || products.length === 0) {
    return (
      <div className="bg-white p-4 text-center text-gray-500 rounded-lg border product-border">
        <div className="py-8">
          <p className="text-gray-600 mb-3">No hay productos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white overflow-hidden rounded-lg shadow product-border">
        {/* Encabezado de la tabla */}
        <div className="flex justify-between items-center p-4 product-bg border-b product-border">
          <h2 className="text-sm font-medium product-title">
            {sectionName ? `Productos en ${sectionName}` : 'Productos'} ({products.length})
            {isReorderModeActive && (
              <span className="ml-2 text-xs font-normal bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Modo reordenación activo
              </span>
            )}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs product-title">
              ({visibleProducts.length}/{products.length} visibles)
            </span>
            <button
              className="text-xs product-title hover:product-text flex items-center ml-2"
              onClick={() => setShowHiddenProducts(!showHiddenProducts)}
            >
              {showHiddenProducts ? 'Ocultar' : 'Mostrar'} no visibles
              {showHiddenProducts ? 
                <ChevronDownIcon className="h-3 w-3 ml-1" /> : 
                <ChevronRightIcon className="h-3 w-3 ml-1" />
              }
            </button>
          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <Droppable droppableId={droppableId} type="product" isDropDisabled={!isDragEnabled}>
          {(provided, snapshot) => (
            <div className="relative overflow-x-auto overscroll-x-none">
              <table className="products-table w-full text-sm text-left rtl:text-right" {...provided.droppableProps} ref={provided.innerRef}>
                <thead className="text-xs uppercase bg-white border-b">
                  <tr>
                    <th className="px-2 py-2">
                      <div className="flex items-center" title="Nombre del producto">
                        <span>Nombre</span>
                      </div>
                    </th>
                    <th className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center" title="Orden del producto">
                        <span>Orden</span>
                      </div>
                    </th>
                    <th className="px-2 py-2 text-right">
                      <div className="flex items-center justify-end" title="Precio del producto">
                        <span>Precio</span>
                      </div>
                    </th>
                    <th className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center" title="Imagen del producto">
                        <span>Imagen</span>
                      </div>
                    </th>
                    <th className="px-1 py-2 text-center text-xs font-medium text-gray-700 product-title uppercase tracking-wider w-10">
                      <EyeIcon className="h-4 w-4 mx-auto text-gray-700 product-title" />
                    </th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 product-title uppercase tracking-wider w-16">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y product-border">
                  {/* Productos visibles (arrastrables) */}
                  {visibleProducts.length > 0 ? (
                    visibleProducts.map((product, index) => (
                      <Draggable
                        key={`product-${product.product_id}`}
                        draggableId={`product-${product.product_id}`}
                        index={index}
                        isDragDisabled={!isDragEnabled}
                      >
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${
                              snapshot.isDragging 
                                ? "grid-item-dragging-product" 
                                : "hover:bg-amber-50/30"
                            } ${isReorderModeActive ? 'cursor-move' : ''}`}
                          >
                            <td className="px-2 py-2">
                              <div className="flex items-center">
                                <div className={`${isDragEnabled ? 'mr-1 product-drag-handle' : 'hidden'}`}>
                                  <Bars3Icon className="h-4 w-4 text-amber-600" />
                                </div>
                                <div className="flex flex-col items-start">
                                  <span className="product-title">{product.name}</span>
                                  {product.description && (
                                    <span className="product-text text-xs">{product.description}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                              {product.display_order || index + 1}
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm product-price-cell">
                              <div>
                                <span className="product-text text-right block">
                                  {typeof product.price === 'number' 
                                    ? `$${(product.price as number).toFixed(2)}` 
                                    : `$${product.price}`}
                                </span>
                                {'discount_price' in product && product.discount_price && (
                                  <span className="text-xs text-gray-500 line-through text-right block">
                                    ${(product as any).discount_price}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-center">
                              <div className="flex justify-center">
                                <div className="product-image-container">
                                  {product.image ? (
                                    <Image
                                      src={getImagePath(product.image, 'products')}
                                      alt={product.name || ''}
                                      width={40}
                                      height={40}
                                      className="product-image object-cover w-full h-full"
                                      onError={handleImageError}
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-400">Sin img</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-center">
                              <button
                                onClick={() => onToggleVisibility && sectionId && onToggleVisibility(
                                  product.product_id, 
                                  product.status,
                                  sectionId
                                )}
                                className={`inline-flex items-center justify-center h-6 w-6 rounded ${
                                  product.status === 1
                                    ? 'product-action product-icon-hover'
                                    : 'text-gray-400 hover:bg-gray-100'
                                }`}
                                disabled={isUpdatingVisibility === product.product_id}
                                aria-label={product.status === 1 ? "Ocultar producto" : "Mostrar producto"}
                              >
                                {isUpdatingVisibility === product.product_id ? (
                                  <div className="w-4 h-4 border-2 border-t-transparent border-amber-500 rounded-full animate-spin"></div>
                                ) : (
                                  <GridIcon 
                                    type="product" 
                                    icon={product.status === 1 ? "visibility" : "hidden"} 
                                    size="medium" 
                                  />
                                )}
                              </button>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-center">
                              <div className="flex justify-center space-x-1">
                                <button
                                  onClick={() => onEditProduct && onEditProduct(product as CompatibleProduct)}
                                  className="action-button product-action product-icon-hover"
                                  title="Editar producto"
                                >
                                  <GridIcon type="product" icon="edit" size="medium" />
                                </button>
                                <button
                                  onClick={() => onDeleteProduct && onDeleteProduct(product as CompatibleProduct)}
                                  className="product-action-delete"
                                  title="Eliminar producto"
                                >
                                  <GridIcon type="product" icon="delete" size="medium" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-3 text-center text-gray-500">
                        No hay productos visibles
                      </td>
                    </tr>
                  )}
                  
                  {/* Productos ocultos (no arrastrables) */}
                  {showHiddenProducts && hiddenProducts.length > 0 && (
                    <tr className="bg-gray-100">
                      <td colSpan={6} className="px-6 py-2 text-xs text-gray-500 font-medium">
                        Productos ocultos ({hiddenProducts.length})
                      </td>
                    </tr>
                  )}
                  
                  {showHiddenProducts && hiddenProducts.map((product) => (
                    <tr 
                      key={`hidden-product-${product.product_id}`}
                      className="grid-item-hidden hover:bg-gray-50"
                    >
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                        <div className="flex items-center">
                          <div className="mr-2 px-1 text-gray-400">
                            <GridIcon type="product" icon="drag" size="large" className="text-gray-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-400">{product.name}</span>
                            {product.description && (
                              <span className="text-xs text-gray-400 truncate max-w-xs">{product.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-400 text-center">
                        {product.display_order || "-"}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-400 text-right">
                        <div>
                          <span className="text-gray-400 text-right block">
                            {typeof product.price === 'number' 
                              ? `$${(product.price as number).toFixed(2)}` 
                              : `$${product.price}`}
                          </span>
                          {'discount_price' in product && product.discount_price && (
                            <span className="text-xs text-gray-400 line-through text-right block">
                              ${(product as any).discount_price}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <div className="flex justify-center">
                          <div className="product-image-container opacity-70">
                            {product.image ? (
                              <Image
                                src={getImagePath(product.image, 'products')}
                                alt={product.name || ''}
                                width={40}
                                height={40}
                                className="product-image object-cover w-full h-full opacity-50 grayscale"
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
                          onClick={() => onToggleVisibility && sectionId && onToggleVisibility(
                            product.product_id, 
                            product.status,
                            sectionId
                          )}
                          className="inline-flex items-center justify-center h-6 w-6 rounded text-gray-400 hover:bg-gray-100"
                          disabled={isUpdatingVisibility === product.product_id}
                        >
                          {isUpdatingVisibility === product.product_id ? (
                            <div className="w-4 h-4 border-2 border-t-transparent border-gray-300 rounded-full animate-spin"></div>
                          ) : (
                            <GridIcon type="product" icon="hidden" size="medium" />
                          )}
                        </button>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={() => onEditProduct && onEditProduct(product as CompatibleProduct)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          >
                            <GridIcon type="product" icon="edit" size="medium" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct && onDeleteProduct(product as CompatibleProduct)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          >
                            <GridIcon type="product" icon="delete" size="medium" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {provided.placeholder}
                </tbody>
              </table>
            </div>
          )}
        </Droppable>

        {/* Botón para agregar producto */}
        {onAddProduct && sectionId && (
          <button
            onClick={() => onAddProduct(sectionId)}
            className="p-1 product-action product-icon-hover rounded-full"
            title="Agregar producto"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductList; 
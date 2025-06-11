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
import { Product } from '@/app/types/menu';
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import Image from 'next/image';
import ProductListItem from './ProductListItem';
import { GridIcon } from '@/app/dashboard-v2/components/ui/grid/GridIcon';
import { CompatibleProduct } from '@/app/dashboard-v2/types/type-adapters';

/**
 * Props para el componente ProductList
 */
export interface ProductListProps {
  /** Lista de productos a mostrar */
  products: Product[];
  /** ID de la sección a la que pertenecen los productos */
  sectionId?: number;
  /** Nombre de la sección a la que pertenecen los productos */
  sectionName?: string;
  /** ID del producto cuya visibilidad está siendo actualizada */
  isUpdatingVisibility?: number | null;
  /** Función para alternar la visibilidad de un producto */
  onToggleVisibility?: (productId: number, status: number, sectionId: number) => void | Promise<void>;
  /** Función para editar un producto */
  onEditProduct?: (product: Product) => void;
  /** Función para eliminar un producto */
  onDeleteProduct?: (product: Product) => void;
  /** Indica si el modo de reordenamiento está activo */
  isReorderModeActive?: boolean;
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
  onAddProduct
}) => {
  const [showHiddenProducts, setShowHiddenProducts] = useState(false);

  // Filtrar productos visibles y ocultos
  const visibleProducts = products.filter(product => product.status === 1);
  const hiddenProducts = products.filter(product => product.status === 0);

  // Si no hay productos, mostrar mensaje
  if (!products || products.length === 0) {
    return (
      <div className="bg-white p-4 text-center text-gray-500 rounded-lg border product-border">
        <div className="py-8">
          <p className="text-gray-600 mb-3">No hay productos disponibles</p>
          {onAddProduct && sectionId && (
            <button
              onClick={() => onAddProduct(sectionId)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Agregar primer producto
            </button>
          )}
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
                <ArrowDownIcon className="h-3 w-3 ml-1" /> :
                <ArrowUpIcon className="h-3 w-3 ml-1" />
              }
            </button>
          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="relative overflow-x-auto overscroll-x-none">
          <table className="products-table grid-table w-full text-sm text-left rtl:text-right">
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
              {/* Productos visibles */}
              {visibleProducts.length > 0 ? (
                visibleProducts.map((product, index) => (
                  <tr
                    key={`product-${product.product_id}`}
                    className="hover:bg-amber-50/30"
                  >
                    <td className="px-2 py-2" data-label="Producto">
                      <div className="flex items-center">
                        <div className="flex flex-col items-start">
                          <span className="product-title">{product.name}</span>
                          {product.description && (
                            <span className="product-text text-xs">{product.description}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center" data-label="Orden">
                      {product.display_order || index + 1}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm product-price-cell" data-label="Precio">
                      <div>
                        <span className="product-text text-right block">
                          {typeof product.price === 'number'
                            ? `$${(product.price as number).toFixed(2)}`
                            : `$${product.price}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center" data-label="Imagen">
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
                    <td className="px-1 py-2 whitespace-nowrap text-center" data-label="Visibilidad">
                      <button
                        onClick={() => onToggleVisibility && sectionId && onToggleVisibility(
                          product.product_id,
                          product.status,
                          sectionId
                        )}
                        className={`inline-flex items-center justify-center h-6 w-6 rounded ${product.status === 1
                          ? 'product-action product-icon-hover'
                          : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        disabled={isUpdatingVisibility === product.product_id}
                        aria-label={product.status === 1 ? "Ocultar producto" : "Mostrar producto"}
                      >
                        {isUpdatingVisibility === product.product_id ? (
                          <div className="w-4 h-4 border-2 border-t-transparent border-amber-500 rounded-full animate-spin"></div>
                        ) : (
                          product.status === 1 ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center" data-label="Acciones">
                      <div className="flex justify-center space-x-1">
                        <button
                          onClick={() => onEditProduct && onEditProduct(product)}
                          className="action-button product-action product-icon-hover"
                          title="Editar producto"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct && onDeleteProduct(product)}
                          className="product-action-delete"
                          title="Eliminar producto"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No hay productos visibles
                  </td>
                </tr>
              )}

              {/* Productos ocultos */}
              {showHiddenProducts && hiddenProducts.map((product, index) => (
                <tr
                  key={`hidden-product-${product.product_id}`}
                  className="bg-gray-50 opacity-60"
                >
                  <td className="px-2 py-2" data-label="Producto">
                    <div className="flex items-center">
                      <div className="flex flex-col items-start">
                        <span className="product-title">{product.name}</span>
                        {product.description && (
                          <span className="product-text text-xs">{product.description}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center" data-label="Orden">
                    {product.display_order || visibleProducts.length + index + 1}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm product-price-cell" data-label="Precio">
                    <div>
                      <span className="product-text text-right block">
                        {typeof product.price === 'number'
                          ? `$${(product.price as number).toFixed(2)}`
                          : `$${product.price}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-center" data-label="Imagen">
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
                  <td className="px-1 py-2 whitespace-nowrap text-center" data-label="Visibilidad">
                    <button
                      onClick={() => onToggleVisibility && sectionId && onToggleVisibility(
                        product.product_id,
                        product.status,
                        sectionId
                      )}
                      className="inline-flex items-center justify-center h-6 w-6 rounded text-gray-400 hover:bg-gray-100"
                      disabled={isUpdatingVisibility === product.product_id}
                      aria-label="Mostrar producto"
                    >
                      {isUpdatingVisibility === product.product_id ? (
                        <div className="w-4 h-4 border-2 border-t-transparent border-amber-500 rounded-full animate-spin"></div>
                      ) : (
                        <EyeSlashIcon className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-center" data-label="Acciones">
                    <div className="flex justify-center space-x-1">
                      <button
                        onClick={() => onEditProduct && onEditProduct(product)}
                        className="action-button product-action product-icon-hover"
                        title="Editar producto"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct && onDeleteProduct(product)}
                        className="product-action-delete"
                        title="Eliminar producto"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón para agregar producto */}
      {onAddProduct && sectionId && (
        <div className="text-center">
          <button
            onClick={() => onAddProduct(sectionId)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Agregar producto
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList; 
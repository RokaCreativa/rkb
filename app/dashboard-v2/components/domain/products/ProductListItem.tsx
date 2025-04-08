/**
 * @fileoverview Componente ProductListItem - Item de producto para la lista de productos
 * 
 * @autor RokaMenu Team
 * @version 1.0
 * @updated 2024-07-22
 */

import React from 'react';
import Image from 'next/image';
import { CompatibleProduct } from '@/app/dashboard-v2/types/type-adapters';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { GridIcon } from '@/app/dashboard-v2/components/ui/grid/GridIcon';

/**
 * Props para el componente ProductListItem
 */
interface ProductListItemProps {
  /** Producto a mostrar */
  product: CompatibleProduct;
  /** Función para alternar la visibilidad del producto */
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void | Promise<void>;
  /** Función para editar el producto */
  onEditProduct?: (product: CompatibleProduct) => void;
  /** Función para eliminar el producto */
  onDeleteProduct?: (product: CompatibleProduct) => void;
  /** ID del producto cuya visibilidad está siendo actualizada */
  isUpdatingProductVisibility?: number | null;
  /** ID de la sección a la que pertenece el producto */
  sectionId: number;
  /** Props para el drag handle */
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  /** Indica si se debe mostrar el drag handle */
  showDragHandle?: boolean;
  /** Indica si el producto está siendo arrastrado */
  isDragging?: boolean;
}

/**
 * Componente ProductListItem - Muestra un producto en una fila de la tabla
 * 
 * Este componente es utilizado por ProductList para mostrar cada producto
 * con sus acciones correspondientes (editar, eliminar, cambiar visibilidad).
 */
const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  onToggleProductVisibility,
  onEditProduct,
  onDeleteProduct,
  isUpdatingProductVisibility,
  sectionId,
  dragHandleProps,
  showDragHandle = false,
  isDragging = false
}) => {
  // Formatear el precio para mostrar
  const formattedPrice = typeof product.price === 'number'
    ? `$${(product.price as number).toFixed(2)}` 
    : `$${product.price}`;

  // Determinar si el producto está visible o no
  const isVisible = product.status === 1;

  return (
    <tr className={`
      ${isDragging ? 'grid-item-dragging-product' : 'hover:bg-amber-50/30'}
      ${!isVisible ? 'opacity-70' : ''}
      ${showDragHandle ? 'cursor-move' : ''}
    `}>
      <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500 w-10" data-label="">
        <button 
          className={`p-1 rounded-full transition-colors hover:bg-amber-100 ${isVisible ? 'text-amber-600' : 'text-gray-400'}`}
          aria-label="Ver detalles del producto"
        >
          <GridIcon type="product" icon="visibility" size="small" />
        </button>
      </td>
      <td className="px-3 py-3" data-label="Producto">
        <div className="flex items-center">
          {showDragHandle && dragHandleProps && (
            <div 
              {...dragHandleProps} 
              className="mr-2 px-1 product-drag-handle touch-optimized"
              title="Arrastrar para reordenar"
            >
              <GridIcon 
                type="product" 
                icon="drag" 
                size="medium"
                className="text-amber-600"
              />
            </div>
          )}
          <div className="flex flex-col">
            <span className={`text-sm font-normal product-text ${!isVisible && 'text-gray-400'}`}>
              {product.name}
            </span>
            {product.description && (
              <span className={`text-xs ${isVisible ? 'text-gray-500' : 'text-gray-400'} truncate max-w-xs`}>
                {product.description}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500 text-center" data-label="Orden">
        {product.display_order || "-"}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-sm product-price-cell" data-label="Precio">
        <div>
          <span className={`product-text text-right block ${!isVisible && 'text-gray-400'}`}>
            {formattedPrice}
          </span>
          {'discount_price' in product && product.discount_price && (
            <span className="text-xs text-gray-500 line-through text-right block">
              ${product.discount_price}
            </span>
          )}
        </div>
      </td>
      <td className="px-2 py-3 whitespace-nowrap text-center" data-label="Visibilidad">
        <button
          onClick={() => onToggleProductVisibility && onToggleProductVisibility(product.product_id, product.status, sectionId)}
          className={`inline-flex items-center justify-center h-6 w-6 rounded ${
            isVisible
              ? 'product-action product-icon-hover'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          disabled={isUpdatingProductVisibility === product.product_id}
          aria-label={isVisible ? "Ocultar producto" : "Mostrar producto"}
        >
          {isUpdatingProductVisibility === product.product_id ? (
            <div className="w-4 h-4 border-2 border-t-transparent border-amber-500 rounded-full animate-spin"></div>
          ) : (
            <GridIcon 
              type="product" 
              icon={isVisible ? "visibility" : "hidden"} 
              size="medium" 
            />
          )}
        </button>
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-center" data-label="Acciones">
        <div className="flex justify-center space-x-1">
          <button
            onClick={() => onEditProduct && onEditProduct(product)}
            className={`rounded-full p-1 ${
              isVisible 
                ? 'product-action product-icon-hover' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            aria-label="Editar producto"
          >
            <GridIcon type="product" icon="edit" size="medium" />
          </button>
          <button
            onClick={() => onDeleteProduct && onDeleteProduct(product)}
            className={`rounded-full p-1 ${
              isVisible 
                ? 'product-action product-icon-hover' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            aria-label="Eliminar producto"
          >
            <GridIcon type="product" icon="delete" size="medium" />
          </button>
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-center" data-label="Imagen">
        <div className="flex justify-center">
          <div className={`product-image-container ${!isVisible && 'opacity-50'}`}>
            {product.image ? (
              <Image
                src={getImagePath(product.image, 'products')}
                alt={product.name || ''}
                width={40}
                height={40}
                className={`product-image object-cover w-full h-full ${!isVisible && 'grayscale'}`}
                onError={handleImageError}
              />
            ) : (
              <span className="text-xs text-gray-400">Sin img</span>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ProductListItem; 
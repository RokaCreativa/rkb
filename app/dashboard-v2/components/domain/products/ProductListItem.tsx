import React from 'react';
import Image from 'next/image';
import { Product as MenuProduct } from '@/app/types/menu';
import { Product as DomainProduct } from '@/app/dashboard-v2/types/domain/product';
import { CompatibleProduct } from '@/app/dashboard-v2/types/type-adapters';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { GridIcon } from '@/app/dashboard-v2/components/ui/grid/GridIcon';

interface ProductListItemProps {
  product: CompatibleProduct;
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void;
  onEditProduct?: (product: CompatibleProduct) => void;
  onDeleteProduct?: (product: CompatibleProduct) => void;
  isUpdatingProductVisibility?: number | null;
  sectionId: number;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  showDragHandle?: boolean;
  isDragging?: boolean;
}

/**
 * Componente reutilizable para mostrar una fila de producto
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
  return (
    <div className={`
      flex items-center justify-between p-3 product-hover border-b product-border 
      !bg-white hover:!bg-amber-50 !border-amber-100 
      ${product.status !== 1 ? 'opacity-70' : ''} 
      ${isDragging ? '!bg-amber-50' : ''}
    `}>
      <div className="flex items-center flex-1 min-w-0">
        {showDragHandle && dragHandleProps && (
          <div 
            {...dragHandleProps} 
            className="mr-3 flex items-center justify-center p-1 rounded product-drag-handle !text-amber-600"
            title="Arrastrar para reordenar"
          >
            <GridIcon type="product" icon="drag" size="medium" />
          </div>
        )}
        
        <div className="min-w-0 flex-1">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 truncate">{product.name}</span>
            <div className="flex items-center text-xs text-gray-500 space-x-1">
              <span className="whitespace-nowrap">{product.price} €</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="ml-3 product-image-container">
        {product.image ? (
          <Image
            src={getImagePath(product.image || null, "products")}
            alt={product.name || ""}
            width={40}
            height={40}
            className="product-image"
            onError={handleImageError}
          />
        ) : (
          <span className="text-xs text-gray-400">Sin img</span>
        )}
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0">
        {onToggleProductVisibility && (
          <button
            onClick={() => onToggleProductVisibility(product.product_id, product.status, sectionId)}
            className={`rounded-full p-1 ${product.status === 1
              ? 'product-action hover:product-bg !text-amber-500 hover:!bg-amber-100'
              : 'text-gray-400 hover:bg-gray-100'
            }`}
            aria-label={product.status === 1 ? "Ocultar producto" : "Mostrar producto"}
            disabled={isUpdatingProductVisibility === product.product_id}
          >
            {isUpdatingProductVisibility === product.product_id ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <GridIcon 
                type="product" 
                icon={product.status === 1 ? "visibility" : "hidden"} 
                size="medium" 
              />
            )}
          </button>
        )}
        
        {onEditProduct && (
          <button
            onClick={() => onEditProduct(product)}
            className="rounded-full p-1 product-action hover:product-bg !text-amber-500 hover:!bg-amber-100"
            aria-label="Editar producto"
          >
            <GridIcon type="product" icon="edit" size="medium" />
          </button>
        )}
        
        {onDeleteProduct && (
          <button
            onClick={() => onDeleteProduct(product)}
            className="rounded-full p-1 product-action hover:product-bg !text-amber-500 hover:!bg-amber-100"
            aria-label="Eliminar producto"
          >
            <GridIcon type="product" icon="delete" size="medium" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductListItem; 
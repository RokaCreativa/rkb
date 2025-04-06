import React, { useEffect } from 'react';
import { Bars3Icon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { Product } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import { Draggable, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { GridIcon } from '@/app/dashboard-v2/components/ui/grid/GridIcon';

interface ProductListItemProps {
  product: Product;
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  isUpdatingProductVisibility?: number | null;
  sectionId: number;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  showDragHandle?: boolean;
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
  showDragHandle = false
}) => {
  // Efecto para depurar props
  useEffect(() => {
    console.log(`ProductListItem for ${product.name}:`, { 
      hasDragHandleProps: !!dragHandleProps,
      dragHandleProps: dragHandleProps ? "Present" : "Missing",
      productId: product.product_id,
      productStatus: product.status
    });
  }, [product.name, product.product_id, product.status, dragHandleProps]);

  return (
    <div className={`flex items-center justify-between p-3 product-hover border-b product-border !bg-white hover:!bg-amber-50 !border-amber-100 ${product.status !== 1 ? 'opacity-70' : ''}`}>
      <div className="flex items-center gap-3">
        {/* Icono de arrastre - IMPORTANTE para drag and drop */}
        {dragHandleProps ? (
          <div 
            {...dragHandleProps}
            className="product-drag-handle px-2 -ml-2 p-2 cursor-grab !bg-amber-50 hover:!bg-amber-100 rounded-lg"
            title="Arrastrar para reordenar"
            style={{
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
          >
            <Bars3Icon className="h-5 w-5 !text-amber-600" />
          </div>
        ) : (
          <div className="flex items-center justify-center self-stretch px-2 -ml-2">
            <Bars3Icon className="h-5 w-5 !text-amber-300" />
          </div>
        )}
        <div className="grid-image-container">
          <Image
            src={getImagePath(product.image, 'products')}
            alt={product.name || ''}
            width={32}
            height={32}
            className={`grid-image ${product.status !== 1 ? 'grayscale' : ''}`}
            onError={handleImageError}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium product-text !text-amber-700">{product.name}</span>
          {product.description && (
            <span className="text-xs text-gray-500 truncate max-w-xs">{product.description}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center">
        <span className="text-sm font-medium mr-4 product-text !text-amber-700">${product.price}</span>
        {onToggleProductVisibility && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleProductVisibility(product.product_id, product.status, sectionId);
            }}
            disabled={isUpdatingProductVisibility === product.product_id}
            className={`p-1 rounded ${
              isUpdatingProductVisibility === product.product_id
                ? 'opacity-50 cursor-not-allowed'
                : product.status === 1
                  ? 'product-action product-icon-hover !text-amber-600 hover:!bg-amber-100'
                  : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={product.status === 1 ? "Ocultar producto" : "Mostrar producto"}
          >
            {isUpdatingProductVisibility === product.product_id ? (
              <div className="w-4 h-4 border-2 border-t-transparent !border-amber-500 rounded-full animate-spin"></div>
            ) : (
              <GridIcon 
                type="product" 
                icon={product.status === 1 ? "visibility" : "hidden"} 
                size="medium"
                className={product.status === 1 ? "!text-amber-600" : ""}
              />
            )}
          </button>
        )}
        {onEditProduct && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditProduct(product);
            }}
            className="p-1 rounded product-action product-icon-hover ml-1 !text-amber-600 hover:!bg-amber-100"
            title="Editar producto"
          >
            <GridIcon type="product" icon="edit" size="medium" className="!text-amber-600" />
          </button>
        )}
        {onDeleteProduct && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteProduct(product);
            }}
            className="p-1 rounded text-red-500 hover:bg-red-50 ml-1"
            title="Eliminar producto"
          >
            <GridIcon type="product" icon="delete" size="medium" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductListItem; 
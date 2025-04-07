import React, { useEffect } from 'react';
import { Bars3Icon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { Product as MenuProduct } from '@/app/types/menu';
import { Product as DomainProduct } from '@/app/dashboard-v2/types/domain/product';
import { CompatibleProduct } from '@/app/dashboard-v2/types/type-adapters';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import { Draggable, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
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
      <div className="flex items-center flex-1 min-w-0">
        {showDragHandle && dragHandleProps && (
          <div 
            {...dragHandleProps} 
            className="mr-3 flex items-center justify-center p-2 rounded-lg !bg-amber-50 hover:!bg-amber-100 cursor-grab !text-amber-600"
            title="Arrastrar para reordenar"
            aria-label="Arrastrar para reordenar"
            style={{
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
            onClick={(e) => {
              console.log('🔍 [DRAG DEBUG] Intentando iniciar drag del producto:', product.name, 'ID:', product.product_id);
              console.log('🔍 [DRAG DEBUG] Estado showDragHandle:', showDragHandle);
              console.log('🔍 [DRAG DEBUG] DragHandleProps disponible:', !!dragHandleProps);
              e.stopPropagation();
              // No usamos e.preventDefault() para permitir que el drag funcione
            }}
            onMouseDown={(e) => {
              console.log('🔍 [DRAG DEBUG] MouseDown en handle de producto:', product.name);
              // No prevenimos para permitir que el DnD funcione correctamente
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              console.log('🔍 [DRAG DEBUG] TouchStart en handle de producto:', product.name);
              // No prevenimos para permitir que el DnD funcione correctamente
              e.stopPropagation();
            }}
          >
            <Bars3Icon className="h-5 w-5" />
          </div>
        )}
        
        <div className="h-10 w-10 relative flex-shrink-0 rounded overflow-hidden bg-gray-100 mr-3">
          <Image
            src={getImagePath(product.image || null, "products")}
            alt={product.name || ""}
            width={40}
            height={40}
            className="object-cover object-center"
            onError={handleImageError}
          />
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 truncate">{product.name}</span>
            <div className="flex items-center text-xs text-gray-500 space-x-1">
              <span className="whitespace-nowrap">{product.price} €</span>
            </div>
          </div>
        </div>
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
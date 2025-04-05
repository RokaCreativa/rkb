import React, { useEffect } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { Product } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useGridIcons } from '@/app/dashboard-v2/shared/hooks/useGridIcons';
import { GridIcon } from '@/app/dashboard-v2/shared/components/grid/GridIcon';

interface ProductListItemProps {
  product: Product;
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  isUpdatingProductVisibility?: number | null;
  sectionId: number;
  dragHandleProps?: DraggableProvidedDragHandleProps;
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
  const { renderIcon } = useGridIcons();
  
  // Efecto para depurar props
  useEffect(() => {
    console.log(`ProductListItem for ${product.name}:`, { 
      showDragHandle, 
      hasDragHandleProps: !!dragHandleProps 
    });
  }, [product.name, showDragHandle, dragHandleProps]);

  return (
    <div className={`flex items-center justify-between p-3 product-hover border-b product-border ${product.status !== 1 ? 'opacity-70' : ''}`}>
      <div className="flex items-center gap-3">
        {/* Icono de arrastre siempre presente para depuración */}
        {showDragHandle ? (
          <div 
            {...(dragHandleProps || {})}
            className="cursor-grab flex items-center justify-center self-stretch px-2 -ml-2 hover:bg-yellow-50 rounded-lg"
            title="Arrastrar para reordenar"
          >
            <Bars3Icon className="h-6 w-6 text-yellow-500 hover:text-yellow-600" />
          </div>
        ) : (
          // Icono visual pero sin funcionalidad para depuración
          <div className="flex items-center justify-center self-stretch px-2 -ml-2 opacity-40">
            <Bars3Icon className="h-6 w-6 text-yellow-300" />
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
          <span className="text-sm font-medium product-text">{product.name}</span>
          {product.description && (
            <span className="text-xs text-gray-500 truncate max-w-xs">{product.description}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center">
        <span className="text-sm font-medium mr-4">{product.price}</span>
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
                  ? 'product-action product-icon-hover'
                  : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={product.status === 1 ? "Ocultar producto" : "Mostrar producto"}
          >
            {isUpdatingProductVisibility === product.product_id ? (
              <div className="w-4 h-4 border-2 border-t-transparent border-yellow-500 rounded-full animate-spin"></div>
            ) : (
              renderIcon("product", product.status === 1 ? "visibility" : "hidden")
            )}
          </button>
        )}
        {onEditProduct && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditProduct(product);
            }}
            className="p-1 rounded product-action product-icon-hover ml-1"
            title="Editar producto"
          >
            {renderIcon("product", "edit")}
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
            {renderIcon("product", "delete")}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductListItem; 
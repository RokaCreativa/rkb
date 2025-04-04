import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Product } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';

interface ProductListItemProps {
  product: Product;
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  isUpdatingProductVisibility?: number | null;
  sectionId: number;
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
  sectionId
}) => {
  return (
    <div className="flex items-center justify-between p-3 product-hover border-b product-border">
      <div className="flex items-center gap-3">
        <div className="grid-image-container">
          <Image
            src={getImagePath(product.image, 'products')}
            alt={product.name || ''}
            width={32}
            height={32}
            className="grid-image"
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
      
      <div className="flex items-center space-x-1">
        <span className="text-sm font-medium mr-4">{product.price}</span>
        {onToggleProductVisibility && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleProductVisibility(product.product_id, product.status, sectionId);
            }}
            disabled={isUpdatingProductVisibility === product.product_id}
            className={`action-button ${
              isUpdatingProductVisibility === product.product_id
                ? 'opacity-50 cursor-not-allowed'
                : product.status === 1
                  ? 'product-action product-icon-hover'
                  : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={product.status === 1 ? "Producto visible" : "Producto oculto"}
          >
            {isUpdatingProductVisibility === product.product_id ? (
              <div className="w-4 h-4 border-2 border-t-transparent border-yellow-500 rounded-full animate-spin"></div>
            ) : product.status === 1 ? (
              <EyeIcon className="w-4 h-4" />
            ) : (
              <EyeSlashIcon className="w-4 h-4" />
            )}
          </button>
        )}
        {onEditProduct && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditProduct(product);
            }}
            className="action-button product-action product-icon-hover"
            title="Editar producto"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
        {onDeleteProduct && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteProduct(product);
            }}
            className="action-button-delete"
            title="Eliminar producto"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductListItem; 
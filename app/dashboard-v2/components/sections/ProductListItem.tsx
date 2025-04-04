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
    <div className="flex items-center justify-between p-3 hover:product-bg border-b product-border">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200">
          <Image
            src={getImagePath(product.image, 'products')}
            alt={product.name || ''}
            width={32}
            height={32}
            className="object-cover w-full h-full"
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
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">{product.price}</span>
        
        <div className="flex items-center gap-1">
          {onToggleProductVisibility && (
            <button
              onClick={() => onToggleProductVisibility(product.product_id, product.status, sectionId)}
              disabled={isUpdatingProductVisibility === product.product_id}
              className={`p-1.5 rounded-full transition-colors ${
                product.status === 1 
                  ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
              }`}
              title={product.status === 1 ? "Visible" : "No visible"}
            >
              {isUpdatingProductVisibility === product.product_id ? (
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                </div>
              ) : product.status === 1 ? (
                <EyeIcon className="w-4 h-4" />
              ) : (
                <EyeSlashIcon className="w-4 h-4" />
              )}
            </button>
          )}
          
          {onEditProduct && (
            <button
              onClick={() => onEditProduct(product)}
              className="p-1 text-yellow-600 hover:text-yellow-800 rounded-full hover:bg-yellow-50"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
          
          {onDeleteProduct && (
            <button
              onClick={() => onDeleteProduct(product)}
              className="p-1 text-yellow-600 hover:text-yellow-800 rounded-full hover:bg-yellow-50"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListItem; 
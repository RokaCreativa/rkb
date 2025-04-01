"use client";

import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';

interface Product {
  id: number;
  product_id?: number;
  name: string;
  description?: string;
  price: number | string;
  image: string | null;
  status: number;
  display_order?: number;
  section_id?: number;
}

interface ProductTableProps {
  products: Product[];
  sectionName: string;
  isUpdatingVisibility: number | null;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => Promise<boolean>;
  onToggleVisibility: (productId: number, status: number) => Promise<void>;
  isReorderModeActive?: boolean;
  onReorderProduct?: (productId: number, direction: 'up' | 'down') => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  sectionName,
  isUpdatingVisibility,
  onEditProduct,
  onDeleteProduct,
  onToggleVisibility,
  isReorderModeActive,
  onReorderProduct
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 bg-white rounded-md shadow-sm">
        No hay productos disponibles para esta sección
      </div>
    );
  }

  // Obtener productos visibles y no visibles
  const visibleProducts = products.filter(p => p.status === 1);
  const hiddenProducts = products.filter(p => p.status !== 1);

  // Formateador de precio
  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') {
      return price;
    }
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="overflow-hidden border border-gray-200 rounded-md">
      <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-medium text-indigo-600">
          Productos de {sectionName}
        </h2>
        <div className="text-xs text-gray-500">
          ({visibleProducts.length}/{products.length} Visibles)
        </div>
      </div>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              NOMBRE
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              ORDEN
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
              PRECIO
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              FOTO
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
              VISIBLE
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              ACCIONES
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product, index) => (
            <tr key={product.id || product.product_id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Bars3Icon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-gray-500 max-w-md truncate">
                        {product.description}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                {product.display_order || index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                {formatPrice(product.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="h-10 w-10 rounded-full overflow-hidden mx-auto">
                  {product.image ? (
                    <img 
                      src={getImagePath(product.image, 'products')} 
                      alt={product.name} 
                      className="h-full w-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <span className="text-xs text-gray-500">Sin imagen</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <button 
                  className="focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(product.id || product.product_id || 0, product.status === 1 ? 0 : 1);
                  }}
                  disabled={isUpdatingVisibility === (product.id || product.product_id)}
                >
                  {isUpdatingVisibility === (product.id || product.product_id) ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : product.status === 1 ? (
                    <span className="inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Visible
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      <EyeSlashIcon className="h-4 w-4 mr-1" />
                      Oculto
                    </span>
                  )}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex space-x-3 justify-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProduct(product);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Editar producto"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProduct(product.id || product.product_id || 0);
                    }}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Eliminar producto"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Contador de productos no visibles */}
      {hiddenProducts.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 text-right">
          <span className="text-xs text-gray-500">
            {hiddenProducts.length} productos no visibles
          </span>
        </div>
      )}
    </div>
  );
}; 
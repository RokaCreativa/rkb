"use client";

import React from 'react';
import { Product } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/core/utils/imageUtils';

interface ProductTableProps {
  products: Product[];
  sectionName: string;
  onToggleVisibility: (productId: number, status: number) => Promise<void>;
  isUpdatingVisibility: number | null;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => Promise<boolean>;
  isReorderModeActive?: boolean;
  onReorderProduct?: (productId: number, direction: 'up' | 'down') => void;
}

export function ProductTable({
  products,
  sectionName,
  onToggleVisibility,
  isUpdatingVisibility,
  onEditProduct,
  onDeleteProduct,
  isReorderModeActive = false,
  onReorderProduct
}: ProductTableProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay productos para la sección "{sectionName}".
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nombre
          </th>
          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Orden
          </th>
          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Foto
          </th>
          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Precio
          </th>
          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Visible
          </th>
          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {products.map((product) => (
          <tr key={product.product_id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {product.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
              <div className="flex items-center justify-center">
                {isReorderModeActive && onReorderProduct && (
                  <button 
                    onClick={() => onReorderProduct(product.product_id, 'up')}
                    className="text-gray-500 hover:text-gray-700 mx-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <span className="mx-2">{product.display_order}</span>
                {isReorderModeActive && onReorderProduct && (
                  <button 
                    onClick={() => onReorderProduct(product.product_id, 'down')}
                    className="text-gray-500 hover:text-gray-700 mx-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="h-full w-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="h-10 w-10 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No img</span>
                </div>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
              {(() => {
                try {
                  // Handle different price formats
                  if (product.price === null || product.price === undefined) {
                    return '$0.00';
                  }
                  
                  const priceValue = typeof product.price === 'number' 
                    ? product.price 
                    : parseFloat(String(product.price).replace(/[^\d.-]/g, '') || '0');
                  
                  return `$${priceValue.toFixed(2)}`;
                } catch (e) {
                  console.error("Error formatting price:", e);
                  return '$0.00';
                }
              })()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
              <button 
                onClick={() => onToggleVisibility(product.product_id, product.status ? 0 : 1)}
                className={`inline-flex px-2 items-center rounded-full ${
                  product.status 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
                disabled={isUpdatingVisibility === product.product_id}
              >
                {isUpdatingVisibility === product.product_id ? (
                  <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    {product.status ? (
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </>
                )}
                <span className="text-xs py-1">
                  {product.status ? 'Visible' : 'Oculto'}
                </span>
              </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
              <button
                onClick={() => onEditProduct(product)}
                className="text-indigo-600 hover:text-indigo-900 mx-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                onClick={() => onDeleteProduct(product.product_id)}
                className="text-red-600 hover:text-red-900 mx-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 
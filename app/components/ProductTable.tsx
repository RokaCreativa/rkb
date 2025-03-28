import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Product } from '@/lib/types';
import Pagination from '@/components/ui/Pagination';

/**
 * Propiedades para el componente ProductTable
 */
interface ProductTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onToggleVisibility: (productId: number, newStatus: number) => void;
  isUpdatingVisibility?: boolean;
  onBackClick?: () => void;
  sectionName?: string;
  onReorderProduct: (productId: number, newPosition: number) => void;
  // Propiedades de paginación
  paginationEnabled?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  totalProducts?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onTogglePagination?: () => void;
}

/**
 * Tabla de productos con soporte para arrastrar y soltar
 * Permite reordenar productos mediante drag and drop
 * Creado: 29-05-2024 (UTC+0 - Londres/Tenerife)
 */
export default function ProductTable({
  products,
  onEditProduct,
  onDeleteProduct,
  onToggleVisibility,
  isUpdatingVisibility,
  onBackClick,
  sectionName,
  onReorderProduct,
  // Propiedades de paginación
  paginationEnabled = false,
  currentPage = 1,
  itemsPerPage = 10,
  totalProducts = 0,
  onPageChange,
  onPageSizeChange,
  onTogglePagination
}: ProductTableProps) {
  
  const [showHiddenProducts, setShowHiddenProducts] = useState(false);
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  
  // Sincronizar productos cuando cambian las props
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);
  
  // Escuchar eventos de cambio de visibilidad
  useEffect(() => {
    const handleProductVisibilityChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { products: updatedProducts } = customEvent.detail;
      
      if (updatedProducts) {
        console.log("[ProductTable] Actualizando productos desde evento visibility-changed", updatedProducts);
        setLocalProducts(updatedProducts);
      }
    };
    
    const handleSingleProductUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { productId, newStatus } = customEvent.detail;
      
      if (productId && newStatus !== undefined) {
        console.log(`[ProductTable] Actualizando producto ${productId} desde evento single-update: nuevo status=${newStatus}`);
        setLocalProducts(prev => 
          prev.map(product => 
            product.product_id === productId 
              ? { ...product, status: newStatus } 
              : product
          )
        );
      }
    };
    
    // Añadir event listeners
    window.addEventListener('product-visibility-changed', handleProductVisibilityChange);
    window.addEventListener('single-product-updated', handleSingleProductUpdate);
    
    return () => {
      window.removeEventListener('product-visibility-changed', handleProductVisibilityChange);
      window.removeEventListener('single-product-updated', handleSingleProductUpdate);
    };
  }, []);
  
  // Separar productos visibles y no visibles usando localProducts
  const visibleProducts = localProducts.filter(prod => prod.status === 1);
  const hiddenProducts = localProducts.filter(prod => prod.status !== 1);
  
  // Determinar el total real de productos para paginación
  const effectiveTotalProducts = paginationEnabled && totalProducts ? 
    totalProducts : localProducts.length;
  
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white w-full">
      <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-100">
        <div className="flex items-center space-x-2">
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          )}
          <h2 className="text-base font-medium text-amber-600">
            {sectionName || 'Productos'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-500">
            ({localProducts.filter(prod => prod.status === 1).length}/{localProducts.length} Visibles)
          </div>
          
          <button
            onClick={() => setShowHiddenProducts(!showHiddenProducts)}
            className={`px-2 py-1 text-xs rounded-md flex items-center ${
              showHiddenProducts 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showHiddenProducts ? 'Ocultar inactivos' : 'Mostrar inactivos'}
          </button>
          
          {onTogglePagination && (
            <button
              onClick={onTogglePagination}
              className={`px-2 py-1 text-xs rounded-md flex items-center ${
                paginationEnabled 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {paginationEnabled ? 'Desactivar paginación' : 'Activar paginación'}
            </button>
          )}
        </div>
      </div>
      
      {/* Resto del componente (tabla y productos) se mantiene igual */}
      {/* ... existing code ... */}
      
      {/* Componente de paginación */}
      {onPageChange && paginationEnabled && (
        <div className="border-t border-amber-100 bg-white">
          <Pagination
            totalItems={effectiveTotalProducts}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>
      )}
    </div>
  );
} 
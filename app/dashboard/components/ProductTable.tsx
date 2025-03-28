import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ProductTable from '@/components/ProductTable';
import type { Product } from '@/components/ProductTable';

interface ProductTableWrapperProps {
  products: Product[];
  isLoading?: boolean;
  onAddProduct?: () => void;
  sectionName?: string;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: number) => void;
  onToggleVisibility?: (productId: number, currentStatus: number) => void;
  isUpdatingVisibility?: number | null;
  onBackClick?: () => void;
  onReorderProduct?: (sourceIndex: number, destinationIndex: number) => void;
}

function ProductTableLoading({ sectionName }: { sectionName?: string }) {
  return (
    <div className="flex justify-center items-center h-40 bg-white rounded-lg border border-gray-200">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600 mb-2"></div>
        <p className="text-amber-600 text-sm">Cargando productos{sectionName ? ` de ${sectionName}` : ''}...</p>
      </div>
    </div>
  );
}

function ProductTableEmpty({ sectionName, onAddProduct }: { sectionName?: string, onAddProduct?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 bg-white rounded-md border border-gray-200 p-4">
      <p className="text-gray-500 text-center mb-4">
        No hay productos en {sectionName || 'esta sección'}. 
        {onAddProduct ? ' Agrega un nuevo producto haciendo clic en el botón "Nuevo Producto".' : ''}
      </p>
      {onAddProduct && (
        <button
          onClick={onAddProduct}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Agregar Producto
        </button>
      )}
    </div>
  );
}

export default function ProductTableWrapper({ 
  products = [], 
  isLoading = false,
  onAddProduct,
  sectionName,
  ...otherProps 
}: ProductTableWrapperProps) {
  // Mostrar estado de carga
  if (isLoading) {
    return <ProductTableLoading sectionName={sectionName} />;
  }
  
  // Mostrar estado vacío
  if (!products || products.length === 0) {
    return <ProductTableEmpty sectionName={sectionName} onAddProduct={onAddProduct} />;
  }
  
  // Renderizar el componente real de la tabla de productos
  return <ProductTable products={products} sectionName={sectionName} {...otherProps} />;
} 
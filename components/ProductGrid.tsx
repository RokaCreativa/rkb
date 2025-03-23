import React from 'react';
import Image from 'next/image';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getImagePath, handleImageError } from '@/lib/imageUtils';

// Tipos para las propiedades
interface Product {
  product_id: number;
  name: string;
  image: string | null;
  status: number;
  display_order: number;
  price: number;
  description: string | null;
}

interface ProductGridProps {
  products: Product[];
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  loading?: boolean;
}

/**
 * Componente para mostrar productos en un grid con tarjetas.
 */
export default function ProductGrid({
  products,
  onEditProduct,
  onDeleteProduct,
  loading = false
}: ProductGridProps) {
  // Formatear precio para mostrar en formato de moneda
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };
  
  // Si está cargando, mostrar esqueletos de carga
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
            <div className="h-40 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div 
          key={product.product_id}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md"
        >
          {/* Imagen del producto */}
          <div className="relative h-40 bg-gray-100">
            <Image
              src={getImagePath(product.image, 'products')}
              alt={product.name || ''}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="object-cover"
              onError={handleImageError}
            />
            
            {/* Indicador de estado */}
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
              product.status === 1 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-400 text-white'
            }`}>
              {product.status === 1 ? 'Activo' : 'Inactivo'}
            </div>
            
            {/* Precio */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-white rounded-lg shadow-sm text-xs font-bold text-indigo-600">
              {formatPrice(product.price)}
            </div>
          </div>
          
          {/* Información del producto */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-1 ml-2">
                {onEditProduct && (
                  <button
                    onClick={() => onEditProduct(product)}
                    className="p-1 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors"
                    title="Editar producto"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                
                {onDeleteProduct && (
                  <button
                    onClick={() => onDeleteProduct && onDeleteProduct(product)}
                    className="p-1 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50"
                    title="Eliminar producto"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Orden: {product.display_order}
            </div>
          </div>
        </div>
      ))}
      
      {products.length === 0 && !loading && (
        <div className="col-span-full text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No hay productos disponibles</p>
        </div>
      )}
    </div>
  );
} 
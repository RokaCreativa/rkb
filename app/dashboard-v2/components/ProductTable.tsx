"use client";

import React, { useState } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Image from 'next/image';

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
  onReorderProduct?: (sourceIndex: number, destinationIndex: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  sectionName,
  isUpdatingVisibility,
  onEditProduct,
  onDeleteProduct,
  onToggleVisibility,
  isReorderModeActive = false,
  onReorderProduct
}) => {
  const [showHiddenProducts, setShowHiddenProducts] = useState(true);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 bg-white rounded-md border border-indigo-100 shadow-sm">
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
  
  // Manejar el evento de drag and drop finalizado
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    
    if (onReorderProduct) {
      onReorderProduct(result.source.index, result.destination.index);
    }
  };

  return (
    <div className="rounded-lg border border-indigo-100 overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 border-b border-indigo-100">
        <h2 className="text-sm font-medium text-indigo-700">
          Productos de {sectionName}
        </h2>
        <div className="flex items-center">
          <div className="text-xs text-indigo-600 mr-4">
            ({visibleProducts.length}/{products.length} Visibles)
          </div>
          <button
            onClick={() => setShowHiddenProducts(!showHiddenProducts)}
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            {showHiddenProducts ? 'Ocultar' : 'Mostrar'} no visibles
            {showHiddenProducts ? 
              <ChevronDownIcon className="h-3 w-3" /> : 
              <ChevronDownIcon className="h-3 w-3" />
            }
          </button>
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="products">
          {(provided) => (
            <table className="min-w-full divide-y divide-indigo-100" {...provided.droppableProps} ref={provided.innerRef}>
              <thead className="bg-indigo-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>Nombre</span>
                    </div>
                  </th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-indigo-600 uppercase tracking-wider w-16">Orden</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-indigo-600 uppercase tracking-wider w-16">Foto</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-indigo-600 uppercase tracking-wider w-20">Precio</th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-indigo-600 uppercase tracking-wider w-16">
                    <EyeIcon className="h-4 w-4 mx-auto text-indigo-500" />
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-indigo-600 uppercase tracking-wider w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-indigo-100">
                {/* Productos visibles */}
                {visibleProducts.map((product, index) => (
                  <Draggable 
                    key={(product.id || product.product_id || index).toString()} 
                    draggableId={(product.id || product.product_id || index).toString()} 
                    index={index}
                    isDragDisabled={!onReorderProduct || !isReorderModeActive}
                  >
                    {(provided, snapshot) => (
                      <tr 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? "bg-blue-50" : "hover:bg-gray-50"}`}
                      >
                        <td 
                          className="px-3 py-2 whitespace-nowrap"
                          {...provided.dragHandleProps}
                        >
                          <div className="flex items-center">
                            <div className="mr-2">
                              <Bars3Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-700">{product.name}</div>
                              {product.description && (
                                <div className="text-xs text-gray-500 max-w-md truncate">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                          {product.display_order || index + 1}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex justify-center">
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
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-center font-medium">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() => onToggleVisibility(product.id || product.product_id || 0, product.status === 1 ? 0 : 1)}
                              disabled={isUpdatingVisibility === (product.id || product.product_id)}
                              className={`p-1.5 rounded-full transition-colors ${
                                product.status === 1 
                                  ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                              }`}
                              title={product.status === 1 ? "Visible" : "No visible"}
                            >
                              {isUpdatingVisibility === (product.id || product.product_id) ? (
                                <div className="w-5 h-5 flex items-center justify-center">
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                                </div>
                              ) : product.status === 1 ? (
                                <EyeIcon className="w-5 h-5" />
                              ) : (
                                <EyeSlashIcon className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-1">
                            <button
                              onClick={() => onEditProduct(product)}
                              className="p-1 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteProduct(product.id || product.product_id || 0)}
                              className="p-1 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}

                {/* Productos ocultos */}
                {showHiddenProducts && hiddenProducts.map((product, index) => (
                  <tr 
                    key={`hidden-${product.id || product.product_id || index}`}
                    className="hover:bg-gray-50 opacity-70"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2">
                          <Bars3Icon className="h-5 w-5 text-gray-300 flex-shrink-0" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-400">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-gray-400 max-w-md truncate">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-400 text-center">
                      {product.display_order || index + 1 + visibleProducts.length}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                          <Image
                            src={getImagePath(product.image, 'products')}
                            alt={product.name || ''}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full opacity-50 grayscale"
                            onError={handleImageError}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-400 text-center font-medium">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => onToggleVisibility(product.id || product.product_id || 0, product.status === 1 ? 0 : 1)}
                          disabled={isUpdatingVisibility === (product.id || product.product_id)}
                          className="p-1.5 rounded-full text-gray-400 bg-gray-50 hover:bg-gray-100"
                          title="No visible"
                        >
                          {isUpdatingVisibility === (product.id || product.product_id) ? (
                            <div className="w-5 h-5 flex items-center justify-center">
                              <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                            </div>
                          ) : (
                            <EyeSlashIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-1">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product.id || product.product_id || 0)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}; 
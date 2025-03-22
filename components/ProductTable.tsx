import React from 'react';
import Image from 'next/image';
import { PencilIcon, TrashIcon, ChevronRightIcon, ArrowLeftIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import { getImagePath, handleImageError } from '@/lib/imageUtils';
import { Switch } from '@headlessui/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// Tipos para las propiedades
export interface Product {
  product_id: number;
  name: string;
  image: string | null;
  status: number;
  price: string;
  section_id: number;
  client_id: number;
  display_order: number;
}

interface ProductTableProps {
  products: Product[];
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: number) => void;
  onToggleVisibility?: (productId: number, currentStatus: number) => void;
  isUpdatingVisibility?: number | null;
  onBackClick?: () => void;
  sectionName?: string;
  onReorderProduct?: (sourceIndex: number, destinationIndex: number) => void;
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
  onReorderProduct
}: ProductTableProps) {
  
  // Manejar el evento de drag and drop finalizado
  const handleDragEnd = (result: DropResult) => {
    // Si no hay destino o si el origen y destino son iguales, no hacer nada
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    
    // Llamar a la función de reordenamiento proporcionada por el padre
    if (onReorderProduct) {
      onReorderProduct(result.source.index, result.destination.index);
    }
  };
  
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          )}
          <h2 className="text-base font-medium text-indigo-600">
            {sectionName || 'Productos'}
          </h2>
        </div>
        <div className="text-xs text-gray-500">
          {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="products">
          {(provided) => (
            <table className="min-w-full divide-y divide-gray-200" {...provided.droppableProps} ref={provided.innerRef}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <ViewColumnsIcon className="h-3 w-3 text-gray-400" />
                      <span>Nombre</span>
                    </div>
                  </th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Orden</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Foto</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Precio</th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Visible</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <Draggable 
                    key={product.product_id.toString()} 
                    draggableId={product.product_id.toString()} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <tr 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? "bg-blue-50" : "hover:bg-gray-50"}`}
                      >
                        <td 
                          className="px-3 py-2 whitespace-nowrap cursor-move"
                          {...provided.dragHandleProps}
                        >
                          <div className="flex items-center">
                            <div className="font-medium text-sm text-gray-600 max-w-xs truncate">
                              {product.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-600">
                          {product.display_order}
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
                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium text-gray-600">
                          {parseFloat(product.price).toFixed(2)}€
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={product.status === 1}
                              onChange={() => onToggleVisibility && onToggleVisibility(product.product_id, product.status)}
                              disabled={isUpdatingVisibility === product.product_id}
                              className={`${
                                product.status === 1 ? 'bg-indigo-600' : 'bg-gray-200'
                              } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none`}
                            >
                              {isUpdatingVisibility === product.product_id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-2 h-2 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                </div>
                              )}
                              <span
                                className={`${
                                  product.status === 1 ? 'translate-x-5' : 'translate-x-1'
                                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                              />
                            </Switch>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-1">
                            <button
                              onClick={() => onEditProduct && onEditProduct(product)}
                              className="p-1 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteProduct && onDeleteProduct(product.product_id)}
                              className="p-1 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
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
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 
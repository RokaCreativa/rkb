import React from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { Product } from '@/app/types/menu';
import ProductListItem from './ProductListItem';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface ProductListProps {
  products: Product[];
  sectionId: number;
  sectionName: string;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onToggleProductVisibility: (productId: number, currentStatus: number) => void;
  isUpdatingVisibility: number | null;
  onProductsReorder?: (updatedProducts: Product[]) => void;
}

/**
 * Componente para mostrar una lista de productos de una sección
 */
const ProductList: React.FC<ProductListProps> = ({
  products,
  sectionId,
  sectionName,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleProductVisibility,
  isUpdatingVisibility,
  onProductsReorder
}) => {
  // Si no hay productos, mostrar mensaje
  if (!products || products.length === 0) {
    return (
      <div className="bg-white p-4 text-center text-gray-500 rounded-lg border border-yellow-200">
        <p>No hay productos en esta sección</p>
        <button
          onClick={onAddProduct}
          className="mt-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
        >
          <PlusCircleIcon className="h-4 w-4 mr-1" />
          Agregar producto
        </button>
      </div>
    );
  }

  // Función para manejar el reordenamiento por drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onProductsReorder) return;
    
    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Actualiza el display_order en cada elemento
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));
    
    onProductsReorder(updatedItems);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-yellow-700">
          Productos: {sectionName} ({products.length})
        </h3>
        <button
          onClick={onAddProduct}
          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
        >
          <PlusCircleIcon className="h-4 w-4 mr-1" />
          Agregar producto
        </button>
      </div>
      
      <div className="bg-white rounded-lg border border-yellow-200 overflow-hidden shadow-sm">
        {onProductsReorder ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`section-products-${sectionId}`}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="divide-y divide-yellow-100"
                >
                  {products.map((product, index) => (
                    <Draggable
                      key={product.product_id.toString()}
                      draggableId={product.product_id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <ProductListItem
                            product={product}
                            sectionId={sectionId}
                            onToggleProductVisibility={onToggleProductVisibility}
                            onEditProduct={onEditProduct}
                            onDeleteProduct={onDeleteProduct}
                            isUpdatingProductVisibility={isUpdatingVisibility}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="divide-y divide-yellow-100">
            {products.map((product) => (
              <ProductListItem
                key={product.product_id}
                product={product}
                sectionId={sectionId}
                onToggleProductVisibility={onToggleProductVisibility}
                onEditProduct={onEditProduct}
                onDeleteProduct={onDeleteProduct}
                isUpdatingProductVisibility={isUpdatingVisibility}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList; 
import React, { useState, useEffect } from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Product } from '@/app/types/menu';
import ProductListItem from './ProductListItem';
import { Droppable, Draggable, DropResult, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useGridIcons } from '@/app/dashboard-v2/hooks/ui/useGridIcons';
import { GridIcon } from '@/app/dashboard-v2/components/ui/grid/GridIcon';

interface ProductListProps {
  products: Product[];
  sectionId: number;
  sectionName: string;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void;
  onProductsReorder?: (sectionId: number, startIndex: number, endIndex: number) => void;
  isUpdatingProductVisibility?: number | null;
  isReorderModeActive?: boolean;
  isProcessingReorder?: boolean;
}

/**
 * Componente ProductList - Muestra productos en formato lista con soporte para drag & drop
 * 
 * Este componente recibe una lista de productos y los muestra como ítems en una lista interactiva.
 * 
 * IMPORTANTE: Este componente NO incluye su propio DragDropContext,
 * debe ser utilizado dentro del DragDropContext global en DashboardView.
 */
const ProductList: React.FC<ProductListProps> = ({
  products,
  sectionId,
  sectionName,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleProductVisibility,
  onProductsReorder,
  isUpdatingProductVisibility,
  isReorderModeActive = false,
  isProcessingReorder = false
}) => {
  const [showHidden, setShowHidden] = useState(true);
  const { renderIcon } = useGridIcons();
  
  // Filtrar productos visibles y no visibles
  const visibleProducts = products.filter(product => product.status === 1);
  const hiddenProducts = products.filter(product => product.status === 0);

  // ID único para la lista droppable
  const droppableId = `products-section-${sectionId}`;
  
  // Debug logs para verificar props
  useEffect(() => {
    console.log('ProductList - Sección:', sectionName, '- Props:', {
      productsCount: products.length,
      visibleCount: visibleProducts.length,
      hiddenCount: hiddenProducts.length,
      isReorderModeActive,
      onProductsReorder: !!onProductsReorder,
      droppableId
    });
  }, [products.length, visibleProducts.length, hiddenProducts.length, isReorderModeActive, onProductsReorder, sectionName, droppableId]);

  // Renderizar mensaje especial si no hay productos
  if (products.length === 0) {
    return (
      <div className="grid-container product-border">
        <div className="grid-header product-bg product-border">
          <h2 className="grid-title product-title">
            {sectionName ? `Productos en ${sectionName}` : 'Productos'} ({products.length})
          </h2>
          <button
            onClick={onAddProduct}
            className="button-sm product-button hover:product-button-hover"
          >
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Añadir primer producto
          </button>
        </div>
        <div className="p-6 text-center">
          <p className="product-text mb-4">No hay productos en esta sección</p>
          <button
            onClick={onAddProduct}
            className="button-sm product-button hover:product-button-hover"
          >
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Añadir primer producto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-container product-border !border-amber-100">
      <div className="grid-header product-bg product-border !bg-amber-50 !border-amber-100">
        <h2 className="grid-title product-title !text-amber-600">
          {sectionName ? `Productos en ${sectionName}` : 'Productos'} ({products.length})
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHidden(!showHidden)}
            className="text-xs product-action hover:product-text flex items-center !text-amber-600"
          >
            {showHidden ? 'Ocultar' : 'Mostrar'} productos no visibles
            {renderIcon('product', 'expand', { className: "ml-1 !text-amber-600" })}
          </button>
          <button
            onClick={onAddProduct}
            className="button-sm product-button hover:product-button-hover !bg-amber-600 hover:!bg-amber-700"
          >
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Añadir
          </button>
        </div>
      </div>

      {/* Zona de arrastre para los productos */}
      <Droppable
        droppableId={droppableId}
        type="PRODUCT"
        isDropDisabled={!isReorderModeActive}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              divide-y product-border !border-amber-100
              ${snapshot.isDraggingOver ? 'product-bg-light !bg-amber-50/50' : 'bg-white'}
            `}
            data-testid={`product-list-${sectionId}`}
          >
            {visibleProducts.map((product, index) => (
              <Draggable
                key={`product-${product.product_id}`}
                draggableId={`product-${product.product_id}`}
                index={index}
                isDragDisabled={!isReorderModeActive}
              >
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    className={`
                      ${dragSnapshot.isDragging ? 'grid-item-dragging-product !bg-amber-50' : ''}
                    `}
                  >
                    <ProductListItem
                      product={product}
                      sectionId={sectionId}
                      onToggleProductVisibility={onToggleProductVisibility}
                      onEditProduct={onEditProduct}
                      onDeleteProduct={onDeleteProduct}
                      isUpdatingProductVisibility={isUpdatingProductVisibility}
                      dragHandleProps={dragProvided.dragHandleProps}
                      showDragHandle={isReorderModeActive}
                    />
                  </div>
                )}
              </Draggable>
            ))}

            {showHidden && hiddenProducts.map((product) => (
              <div key={`hidden-product-${product.product_id}`}>
                <ProductListItem
                  product={product}
                  sectionId={sectionId}
                  onToggleProductVisibility={onToggleProductVisibility}
                  onEditProduct={onEditProduct}
                  onDeleteProduct={onDeleteProduct}
                  isUpdatingProductVisibility={isUpdatingProductVisibility}
                />
              </div>
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default ProductList; 
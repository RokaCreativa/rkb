import React, { useState } from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { Product as DomainProduct } from '@/app/dashboard-v2/types/domain/product';
import { Product as MenuProduct } from '@/app/types/menu';
import { CompatibleProduct } from '@/app/dashboard-v2/types/type-adapters';
import ProductListItem from './ProductListItem';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { GridIcon } from '@/app/dashboard-v2/components/ui/grid/GridIcon';

export interface ProductListProps {
  /** ID de la sección a la que pertenecen los productos */
  sectionId: number;
  /** Nombre de la sección a la que pertenecen los productos */
  sectionName?: string;
  /** Lista de productos a mostrar */
  products: DomainProduct[] | MenuProduct[];
  /** Función para agregar un producto */
  onAddProduct?: (sectionId: number) => void;
  /** Función para editar un producto */
  onEditProduct?: (product: CompatibleProduct) => void;
  /** Función para eliminar un producto */
  onDeleteProduct?: (product: CompatibleProduct) => void;
  /** Función para alternar visibilidad de un producto */
  onToggleVisibility?: (productId: number, status: number, sectionId: number) => void | Promise<void>;
  /** ID del producto cuya visibilidad está siendo actualizada */
  isUpdatingVisibility?: number | null;
  /** Indica si el modo de reordenamiento está activo */
  isReorderModeActive?: boolean;
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
  onToggleVisibility,
  isUpdatingVisibility,
  isReorderModeActive = false
}) => {
  const [showHidden, setShowHidden] = useState(true);
  
  // Filtrar productos visibles y no visibles
  const visibleProducts = products.filter(product => product.status === 1);
  const hiddenProducts = products.filter(product => product.status === 0);

  // ID único para la lista droppable
  const droppableId = `section-${sectionId}`;
  
  // Modificar el handler para pasar sectionId
  const handleAddProduct = () => {
    if (onAddProduct) {
      onAddProduct(sectionId);
    }
  };

  // Renderizar mensaje especial si no hay productos
  if (products.length === 0) {
    return (
      <div className="grid-container product-border">
        <div className="grid-header product-bg product-border">
          <h2 className="grid-title product-title">
            {sectionName ? `Productos en ${sectionName}` : 'Productos'} ({products.length})
          </h2>
          <button
            onClick={handleAddProduct}
            className="button-sm product-button hover:product-button-hover"
          >
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Añadir primer producto
          </button>
        </div>
        <div className="p-6 text-center">
          <p className="product-text mb-4">No hay productos en esta sección</p>
          <button
            onClick={handleAddProduct}
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
          {isReorderModeActive && (
            <span className="ml-2 text-xs font-normal !bg-amber-200 !text-amber-800 px-2 py-0.5 rounded-full">
              Modo reordenación activo
            </span>
          )}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHidden(!showHidden)}
            className="text-xs product-action hover:product-text flex items-center !text-amber-600"
          >
            {showHidden ? 'Ocultar' : 'Mostrar'} productos no visibles
            <GridIcon 
              type="product" 
              icon="expand" 
              size="small"
              className="ml-1 !text-amber-600" 
            />
          </button>
          <button
            onClick={handleAddProduct}
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
            <div className="space-y-1">
              {visibleProducts.map((product, index) => (
                <Draggable
                  key={product.product_id.toString()}
                  draggableId={`product-${product.product_id}`}
                  index={index}
                  isDragDisabled={!isReorderModeActive}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`rounded-md overflow-hidden ${snapshot.isDragging ? 'shadow-lg !bg-amber-50' : ''} ${isReorderModeActive ? 'cursor-move' : ''}`}
                    >
                      <ProductListItem
                        product={product}
                        sectionId={sectionId}
                        onToggleProductVisibility={onToggleVisibility}
                        onEditProduct={onEditProduct}
                        onDeleteProduct={onDeleteProduct}
                        isUpdatingProductVisibility={isUpdatingVisibility}
                        dragHandleProps={provided.dragHandleProps}
                        showDragHandle={isReorderModeActive}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
            </div>

            {showHidden && hiddenProducts.length > 0 && (
              <div className="mt-2 pt-2 border-t product-border !border-amber-100">
                <div className="px-3 py-1 !bg-amber-50/30 text-xs text-amber-800 font-medium">
                  Productos ocultos ({hiddenProducts.length})
                </div>
                {hiddenProducts.map((product) => (
                  <div key={`hidden-product-${product.product_id}`} className="opacity-60">
                    <ProductListItem
                      product={product}
                      sectionId={sectionId}
                      onToggleProductVisibility={onToggleVisibility}
                      onEditProduct={onEditProduct}
                      onDeleteProduct={onDeleteProduct}
                      isUpdatingProductVisibility={isUpdatingVisibility}
                    />
                  </div>
                ))}
              </div>
            )}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default ProductList; 
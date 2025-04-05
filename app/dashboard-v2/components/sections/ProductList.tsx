import React, { useState, useEffect } from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Product } from '@/app/types/menu';
import ProductListItem from './ProductListItem';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useGridIcons } from '@/app/dashboard-v2/shared/hooks/useGridIcons';
import { GridIcon } from '@/app/dashboard-v2/shared/components/grid/GridIcon';

interface ProductListProps {
  products: Product[];
  sectionId: number;
  sectionName: string;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onToggleProductVisibility: (productId: number, currentStatus: number, sectionId: number) => void;
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
  const [showHiddenProducts, setShowHiddenProducts] = useState(true);
  const { renderIcon } = useGridIcons();
  
  // Separar productos visibles y ocultos
  const visibleProducts = products.filter(product => product.status === 1);
  const hiddenProducts = products.filter(product => product.status !== 1);
  
  // Si no hay productos, mostrar mensaje
  if (!products || products.length === 0) {
    return (
      <div className="bg-white p-4 text-center text-gray-500 rounded-lg border product-border">
        <p>No hay productos en esta sección</p>
        <button
          onClick={onAddProduct}
          className="mt-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded product-text product-button"
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
    
    console.log("Drag end in ProductList", result);
    
    // Obtenemos todos los productos (tanto visibles como ocultos)
    const allProducts = Array.from(products);
    
    // Solo reordenamos los productos visibles
    const visibleProductsArray = Array.from(visibleProducts);
    const [reorderedItem] = visibleProductsArray.splice(result.source.index, 1);
    visibleProductsArray.splice(result.destination.index, 0, reorderedItem);
    
    // Actualizar el display_order solo en los productos visibles
    const updatedVisibleProducts = visibleProductsArray.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));
    
    // Crear una nueva lista con todos los productos, manteniendo los no visibles sin cambios
    // y actualizando los visibles con sus nuevos órdenes
    const updatedProducts = allProducts.map(product => {
      // Si el producto es visible (está en updatedVisibleProducts), actualizamos su display_order
      const updatedProduct = updatedVisibleProducts.find(
        p => p.product_id === product.product_id
      );
      
      if (updatedProduct) {
        return {
          ...product,
          display_order: updatedProduct.display_order
        };
      }
      
      // Si el producto no está en updatedVisibleProducts, es un producto oculto
      // y no modificamos su display_order
      return product;
    });
    
    console.log("Reordering products:", updatedProducts.length, "items");
    console.log("updatedVisibleProducts:", updatedVisibleProducts.length, "items");
    console.log("hiddenProducts:", hiddenProducts.length, "items");
    console.log("onProductsReorder available:", !!onProductsReorder);
    
    // Aplicar reordenamiento mediante la función proporcionada por el padre
    onProductsReorder(updatedProducts);
  };

  // Helper para manejar el tipado de dragHandleProps
  const getDragHandleProps = (
    props: DraggableProvidedDragHandleProps | null
  ): DraggableProvidedDragHandleProps | undefined => {
    return props || undefined;
  };

  // Efecto para depurar cuando se monta el componente
  useEffect(() => {
    console.log("ProductList mounted, products:", products);
    console.log("visibleProducts:", visibleProducts);
    console.log("onProductsReorder available:", !!onProductsReorder);
  }, []);

  return (
    <div className="mb-4">
      <div className="bg-white overflow-hidden product-border rounded-lg">
        <div className="flex justify-between items-center p-4 product-bg border-b product-border">
          <h2 className="text-sm font-medium product-title">
            Productos en {sectionName} ({products.length})
          </h2>
          <div className="flex items-center">
            <div className="text-xs product-title mr-4">
              ({visibleProducts.length}/{products.length} visibles)
            </div>
            <button
              type="button"
              onClick={() => setShowHiddenProducts(!showHiddenProducts)}
              className="text-xs product-title hover:product-text flex items-center gap-1"
            >
              {showHiddenProducts ? 'Ocultar' : 'Mostrar'} no visibles
            </button>
            <button
              onClick={onAddProduct}
              className="ml-4 p-1 product-action product-icon-hover rounded-full"
              title="Agregar producto"
            >
              <GridIcon type="product" icon="add" size="large" />
            </button>
          </div>
        </div>
        
        {onProductsReorder ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`products-section-${sectionId}`}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="divide-y product-border"
                >
                  {/* Renderizar productos visibles (arrastrables) */}
                  {visibleProducts.map((product, index) => (
                    <Draggable
                      key={product.product_id.toString()}
                      draggableId={product.product_id.toString()}
                      index={index}
                      isDragDisabled={false}
                    >
                      {(provided, snapshot) => {
                        console.log("Draggable provided for product:", product.name, provided.dragHandleProps ? "has dragHandleProps" : "NO dragHandleProps");
                        return (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={snapshot.isDragging ? "grid-item-dragging-product" : ""}
                          >
                            <ProductListItem
                              product={product}
                              sectionId={sectionId}
                              onToggleProductVisibility={onToggleProductVisibility}
                              onEditProduct={onEditProduct}
                              onDeleteProduct={onDeleteProduct}
                              isUpdatingProductVisibility={isUpdatingVisibility}
                              dragHandleProps={getDragHandleProps(provided.dragHandleProps)}
                              showDragHandle={true}
                            />
                          </div>
                        );
                      }}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {/* Productos no visibles (no arrastrables) */}
                  {showHiddenProducts && hiddenProducts.map((product) => (
                    <div key={`hidden-${product.product_id}`} className="opacity-60">
                      <ProductListItem
                        product={product}
                        sectionId={sectionId}
                        onToggleProductVisibility={onToggleProductVisibility}
                        onEditProduct={onEditProduct}
                        onDeleteProduct={onDeleteProduct}
                        isUpdatingProductVisibility={isUpdatingVisibility}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="divide-y product-border">
            {/* Productos visibles */}
            {visibleProducts.map((product) => (
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
            
            {/* Productos no visibles */}
            {showHiddenProducts && hiddenProducts.map((product) => (
              <div key={`hidden-${product.product_id}`} className="opacity-60">
                <ProductListItem
                  product={product}
                  sectionId={sectionId}
                  onToggleProductVisibility={onToggleProductVisibility}
                  onEditProduct={onEditProduct}
                  onDeleteProduct={onDeleteProduct}
                  isUpdatingProductVisibility={isUpdatingVisibility}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList; 
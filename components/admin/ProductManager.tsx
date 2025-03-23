import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import useProducts from '@/app/hooks/useProducts';
import { Product } from '@/app/types/menu';
import ProductModal from '@/components/modals/ProductModal';
import { getImagePath } from '@/lib/imageUtils';

interface ProductManagerProps {
  sectionId: number;
  initialProducts?: Product[];
}

export default function ProductManager({ sectionId, initialProducts = [] }: ProductManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalConfirmOpen, setIsDeleteModalConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);
  
  const { 
    products, 
    isLoading, 
    fetchProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    toggleProductVisibility,
    reorderProducts
  } = useProducts({
    onSuccess: () => {
      // Cerrar modales después de operaciones exitosas
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setIsDeleteModalConfirmOpen(false);
      setSelectedProduct(null);
    }
  });
  
  // Cargar productos iniciales si se proporcionan
  useEffect(() => {
    if (initialProducts.length > 0) {
      // Usar los productos proporcionados en props
    } else {
      // Cargar productos desde la API
      fetchProducts(sectionId);
    }
  }, [fetchProducts, initialProducts, sectionId]);
  
  // Manejador para abrir el modal de edición
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  
  // Manejador para abrir el modal de confirmación de eliminación
  const handleDeleteModalOpen = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalConfirmOpen(true);
  };
  
  // Manejador para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProduct(selectedProduct.product_id);
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };
  
  // Manejador para alternar visibilidad
  const handleToggleVisibility = async (product: Product) => {
    try {
      await toggleProductVisibility(product.product_id, product.status);
    } catch (error) {
      console.error('Error al cambiar la visibilidad:', error);
    }
  };
  
  // Manejador para crear un nuevo producto
  const handleCreateProduct = async (formData: FormData) => {
    // Asegurarse de que se incluya el section_id
    if (!formData.has('section_id')) {
      formData.append('section_id', sectionId.toString());
    }
    
    try {
      await createProduct(formData);
    } catch (error) {
      console.error('Error al crear el producto:', error);
    }
  };
  
  // Manejador para actualizar un producto existente
  const handleUpdateProduct = async (formData: FormData) => {
    try {
      await updateProduct(formData);
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
    }
  };
  
  // Manejador para reordenar productos (drag and drop)
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    const productsCopy = [...products];
    const [movedProduct] = productsCopy.splice(sourceIndex, 1);
    productsCopy.splice(destinationIndex, 0, movedProduct);
    
    // Actualizar en el servidor
    reorderProducts(productsCopy);
  };
  
  return (
    <div className="space-y-4">
      {/* Botón para agregar nuevo producto */}
      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Nuevo Producto
        </button>
        
        <button
          type="button"
          className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
            isReorderModeActive 
              ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' 
              : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
          }`}
          onClick={() => setIsReorderModeActive(!isReorderModeActive)}
        >
          {isReorderModeActive ? 'Terminar Reordenación' : 'Reordenar Productos'}
        </button>
      </div>
      
      {/* Lista de productos */}
      {isLoading && products.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <p className="text-center text-gray-500">
            No hay productos en esta sección. ¡Agrega uno!
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="products" isDropDisabled={!isReorderModeActive}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {products.map((product, index) => (
                  <Draggable 
                    key={product.product_id} 
                    draggableId={`product-${product.product_id}`} 
                    index={index}
                    isDragDisabled={!isReorderModeActive}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-white rounded-lg shadow px-4 py-3 sm:px-6 flex items-center justify-between ${
                          snapshot.isDragging ? 'border-2 border-indigo-300' : ''
                        } ${product.status === 0 ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-center space-x-4">
                          {/* Imagen del producto */}
                          <div className="flex-shrink-0 h-12 w-12 relative overflow-hidden rounded-md bg-gray-100">
                            {product.image ? (
                              <Image
                                src={getImagePath(product.image, 'products')}
                                alt={product.name}
                                fill
                                className="object-cover"
                                onError={(e: any) => {
                                  e.target.src = '/images/placeholder.jpg';
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full bg-gray-200">
                                <span className="text-gray-400 text-xs">Sin imagen</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Información del producto */}
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.price}€</p>
                            {product.description && (
                              <p className="text-xs text-gray-400 truncate max-w-xs">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Acciones */}
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            className="p-1 text-gray-400 hover:text-gray-500"
                            onClick={() => handleToggleVisibility(product)}
                          >
                            {product.status === 1 ? (
                              <EyeIcon className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                            )}
                            <span className="sr-only">
                              {product.status === 1 ? 'Ocultar' : 'Mostrar'}
                            </span>
                          </button>
                          
                          <button
                            type="button"
                            className="p-1 text-indigo-400 hover:text-indigo-500"
                            onClick={() => handleEditProduct(product)}
                          >
                            <PencilIcon className="h-5 w-5" aria-hidden="true" />
                            <span className="sr-only">Editar</span>
                          </button>
                          
                          <button
                            type="button"
                            className="p-1 text-red-400 hover:text-red-500"
                            onClick={() => handleDeleteModalOpen(product)}
                          >
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                            <span className="sr-only">Eliminar</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
      
      {/* Modal para crear producto */}
      <ProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateProduct}
        isLoading={isLoading}
        mode="create"
        product={{ section_id: sectionId } as Product}
      />
      
      {/* Modal para editar producto */}
      {selectedProduct && (
        <ProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSave={handleUpdateProduct}
          isLoading={isLoading}
          mode="edit"
        />
      )}
      
      {/* Modal de confirmación para eliminar */}
      {selectedProduct && (
        <div className={`fixed inset-0 z-50 overflow-y-auto ${isDeleteModalConfirmOpen ? 'block' : 'hidden'}`}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsDeleteModalConfirmOpen(false)}></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Eliminar Producto
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      ¿Estás seguro de que quieres eliminar el producto "{selectedProduct.name}"? Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleConfirmDelete}
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setIsDeleteModalConfirmOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
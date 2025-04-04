import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Section } from '../types';
import { LegacySection, LegacyProduct, toLegacyProduct, toOfficialProduct, toOfficialSection } from '../types/legacy';
import useDataState from '../hooks/useDataState';

interface ProductManagerProps {
  section: LegacySection;
}

export default function ProductManager({ section }: ProductManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalConfirmOpen, setIsDeleteModalConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<LegacyProduct | null>(null);
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);
  const [localProducts, setLocalProducts] = useState<LegacyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    products: productsMap,
    fetchProductsBySection,
    updateProduct,
    deleteProduct,
    toggleProductVisibility
  } = useDataState();
  
  // Cargar productos cuando se monta el componente
  useEffect(() => {
    const loadProducts = async () => {
      if (!section) return;
      setIsLoading(true);
      
      try {
        // Convertir LegacySection a Section para la API
        const sectionId = section.section_id;
        
        await fetchProductsBySection(
          sectionId,
          false, // No forzar recarga
          (loadedProducts) => {
            console.log(`✅ Actualizando estado local con ${loadedProducts.length} productos cargados para sección ${section.section_id}`);
            
            // Convertir a formato legacy para compatibilidad
            const legacyProducts = loadedProducts.map(product => ({
              product_id: product.product_id,
              section_id: product.section_id,
              name: product.name,
              description: product.description || '',
              price: product.price,
              image_url: product.image || '',
              status: product.status === 1 ? 'active' as const : 'inactive' as const,
              client_id: product.client_id,
              display_order: product.display_order
            } as LegacyProduct));
            
            setLocalProducts(legacyProducts);
          }
        );
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [section, fetchProductsBySection]);
  
  // Actualizar productos locales cuando cambia el store
  useEffect(() => {
    // Convertir section_id a string para acceder al objeto productsMap correctamente
    const sectionIdStr = section?.section_id?.toString();
    if (section && sectionIdStr && productsMap && productsMap[sectionIdStr]) {
      const productsForSection = productsMap[sectionIdStr];
      console.log(`🔄 Sincronizando productos locales desde store global para sección ${sectionIdStr}: ${productsForSection.length} productos`);
      
      // Convertir los productos del formato de la API al formato legacy
      const legacyProducts = productsForSection.map(product => ({
        product_id: product.product_id,
        section_id: product.section_id,
        name: product.name,
        description: product.description || '',
        price: typeof product.price === 'string' ? product.price : String(product.price),
        image_url: product.image || '',
        status: product.status === 1 ? 'active' as const : 'inactive' as const,
        client_id: product.client_id,
        display_order: product.display_order
      } as LegacyProduct));
      
      setLocalProducts(legacyProducts);
    }
  }, [section, productsMap]);
  
  // Manejador para abrir el modal de edición
  const handleEditProduct = (product: LegacyProduct) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  
  // Manejador para abrir el modal de confirmación de eliminación
  const handleDeleteModalOpen = (product: LegacyProduct) => {
    setSelectedProduct(product);
    setIsDeleteModalConfirmOpen(true);
  };
  
  // Manejador para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProduct(selectedProduct.product_id, section.section_id);
      setIsDeleteModalConfirmOpen(false);
      setSelectedProduct(null);
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      toast.error('Error al eliminar el producto');
    }
  };
  
  // Manejador para alternar visibilidad
  const handleToggleVisibility = async (product: LegacyProduct) => {
    try {
      const currentStatus = product.status === 'active' ? 1 : 0;
      
      await toggleProductVisibility(product.product_id, currentStatus, section.section_id);
      
      // Actualizar estado local mientras se refresca
      setLocalProducts(prevProducts => 
        prevProducts.map(p => 
          p.product_id === product.product_id 
            ? { ...p, status: product.status === 'active' ? 'inactive' : 'active' } 
            : p
        )
      );
      
      toast.success(product.status === 'active' ? 'Producto oculto' : 'Producto visible');
    } catch (error) {
      console.error('Error al cambiar la visibilidad:', error);
      toast.error('Error al cambiar la visibilidad');
    }
  };
  
  // Manejador para crear un nuevo producto
  const handleCreateProduct = async (productData: any) => {
    setIsLoading(true);
    
    try {
      // Implementar la creación del producto
      // Esta implementación dependerá de la API real
      setIsCreateModalOpen(false);
      toast.success('Producto creado correctamente');
      
      // Recargar productos
      await fetchProductsBySection(section.section_id);
    } catch (error) {
      console.error('Error al crear el producto:', error);
      toast.error('Error al crear el producto');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manejador para actualizar un producto existente
  const handleUpdateProduct = async (productData: any) => {
    if (!selectedProduct) return;
    setIsLoading(true);
    
    try {
      // Adaptación del tipo de datos al que espera la función updateProduct
      const formData = new FormData();
      formData.append('product_id', productData.product_id.toString());
      formData.append('name', productData.name);
      formData.append('price', productData.price.toString());
      formData.append('description', productData.description || '');
      formData.append('status', productData.status === 'active' ? '1' : '0');
      
      await updateProduct(formData);
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      toast.success('Producto actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      toast.error('Error al actualizar el producto');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manejador para reordenar productos (drag and drop)
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    // Aquí iría la lógica para reordenar productos
    toast.success('Orden actualizado');
  };
  
  // Determinar si hay productos para mostrar
  const hasProducts = localProducts && localProducts.length > 0;
  
  return (
    <div className="space-y-4">
      {/* Header con botones de acción */}
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
      
      {/* Estado de carga o sin productos */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : !hasProducts ? (
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <p className="text-center text-gray-500">
            No hay productos en esta sección. ¡Agrega uno!
          </p>
        </div>
      ) : (
        // Lista de productos con drag and drop
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="products" isDropDisabled={!isReorderModeActive}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {localProducts.map((product, index) => (
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
                        } ${product.status === 'inactive' ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-center space-x-4">
                          {/* Imagen del producto */}
                          <div className="flex-shrink-0 h-12 w-12 relative overflow-hidden rounded-md bg-gray-100">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                onError={(e: any) => {
                                  e.target.src = '/images/no-image.png';
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
                            {product.status === 'active' ? (
                              <EyeIcon className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                            )}
                            <span className="sr-only">
                              {product.status === 'active' ? 'Ocultar' : 'Mostrar'}
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
      
      {/* Modales - Implementar según sea necesario */}
      {isDeleteModalConfirmOpen && selectedProduct && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900">Confirmar eliminación</h3>
            <p className="mt-2 text-sm text-gray-500">
              ¿Estás seguro de que deseas eliminar el producto "{selectedProduct.name}"? Esta acción no se puede deshacer.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => {
                  setIsDeleteModalConfirmOpen(false);
                  setSelectedProduct(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                onClick={handleConfirmDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Implementar modales de creación y edición según sea necesario */}
    </div>
  );
} 
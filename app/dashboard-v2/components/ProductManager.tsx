/**
 * @fileoverview Componente ProductManager - Gestiona los productos de una sección
 * 
 * IMPORTANTE: Este componente NO incluye su propio DragDropContext.
 * Debe ser usado dentro del DragDropContext global definido en DashboardView.tsx.
 * 
 * @autor RokaMenu Team
 * @version 2.0
 * @updated 2024-06-18
 */

import React, { useState, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { Bars3Icon as Bars3IconSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Section } from '../types';
import { LegacySection, LegacyProduct, toLegacyProduct, toOfficialProduct, toOfficialSection } from '../types/legacy';
import useDataState from '../hooks/useDataState';

/**
 * Props para el componente ProductManager
 */
interface ProductManagerProps {
  /** Sección cuyos productos se gestionarán */
  section: LegacySection;
}

/**
 * Componente que gestiona los productos de una sección específica
 * Permite visualizar, reordenar, editar y eliminar productos
 * 
 * IMPORTANTE: Este componente NO incluye su propio DragDropContext,
 * debe ser utilizado dentro del DragDropContext global en DashboardView.
 */
export default function ProductManager({ section }: ProductManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<LegacyProduct | null>(null);
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usar hook de estado global
  const { 
    products, 
    fetchProductsBySection, 
    toggleProductVisibility, 
    deleteProduct
  } = useDataState();

  // ID de sección convertido a número
  const sectionId = parseInt(section.section_id.toString(), 10);
  
  // ID único para el Droppable basado en la sección
  const droppableId = `products-section-${sectionId}`;

  // Productos para esta sección
  const sectionProducts = products[sectionId] || [];
  
  // Separar productos visibles y ocultos
  const visibleProducts = sectionProducts.filter(p => p.status === 1);
  const hiddenProducts = sectionProducts.filter(p => p.status === 0);
  
  // Productos ordenados por display_order
  const sortedProducts = [...sectionProducts].sort(
    (a, b) => (a.display_order || 999) - (b.display_order || 999)
  );
  
  // Estado para mostrar/ocultar productos ocultos
  const [showHiddenProducts, setShowHiddenProducts] = useState(true);
  
  // Estado para producto que está actualizando visibilidad
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null);

  // Cargar productos al montar
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        await fetchProductsBySection(sectionId);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setError("No se pudieron cargar los productos");
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [sectionId, fetchProductsBySection]);

  // Manejar cambio de visibilidad de producto
  const handleToggleVisibility = async (productId: number) => {
    try {
      const product = sectionProducts.find(p => p.product_id === productId);
      if (!product) return;
      
      setUpdatingProductId(productId);
      await toggleProductVisibility(
        productId, 
        product.status === 1 ? 0 : 1, 
        sectionId
      );
      setUpdatingProductId(null);
    } catch (error) {
      console.error("Error al cambiar visibilidad:", error);
      toast.error("Error al cambiar la visibilidad");
      setUpdatingProductId(null);
    }
  };

  // Manejar reordenamiento de productos
  const handleProductReorder = (sourceIndex: number, destinationIndex: number) => {
    // Esta lógica será manejada por el DragDropContext global
    console.log(`Reordenando producto de ${sourceIndex} a ${destinationIndex}`);
  };

  // Filtrar productos según visibilidad
  const hasProducts = sectionProducts.length > 0;
  
  // Manejar selección de producto para editar
  const handleEditProduct = (product: LegacyProduct) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  
  // Manejar selección de producto para eliminar
  const handleDeleteProduct = (product: LegacyProduct) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };
  
  // Confirmar eliminación de producto
  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProduct(
        parseInt(selectedProduct.product_id.toString(), 10), 
        sectionId
      );
      toast.success("Producto eliminado correctamente");
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast.error("Error al eliminar el producto");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        <p>{error}</p>
      </div>
    );
  }

  if (!hasProducts) {
    return (
      <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
        <p className="text-center text-gray-500">
          No hay productos en esta sección. ¡Agrega uno!
        </p>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Agregar Producto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Productos en {section.name}
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowHiddenProducts(!showHiddenProducts)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {showHiddenProducts ? "Ocultar" : "Mostrar"} productos ocultos
            </button>
            <button
              onClick={() => setIsReorderModeActive(!isReorderModeActive)}
              className={`px-3 py-1 text-sm font-medium rounded ${
                isReorderModeActive
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {isReorderModeActive ? "Guardar Orden" : "Reordenar"}
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
            >
              Agregar Producto
            </button>
          </div>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {visibleProducts.length} de {sectionProducts.length} productos visibles
        </p>
      </div>

      {/* IMPORTANTE: No hay DragDropContext aquí, solo Droppable */}
      <Droppable droppableId={droppableId} type="PRODUCT" isDropDisabled={!isReorderModeActive}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {sortedProducts
              .filter(product => product.status === 1 || showHiddenProducts)
              .map((product, index) => (
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
                      className={`border ${
                        product.status === 0 ? "border-gray-200 bg-gray-50" : "border-gray-200"
                      } rounded-md ${
                        snapshot.isDragging ? "shadow-md bg-blue-50" : ""
                      } p-4 mx-4 my-2`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          {/* Handle de arrastre */}
                          <div 
                            {...provided.dragHandleProps}
                            className="mr-3 product-drag-handle rounded p-1.5"
                            onClick={(e) => {
                              // Detener propagación para evitar conflictos
                              e.stopPropagation();
                            }}
                          >
                            <Bars3IconSolid className="h-5 w-5" />
                          </div>
                          
                          {/* Imagen del producto */}
                          <div className="h-12 w-12 bg-gray-200 rounded-md overflow-hidden mr-4 flex-shrink-0">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={48}
                                height={48}
                                className={`object-cover w-full h-full ${
                                  product.status === 0 ? "opacity-50 grayscale" : ""
                                }`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-xs">Sin img</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Detalles del producto */}
                          <div>
                            <h4 className={`text-sm font-medium ${
                              product.status === 0 ? "text-gray-500" : "text-gray-900"
                            }`}>
                              {product.name}
                            </h4>
                            {product.description && (
                              <p className="text-xs text-gray-500 mt-1 max-w-md truncate">
                                {product.description}
                              </p>
                            )}
                            <div className="mt-1 flex items-center">
                              <span className={`text-sm font-medium ${
                                product.status === 0 ? "text-gray-400" : "text-gray-900"
                              }`}>
                                ${typeof product.price === 'number' 
                                  ? (product.price as number).toFixed(2) 
                                  : product.price.toString()}
                              </span>
                              {/* El precio con descuento se mostraría aquí si estuviera disponible */}
                            </div>
                          </div>
                        </div>
                        
                        {/* Acciones */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleVisibility(product.product_id)}
                            className={`p-1.5 rounded ${
                              product.status === 1
                                ? "text-indigo-600 hover:bg-indigo-50"
                                : "text-gray-400 hover:bg-gray-50"
                            }`}
                            disabled={updatingProductId === product.product_id}
                          >
                            {updatingProductId === product.product_id ? (
                              <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : product.status === 1 ? (
                              <EyeIcon className="h-5 w-5" />
                            ) : (
                              <EyeSlashIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditProduct(toLegacyProduct(product))}
                            className="p-1.5 rounded text-indigo-600 hover:bg-indigo-50"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(toLegacyProduct(product))}
                            className="p-1.5 rounded text-red-600 hover:bg-red-50"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      {/* Botón para agregar productos */}
      <div className="px-4 py-4 border-t border-gray-200 flex justify-center">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Agregar Producto
        </button>
      </div>
      
      {/* Modal de eliminación */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Eliminar Producto
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              ¿Estás seguro que quieres eliminar el producto "{selectedProduct.name}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteProduct}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Aquí irían los modales de creación y edición */}
    </div>
  );
} 
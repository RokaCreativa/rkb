import React from 'react';
import { Category, Section, Product, Client } from '@/app/types/menu';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

/**
 * Props para el componente ProductsView
 */
interface ProductsViewProps {
  /**
   * Categoría seleccionada actualmente
   */
  selectedCategory: Category;
  
  /**
   * Sección seleccionada actualmente
   */
  selectedSection: Section;
  
  /**
   * Lista de productos a mostrar
   */
  products: Product[];
  
  /**
   * Función que se ejecuta para crear un nuevo producto
   */
  onNewProduct: () => void;
  
  /**
   * Función que se ejecuta para editar un producto
   * @param product Producto a editar
   */
  onEditProduct: (product: Product) => void;
  
  /**
   * Función que se ejecuta para eliminar un producto
   * @param productId ID del producto a eliminar
   */
  onDeleteProduct: (productId: number) => void;
  
  /**
   * Función que se ejecuta para cambiar la visibilidad de un producto
   * @param productId ID del producto
   */
  onToggleVisibility: (productId: number) => Promise<void>;
  
  /**
   * ID del producto que está actualizando su visibilidad
   */
  isUpdatingVisibility: number | null;
  
  /**
   * Función que se ejecuta para reordenar productos
   * @param sourceIndex Índice de origen
   * @param destinationIndex Índice de destino
   */
  onReorderProduct: (sourceIndex: number, destinationIndex: number) => void;
  
  /**
   * Función que se ejecuta para volver a la vista anterior
   */
  onBackClick: () => void;
  
  /**
   * Lista completa de categorías
   */
  allCategories: Category[];
  
  /**
   * Registro completo de secciones por categoría
   */
  allSections: Record<string, Section[]>;
  
  /**
   * Registro completo de productos por sección
   */
  allProducts: Record<string, Product[]>;
  
  /**
   * Información del cliente
   */
  client: Client | null;
}

/**
 * Componente que muestra la lista de productos de una sección
 * Permite la creación, edición, eliminación y reordenación de productos
 */
const ProductsView: React.FC<ProductsViewProps> = ({
  selectedCategory,
  selectedSection,
  products,
  onNewProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleVisibility,
  isUpdatingVisibility,
  onReorderProduct,
  onBackClick,
  allCategories,
  allSections,
  allProducts,
  client
}) => {
  // Formatea el precio para mostrar 2 decimales
  const formatPrice = (price: number): string => {
    return price.toFixed(2).replace('.', ',') + ' €';
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <button
            type="button"
            onClick={onBackClick}
            className="mr-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <h2 className="text-lg font-medium text-gray-900">
            Productos: {selectedSection.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onNewProduct}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Nuevo Producto
        </button>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {products.length === 0 ? (
          <li className="p-4 text-center text-sm text-gray-500">
            No hay productos disponibles en esta sección. ¡Crea un nuevo producto para comenzar!
          </li>
        ) : (
          products.map((product, index) => (
            <li 
              key={product.product_id} 
              className="px-4 py-3 flex flex-col sm:flex-row sm:items-center hover:bg-gray-50"
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', index.toString());
                e.currentTarget.classList.add('bg-gray-100');
              }}
              onDragEnd={(e) => {
                e.currentTarget.classList.remove('bg-gray-100');
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('bg-blue-50');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-blue-50');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-blue-50');
                const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
                onReorderProduct(sourceIndex, index);
              }}
            >
              <div className="flex-1 flex items-center mb-2 sm:mb-0">
                {product.image ? (
                  <div className="relative h-14 w-14 mr-3">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                      sizes="56px"
                    />
                  </div>
                ) : (
                  <div className="h-14 w-14 bg-gray-200 rounded mr-3 flex items-center justify-center">
                    <span className="text-xs text-gray-500">Sin img</span>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600 font-medium">{formatPrice(Number(product.price))}</p>
                  <p className="text-xs text-gray-500 max-w-md line-clamp-1">
                    {product.description || 'Sin descripción'}
                  </p>
                </div>
              </div>
              
              <div className="sm:ml-4 flex items-center space-x-2 mt-2 sm:mt-0">
                <button
                  type="button"
                  onClick={() => onToggleVisibility(product.product_id)}
                  disabled={isUpdatingVisibility === product.product_id}
                  className={`px-2 py-1 text-xs rounded-md ${
                    product.status === 1
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {isUpdatingVisibility === product.product_id ? 'Actualizando...' : product.status === 1 ? 'Visible' : 'Oculto'}
                </button>
                
                <button
                  type="button"
                  onClick={() => onEditProduct(product)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
                
                <button
                  type="button"
                  onClick={() => onDeleteProduct(product.product_id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ProductsView; 
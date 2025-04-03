"use client";

/**
 * @fileoverview Componente de vista para la visualización y gestión de productos
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { ChevronLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Product, Section } from "@/app/dashboard-v2/types";
import { ProductTable } from "../ProductTable";

/**
 * Props para el componente ProductView
 */
interface ProductViewProps {
  products: Product[];
  sectionName: string;
  sectionId: number;
  isUpdatingVisibility: number | null;
  onAddProduct: () => void;
  onToggleProductVisibility: (productId: number, currentStatus: number, sectionId: number) => Promise<void>;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  isLoading?: boolean;
}

/**
 * Componente que gestiona la visualización y acciones relacionadas con productos
 * 
 * Esta vista centraliza la interacción con los productos de una sección específica, incluyendo:
 * - Lista de productos con sus propiedades
 * - Acciones para editar y eliminar productos
 * - Navegación entre secciones y productos
 * - Delegación de eventos a los componentes padres a través de callbacks
 * 
 * @param {ProductViewProps} props - Propiedades del componente
 * @returns {JSX.Element} La vista de productos renderizada
 */
export default function ProductView({
  products,
  sectionName,
  sectionId,
  isUpdatingVisibility,
  onAddProduct,
  onToggleProductVisibility,
  onEditProduct,
  onDeleteProduct,
  isLoading = false
}: ProductViewProps) {
  const adaptedProducts = products.map(p => ({
    id: p.product_id,
    name: p.name,
    description: p.description,
    image: p.image,
    price: p.price,
    discount_price: p.discount_price,
    status: p.status,
  }));
  
  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Productos: {sectionName}
          </h1>
          
          <button
            onClick={onAddProduct}
            className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md shadow-sm"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Añadir producto
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40 bg-white rounded-lg border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <ProductTable 
          products={adaptedProducts}
          sectionId={sectionId}
          sectionName={sectionName}
          isUpdatingVisibility={isUpdatingVisibility}
          onToggleVisibility={(productId, status, sectionIdParam) => 
            onToggleProductVisibility(productId, status, sectionIdParam || sectionId)
          }
          onEditProduct={(productFromTable) => {
            const originalProduct = products.find(p => p.product_id === productFromTable.id);
            if (originalProduct) {
              onEditProduct(originalProduct);
            }
          }}
          onDeleteProduct={async (productId) => {
            const originalProduct = products.find(p => p.product_id === productId);
            if (originalProduct) {
              onDeleteProduct(originalProduct);
            }
            return true;
          }}
        />
      )}
    </>
  );
} 
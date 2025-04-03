"use client";

/**
 * @fileoverview Componente de vista para la visualización y gestión de productos
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { ProductTable } from "../ProductTable";
import { Product, Section } from "@/app/types/menu";

/**
 * Props para el componente ProductView
 */
interface ProductViewProps {
  selectedSection: Section;
  products: Product[];
  isUpdatingVisibility: number | null;
  onBackToSections: () => void;
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
  selectedSection,
  products,
  isUpdatingVisibility,
  onBackToSections,
  onToggleProductVisibility,
  onEditProduct,
  onDeleteProduct,
  isLoading = false
}: ProductViewProps) {
  return (
    <>
      <div className="mb-6">
        <button
          onClick={onBackToSections}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Volver a secciones
        </button>
        
        <h1 className="text-2xl font-bold text-gray-800">
          Productos: {selectedSection.name}
        </h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40 bg-white rounded-lg border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <ProductTable 
          products={products}
          sectionId={selectedSection.section_id}
          sectionName={selectedSection.name}
          onToggleProductVisibility={onToggleProductVisibility}
          isUpdatingVisibility={isUpdatingVisibility}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
        />
      )}
    </>
  );
} 
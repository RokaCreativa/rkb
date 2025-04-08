"use client";

import React from 'react';
import { Product, Section } from '@/app/types/menu';
import ProductList from './ProductList';
import { CompatibleProduct } from '@/app/dashboard-v2/types/type-adapters';

interface ProductTableProps {
  products: Product[];
  client?: any;
  loading?: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setProducts?: React.Dispatch<React.SetStateAction<Record<string, Product[]>>>;
  isUpdatingVisibility: number | null;
  onToggleVisibility: (productId: number, currentStatus: number, sectionId?: number) => void | Promise<void>;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  sectionId?: number;
  sectionName?: string;
  isReorderModeActive?: boolean;
  onReorderProduct?: (sectionId: number, sourceIndex: number, destinationIndex: number) => void;
  onAddProduct?: (sectionId: number) => void;
}

/**
 * ProductTable - Componente envoltorio que ahora utiliza ProductList internamente
 * Mantenemos este componente por compatibilidad con código existente
 * 
 * @version 1.0.0
 * @updated 2024-07-21
 */
export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  sectionName,
  sectionId,
  isUpdatingVisibility,
  onToggleVisibility,
  onEditProduct,
  onDeleteProduct,
  isReorderModeActive = false,
  onReorderProduct,
  onAddProduct
}) => {
  // Adaptadores para las funciones de edición y eliminación
  const handleEditProduct = (product: CompatibleProduct) => {
    onEditProduct(product as unknown as Product);
  };

  const handleDeleteProduct = (product: CompatibleProduct) => {
    onDeleteProduct(product as unknown as Product);
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 bg-white rounded-md border border-amber-200">
        No hay productos disponibles
      </div>
    );
  }

  return (
    <ProductList
      products={products}
      sectionId={sectionId}
      sectionName={sectionName}
      onToggleVisibility={onToggleVisibility}
      onEditProduct={handleEditProduct}
      onDeleteProduct={handleDeleteProduct}
      isUpdatingVisibility={isUpdatingVisibility}
      isReorderModeActive={isReorderModeActive}
      onProductsReorder={onReorderProduct}
      onAddProduct={sectionId ? () => onAddProduct?.(sectionId) : undefined}
    />
  );
}; 
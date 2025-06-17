/**
 * @fileoverview Componente ProductList - Lista de productos con soporte para arrastrar y soltar (drag and drop)
 * Este componente muestra los productos de una sección específica en formato de tabla
 * y permite arrastrar y reordenar los productos visibles.
 * 
 * IMPORTANTE: Este componente NO incluye su propio DragDropContext.
 * Debe ser usado dentro del DragDropContext global definido en DashboardView.tsx.
 * 
 * @autor RokaMenu Team
 * @version 2.0
 * @updated 2024-07-22
 */

'use client';
import React from 'react';
import { Product } from '@/app/dashboard-v2/types';
import { GenericRow } from '@/app/dashboard-v2/components/ui/Table/GenericRow';
import { ActionIcon } from '@/app/dashboard-v2/components/ui/Button/ActionIcon';
import { Pencil, Trash, Eye, EyeOff } from 'lucide-react';

export interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleVisibility: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
  onToggleVisibility,
}) => {

  const renderActions = (product: Product) => (
    <>
      <ActionIcon
        Icon={product.status ? Eye : EyeOff}
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility(product);
        }}
        iconClassName={product.status ? "text-gray-600" : "text-gray-400"}
      />
      <ActionIcon
        Icon={Pencil}
        onClick={(e) => {
          e.stopPropagation();
          onEdit(product);
        }}
        iconClassName="text-gray-600"
      />
      <ActionIcon
        Icon={Trash}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(product);
        }}
        iconClassName="text-gray-600"
      />
    </>
  );

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No hay productos en esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product) => {
        const subtitle = [
          product.price ? `$${Number(product.price).toFixed(2)}` : null,
          product.description,
        ]
          .filter(Boolean)
          .join(' - ');

        return (
          <GenericRow
            key={product.product_id}
            id={product.product_id}
            title={product.name}
            subtitle={subtitle}
            imageSrc={product.image}
            imageAlt={product.name ?? 'Producto'}
            imageType="products"
            actions={renderActions(product)}
            onClick={() => onEdit(product)}
            className={!product.status ? 'opacity-50' : ''}
            isSelected={false}
            isReorderMode={false}
          />
        );
      })}
    </div>
  );
};

export default ProductList; 
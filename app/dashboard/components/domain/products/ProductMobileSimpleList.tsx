/**
 * 🧭 MIGA DE PAN CONTEXTUAL: ProductList - Componente TONTO de Productos
 *
 * 📍 UBICACIÓN: app/dashboard-v2/components/domain/products/ProductList.tsx
 *
 * 🎯 PORQUÉ EXISTE:
 * Componente de presentación PURA que renderiza listas de productos.
 * Cumple estrictamente el Mandamiento #7 de separación de lógica y presentación.
 * NO contiene lógica de negocio, solo renderización y callbacks.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Recibe productos y callbacks como props
 * 2. Renderiza cada producto usando GenericRow
 * 3. Emite eventos a través de callbacks (onClick, onEdit, etc.)
 * 4. NO maneja estado interno ni efectos secundarios
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - PADRE: ProductTable.tsx, MobileView.tsx
 * - HIJO: GenericRow.tsx, ActionIcon.tsx
 * - USADO EN: Vista móvil y desktop para mostrar productos
 *
 * 🚨 PROBLEMAS RESUELTOS:
 * - ANTES: Archivos duplicados (ProductListView, ProductListItem)
 * - SOLUCIÓN: Un solo componente tonto, limpio y reutilizable
 * - FECHA: 2025-01-25 - Limpieza de archivos obsoletos
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7: Componente TONTO - solo presentación
 * - Sin lógica de negocio, sin estado, sin efectos secundarios
 * - Responsabilidad única: renderizar lista de productos
 *
 * @version 2.1.0 - Limpieza y documentación actualizada
 * @updated 2025-01-25
 */

'use client';
import React from 'react';
import { Product } from '@/app/dashboard-v2/types';
import { GenericRow } from '@/app/dashboard/components/ui/Table/GenericRow';
import { ActionIcon } from '@/app/dashboard/components/ui/Button/ActionIcon';
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
            isSelected={false}
            status={product.status}
          />
        );
      })}
    </div>
  );
};

export default ProductList; 
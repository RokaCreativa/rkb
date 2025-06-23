/**
 * 🧭 MIGA DE PAN CONTEXTUAL: ProductTable - Wrapper Legacy
 *
 * 📍 UBICACIÓN: app/dashboard-v2/components/domain/products/ProductTable.tsx
 *
 * 🎯 PORQUÉ EXISTE:
 * Componente wrapper legacy que mantiene compatibilidad con código existente
 * mientras internamente usa ProductList. Sigue Mandamiento #7 de separación
 * estricta entre lógica y presentación.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Recibe props legacy del código existente
 * 2. Adapta las props al formato que espera ProductList
 * 3. Delega toda la renderización a ProductList (componente tonto)
 * 4. NO contiene lógica de negocio, solo adaptación de tipos
 *
 * 🚨 PROBLEMAS RESUELTOS:
 * - ANTES: Mezclaba lógica de adaptación con renderización
 * - SOLUCIÓN: Separación clara - solo adaptación de tipos y delegación
 * - FECHA: 2025-01-25 - Refactorización según Mandamiento #7
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7: Separación absoluta de lógica y presentación
 * - Este componente es TONTO - solo adapta props y delega renderización
 */

"use client";

import React from 'react';
import { Product } from '@/app/dashboard-v2/types';
import { ProductList } from './ProductList';

/**
 * Props simplificadas para ProductTable - solo lo esencial
 * Eliminadas props innecesarias que violaban la separación de responsabilidades
 */
interface ProductTableProps {
  products: Product[];
  onToggleVisibility: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

/**
 * ProductTable - Componente TONTO que solo adapta y delega
 * 
 * 🎯 RESPONSABILIDAD ÚNICA: Adaptar props legacy a ProductList
 * ✅ CUMPLE Mandamiento #7: Sin lógica de negocio, solo presentación
 * 
 * @version 2.0.0 - Refactorizado según Mandamiento #7
 * @updated 2025-01-25
 */
export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onToggleVisibility,
  onEdit,
  onDelete
}) => {
  // 🎯 COMPONENTE TONTO: Solo renderización, sin lógica
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 bg-white rounded-md border border-amber-200">
        No hay productos disponibles
      </div>
    );
  }

  // 🎯 DELEGACIÓN PURA: Pasa props sin transformación
  return (
    <ProductList
      products={products}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleVisibility={onToggleVisibility}
    />
  );
}; 
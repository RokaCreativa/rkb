/**
 * 🧭 MIGA DE PAN CONTEXTUAL MAESTRA: Grid de Productos de una Sección (Columna 3)
 *
 * 📍 UBICACIÓN: app/dashboard-v2/components/domain/products/ProductGridView.tsx
 *
 * 🎯 PORQUÉ EXISTE:
 * Este componente es el tercer y último pilar de la vista de escritorio, representando el nivel más
 * profundo de la jerarquía del menú (Categorías -> Secciones -> Productos). Su única responsabilidad
 * es mostrar la lista de productos que pertenecen a la sección seleccionada en la Columna 2.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. A diferencia de los otros dos grids, este componente NO maneja una lista mixta. Recibe
 *    una lista simple de `Product[]` desde `DashboardView`.
 * 2. Muestra un estado vacío si no hay ninguna sección seleccionada (`isSectionSelected` es false).
 * 3. Itera sobre la lista de productos y renderiza un `GenericRow` para cada uno.
 * 4. Pasa al `GenericRow` no solo las acciones estándar, sino también componentes específicos
 *    como el `showcaseIcon` (para destacar productos) y los `reorderHandles` (para el modo de reordenar).
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - **PADRE:** `DashboardView.tsx` (le provee datos y callbacks).
 * - **HIJO:** `GenericRow.tsx` (usado para renderizar cada fila).
 * - **CONSUME ESTADO DE:** `useDashboardStore` (solo para `isReorderMode`).
 *
 * 🚨 PROBLEMA RESUELTO (Refactorización):
 * Antes, este componente tenía estilos y lógica de fila hardcodeados. Al adoptar `GenericRow`,
 * se alinea visualmente con los otros grids, asegurando consistencia (Mandamiento #8) y
 * centralizando la lógica de renderizado de filas en un solo lugar.
 *
 * ⚠️ REGLAS DE NEGOCIO:
 * - Es CRÍTICO que `isSectionSelected` sea `true` para que este componente muestre algo.
 * - La acción `onToggleShowcase` es única de este grid y permite destacar un producto,
 *   lo que afecta cómo se muestra en la Columna 2.
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { Product } from '@/app/dashboard-v2/types/domain/product';
import { Star, Pencil, Trash, Move, Plus, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GenericRow } from '@/app/dashboard-v2/components/ui/Table/GenericRow';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { ActionIcon } from '../../ui/Button/ActionIcon';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';

import { ArrowUp, ArrowDown } from 'lucide-react';

interface ProductGridViewProps {
    products: Product[];
    title: string;
    onToggleVisibility: (item: Product) => void;
    onToggleShowcase: (productId: number) => Promise<void>;
    onEdit: (item: Product) => void;
    onDelete: (item: Product) => void;
    onAddNew: () => void;
    isSectionSelected: boolean;
}

export const ProductGridView: React.FC<ProductGridViewProps> = ({
    products,
    title,
    onToggleVisibility,
    onToggleShowcase,
    onEdit,
    onDelete,
    onAddNew,
    isSectionSelected,
}) => {

    const renderActions = (product: Product) => (
        <div className="flex items-center">
            <ActionIcon Icon={product.status ? Eye : EyeOff} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleVisibility(product); }} />
            <ActionIcon Icon={Pencil} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(product); }} />
            <ActionIcon Icon={Trash} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(product); }} className="hover:text-red-600" />
        </div>
    );

    const renderShowcaseIcon = (product: Product) => (
        <ActionIcon
            Icon={Star}
            onClick={e => {
                e.stopPropagation();
                onToggleShowcase(product.product_id);
            }}
            aria-label={
                product.is_showcased ? 'Quitar de destacados' : 'Marcar como destacado'
            }
            iconClassName={cn(
                'transition-all text-gray-600',
                product.is_showcased
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'hover:text-yellow-400',
            )}
        />
    );

    return (
        <div className="p-4 bg-white rounded-lg shadow-soft h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                <Button onClick={onAddNew} size="sm" disabled={!isSectionSelected}>
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Producto
                </Button>
            </div>
            <div className="space-y-2 overflow-y-auto flex-grow">
                {!isSectionSelected ? (
                    <div className="text-center py-10 flex items-center justify-center h-full">
                        <p className="text-gray-500">Selecciona una sección para ver sus productos.</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-10 flex items-center justify-center h-full">
                        <p className="text-gray-500">No hay productos en esta sección.</p>
                    </div>
                ) : (
                    products.map((product, index) => {
                        const subtitle = [
                            product.price ? `$${Number(product.price).toFixed(2)}` : null,
                            product.description
                        ].filter(Boolean).join(' - ');

                        return (
                            <GenericRow
                                key={product.product_id}
                                id={product.product_id}
                                isSelected={false}
                                imageSrc={product.image}
                                imageAlt={product.name ?? 'Producto'}
                                imageType="products"
                                title={product.name}
                                subtitle={subtitle}
                                status={product.status}
                                actions={renderActions(product)}
                                showcaseIcon={renderShowcaseIcon(product)}
                                onClick={() => onEdit(product)}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};

ProductGridView.displayName = 'ProductGridView';
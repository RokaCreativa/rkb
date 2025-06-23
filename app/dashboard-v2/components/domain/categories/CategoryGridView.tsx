/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Grid de Categorías y Productos Globales (Columna 1)
 *
 * 🎯 PORQUÉ EXISTE:
 * Muestra una lista mixta de Categorías y Productos Directos Globales. Esta estructura
 * de lista única es fundamental para el futuro reordenamiento drag-and-drop.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Recibe una lista `items` pre-mezclada de `DashboardView`.
 * 2. Usa un type guard (`isCategory`) para diferenciar ítems.
 * 3. Renderiza un `GenericRow` para cada ítem.
 * 4. Delega todas las acciones a los callbacks de `DashboardView`.
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - PADRE: `DashboardView.tsx`
 * - HIJO: `GenericRow.tsx`, `CategoryContentDisplay.tsx`
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Recibe una lista plana `items` de `DashboardView`, que ya contiene categorías y productos mezclados y ordenados.
 * 2. Itera sobre `items`. En cada iteración, usa el type guard `isCategory()` para determinar el tipo de ítem.
 * 3. Renderiza un componente `GenericRow` para cada ítem, pasándole las props adecuadas según sea
 *    una categoría o un producto.
 * 4. Delega todas las acciones (selección, edición, eliminación) a los manejadores que recibe de `DashboardView`.
 *    Este componente es "tonto" en cuanto a lógica de negocio.
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - **PADRE:** `DashboardView.tsx` (le provee datos y callbacks).
 * - **HIJO:** `GenericRow.tsx` (usado para renderizar cada fila).
 * - **HIJO:** `CategoryContentDisplay.tsx` (usado para mostrar contadores dentro de la fila de categoría).
 * - **CONSUME ESTADO DE:** `useDashboardStore` (solo para `isReorderMode`).
 *
 * ⚠️ REGLAS DE NEGOCIO:
 * - El type guard `isCategory` es la pieza clave que permite el funcionamiento de la lista mixta.
 * - Los productos directos mostrados aquí son los "Globales" (ver Bitácora #35), no son seleccionables
 *   para mostrar una tercera columna, y su click puede llevar directamente a la edición.
 * - La indentación visual (`className="ml-4"`) para los productos es una decisión de UI para
 *   diferenciarlos jerárquicamente, aunque estén en la misma lista plana.
 */
'use client';

import React, { useCallback } from 'react';
import { Category, Product } from '@/app/dashboard-v2/types';
import { GenericRow } from '@/app/dashboard-v2/components/ui/Table/GenericRow';
import { ActionIcon } from '@/app/dashboard-v2/components/ui/Button/ActionIcon';
import { PlusCircle, Trash2, Eye, EyeOff, Pencil } from 'lucide-react';
import { getImagePath } from '@/app/dashboard-v2/utils/imageUtils';

// 🛡️ Type Guard: Diferencia entre una Categoría y un Producto en la lista mixta.
function isCategory(item: Category | Product): item is Category {
    return 'category_id' in item && !('product_id' in item);
}

interface CategoryGridViewProps {
    items: (Category | Product)[];
    selectedCategoryId: number | null;
    onCategorySelect: (category: Category) => void;
    onProductSelect: (product: Product) => void;
    onToggleVisibility: (item: Category | Product) => void;
    onEdit: (item: Category | Product) => void;
    onDelete: (item: Category | Product) => void;
    onAddNewCategory: () => void;
    onAddNewProductDirect: () => void;
}

export const CategoryGridView: React.FC<CategoryGridViewProps> = ({
    items,
    selectedCategoryId,
    onCategorySelect,
    onProductSelect,
    onToggleVisibility,
    onEdit,
    onDelete,
    onAddNewCategory,
    onAddNewProductDirect,
}) => {

    const renderActions = (item: Category | Product) => {
        const isCat = isCategory(item);
        return (
            <div className="flex items-center">
                <ActionIcon
                    Icon={item.status ? Eye : EyeOff}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleVisibility(item); }}
                />
                <ActionIcon
                    Icon={Pencil}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(item); }}
                />
                <ActionIcon
                    Icon={Trash2}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(item); }}
                    className="hover:text-red-600"
                />
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Categorías</h2>
                <div className="flex gap-2">
                    <ActionIcon
                        Icon={PlusCircle}
                        onClick={onAddNewCategory}
                        className="text-blue-600 hover:text-blue-700"
                        title="Agregar nueva categoría"
                    />
                    <ActionIcon
                        Icon={PlusCircle}
                        onClick={onAddNewProductDirect}
                        className="text-green-600 hover:text-green-700"
                        title="Agregar producto directo global"
                    />
                </div>
            </div>

            <div className="space-y-2">
                {items.map((item) => {
                    const isItemCategory = isCategory(item);
                    const id = isItemCategory ? item.category_id : item.product_id;
                    const title = item.name;
                    const imageSrc = item.image;
                    const isSelected = isItemCategory && selectedCategoryId === item.category_id;

                    return (
                        <GenericRow
                            key={`${isItemCategory ? 'category' : 'product'}-${id}`}
                            id={id}
                            title={title}
                            imageSrc={imageSrc}
                            imageAlt={title || ''}
                            imageType={isItemCategory ? 'categories' : 'products'}
                            status={item.status}
                            isSelected={isSelected}
                            subtitle={isItemCategory ? undefined : `$${Number((item as Product).price).toFixed(2)}`}
                            onClick={() => {
                                if (isItemCategory) {
                                    onCategorySelect(item as Category);
                                } else {
                                    onProductSelect(item as Product);
                                }
                            }}
                            actions={renderActions(item)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

CategoryGridView.displayName = 'CategoryGridView'; 
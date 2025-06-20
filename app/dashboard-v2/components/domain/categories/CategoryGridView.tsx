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

import React, { useCallback, useMemo } from 'react';
import { Category, Product } from '@/app/dashboard-v2/types';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { Eye, EyeOff, Pencil, Trash, Plus } from 'lucide-react';

import { GenericRow } from '@/app/dashboard-v2/components/ui/Table/GenericRow';
import { ActionIcon } from '@/app/dashboard-v2/components/ui/Button/ActionIcon';
import { CategoryContentDisplay } from './CategoryContentDisplay';
import { ArrowUp, ArrowDown, PlusCircle, Trash2 } from 'lucide-react';
import { getImagePath } from '@/app/dashboard-v2/utils/imageUtils';

// 🛡️ Type Guard: Diferencia entre una Categoría y un Producto en la lista mixta.
// Se basa en la existencia de propiedades únicas para cada tipo.
function isCategory(item: Category | Product): item is Category {
    // La forma más segura es verificar la ausencia de una propiedad única del otro tipo.
    return !('price' in item);
}

interface CategoryGridViewProps {
    items: (Category | Product)[];
    selectedCategoryId?: number | null;
    isReorderMode: boolean;
    onCategorySelect: (category: Category) => void;
    onProductSelect: (product: Product) => void;
    onMoveItem: (itemId: number, direction: 'up' | 'down', itemType: 'category' | 'section' | 'product', contextId?: number | null) => Promise<void>;
    onToggleVisibility: (item: Category | Product) => void;
    onEdit: (item: Category | Product) => void;
    onDelete: (item: Category | Product, itemType: 'category' | 'product') => void;
    onAddNewCategory: () => void;
    onAddNewProductDirect: () => void;
}

export const CategoryGridView: React.FC<CategoryGridViewProps> = ({
    items,
    selectedCategoryId,
    isReorderMode,
    onCategorySelect,
    onProductSelect,
    onMoveItem,
    onToggleVisibility,
    onEdit,
    onDelete,
    onAddNewCategory,
    onAddNewProductDirect,
}) => {

    // 🔧 SOLUCIÓN DEFINITIVA: Garantizar orden visual explícito para lista mixta
    // Esto resuelve el problema del "segundo movimiento" en Grid 1 (categorías + productos globales)
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            // Ordenar por el campo contextual apropiado según el tipo
            const orderA = isCategory(a) ? (a.categories_display_order ?? 999) : (a.categories_display_order ?? 999);
            const orderB = isCategory(b) ? (b.categories_display_order ?? 999) : (b.categories_display_order ?? 999);
            return orderA - orderB;
        });
    }, [items]);

    // 🔧 POSIBLE FIX: Prevenir llamadas duplicadas rápidas
    const [isMoving, setIsMoving] = React.useState(false);

    const handleMoveItem = useCallback(async (id: number, direction: 'up' | 'down', type: 'category' | 'product') => {
        if (isMoving) {
            console.log('🚨 Movement already in progress, ignoring click');
            return;
        }

        try {
            setIsMoving(true);
            console.log('🔥 CategoryGrid - Move clicked:', { id, direction, type, mode: isReorderMode });
            await onMoveItem(id, direction, type);
        } catch (error) {
            console.error('🔥 Error in movement:', error);
        } finally {
            // Pequeño delay para prevenir clicks rápidos accidentales
            setTimeout(() => setIsMoving(false), 300);
        }
    }, [isMoving, onMoveItem, isReorderMode]);

    const ReorderHandles = ({ id, type }: { id: number; type: 'category' | 'product' }) => (
        <div className="flex flex-col">
            <ActionIcon
                Icon={ArrowUp}
                disabled={isMoving}
                onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleMoveItem(id, 'up', type);
                }}
            />
            <ActionIcon
                Icon={ArrowDown}
                disabled={isMoving}
                onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleMoveItem(id, 'down', type);
                }}
            />
        </div>
    );

    const renderActions = (item: Category | Product) => {
        const isCat = isCategory(item);
        return (
            <div className="flex items-center">
                <ActionIcon Icon={item.status ? Eye : EyeOff} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleVisibility(item); }} />
                <ActionIcon Icon={Pencil} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(item); }} />
                <ActionIcon Icon={Trash2} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(item, isCat ? 'category' : 'product'); }} className="hover:text-red-600" />
            </div>
        );
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-soft h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-800">Categorías</h2>
                <div className="flex space-x-2">
                    <Button onClick={onAddNewProductDirect} size="sm" variant="outline">
                        Añadir Prod. Global
                    </Button>
                    <Button onClick={onAddNewCategory} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir Categoría
                    </Button>
                </div>
            </div>

            <div className="space-y-2 overflow-y-auto flex-grow">
                <div className="grid grid-cols-1 gap-2">
                    {sortedItems.map((item) => {
                        if (isCategory(item)) {
                            return (
                                <GenericRow
                                    key={`cat-${item.category_id}`}
                                    id={item.category_id}
                                    isSelected={selectedCategoryId === item.category_id}
                                    status={item.status}
                                    isReorderMode={isReorderMode}
                                    imageSrc={item.image}
                                    imageAlt={item.name ?? 'Categoría'}
                                    imageType="categories"
                                    title={item.name}
                                    content={<CategoryContentDisplay categoryId={item.category_id} />}
                                    onClick={() => !isReorderMode && onCategorySelect(item)}
                                    reorderHandles={<ReorderHandles id={item.category_id} type="category" />}
                                    actions={renderActions(item)}
                                />
                            );
                        } else {
                            return (
                                <GenericRow
                                    key={`prod-${item.product_id}`}
                                    id={item.product_id}
                                    isSelected={false}
                                    status={item.status}
                                    isReorderMode={isReorderMode}
                                    imageSrc={item.image}
                                    imageAlt={item.name ?? 'Producto'}
                                    imageType="products"
                                    title={item.name}
                                    subtitle={item.price ? `$${Number(item.price).toFixed(2)}` : ''}
                                    onClick={() => !isReorderMode && onEdit(item)}
                                    reorderHandles={<ReorderHandles id={item.product_id} type="product" />}
                                    actions={renderActions(item)}
                                />
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
};

CategoryGridView.displayName = 'CategoryGridView'; 
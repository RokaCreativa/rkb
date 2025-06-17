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

import React from 'react';
import { Category, Product } from '@/app/dashboard-v2/types';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { Eye, EyeOff, Pencil, Trash, Plus } from 'lucide-react';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';
import { GenericRow } from '../../ui/Table/GenericRow';
import { ActionIcon } from '../../ui/Button/ActionIcon';
import { CategoryContentDisplay } from './CategoryContentDisplay';

// 🛡️ Type Guard: Diferencia entre una Categoría y un Producto en la lista mixta.
// Se basa en la existencia de propiedades únicas para cada tipo.
function isCategory(item: Category | Product): item is Category {
    // La forma más segura es verificar la ausencia de una propiedad única del otro tipo.
    return !('price' in item);
}

interface CategoryGridViewProps {
    items: (Category | Product)[];
    selectedCategoryId?: number | null;
    onCategorySelect: (category: Category) => void;
    onProductSelect: (product: Product) => void;
    onToggleVisibility: (item: Category | Product) => void;
    onEdit: (item: Category | Product) => void;
    onDelete: (item: Category | Product) => void;
    onAddNewCategory: () => void;
    onAddNewProductDirect: () => void;
}

export const CategoryGridView = React.memo<CategoryGridViewProps>(({
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
    // Suscripción atómica al estado de reordenamiento.
    const isReorderMode = useDashboardStore(state => state.isReorderMode);

    // 🎨 Renderizador de acciones, reutilizable para ambos tipos de items.
    // Pasa las acciones recibidas del padre a los ActionIcon.
    const renderActions = (item: Category | Product) => (
        <>
            <ActionIcon Icon={item.status ? Eye : EyeOff} onClick={(e) => { e.stopPropagation(); onToggleVisibility(item); }} iconClassName={item.status ? 'text-gray-600' : 'text-gray-400'} />
            <ActionIcon Icon={Pencil} onClick={(e) => { e.stopPropagation(); onEdit(item); }} iconClassName="text-gray-600" />
            <ActionIcon Icon={Trash} onClick={(e) => { e.stopPropagation(); onDelete(item); }} iconClassName="text-gray-600" />
        </>
    );

    return (
        <div className="p-4 bg-white rounded-lg shadow-soft h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-800">Categorias</h2>
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
                {items.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No hay categorías ni productos globales.</p>
                    </div>
                ) : (
                    items.map((item, index) => {
                        if (isCategory(item)) {
                            // Renderiza la fila para una Categoría
                            return <GenericRow
                                key={`cat-${item.category_id}`}
                                id={item.category_id}
                                isSelected={selectedCategoryId === item.category_id}
                                isReorderMode={isReorderMode}
                                imageSrc={item.image}
                                imageAlt={item.name ?? 'Categoría'}
                                imageType="categories"
                                title={item.name}
                                content={<CategoryContentDisplay categoryId={item.category_id} />}
                                actions={renderActions(item)}
                                onClick={() => onCategorySelect(item)}
                            />;
                        } else {
                            // Renderiza la fila para un Producto Directo Global
                            const subtitle = [
                                item.price ? `$${Number(item.price).toFixed(2)}` : null,
                                item.description,
                            ].filter(Boolean).join(' - ');

                            return <GenericRow
                                key={`prod-${item.product_id}`}
                                id={item.product_id}
                                isSelected={false} // Productos globales no se "seleccionan"
                                isReorderMode={isReorderMode}
                                imageSrc={item.image}
                                imageAlt={item.name ?? 'Producto'}
                                imageType="products"
                                title={item.name}
                                subtitle={subtitle}
                                actions={renderActions(item)}
                                onClick={() => onEdit(item)} // El clic en un producto global va a edición
                                className="bg-slate-50" // Color de fondo para diferenciar
                            />;
                        }
                    })
                )}
            </div>
        </div>
    );
});

CategoryGridView.displayName = 'CategoryGridView'; 
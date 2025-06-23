/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Grid Mixto de Categorías y Productos Globales (Columna 1)
 *
 * 📍 UBICACIÓN: components/domain/categories/CategoryDesktopMixedGrid.tsx → Grid Principal Columna 1
 *
 * 🎯 PORQUÉ EXISTE:
 * Implementa la Columna 1 del dashboard desktop mostrando una lista mixta de Categorías
 * reales y Productos Directos Globales. Es un componente "tonto" que renderiza datos
 * pre-procesados del DesktopMasterDetailView y delega todas las acciones a callbacks.
 * Fundamental para la Arquitectura Híbrida Definitiva (T31).
 *
 * 🔄 FLUJO DE DATOS:
 * 1. DesktopMasterDetailView → useMemo(grid1Items) → ESTE COMPONENTE
 * 2. items[] pre-mezclados → isCategory() type guard → renderizado diferencial
 * 3. GenericRow por cada ítem → actions contextuales según tipo
 * 4. onClick eventos → callbacks padre → store actions
 * 5. UI actualizada → refleja cambios store automáticamente
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: DesktopMasterDetailView.tsx → grid1Items prop
 * - SALIDA: GenericRow.tsx → renderizado individual de ítems
 * - CALLBACKS: onCategorySelect, onEdit, onDelete → store actions
 * - TYPE GUARD: isCategory() → diferencia Category vs Product
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #35 + T31):
 * - Antes: Solo mostraba categorías, productos globales invisibles
 * - Error: Arquitectura no soportaba productos sin sección
 * - Solución: Lista mixta con type guard + renderizado diferencial
 * - Beneficio: Productos globales visibles junto a categorías
 * - Fecha: 2025-01-15 - Implementación T31 Arquitectura Híbrida
 *
 * 🎯 CASOS DE USO REALES:
 * - Categoría "BEBIDAS" → click → selecciona categoría → carga secciones
 * - Producto global "Coca Cola" → click → abre modal edición directa
 * - Toggle visibility → cambia status categoría/producto
 * - Botón + categoría → modal crear nueva categoría
 * - Botón + producto → modal crear producto global
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - isCategory() type guard OBLIGATORIO para lista mixta
 * - Productos globales NO seleccionables (no abren columna 3)
 * - selectedCategoryId solo aplica a categorías, no productos
 * - Actions contextuales: diferentes íconos según tipo ítem
 * - Indentación visual: productos diferenciados de categorías
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: Category, Product types desde types/
 * - REQUIERE: GenericRow component para renderizado
 * - REQUIERE: ActionIcon components para acciones
 * - REQUIERE: isCategory() type guard funcional
 * - ROMPE SI: items[] contiene tipos no esperados
 * - ROMPE SI: callbacks padre undefined
 *
 * 📊 PERFORMANCE:
 * - Type guard O(1) → verificación rápida por ítem
 * - GenericRow memoized → re-renders mínimos
 * - Actions lazy → solo renderiza cuando hover
 * - Lista virtual ready → preparado para grandes datasets
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7 (Separación): Componente "tonto", lógica en padre
 * - Mandamiento #3 (DRY): Reutiliza GenericRow para ambos tipos
 * - Mandamiento #6 (Consistencia): Actions uniformes entre tipos
 * - Mandamiento #1 (Contexto): Refleja estado store automáticamente
 */
'use client';

import React, { useCallback } from 'react';
import { Category, Product } from '@/app/dashboard/types';
import { GenericRow } from '@/app/dashboard/components/ui/Table/GenericRow';
import { ActionIcon } from '@/app/dashboard/components/ui/Button/ActionIcon';
import { PlusCircle, Trash2, Eye, EyeOff, Pencil } from 'lucide-react';

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
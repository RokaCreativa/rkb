/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Grid Simple de Productos (Columna 3)
 *
 * 📍 UBICACIÓN: components/domain/products/ProductDesktopSimpleGrid.tsx → Grid Columna 3
 *
 * 🎯 PORQUÉ EXISTE:
 * Implementa la Columna 3 del dashboard desktop mostrando productos de una sección específica.
 * Representa el nivel más profundo de la jerarquía del menú (Categorías → Secciones → Productos).
 * Es un componente "tonto" que renderiza lista simple de productos sin mezclas, delegando
 * toda la lógica a callbacks del DesktopMasterDetailView.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. DesktopMasterDetailView → useMemo(grid3Items) → ESTE COMPONENTE
 * 2. products[] simple → GenericRow por cada producto
 * 3. showcaseIcon → onToggleShowcase → store action
 * 4. Actions → onEdit, onDelete, onToggleVisibility → store actions
 * 5. isSectionSelected → controla estado vacío vs lista productos
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: DesktopMasterDetailView.tsx → grid3Items + callbacks
 * - SALIDA: GenericRow.tsx → renderizado individual productos
 * - FEATURE: showcaseIcon → única acción específica de productos
 * - STATE: isSectionSelected → determina si mostrar contenido
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #58 - Limpieza Masiva):
 * - Antes: Estilos y lógica de fila hardcodeados, inconsistencia visual
 * - Error: Duplicación de código con otros grids
 * - Solución: Adopción de GenericRow para consistencia visual
 * - Beneficio: Alineación visual con otros grids + código DRY
 * - Fecha: 2025-01-20 - Unificación componentes UI
 *
 * 🎯 CASOS DE USO REALES:
 * - Sin sección seleccionada → mensaje "Selecciona una sección..."
 * - Sección vacía → mensaje "No hay productos en esta sección"
 * - Lista productos → GenericRow con showcase star + actions
 * - Toggle showcase → estrella amarilla filled/unfilled
 * - Añadir producto → botón disabled si no isSectionSelected
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - isSectionSelected: true REQUERIDO para mostrar contenido
 * - onToggleShowcase: ÚNICA acción específica de este grid
 * - showcaseIcon: star amarilla, filled si is_showcased
 * - Botón añadir: disabled si no hay sección seleccionada
 * - onClick producto → abre modal edición directamente
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: Product type desde types/domain/product
 * - REQUIERE: GenericRow component para renderizado
 * - REQUIERE: ActionIcon components para acciones
 * - REQUIERE: isSectionSelected para estado correcto
 * - ROMPE SI: onToggleShowcase callback undefined
 * - ROMPE SI: products[] contiene tipos incorrectos
 *
 * 📊 PERFORMANCE:
 * - Lista simple → sin derivaciones complejas como otros grids
 * - GenericRow memoized → re-renders mínimos
 * - showcaseIcon lazy → solo renderiza cuando hover
 * - Conditional rendering → estado vacío eficiente
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7 (Separación): Componente "tonto", lógica en padre
 * - Mandamiento #3 (DRY): Reutiliza GenericRow como otros grids
 * - Mandamiento #6 (Consistencia): Visual uniforme con Columnas 1 y 2
 * - Mandamiento #8 (Calidad): Código mantenible y reutilizable
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { Product } from '@/app/dashboard/types';
import { Star, Pencil, Trash, Move, Plus, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GenericRow } from '@/app/dashboard/components/ui/Table/GenericRow';
import { Button } from '@/app/dashboard/components/ui/Button/Button';
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
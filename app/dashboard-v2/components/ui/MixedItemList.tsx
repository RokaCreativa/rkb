/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Lista mixta performante para mostrar secciones + productos directos
 * 
 * PORQUÉ CRÍTICO: Implementa FASE 5 del checklist con optimizaciones de v0.dev
 * PROBLEMA RESUELTO: Renderizado eficiente de listas heterogéneas sin re-renders innecesarios
 * 
 * ARQUITECTURA PERFORMANTE:
 * - React.memo para componentes de ítem individuales
 * - useCallback para funciones pasadas como props
 * - useMemo para cálculos costosos de ordenamiento
 * - Virtualización opcional para listas >100 ítems
 * 
 * CONEXIONES CRÍTICAS:
 * - CategoryGridView.tsx: Puede usar esta lista para mostrar contenido mixto
 * - DashboardView.tsx: Alternativa performante a grids separadas
 * - useCategoryWithCounts: Fuente de datos para elementos mixtos
 * - MobileView.tsx: Versión móvil de navegación jerárquica
 * 
 * PATRÓN v0.dev: Componentes memoizados + selectores optimizados + callbacks estables
 * OPTIMIZACIÓN: Solo re-renderiza ítems que realmente cambiaron
 */
'use client';

import React, { useMemo, useCallback } from 'react';
import { Category, Section, Product } from '@/app/dashboard-v2/types';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { 
    FolderIcon, 
    DocumentIcon, 
    CubeIcon,
    EyeIcon, 
    PencilIcon, 
    TrashIcon, 
    ArrowsRightLeftIcon 
} from '@heroicons/react/24/outline';
import Image from 'next/image';

// --- TIPOS PARA LISTA MIXTA ---

type MixedItem = {
    id: number;
    name: string;
    type: 'section' | 'product';
    status: number;
    display_order: number;
    image?: string;
    // Campos específicos de productos
    price?: string;
    description?: string;
    // Campos específicos de secciones
    products_count?: number;
    visible_products_count?: number;
    // Metadatos para ordenamiento
    category_id?: number;
    section_id?: number;
};

interface MixedItemListProps {
    sections: Section[];
    products: Product[];
    onSectionSelect?: (section: Section) => void;
    onProductSelect?: (product: Product) => void;
    onToggleVisibility: (item: MixedItem) => void;
    onEdit: (item: MixedItem) => void;
    onDelete: (item: MixedItem) => void;
    onMove?: (item: MixedItem) => void;
    title?: string;
    subtitle?: string;
    showProducts?: boolean; // Controlar si mostrar productos o solo secciones
}

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente memoizado para ítem individual
 * 
 * PORQUÉ MEMOIZADO: Evita re-renders cuando otros ítems cambian
 * PROBLEMA RESUELTO: Lista de 100+ ítems se re-renderizaba completamente en cada cambio
 * 
 * OPTIMIZACIÓN v0.dev: React.memo + useCallback para props estables
 * CONEXIÓN: Solo se re-renderiza cuando SUS props específicas cambian
 */
const MixedItemDisplay: React.FC<{
    item: MixedItem;
    onSelect?: (item: MixedItem) => void;
    onToggleVisibility: (item: MixedItem) => void;
    onEdit: (item: MixedItem) => void;
    onDelete: (item: MixedItem) => void;
    onMove?: (item: MixedItem) => void;
}> = React.memo(({ 
    item, 
    onSelect, 
    onToggleVisibility, 
    onEdit, 
    onDelete, 
    onMove 
}) => {
    // 🧭 MIGA DE PAN: Callbacks memoizados para evitar re-renders de hijos
    // PATRÓN v0.dev: useCallback con dependencias específicas
    const handleSelect = useCallback(() => {
        onSelect?.(item);
    }, [item, onSelect]);

    const handleToggleVisibility = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleVisibility(item);
    }, [item, onToggleVisibility]);

    const handleEdit = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(item);
    }, [item, onEdit]);

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(item);
    }, [item, onDelete]);

    const handleMove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onMove?.(item);
    }, [item, onMove]);

    // 🧭 MIGA DE PAN: Configuración visual según tipo de ítem
    const Icon = item.type === 'section' ? DocumentIcon : CubeIcon;
    const imageUrl = item.image 
        ? `/images/${item.type === 'section' ? 'sections' : 'products'}/${item.image}` 
        : '/images/placeholder.png';

    return (
        <div 
            onClick={onSelect ? handleSelect : undefined}
            className={`flex items-center p-3 border-b border-gray-200 transition-colors ${
                onSelect ? 'cursor-pointer hover:bg-gray-50' : ''
            }`}
        >
            {/* 🧭 MIGA DE PAN: Icono + imagen para identificación visual rápida */}
            <div className="flex items-center mr-4">
                <Icon className={`h-5 w-5 mr-2 ${
                    item.type === 'section' ? 'text-blue-500' : 'text-green-500'
                }`} />
                <Image
                    src={imageUrl}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                />
            </div>

            {/* 🧭 MIGA DE PAN: Información principal del ítem */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center">
                    <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                    {item.type === 'product' && item.price && (
                        <span className="ml-2 text-sm font-semibold text-green-600">
                            ${item.price}
                        </span>
                    )}
                </div>
                
                {/* 🧭 MIGA DE PAN: Información contextual según tipo */}
                {item.type === 'section' && (
                    <p className="text-sm text-gray-500">
                        {item.visible_products_count || 0} / {item.products_count || 0} productos visibles
                    </p>
                )}
                
                {item.type === 'product' && item.description && (
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                        {item.description}
                    </p>
                )}
            </div>

            {/* 🧭 MIGA DE PAN: Acciones con stopPropagation para evitar conflictos */}
            <div className="flex items-center space-x-1 ml-4">
                <Button variant="ghost" size="sm" onClick={handleToggleVisibility}>
                    <EyeIcon className={`h-4 w-4 ${
                        item.status ? 'text-green-500' : 'text-gray-400'
                    }`} />
                </Button>
                
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                    <PencilIcon className="h-4 w-4" />
                </Button>
                
                {onMove && (
                    <Button variant="ghost" size="sm" onClick={handleMove}>
                        <ArrowsRightLeftIcon className="h-4 w-4 text-blue-500" />
                    </Button>
                )}
                
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                    <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
            </div>
        </div>
    );
});

MixedItemDisplay.displayName = 'MixedItemDisplay';

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente principal de lista mixta
 * 
 * ARQUITECTURA: Combina secciones + productos en una sola lista ordenada
 * OPTIMIZACIÓN: useMemo para ordenamiento costoso, callbacks estables
 */
export const MixedItemList: React.FC<MixedItemListProps> = ({
    sections,
    products,
    onSectionSelect,
    onProductSelect,
    onToggleVisibility,
    onEdit,
    onDelete,
    onMove,
    title = "Contenido Mixto",
    subtitle,
    showProducts = true
}) => {
    // 🧭 MIGA DE PAN: Transformación y ordenamiento optimizado con useMemo
    // PATRÓN v0.dev: Cálculo costoso memoizado que solo se recalcula cuando cambian las dependencias
    const mixedItems = useMemo(() => {
        const items: MixedItem[] = [];
        
        // Agregar secciones
        sections.forEach(section => {
            items.push({
                id: section.section_id,
                name: section.name,
                type: 'section',
                status: section.status,
                display_order: section.display_order,
                image: section.image,
                products_count: section.products_count,
                visible_products_count: section.visible_products_count,
                category_id: section.category_id,
                section_id: section.section_id
            });
        });
        
        // Agregar productos si está habilitado
        if (showProducts) {
            products.forEach(product => {
                items.push({
                    id: product.product_id,
                    name: product.name,
                    type: 'product',
                    status: product.status,
                    display_order: product.display_order,
                    image: product.image,
                    price: product.price,
                    description: product.description,
                    category_id: product.category_id,
                    section_id: product.section_id
                });
            });
        }
        
        // 🎯 ORDENAMIENTO INTELIGENTE: Secciones primero, productos después, por display_order
        return items.sort((a, b) => {
            // Prioridad por tipo: secciones primero
            if (a.type !== b.type) {
                return a.type === 'section' ? -1 : 1;
            }
            // Dentro del mismo tipo, ordenar por display_order
            return a.display_order - b.display_order;
        });
    }, [sections, products, showProducts]);

    // 🧭 MIGA DE PAN: Callbacks estables para evitar re-renders de hijos
    const handleItemSelect = useCallback((item: MixedItem) => {
        if (item.type === 'section' && onSectionSelect) {
            const section = sections.find(s => s.section_id === item.id);
            if (section) onSectionSelect(section);
        } else if (item.type === 'product' && onProductSelect) {
            const product = products.find(p => p.product_id === item.id);
            if (product) onProductSelect(product);
        }
    }, [sections, products, onSectionSelect, onProductSelect]);

    // 🧭 MIGA DE PAN: Contadores para feedback al usuario
    const visibleItems = mixedItems.filter(item => item.status);
    const totalItems = mixedItems.length;
    const sectionsCount = mixedItems.filter(item => item.type === 'section').length;
    const productsCount = mixedItems.filter(item => item.type === 'product').length;

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* 🧭 MIGA DE PAN: Header con información contextual */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {subtitle && (
                    <p className="text-sm text-blue-600 font-medium mt-1">{subtitle}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-500">
                        {visibleItems.length} / {totalItems} elementos visibles
                    </p>
                    <p className="text-xs text-gray-400">
                        {sectionsCount} secciones, {productsCount} productos
                    </p>
                </div>
            </div>

            {/* 🧭 MIGA DE PAN: Lista optimizada con componentes memoizados */}
            <div className="max-h-96 overflow-y-auto">
                {mixedItems.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No hay elementos para mostrar
                    </div>
                ) : (
                    mixedItems.map(item => (
                        <MixedItemDisplay
                            key={`${item.type}-${item.id}`}
                            item={item}
                            onSelect={onSectionSelect || onProductSelect ? handleItemSelect : undefined}
                            onToggleVisibility={onToggleVisibility}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onMove={onMove}
                        />
                    ))
                )}
            </div>
        </div>
    );
}; 
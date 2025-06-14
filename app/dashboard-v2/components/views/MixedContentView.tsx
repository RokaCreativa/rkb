/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente para Lista Mixta T31 (FASE 1.2)
 * PORQUÉ CRÍTICO: Implementa la jerarquía híbrida mostrando secciones y productos directos en una sola vista
 * PROBLEMA RESUELTO: Antes había que elegir entre mostrar secciones O productos, ahora ambos simultáneamente
 * CONEXIÓN: DashboardViewWrapper → useMixedContentForCategory → este componente
 * ARQUITECTURA: Usa discriminated unions para renderizar diferentes tipos de items con type safety
 * PATRÓN v0.dev: Componente que maneja múltiples tipos de datos con iconos diferenciadores
 */
'use client';

import React from 'react';
import { MixedListItem, isSectionItem, isProductItem } from '@/app/dashboard-v2/types/domain/mixed';
import { Section, Product } from '@/app/dashboard-v2/types';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { 
    EyeIcon, 
    PencilIcon, 
    TrashIcon, 
    FolderIcon, 
    CubeIcon,
    PlusIcon 
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface MixedContentViewProps {
    items: MixedListItem[];
    onSectionSelect: (section: Section) => void;
    onProductEdit: (product: Product) => void;
    onProductDelete: (product: Product) => void;
    onProductToggleVisibility: (product: Product) => void;
    onSectionEdit: (section: Section) => void;
    onSectionDelete: (section: Section) => void;
    onSectionToggleVisibility: (section: Section) => void;
    onAddSection: () => void;
    onAddProductDirect: () => void;
    categoryName?: string;
}

export const MixedContentView: React.FC<MixedContentViewProps> = ({
    items,
    onSectionSelect,
    onProductEdit,
    onProductDelete,
    onProductToggleVisibility,
    onSectionEdit,
    onSectionDelete,
    onSectionToggleVisibility,
    onAddSection,
    onAddProductDirect,
    categoryName = "Categoría"
}) => {
    // 🧭 MIGA DE PAN: Contadores separados por tipo para UX informativa
    const sections = items.filter(isSectionItem);
    const products = items.filter(isProductItem);
    const visibleSections = sections.filter(s => s.status);
    const visibleProducts = products.filter(p => p.status);

    // 🧭 MIGA DE PAN: Renderizado de item individual con iconos diferenciadores
    // PORQUÉ: Cada tipo necesita UI específica pero dentro del mismo contenedor
    // PATRÓN v0.dev: Switch statement con type guards para type safety
    const renderItem = (item: MixedListItem) => {
        if (isSectionItem(item)) {
            return renderSectionItem(item);
        } else if (isProductItem(item)) {
            return renderProductItem(item);
        }
        return null;
    };

    const renderSectionItem = (section: Section) => {
        const imageUrl = section.image ? `/images/sections/${section.image}` : '/images/placeholder.png';
        
        return (
            <div 
                key={`section-${section.section_id}`}
                className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                onClick={() => onSectionSelect(section)}
            >
                <div className="flex items-center flex-1">
                    {/* 🧭 MIGA DE PAN: Icono diferenciador para secciones */}
                    <FolderIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
                    <Image
                        src={imageUrl}
                        alt={section.name || 'Sección'}
                        width={40}
                        height={40}
                        className="rounded-md object-cover mr-4"
                    />
                    <div className="flex flex-col">
                        <span className="font-medium text-blue-900">{section.name}</span>
                        <span className="text-sm text-blue-600">📁 Sección</span>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); onSectionToggleVisibility(section); }}
                    >
                        <EyeIcon className={`h-5 w-5 ${section.status ? 'text-green-500' : 'text-gray-400'}`} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); onSectionEdit(section); }}
                    >
                        <PencilIcon className="h-5 w-5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); onSectionDelete(section); }}
                    >
                        <TrashIcon className="h-5 w-5 text-red-500" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderProductItem = (product: Product) => {
        const imageUrl = product.image ? `/images/products/${product.image}` : '/images/placeholder.png';
        
        return (
            <div 
                key={`product-${product.product_id}`}
                className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
                <div className="flex items-center flex-1">
                    {/* 🧭 MIGA DE PAN: Icono diferenciador para productos directos */}
                    <CubeIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
                    <Image
                        src={imageUrl}
                        alt={product.name || 'Producto'}
                        width={40}
                        height={40}
                        className="rounded-md object-cover mr-4"
                    />
                    <div className="flex flex-col">
                        <span className="font-medium text-green-900">{product.name}</span>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-green-600">📦 Producto Directo</span>
                            <span className="text-sm font-semibold text-green-700">${product.price}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); onProductToggleVisibility(product); }}
                    >
                        <EyeIcon className={`h-5 w-5 ${product.status ? 'text-green-500' : 'text-gray-400'}`} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); onProductEdit(product); }}
                    >
                        <PencilIcon className="h-5 w-5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); onProductDelete(product); }}
                    >
                        <TrashIcon className="h-5 w-5 text-red-500" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {/* 🧭 MIGA DE PAN: Header con información contextual y botones de acción */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                    <h2 className="text-xl font-semibold">Contenido de {categoryName}</h2>
                    <p className="text-sm text-blue-600 font-medium">Jerarquía Híbrida T31</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>📁 {visibleSections.length}/{sections.length} secciones</span>
                        <span>📦 {visibleProducts.length}/{products.length} productos directos</span>
                    </div>
                </div>
                
                {/* 🧭 MIGA DE PAN: Botones de acción diferenciados */}
                <div className="flex space-x-2">
                    <Button 
                        variant="outline" 
                        onClick={onAddSection}
                        className="flex items-center space-x-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <FolderIcon className="h-4 w-4" />
                        <span>Sección</span>
                    </Button>
                    <Button 
                        onClick={onAddProductDirect}
                        className="flex items-center space-x-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <CubeIcon className="h-4 w-4" />
                        <span>Producto Directo</span>
                    </Button>
                </div>
            </div>

            {/* 🧭 MIGA DE PAN: Lista de items mixtos */}
            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="flex space-x-2">
                                <FolderIcon className="h-8 w-8 text-gray-300" />
                                <CubeIcon className="h-8 w-8 text-gray-300" />
                            </div>
                            <p>No hay secciones ni productos directos en esta categoría</p>
                            <p className="text-sm">Añade una sección o un producto directo para comenzar</p>
                        </div>
                    </div>
                ) : (
                    items.map(renderItem)
                )}
            </div>
        </div>
    );
}; 
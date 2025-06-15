/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente MASTER en arquitectura Master-Detail para escritorio
 * 
 * PORQUÉ CRÍTICO: Es el punto de entrada principal para toda la navegación en vista escritorio
 * RESPONSABILIDAD ÚNICA: Renderizar tabla de categorías y manejar selección (Mandamiento #6)
 * 
 * CONEXIONES CRÍTICAS:
 * - DashboardView.tsx línea ~75: <CategoryGridView categories={store.categories} onCategorySelect={(cat) => store.setSelectedCategoryId(cat.category_id)} />
 * - dashboardStore.ts: setSelectedCategoryId → fetchSectionsByCategory → actualiza UI
 * - GenericTable.tsx: Componente reutilizable que maneja toda la lógica de tabla
 * - useModalState.tsx: onEdit/onDelete conectan con sistema de modales
 * 
 * ARQUITECTURA: Componente "tonto" que solo renderiza - NO maneja estado
 * FLUJO DE DATOS: store → DashboardView → CategoryGridView → GenericTable → UI
 * 
 * DECISIÓN UX: onRowClick selecciona categoría (navegación), botones específicos para acciones (editar/eliminar)
 * PATRÓN: Misma estructura que SectionGridView y ProductGridView para consistencia
 */
'use client';

import React from 'react';
import { Category, Product, Section } from '@/app/dashboard-v2/types';
import { GenericTable, Column } from '@/app/dashboard-v2/components/ui/Table/GenericTable';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Lista de Productos Directos (Componente "Tonto")
 * 
 * 📍 UBICACIÓN: CategoryGridView.tsx → ProductDirectList
 * 
 * 🎯 PORQUÉ ESTE CAMBIO (CORRECCIÓN):
 * Este componente ahora es 100% presentacional. No tiene lógica de datos propia.
 * Recibe la lista de `products` ya filtrada y simplemente la renderiza.
 * 
 * 🔄 FLUJO DE DATOS (CORRECTO):
 * 1. `DashboardViewWrapper` calcula `directProductsForCategory` con `useMemo`.
 * 2. Pasa esa lista como prop `directProducts` a `CategoryGridView`.
 * 3. `CategoryGridView` pasa esa misma lista a este componente.
 * 4. Este componente solo mapea y renderiza. Cero lógica de estado.
 * 
 * 🚨 PROBLEMA RESUELTO:
 * Eliminada la llamada redundante a `useDashboardStore` que causaba el bug visual.
 * El flujo de datos es ahora unidireccional y predecible (Top -> Down).
 */
interface ProductDirectListProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onToggleVisibility: (product: Product) => void;
    onAddProductDirect: () => void;
}

const ProductDirectList: React.FC<ProductDirectListProps> = React.memo(({ products, onEdit, onDelete, onToggleVisibility, onAddProductDirect }) => {

    if (products.length === 0) {
        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                    <div className="text-gray-400 mb-2">📦</div>
                    <p className="text-sm text-gray-500 mb-3">
                        No hay productos directos en esta categoría
                    </p>
                    <Button
                        onClick={onAddProductDirect}
                        size="sm"
                        className="flex items-center space-x-2"
                    >
                        <span>📦</span>
                        <span>Crear Primer Producto Directo</span>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 bg-green-50 rounded-lg border border-green-200 p-4">
            <div className="space-y-2">
                {products.map(product => (
                    <div
                        key={`direct-product-${product.product_id}`}
                        className="flex items-center justify-between p-3 bg-white rounded-md border border-green-200 hover:border-green-300 transition-colors"
                    >
                        <div className="flex items-center flex-1">
                            <Image
                                src={product.image ? `/images/products/${product.image}` : '/images/placeholder.png'}
                                alt={product.name || 'Producto'}
                                width={32}
                                height={32}
                                className="rounded-md object-cover mr-3"
                            />
                            <div className="flex flex-col">
                                <span className="font-medium text-green-900 text-sm">{product.name}</span>
                                {product.description && (
                                    <span className="text-xs text-gray-600">{product.description}</span>
                                )}
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-green-600">📦 Directo</span>
                                    <span className="text-xs font-semibold text-green-700">${product.price}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleVisibility(product)}
                                className="p-1"
                            >
                                <EyeIcon className={`h-4 w-4 ${product.status ? 'text-green-500' : 'text-gray-400'}`} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(product)}
                                className="p-1"
                            >
                                <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(product)}
                                className="p-1"
                            >
                                <TrashIcon className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
ProductDirectList.displayName = 'ProductDirectList';

const CategoryContentDisplay = React.memo(({ categoryId }: { categoryId: number }) => {
    const categories = useDashboardStore(state => state.categories);
    const sections = useDashboardStore(state => state.sections);
    const products = useDashboardStore(state => state.products);

    const displayData = React.useMemo(() => {
        const category = categories.find(c => c.category_id === categoryId);
        if (!category) return null;

        const categorySections = sections[categoryId] || [];
        const allCategoryProducts = products[`cat-${categoryId}`] || [];
        const directProducts = allCategoryProducts.filter(p => p.section_id === null);

        const sectionsCount = categorySections.length;
        const directProductsCount = directProducts.length;

        const visibleDirectProductsCount = directProducts.filter(p => p.status).length;

        const displayText = sectionsCount > 0
            ? `${sectionsCount} secciones`
            : `${directProductsCount} productos directos`;

        return {
            displayText,
            hasDirectProducts: directProductsCount > 0,
            directProductsCount,
            visibleDirectProductsCount
        };
    }, [categoryId, categories, sections, products]);

    if (!displayData) {
        return <span className="text-sm text-gray-400">Cargando...</span>;
    }

    return (
        <div className="flex flex-col">
            <span className="text-sm text-gray-600 font-medium">
                {displayData.displayText}
            </span>
            {displayData.hasDirectProducts && (
                <span className="text-xs text-gray-400">
                    {displayData.visibleDirectProductsCount} / {displayData.directProductsCount} productos visibles
                </span>
            )}
        </div>
    );
});
CategoryContentDisplay.displayName = 'CategoryContentDisplay';

interface CategoryGridViewProps {
    categories: Category[];
    directProducts: Product[];
    onCategorySelect: (category: Category) => void;
    onToggleVisibility: (category: Category) => void;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onAddNew: () => void;
    onAddProductDirect?: () => void;
    selectedCategoryId?: number | null;
    onProductEdit?: (product: Product) => void;
    onProductDelete?: (product: Product) => void;
    onProductToggleVisibility?: (product: Product) => void;
}

export const CategoryGridView = React.memo<CategoryGridViewProps>(({
    categories,
    directProducts = [],
    onCategorySelect,
    onToggleVisibility,
    onEdit,
    onDelete,
    onAddNew,
    onAddProductDirect,
    selectedCategoryId,
    onProductEdit,
    onProductDelete,
    onProductToggleVisibility,
}) => {
    const safeDirectProducts = directProducts || [];

    const visibleCategories = categories.filter(category => category.status).length;
    const totalCategories = categories.length;

    const visibleDirectProducts = safeDirectProducts.filter(p => p.status).length;
    const totalDirectProducts = safeDirectProducts.length;

    const columns: Column<Category>[] = [
        {
            key: 'name',
            header: 'Nombre',
            render: (category) => (
                <div className="flex items-center">
                    <Image
                        src={category.image || '/images/placeholder.png'}
                        alt={category.name || 'Categoría'}
                        width={40}
                        height={40}
                        className="rounded-md object-cover mr-4"
                    />
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium">{category.name}</span>
                            {category.is_virtual_category && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    VIRTUAL
                                </span>
                            )}
                        </div>
                        {category.is_virtual_category && (
                            <span className="text-xs text-purple-600">
                                Productos aparecen en vista raíz del cliente
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'content',
            header: 'Contenido',
            render: (category) => (
                <CategoryContentDisplay categoryId={category.category_id} />
            ),
        },
        {
            key: 'display_order',
            header: 'Orden',
        },
        {
            key: 'actions',
            header: 'Acciones',
            render: (category) => (
                <div className="flex justify-end items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onToggleVisibility(category); }}>
                        <EyeIcon className={`h-5 w-5 ${category.status ? 'text-green-500' : 'text-gray-400'}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(category); }}>
                        <PencilIcon className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(category); }}>
                        <TrashIcon className="h-5 w-5 text-red-500" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-semibold">Gestionar Categorías</h2>
                    <p className="text-sm text-gray-500">
                        {visibleCategories} / {totalCategories} categorías visibles
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={onAddNew}>
                        Añadir Categoría
                    </Button>
                    {onAddProductDirect && (
                        <Button
                            onClick={onAddProductDirect}
                            disabled={!selectedCategoryId}
                            variant="outline"
                            className="flex items-center space-x-2"
                            title={!selectedCategoryId ? "Selecciona una categoría primero para crear un producto directo" : "Crear producto directo en la categoría seleccionada"}
                        >
                            <span>📦</span>
                            <span>
                                {!selectedCategoryId
                                    ? "Producto Directo (selecciona categoría)"
                                    : "Producto Directo"
                                }
                            </span>
                        </Button>
                    )}
                </div>
            </div>
            <GenericTable
                data={categories}
                columns={columns}
                onRowClick={onCategorySelect}
                emptyMessage="No hay categorías para mostrar."
            />
            {selectedCategoryId && onProductEdit && onProductDelete && onProductToggleVisibility && onAddProductDirect && (
                <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-700">Productos Directos</h3>
                            <span className="text-sm text-gray-500">({visibleDirectProducts} / {totalDirectProducts} visibles)</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={onAddProductDirect} className="flex items-center space-x-2">
                            <span>📦</span>
                            <span>Agregar</span>
                        </Button>
                    </div>
                    <ProductDirectList
                        products={safeDirectProducts}
                        onEdit={onProductEdit}
                        onDelete={onProductDelete}
                        onToggleVisibility={onProductToggleVisibility}
                        onAddProductDirect={onAddProductDirect}
                    />
                </div>
            )}
        </div>
    );
});
CategoryGridView.displayName = 'CategoryGridView'; 
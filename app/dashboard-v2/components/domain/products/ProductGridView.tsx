/**
 * @file ProductGridView.tsx
 * @description Componente de vista dedicado a renderizar la tabla de productos para una sección específica.
 * @architecture
 * Este es el segundo y último nivel de "Detalle" en la arquitectura "Master-Detail", completando el flujo.
 * Su única función es mostrar los "productos hijos" de una sección seleccionada en `SectionGridView`.
 *
 * @dependencies
 * - `GenericTable`: Utiliza la tabla genérica para una visualización consistente.
 * - `DashboardView` (Padre/Orquestador): Al igual que los otros `GridView`, es un componente "tonto".
 *   Recibe la lista de `products` ya filtrada y todos los callbacks necesarios.
 * - `dashboardStore`: La acción `setSelectedSectionId` del store es la que, en última instancia,
 *   provoca que este componente se renderice con los productos correctos.
 */
'use client';

import React from 'react';
import { Product } from '@/app/dashboard-v2/types';
import { GenericTable, Column } from '@/app/dashboard-v2/components/ui/Table/GenericTable';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

// --- TIPOS DE PROPS ---
interface ProductGridViewProps {
    products: Product[];
    onToggleVisibility: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onAddNew: () => void;
}

export const ProductGridView: React.FC<ProductGridViewProps> = ({
    products,
    onToggleVisibility,
    onEdit,
    onDelete,
    onAddNew,
}) => {
    // 🧭 MIGA DE PAN: Calcular contador de visibilidad siguiendo el patrón de SectionListView
    const visibleProducts = products.filter(product => product.status);
    const totalProducts = products.length;

    const columns: Column<Product>[] = [
        {
            key: 'name',
            header: 'Nombre',
            render: (product) => {
                // Comentario de Contexto:
                // La propiedad `product.image` solo contiene el nombre del archivo.
                // Construimos la ruta completa desde `public` para que el componente <Image> la encuentre.
                const imageUrl = product.image ? `/images/products/${product.image}` : '/images/placeholder.png';
                return (
                    <div className="flex items-center">
                        <Image
                            src={imageUrl}
                            alt={product.name || 'Producto'}
                            width={40}
                            height={40}
                            className="rounded-md object-cover mr-4"
                        />
                        <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            {/* 🧭 MIGA DE PAN: Agregamos descripción siguiendo el patrón mobile-first */}
                            {product.description && (
                                <span className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xs">
                                    {product.description}
                                </span>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'price',
            header: 'Precio',
            render: (product) => `$${product.price}`
        },
        {
            key: 'actions',
            header: 'Acciones',
            render: (product) => (
                <div className="flex justify-end items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onToggleVisibility(product); }}>
                        <EyeIcon className={`h-5 w-5 ${product.status ? 'text-green-500' : 'text-gray-400'}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(product); }}>
                        <PencilIcon className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(product); }}>
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
                    <h2 className="text-xl font-semibold">Gestionar Productos</h2>
                    {/* 🧭 MIGA DE PAN: Contador de visibilidad siguiendo el patrón de SectionListView */}
                    <p className="text-sm text-gray-500">
                        {visibleProducts.length} / {totalProducts} productos visibles
                    </p>
                </div>
                <Button onClick={onAddNew}>Añadir Producto</Button>
            </div>
            <GenericTable
                data={products}
                columns={columns}
                emptyMessage="No hay productos para mostrar. Seleccione una sección."
            />
        </div>
    );
}; 
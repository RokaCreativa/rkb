/**
 * @file CategoryGridView.tsx
 * @description Componente de vista dedicado a renderizar la tabla de categorías.
 * @architecture
 * Este componente es la vista "Master" en la arquitectura "Master-Detail" del dashboard de escritorio.
 * Su única responsabilidad es mostrar la lista de todas las categorías.
 * 
 * @dependencies
 * - `GenericTable`: En lugar de construir su propia tabla, delega el renderizado a este componente reutilizable.
 *   Le pasa los datos (`categories`) y una configuración de `columns` que define cómo se debe ver cada fila.
 * - `DashboardView` (Padre/Orquestador): Este componente no tiene estado propio. Recibe `categories` y todos los
 *   callbacks (`onCategorySelect`, `onEdit`, etc.) como props desde `DashboardView`.
 * - `dashboardStore`: Indirectamente, depende de `dashboardStore` ya que es su orquestador (`DashboardView`)
 *   quien se suscribe al store y le provee los datos y acciones.
 */
'use client';

import React from 'react';
import { Category } from '@/app/dashboard-v2/types';
import { GenericTable, Column } from '@/app/dashboard-v2/components/ui/Table/GenericTable';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

// --- TIPOS DE PROPS ---
interface CategoryGridViewProps {
    categories: Category[];
    onCategorySelect: (category: Category) => void;
    onToggleVisibility: (category: Category) => void;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onAddNew: () => void;
}

export const CategoryGridView: React.FC<CategoryGridViewProps> = ({
    categories,
    onCategorySelect,
    onToggleVisibility,
    onEdit,
    onDelete,
    onAddNew,
}) => {
    // 🧭 MIGA DE PAN: Calcular contador de visibilidad siguiendo el patrón de ProductGridView
    const visibleCategories = categories.filter(category => category.status);
    const totalCategories = categories.length;

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
                    <span className="font-medium">{category.name}</span>
                </div>
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
                    {/* 🧭 MIGA DE PAN: Contador de visibilidad siguiendo el patrón de ProductGridView */}
                    <p className="text-sm text-gray-500">
                        {visibleCategories.length} / {totalCategories} categorías visibles
                    </p>
                </div>
                <Button onClick={onAddNew}>
                    Añadir Categoría
                </Button>
            </div>
            <GenericTable
                data={categories}
                columns={columns}
                onRowClick={onCategorySelect}
                emptyMessage="No hay categorías para mostrar."
            />
        </div>
    );
}; 
/**
 * @file SectionGridView.tsx
 * @description Componente de vista dedicado a renderizar la tabla de secciones para una categoría específica.
 * @architecture
 * Este es el primer nivel de "Detalle" en la arquitectura "Master-Detail". Su rol es mostrar
 * las "secciones hijas" de la categoría que ha sido seleccionada en `CategoryGridView`.
 * 
 * @dependencies
 * - `GenericTable`: Al igual que su par de categorías, usa la tabla genérica para el renderizado.
 * - `DashboardView` (Padre/Orquestador): Es completamente controlado desde fuera. Recibe `sections`
 *   (ya filtradas por el padre) y los callbacks. No sabe ni le importa cuál categoría fue seleccionada,
 *   solo renderiza la lista que le dan.
 * - `dashboardStore`: Su dependencia es indirecta. La lógica de selección que causa que este componente
 *   se renderice (`setSelectedCategoryId`) vive en el store y es invocada desde `CategoryGridView`
 *   a través del orquestador.
 */
'use client';

import React from 'react';
import { Section } from '@/app/dashboard-v2/types';
import { GenericTable, Column } from '@/app/dashboard-v2/components/ui/Table/GenericTable';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

// --- TIPOS DE PROPS ---
interface SectionGridViewProps {
    sections: Section[];
    onSectionSelect: (section: Section) => void;
    onToggleVisibility: (section: Section) => void;
    onEdit: (section: Section) => void;
    onDelete: (section: Section) => void;
    onAddNew: () => void;
}

export const SectionGridView: React.FC<SectionGridViewProps> = ({
    sections,
    onSectionSelect,
    onToggleVisibility,
    onEdit,
    onDelete,
    onAddNew,
}) => {
    // 🧭 MIGA DE PAN: Calcular contador de visibilidad siguiendo el patrón de ProductGridView
    const visibleSections = sections.filter(section => section.status);
    const totalSections = sections.length;

    const columns: Column<Section>[] = [
        {
            key: 'name',
            header: 'Nombre',
            render: (section) => {
                const imageUrl = section.image ? `/images/sections/${section.image}` : '/images/placeholder.png';
                return (
                    <div className="flex items-center">
                        <Image
                            src={imageUrl}
                            alt={section.name || 'Sección'}
                            width={40}
                            height={40}
                            className="rounded-md object-cover mr-4"
                        />
                        <span className="font-medium">{section.name}</span>
                    </div>
                );
            }
        },
        {
            key: 'display_order',
            header: 'Orden',
        },
        {
            key: 'actions',
            header: 'Acciones',
            render: (section) => (
                <div className="flex justify-end items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onToggleVisibility(section); }}>
                        <EyeIcon className={`h-5 w-5 ${section.status ? 'text-green-500' : 'text-gray-400'}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(section); }}>
                        <PencilIcon className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(section); }}>
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
                    <h2 className="text-xl font-semibold">Gestionar Secciones</h2>
                    {/* 🧭 MIGA DE PAN: Contador de visibilidad siguiendo el patrón de ProductGridView */}
                    <p className="text-sm text-gray-500">
                        {visibleSections.length} / {totalSections} secciones visibles
                    </p>
                </div>
                <Button onClick={onAddNew}>Añadir Sección</Button>
            </div>
            <GenericTable
                data={sections}
                columns={columns}
                onRowClick={onSectionSelect}
                emptyMessage="No hay secciones para mostrar. Seleccione una categoría."
            />
        </div>
    );
}; 
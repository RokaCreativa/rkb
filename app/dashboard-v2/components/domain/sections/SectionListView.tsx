/**
 * @fileoverview SectionListView - Componente de UI para renderizar la lista de secciones en la vista móvil.
 * @description
 * Este es un componente "tonto" (presentacional) diseñado específicamente para la interfaz móvil.
 * Su única responsabilidad es mostrar una lista de secciones y delegar todas las acciones (clics,
 * edición, eliminación, etc.) a su componente padre (`MobileView`), que obtiene la lógica
 * del store de Zustand (`useDashboardStore`).
 *
 * @architecture
 * Este componente es una pieza clave de la estrategia "Drill-Down" para móviles. Se utiliza en `MobileView`
 * cuando el `activeView` es 'sections'. La comunicación con el resto de la app es unidireccional (hacia arriba)
 * a través de las funciones pasadas como props (ej: `onSectionClick`, `onEdit`). El `ContextMenu` que utiliza
 * es nuestro componente personalizado (`app/dashboard-v2/components/ui/ContextMenu.tsx`), NO el de shadcn/ui.
 * Esta distinción es crucial para entender su funcionamiento.
 */
'use client';

import React from 'react';
import Image from 'next/image';
import { Section } from '../../../types';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import ContextMenu from '../../ui/ContextMenu';
import { getImagePath, handleImageError } from '../../../utils/imageUtils';

interface SectionListViewProps {
    sections: Section[];
    onSectionClick: (section: Section) => void;
    onToggleVisibility: (section: Section) => void;
    onEdit: (section: Section) => void;
    onDelete: (section: Section) => void;
}

export const SectionListView: React.FC<SectionListViewProps> = ({
    sections,
    onSectionClick,
    onToggleVisibility,
    onEdit,
    onDelete,
}) => {
    if (!sections || sections.length === 0) {
        return <p className="text-gray-500 text-center py-4">No hay secciones en esta categoría.</p>;
    }

    return (
        <ul className="space-y-3">
            {sections.map(section => {
                const contextActions = [
                    {
                        label: 'Editar',
                        onClick: () => onEdit(section),
                    },
                    {
                        label: 'Eliminar',
                        onClick: () => onDelete(section),
                        isDestructive: true,
                    },
                ];

                return (
                    <li
                        key={section.section_id}
                        onClick={() => onSectionClick(section)}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all shadow-sm ${section.status ? 'bg-white hover:bg-gray-50' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                    >
                        <div className="relative w-16 h-16 mr-4 rounded-md overflow-hidden shrink-0">
                            <Image
                                src={getImagePath(section.image || null, 'sections')}
                                alt={section.name || 'Imagen de sección'}
                                fill
                                className="object-cover transition-opacity duration-300"
                                style={{ opacity: section.status ? 1 : 0.5 }}
                                onError={handleImageError}
                            />
                        </div>

                        <div className="grow">
                            <h3 className="font-semibold text-base">{section.name}</h3>
                            <p className="text-sm text-gray-500">
                                {section.visible_products_count ?? 0} / {section.products_count ?? 0} productos visibles
                            </p>
                        </div>

                        <div className="flex items-center space-x-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleVisibility(section);
                                }}
                                className="p-2 rounded-full hover:bg-gray-100"
                            >
                                {section.status ? <EyeIcon className="h-5 w-5 text-gray-600" /> : <EyeSlashIcon className="h-5 w-5 text-gray-400" />}
                            </button>
                            <ContextMenu actions={contextActions} />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}; 
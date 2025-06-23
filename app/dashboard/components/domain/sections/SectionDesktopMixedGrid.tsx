/**
 * 🧭 MIGA DE PAN CONTEXTUAL MAESTRA: Grid de Secciones y Productos Locales (Columna 2)
 *
 * 📍 UBICACIÓN: app/dashboard-v2/components/domain/sections/SectionGridView.tsx
 *
 * 🎯 PORQUÉ EXISTE:
 * Este componente es el segundo pilar de la vista de escritorio. Su responsabilidad es mostrar
 * el contenido de la categoría seleccionada en la Columna 1. Este contenido es una lista mixta
 * que puede contener tanto SECCIONES normales como PRODUCTOS DIRECTOS LOCALES (ej. un plato especial
 * que pertenece a una categoría pero no a una sección específica).
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Recibe una lista plana `sections` (nombre heredado, pero contiene Section | Product) de `DashboardView`.
 *    Esta lista ya ha sido calculada y ordenada.
 * 2. Muestra un estado vacío si no hay ninguna categoría seleccionada (`isCategorySelected` es false).
 * 3. Si hay una categoría seleccionada, itera sobre la lista. Usa el type guard `isSection()` para
 *    diferenciar entre un ítem de tipo `Section` y uno de tipo `Product`.
 * 4. Renderiza un `GenericRow` para cada ítem con las props correspondientes.
 * 5. Delega todas las acciones (selección, edición, etc.) a los manejadores que recibe de `DashboardView`.
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - **PADRE:** `DashboardView.tsx` (le provee datos y callbacks).
 * - **HIJO:** `GenericRow.tsx` (usado para renderizar cada fila).
 * - **CONSUME ESTADO DE:** `useDashboardStore` (solo para `isReorderMode`).
 *
 * ⚠️ REGLAS DE NEGOCIO:
 * - Es CRÍTICO que `isCategorySelected` sea `true` para que este componente muestre algo más
 *   que un mensaje de "Selecciona una categoría".
 * - El type guard `isSection` es la clave para manejar la lista mixta.
 * - Los Productos Directos Locales, al igual que los globales, no son "seleccionables" en el
 *   sentido de que no abren una tercera columna. Su `onClick` suele llevar a la edición.
 */
'use client';

import React, { useCallback, useMemo } from 'react';
import { Section, Product } from '@/app/dashboard-v2/types';
import { Button } from '@/app/dashboard/components/ui/Button/Button';
import { Eye, Pencil, Trash, Plus, EyeOff } from 'lucide-react';
import { GenericRow } from '../../ui/Table/GenericRow';
import { ActionIcon } from '../../ui/Button/ActionIcon';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';

import { ArrowUp, ArrowDown } from 'lucide-react';
import { PlusCircle, Trash2 } from 'lucide-react';

// 🛡️ Type Guard: Diferencia entre una Sección y un Producto en la lista mixta.
function isSection(item: Section | Product): item is Section {
    return 'section_id' in item && !('price' in item);
}

interface SectionGridViewProps {
    sections: (Section | Product)[]
    title: string
    selectedSectionId: number | null
    onSectionSelect: (section: Section) => void
    selectedCategoryId: number | null
    onToggleVisibility: (item: Section | Product) => void
    onEdit: (item: Section | Product) => void
    onDelete: (item: Section | Product) => void
    onAddNew: () => void
    onAddProductDirect: () => void | null
}

export const SectionGridView: React.FC<SectionGridViewProps> = ({
    sections,
    title,
    selectedSectionId,
    onSectionSelect,
    selectedCategoryId,
    onToggleVisibility,
    onEdit,
    onDelete,
    onAddNew,
    onAddProductDirect,
}) => {

    const renderActions = (item: Section | Product) => (
        <div className="flex items-center">
            <ActionIcon Icon={item.status ? Eye : EyeOff} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleVisibility(item); }} />
            <ActionIcon Icon={Pencil} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(item); }} />
            <ActionIcon Icon={Trash2} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(item); }} className="hover:text-red-600" />
        </div>
    );

    return (
        <div className="p-4 bg-white rounded-lg shadow-soft h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                <div className="flex space-x-2">
                    <Button onClick={onAddProductDirect} size="sm" variant="outline" disabled={!selectedCategoryId}>
                        Añadir Prod. Directo
                    </Button>
                    <Button onClick={onAddNew} size="sm" disabled={!selectedCategoryId}>
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir Sección
                    </Button>
                </div>
            </div>

            <div className="space-y-2 overflow-y-auto flex-grow">
                {!selectedCategoryId ? (
                    <div className="text-center py-10 flex items-center justify-center h-full">
                        <p className="text-gray-500">Selecciona una categoría para ver su contenido.</p>
                    </div>
                ) : sections.length === 0 ? (
                    <div className="text-center py-10 flex items-center justify-center h-full">
                        <p className="text-gray-500">No hay secciones ni productos directos.</p>
                    </div>
                ) : (
                    sections.map(item => {
                        if (isSection(item)) {
                            // Renderiza la fila para una Sección
                            return (
                                <GenericRow
                                    key={`sec-${item.section_id}`}
                                    id={item.section_id}
                                    status={item.status}
                                    isSelected={selectedSectionId === item.section_id}
                                    imageSrc={item.image}
                                    imageAlt={item.name ?? 'Sección'}
                                    imageType="sections"
                                    title={item.name}
                                    subtitle={`productos`}
                                    onClick={() => onSectionSelect(item)}
                                    actions={renderActions(item)}
                                />
                            );
                        } else {
                            // Renderiza la fila para un Producto Directo Local
                            const subtitle = [
                                item.price ? `$${Number(item.price).toFixed(2)}` : null,
                                item.description
                            ].filter(Boolean).join(' - ');

                            return (
                                <GenericRow
                                    key={`prod-${item.product_id}`}
                                    id={item.product_id}
                                    status={item.status}
                                    isSelected={false}
                                    imageSrc={item.image}
                                    imageAlt={item.name ?? 'Producto'}
                                    imageType="products"
                                    title={item.name}
                                    subtitle={subtitle}
                                    onClick={() => onEdit(item)}
                                    actions={renderActions(item)}
                                />
                            );
                        }
                    })
                )}
            </div>
        </div>
    );
};

SectionGridView.displayName = 'SectionGridView'; 
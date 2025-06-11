/**
 * @file EditModals.tsx
 * @description Contiene los componentes de modal para crear y editar categorías, secciones y productos.
 * @architecture
 * Este archivo demuestra una estrategia de reutilización de UI. En lugar de crear tres modales
 * casi idénticos, se crea un componente genérico `EditModal<T>`.
 *
 * `EditModal<T>` se encarga de la lógica común:
 * 1. Determinar el título ('Crear' vs 'Editar').
 * 2. Renderizar el `BaseModal`.
 * 3. Renderizar el pie de página (`footer`) con los botones de acción.
 *
 * Luego, se exportan componentes específicos (`EditCategoryModal`, etc.) que son simplemente
 * "envoltorios" delgados (`wrappers`) alrededor de `EditModal`, pasándole el tipo de dato correcto.
 * Esto cumple con el principio DRY (Don't Repeat Yourself) y facilita el mantenimiento.
 *
 * @dependencies
 * - `BaseModal`: Utilizado para la estructura fundamental del modal.
 */
'use client';

import React from 'react';
import { BaseModal } from '@/app/dashboard-v2/components/ui/Modal/BaseModal';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { Category, Section, Product } from '@/app/dashboard-v2/types';
// Asumiremos que tenemos formularios específicos para cada uno
// import { CategoryForm } from '../domain/categories/CategoryForm';
// import { SectionForm } from '../domain/sections/SectionForm';
// import { ProductForm } from '../domain/products/ProductForm';

// --- PROPS PARA LOS MODALES ---
interface EditModalProps<T> {
    isOpen: boolean;
    onClose: () => void;
    item: T | null;
    itemType: 'Categoría' | 'Sección' | 'Producto';
}

// --- COMPONENTES DE MODAL GENÉRICOS ---
const EditModal = <T,>({ isOpen, onClose, item, itemType }: EditModalProps<T>) => {
    if (!isOpen) return null;

    const title = item ? `Editar ${itemType}` : `Crear ${itemType}`;

    const footer = (
        <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            {/* En un futuro, este botón llamaría a la función de guardado */}
            <Button onClick={onClose}>Guardar Cambios</Button>
        </div>
    );

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
            <p className="text-sm text-gray-500">
                El formulario para {item ? `editar esta ${itemType.toLowerCase()}` : `crear una nueva ${itemType.toLowerCase()}`} irá aquí.
            </p>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(item, null, 2)}
            </pre>
        </BaseModal>
    );
};

// --- EXPORTACIONES ESPECÍFICAS ---
export const EditCategoryModal: React.FC<{ isOpen: boolean; onClose: () => void; category: Category | null }> =
    ({ isOpen, onClose, category }) => (
        <EditModal isOpen={isOpen} onClose={onClose} item={category} itemType="Categoría" />
    );

export const EditSectionModal: React.FC<{ isOpen: boolean; onClose: () => void; section: Section | null }> =
    ({ isOpen, onClose, section }) => (
        <EditModal isOpen={isOpen} onClose={onClose} item={section} itemType="Sección" />
    );

export const EditProductModal: React.FC<{ isOpen: boolean; onClose: () => void; product: Product | null }> =
    ({ isOpen, onClose, product }) => (
        <EditModal isOpen={isOpen} onClose={onClose} item={product} itemType="Producto" />
    );

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

import React, { useRef, useState } from 'react';
import { BaseModal } from '@/app/dashboard-v2/components/ui/Modal/BaseModal';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { Category, Section, Product } from '@/app/dashboard-v2/types';
import { useDashboardStore } from '../../stores/dashboardStore';

// Importamos los formularios y sus tipos de 'ref'
import { CategoryForm, CategoryFormRef } from '../domain/categories/CategoryForm';
import { SectionForm, SectionFormRef } from '../domain/sections/SectionForm';
import { ProductForm, ProductFormRef } from '../domain/products/ProductForm';

type ItemWithId = Category | Section | Product;

// --- PROPS PARA LOS MODALES ---
interface EditModalProps<T extends ItemWithId> {
    isOpen: boolean;
    onClose: () => void;
    item: T | null;
    itemType: 'Categoría' | 'Sección' | 'Producto';
    // Propiedades adicionales para saber dónde crear/actualizar
    clientId?: number;
    categoryId?: number;
    sectionId?: number;
    // 🎯 T31.5 - Soporte para productos directos
    isDirect?: boolean;
}

// --- COMPONENTE DE MODAL GENÉRICO ---
const EditModal = <T extends ItemWithId>({ isOpen, onClose, item, itemType, clientId, categoryId, sectionId, isDirect }: EditModalProps<T>) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<CategoryFormRef | SectionFormRef | ProductFormRef>(null);

    // Acciones del store
    const { createCategory, updateCategory, createSection, updateSection, createProduct, updateProduct, createProductDirect } = useDashboardStore();

    if (!isOpen) return null;

    const title = item ? `Editar ${itemType}` : `Crear ${itemType}`;

    const handleSave = async () => {
        if (!formRef.current) {
            return;
        }

        setIsSubmitting(true);
        try {
            const { data, imageFile } = formRef.current.getFormData();

            switch (itemType) {
                case 'Categoría':
                    if (item) {
                        await updateCategory((item as Category).category_id, data as Partial<Category>, imageFile);
                    } else if (clientId) {
                        const categoryData = { ...data, client_id: clientId } as Partial<Category>;
                        await createCategory(categoryData, imageFile);
                    }
                    break;
                case 'Sección':
                    if (item) {
                        await updateSection((item as Section).section_id, data as Partial<Section>, imageFile);
                    } else if (categoryId) {
                        await createSection({ ...data, category_id: categoryId } as Partial<Section>, imageFile);
                    }
                    break;
                case 'Producto':
                    if (item) {
                        await updateProduct((item as Product).product_id, data as Partial<Product>, imageFile);
                    } else if (isDirect && categoryId) {
                        // 🎯 T31.5 - Crear producto directo en categoría
                        await createProductDirect(categoryId, data as Partial<Product>, imageFile);
                    } else if (sectionId) {
                        // Crear producto tradicional en sección
                        await createProduct({ ...data, section_id: sectionId } as Partial<Product>, imageFile);
                    }
                    break;
            }
            onClose();
        } catch (error) {
            console.error(`❌ Error al guardar ${itemType}:`, error);
            // El toast de error ya se muestra desde el store
        } finally {
            setIsSubmitting(false);
        }
    }

    const footer = (
        <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
        </div>
    );

    const renderForm = () => {
        switch (itemType) {
            case 'Categoría':
                return <CategoryForm ref={formRef as React.Ref<CategoryFormRef>} category={item as Category | null} />;
            case 'Sección':
                return <SectionForm ref={formRef as React.Ref<SectionFormRef>} section={item as Section | null} />;
            case 'Producto':
                return <ProductForm ref={formRef as React.Ref<ProductFormRef>} product={item as Product | null} />;
            default:
                return null;
        }
    }

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={title} footer={footer} size="xl">
            {renderForm()}
        </BaseModal>
    );
};

// --- EXPORTACIONES ESPECÍFICAS ---
// Añadimos las props necesarias para el contexto de creación
export const EditCategoryModal: React.FC<{ isOpen: boolean; onClose: () => void; category: Category | null; clientId: number | undefined; }> =
    ({ isOpen, onClose, category, clientId }) => (
        <EditModal isOpen={isOpen} onClose={onClose} item={category} itemType="Categoría" clientId={clientId} />
    );

export const EditSectionModal: React.FC<{ isOpen: boolean; onClose: () => void; section: Section | null; categoryId: number | undefined; }> =
    ({ isOpen, onClose, section, categoryId }) => (
        <EditModal isOpen={isOpen} onClose={onClose} item={section} itemType="Sección" categoryId={categoryId} />
    );

export const EditProductModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    product: Product | null; 
    sectionId?: number | undefined;
    categoryId?: number | undefined;
    isDirect?: boolean;
}> = ({ isOpen, onClose, product, sectionId, categoryId, isDirect }) => (
    <EditModal 
        isOpen={isOpen} 
        onClose={onClose} 
        item={product} 
        itemType="Producto" 
        sectionId={sectionId}
        categoryId={categoryId}
        isDirect={isDirect}
    />
);

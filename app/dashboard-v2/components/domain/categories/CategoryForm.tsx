'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Category } from '@/app/dashboard-v2/types';
import { FormField } from '@/app/dashboard-v2/components/ui/Form/FormField';
import { ImageUploader } from '@/app/dashboard-v2/components/ui/Form/ImageUploader';

// --- REF Y PROPS ---

/**
 * @fileoverview Refactorización de CategoryForm.
 * @description
 * Hemos refactorizado este componente para ser "controlado" por un componente padre (`EditModals`).
 *
 * 1.  `forwardRef`: El componente ahora puede aceptar una `ref` de su padre.
 * 2.  `useImperativeHandle`: A través de esta `ref`, exponemos una función específica (`getFormData`)
 *     al padre. Esto permite que el modal solicite los datos del formulario justo antes de enviar.
 * 3.  `CategoryFormRef`: Es la "interfaz" de nuestra ref, define qué funciones puede llamar el padre.
 *     Esto crea un contrato claro entre el formulario y su controlador.
 *
 * Este patrón invierte el flujo de datos. En lugar de que el formulario empuje los datos hacia arriba
 * con `onFormSubmit`, el padre "tira" de los datos cuando los necesita. Es más robusto para modales.
 */
export interface CategoryFormRef {
    getFormData: () => { data: Partial<Category>, imageFile: File | null };
}

interface CategoryFormProps {
    category: Category | null;
}

// --- COMPONENTE ---

export const CategoryForm = forwardRef<CategoryFormRef, CategoryFormProps>(({ category }, ref) => {
    const [name, setName] = useState('');
    const [displayOrder, setDisplayOrder] = useState(0);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (category) {
            setName(category.name || '');
            setDisplayOrder(category.display_order || 0);
            setImageFile(null); // Reseteamos el archivo al cambiar de item
        } else {
            // Resetear para un nuevo formulario
            setName('');
            setDisplayOrder(0);
            setImageFile(null);
        }
    }, [category]);

    // Exponemos la función getFormData al componente padre a través de la ref
    useImperativeHandle(ref, () => ({
        getFormData: () => {
            return {
                data: {
                    name,
                    display_order: displayOrder,
                },
                imageFile,
            };
        }
    }));

    return (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <FormField
                label="Nombre de la Categoría"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <FormField
                label="Orden de Visualización"
                name="display_order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
            />
            <ImageUploader
                label="Imagen de la Categoría"
                onImageChange={setImageFile}
                initialImageUrl={category?.image ? `/images/categories/${category.image}` : null}
            />
        </form>
    );
});

// Añadimos un displayName para mejorar la depuración en las DevTools de React
CategoryForm.displayName = 'CategoryForm';

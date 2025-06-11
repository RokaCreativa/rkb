'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Section } from '@/app/dashboard-v2/types';
import { FormField } from '@/app/dashboard-v2/components/ui/Form/FormField';
import { ImageUploader } from '@/app/dashboard-v2/components/ui/Form/ImageUploader';

// --- REF Y PROPS ---
/**
 * @fileoverview Refactorización de SectionForm.
 * @description Aplicamos el mismo patrón de `forwardRef` y `useImperativeHandle` que en CategoryForm.
 * El modal padre (`EditModals`) controla el envío y obtiene los datos del formulario
 * llamando a `getFormData()` en la `ref` del formulario.
 */
export interface SectionFormRef {
    getFormData: () => { data: Partial<Section>, imageFile: File | null };
}

interface SectionFormProps {
    section: Section | null;
}

// --- COMPONENTE ---

export const SectionForm = forwardRef<SectionFormRef, SectionFormProps>(({ section }, ref) => {
    const [name, setName] = useState('');
    const [displayOrder, setDisplayOrder] = useState(0);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (section) {
            setName(section.name || '');
            setDisplayOrder(section.display_order || 0);
            setImageFile(null); // Reset
        } else {
            setName('');
            setDisplayOrder(0);
            setImageFile(null);
        }
    }, [section]);

    // Exponer la función `getFormData`
    useImperativeHandle(ref, () => ({
        getFormData: () => ({
            data: {
                name,
                display_order: displayOrder,
            },
            imageFile,
        })
    }));

    return (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <FormField
                label="Nombre de la Sección"
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
                label="Imagen de la Sección"
                onImageChange={setImageFile}
                initialImageUrl={section?.image}
            />
        </form>
    );
});

SectionForm.displayName = 'SectionForm';

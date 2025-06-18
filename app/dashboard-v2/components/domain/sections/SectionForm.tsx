'use client';

import React, { useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import type { Section } from '@/app/dashboard-v2/types';
import { FormField } from '@/app/dashboard-v2/components/ui/Form/FormField';
import { Input } from '@/app/dashboard-v2/components/ui/Form/Input';
import { ImageUploader } from '@/app/dashboard-v2/components/ui/Form/ImageUploader';
import { getImagePath } from '@/app/dashboard-v2/utils/imageUtils';

// --- VALIDACIÓN Y TIPOS ---
const formSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
});

type FormData = z.infer<typeof formSchema>;

// --- REF Y PROPS ---
/**
 * @fileoverview SectionForm - Formulario unificado para secciones
 * @description 
 * 🧭 MIGA DE PAN: Este formulario sigue el patrón `forwardRef` + `useImperativeHandle`
 * establecido en los Mandamientos #6 (Separación de Responsabilidades).
 * Se conecta con:
 * - EditModals.tsx: Modal padre que controla el envío
 * - NewSectionModal.tsx: Modal de creación (legacy, pendiente refactorización)
 * - SectionGridView.tsx: Vista que muestra las secciones creadas
 * - dashboardStore.ts: Store que maneja las operaciones CRUD
 * 
 * 🎯 MANDAMIENTO #8: Mantiene consistencia visual con CategoryForm y ProductForm
 * 🎯 MANDAMIENTO #5: Diseño Mobile-First con campos optimizados para táctil
 * 🎯 MANDAMIENTO #3: Reutiliza FormField e ImageUploader (DRY)
 */
export interface SectionFormRef {
    getFormData: () => { data: Partial<Section>, imageFile: File | null };
}

interface SectionFormProps {
    section: Section | null;
}

// --- COMPONENTE ---
export const SectionForm = forwardRef<SectionFormRef, SectionFormProps>(({ section }, ref) => {
    const [imageFile, setImageFile] = useState<File | null>(null);

    const {
        register,
        reset,
        getValues,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '' },
    });

    useEffect(() => {
        if (section) {
            reset({ name: section.name || '' });
        } else {
            reset({ name: '' });
        }
        setImageFile(null);
    }, [section, reset]);

    useImperativeHandle(ref, () => ({
        getFormData: () => {
            const formData = getValues();
            return {
                data: {
                    name: formData.name,
                },
                imageFile,
            };
        },
    }));

    const handleImageChange = (file: File | null) => {
        setImageFile(file);
    };

    return (
        <div className="space-y-4">
            <FormField label="Nombre de la Sección" error={errors.name?.message}>
                <Input {...register("name")} />
            </FormField>
            <ImageUploader
                label="Imagen de la Sección"
                initialImageUrl={getImagePath(section?.image, 'sections')}
                onImageChange={handleImageChange}
            />
        </div>
    );
});

// 🧭 MIGA DE PAN: DisplayName para mejorar debugging en React DevTools
SectionForm.displayName = 'SectionForm';

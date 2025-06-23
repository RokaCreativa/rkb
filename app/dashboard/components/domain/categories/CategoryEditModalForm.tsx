'use client';

import React, { useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import type { Category } from '@/app/dashboard-v2/types';
import { FormField } from '@/app/dashboard/components/ui/Form/FormField';
import { Input } from '@/app/dashboard/components/ui/Form/Input';
import { ImageUploader } from '@/app/dashboard/components/ui/Form/ImageUploader';
import { getImagePath } from '@/app/dashboard-v2/utils/imageUtils';

// --- VALIDACIÓN Y TIPOS ---
const formSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
});

type FormData = z.infer<typeof formSchema>;

// --- REF Y PROPS ---
export interface CategoryFormRef {
    getFormData: () => { data: Partial<Category>, imageFile: File | null };
}

interface CategoryFormProps {
    category: Category | null;
}

// --- COMPONENTE ---
export const CategoryForm = forwardRef<CategoryFormRef, CategoryFormProps>(({ category }, ref) => {
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
        // 🧭 MIGA DE PAN PARA DEPURACIÓN
        // Logueamos el objeto `category` completo que llega como prop.
        // Esto nos permitirá ver en la consola del navegador si el campo `image`
        // tiene el valor que esperamos (un string con el nombre del archivo).
        console.log('🕵️‍♂️ [CategoryForm] Recibida categoría para editar:', category);

        if (category) {
            reset({ name: category.name || '' });
        } else {
            reset({ name: '' });
        }
        setImageFile(null);
    }, [category, reset]);

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
            <FormField label="Nombre de la Categoría" error={errors.name?.message}>
                <Input {...register("name")} />
            </FormField>
            <ImageUploader
                label="Imagen de la Categoría"
                initialImageUrl={getImagePath(category?.image, 'categories')}
                onImageChange={handleImageChange}
            />
        </div>
    );
});

CategoryForm.displayName = 'CategoryForm';

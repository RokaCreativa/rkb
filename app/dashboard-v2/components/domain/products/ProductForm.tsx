'use client';

import React, { useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import type { Product } from '@/app/dashboard-v2/types';
import { FormField } from '@/app/dashboard-v2/components/ui/Form/FormField';
import { Input } from '@/app/dashboard-v2/components/ui/Form/Input';
import { ImageUploader } from '@/app/dashboard-v2/components/ui/Form/ImageUploader';
import { getImagePath } from '@/app/dashboard-v2/utils/imageUtils';

// --- VALIDACIÓN Y TIPOS ---
const formSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    description: z.string().optional(),
    price: z.number().min(0, 'El precio no puede ser negativo'),
});

type FormData = z.infer<typeof formSchema>;

// --- REF Y PROPS ---
/**
 * @fileoverview ProductForm - Formulario unificado para productos
 * @description 
 * 🧭 MIGA DE PAN: Este formulario sigue el patrón `forwardRef` + `useImperativeHandle`
 * establecido en los Mandamientos #6 (Separación de Responsabilidades).
 * Se conecta con:
 * - EditModals.tsx: Modal padre que controla el envío
 * - NewProductModal.tsx: Modal de creación (legacy, pendiente refactorización)
 * - ProductGridView.tsx: Vista que muestra los productos creados
 * - dashboardStore.ts: Store que maneja las operaciones CRUD
 * 
 * 🎯 MANDAMIENTO #8: Mantiene consistencia visual con CategoryForm y SectionForm
 * 🎯 MANDAMIENTO #5: Diseño Mobile-First con campos optimizados para táctil
 */
export interface ProductFormRef {
    getFormData: () => { data: Partial<Product>, imageFile: File | null };
}

interface ProductFormProps {
    product: Product | null;
}

// --- COMPONENTE ---
export const ProductForm = forwardRef<ProductFormRef, ProductFormProps>(({ product }, ref) => {
    const [imageFile, setImageFile] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        control,
        getValues,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
        },
    });

    useEffect(() => {
        if (product) {
            reset({
                name: product.name || '',
                description: product.description || '',
                price: product.price || 0,
            });
        } else {
            reset({
                name: '',
                description: '',
                price: 0,
            });
        }
        // Reseteamos el archivo de imagen en cada cambio de `product`
        setImageFile(null);
    }, [product, reset]);

    useImperativeHandle(ref, () => ({
        getFormData: () => {
            const formData = getValues();
            return {
                data: {
                    name: formData.name,
                    description: formData.description,
                    price: formData.price,
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
            <FormField label="Nombre del Producto" error={errors.name?.message}>
                <Input {...register("name")} />
            </FormField>

            <FormField label="Descripción" error={errors.description?.message}>
                <Input as="textarea" {...register("description")} />
            </FormField>

            <FormField label="Precio" error={errors.price?.message}>
                <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
            </FormField>

            <ImageUploader
                label="Imagen del Producto"
                initialImageUrl={getImagePath(product?.image, 'products')}
                onImageChange={handleImageChange}
            />
        </div>
    );
});

ProductForm.displayName = 'ProductForm';

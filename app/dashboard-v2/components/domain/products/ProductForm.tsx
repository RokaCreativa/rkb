'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Product } from '@/app/dashboard-v2/types';
import { FormField } from '@/app/dashboard-v2/components/ui/Form/FormField';
import { ImageUploader } from '@/app/dashboard-v2/components/ui/Form/ImageUploader';

// --- REF Y PROPS ---
/**
 * @fileoverview Refactorización de ProductForm.
 * @description Aplicamos el mismo patrón de `forwardRef` y `useImperativeHandle`.
 * El modal padre (`EditModals`) controla el envío y obtiene los datos del formulario
 * llamando a `getFormData()` en la `ref` del formulario.
 */
export interface ProductFormRef {
    getFormData: () => { data: Partial<Product>, imageFile: File | null };
}

interface ProductFormProps {
    product: Product | null;
}

// --- COMPONENTE ---

export const ProductForm = forwardRef<ProductFormRef, ProductFormProps>(({ product }, ref) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [displayOrder, setDisplayOrder] = useState(0);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (product) {
            setName(product.name || '');
            setDescription(product.description || '');
            setPrice(product.price || 0);
            setDisplayOrder(product.display_order || 0);
            setImageFile(null); // Reset
        } else {
            setName('');
            setDescription('');
            setPrice(0);
            setDisplayOrder(0);
            setImageFile(null);
        }
    }, [product]);

    // Exponer la función `getFormData`
    useImperativeHandle(ref, () => ({
        getFormData: () => ({
            data: {
                name,
                description,
                price,
                display_order: displayOrder,
            },
            imageFile,
        })
    }));

    return (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <FormField
                label="Nombre del Producto"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <FormField
                label="Descripción"
                name="description"
                as="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <FormField
                label="Precio"
                name="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
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
                label="Imagen del Producto"
                onImageChange={setImageFile}
                initialImageUrl={product?.image}
            />
        </form>
    );
});

ProductForm.displayName = 'ProductForm';

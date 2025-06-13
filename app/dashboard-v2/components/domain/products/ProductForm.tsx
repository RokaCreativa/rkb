'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Product } from '@/app/dashboard-v2/types';
import { FormField } from '@/app/dashboard-v2/components/ui/Form/FormField';
import { ImageUploader } from '@/app/dashboard-v2/components/ui/Form/ImageUploader';

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
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    // 🧭 MIGA DE PAN: El precio se maneja como string porque Prisma.Decimal se serializa como string
    // para mantener precisión decimal. Se conecta con ProductGridView.tsx y API /api/products
    const [price, setPrice] = useState<string>('0');
    // 🧭 MIGA DE PAN: Status por defecto TRUE (activo) según feedback del usuario
    // Se conecta con toggleProductVisibility en dashboardStore.ts y contadores de visibilidad
    const [status, setStatus] = useState<boolean>(true);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (product) {
            // 🧭 MIGA DE PAN: Al editar, cargar datos existentes del producto
            setName(product.name || '');
            setDescription(product.description || '');
            setPrice(product.price || '0');
            // 🔧 FIX: product.status es number (1 = activo, 0 = inactivo)
            setStatus(product.status === 1);
            setImageFile(null); // Reset para evitar conflictos con imagen existente
        } else {
            // 🧭 MIGA DE PAN: Al crear, valores por defecto optimizados según Mandamiento #8
            setName('');
            setDescription('');
            setPrice('0');
            setStatus(true); // ✅ CORRECCIÓN: Por defecto ACTIVO según feedback
            setImageFile(null);
        }
    }, [product]);

    // 🧭 MIGA DE PAN: Exponer getFormData para que EditModals.tsx pueda obtener los datos
    // Patrón establecido en Mandamiento #6 para separar lógica de presentación
    useImperativeHandle(ref, () => ({
        getFormData: () => ({
            data: {
                name,
                description,
                price,
                status: status ? 1 : 0, // Convertir a formato esperado por API
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
                className="focus:ring-2 focus:ring-blue-500" // Mandamiento #8: Consistencia visual
            />
            <FormField
                label="Descripción"
                name="description"
                as="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] resize-none" // Mandamiento #5: Mobile-First
            />
            <FormField
                label="Precio"
                name="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="focus:ring-2 focus:ring-blue-500"
            />

            {/* 🧭 MIGA DE PAN: Selector de visibilidad reemplaza campo "orden" según feedback
                Se conecta con contadores de visibilidad en CategoryGridView, SectionGridView, ProductGridView */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Visibilidad
                </label>
                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="status"
                            checked={status === true}
                            onChange={() => setStatus(true)}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Activo (Visible)</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="status"
                            checked={status === false}
                            onChange={() => setStatus(false)}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Inactivo (Oculto)</span>
                    </label>
                </div>
            </div>

            <ImageUploader
                label="Imagen del Producto"
                onImageChange={setImageFile}
                initialImageUrl={product?.image ? `/images/products/${product.image}` : null}
            />
        </form>
    );
});

ProductForm.displayName = 'ProductForm';

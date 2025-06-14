'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Category } from '@/app/dashboard-v2/types';
import { FormField } from '@/app/dashboard-v2/components/ui/Form/FormField';
import { ImageUploader } from '@/app/dashboard-v2/components/ui/Form/ImageUploader';
import { getImagePath } from '@/app/dashboard-v2/utils/imageUtils';

// --- REF Y PROPS ---

/**
 * @fileoverview CategoryForm - Formulario unificado para categorías
 * @description 
 * 🧭 MIGA DE PAN: Este formulario sigue el patrón `forwardRef` + `useImperativeHandle`
 * establecido en los Mandamientos #6 (Separación de Responsabilidades).
 * Se conecta con:
 * - EditModals.tsx: Modal padre que controla el envío
 * - NewCategoryModal.tsx: Modal de creación (legacy, pendiente refactorización)
 * - CategoryGridView.tsx: Vista que muestra las categorías creadas
 * - dashboardStore.ts: Store que maneja las operaciones CRUD
 * 
 * 🎯 MANDAMIENTO #8: Mantiene consistencia visual con ProductForm y SectionForm
 * 🎯 MANDAMIENTO #5: Diseño Mobile-First con campos optimizados para táctil
 * 🎯 MANDAMIENTO #3: Reutiliza FormField e ImageUploader (DRY)
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
    // 🧭 MIGA DE PAN: Status por defecto TRUE (activo) según feedback del usuario
    // Se conecta con toggleCategoryVisibility en dashboardStore.ts y contadores de visibilidad
    const [status, setStatus] = useState<boolean>(true);
    // 🎯 SOLUCIÓN v0.dev: Estado para categoría virtual
    // PORQUÉ: Permite crear categorías cuyos productos aparecen en vista raíz del cliente
    // CONEXIÓN: CategoryGridView mostrará badge VIRTUAL para estas categorías
    const [isVirtualCategory, setIsVirtualCategory] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (category) {
            // 🧭 MIGA DE PAN: Al editar, cargar datos existentes de la categoría
            console.log('🔍 CategoryForm - category recibida:', category);
            console.log('🔍 CategoryForm - category.image:', category.image);
            setName(category.name || '');
            setStatus(Boolean(category.status)); // Normalizar boolean
            setIsVirtualCategory(Boolean(category.is_virtual_category)); // 🎯 SOLUCIÓN v0.dev
            setImageFile(null); // Reset para evitar conflictos con imagen existente
        } else {
            // 🧭 MIGA DE PAN: Al crear, valores por defecto optimizados según Mandamiento #8
            setName('');
            setStatus(true); // ✅ CORRECCIÓN: Por defecto ACTIVO según feedback
            setIsVirtualCategory(false); // 🎯 Por defecto categoría normal
            setImageFile(null);
        }
    }, [category]);

    // 🧭 MIGA DE PAN: Exponer getFormData para que EditModals.tsx pueda obtener los datos
    // Patrón establecido en Mandamiento #6 para separar lógica de presentación
    useImperativeHandle(ref, () => ({
        getFormData: () => {
            return {
                data: {
                    name,
                    status: status ? 1 : 0, // Convertir a formato esperado por API
                    is_virtual_category: isVirtualCategory, // 🎯 SOLUCIÓN v0.dev
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

            {/* 🧭 MIGA DE PAN: Selector de visibilidad reemplaza campo "orden" según feedback
                Se conecta con contadores de visibilidad en CategoryGridView */}
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

            {/* 🎯 SOLUCIÓN v0.dev: Checkbox para categoría virtual */}
            <div className="space-y-2">
                <label className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        checked={isVirtualCategory}
                        onChange={(e) => setIsVirtualCategory(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                            Categoría Virtual
                        </span>
                        <span className="text-xs text-gray-500">
                            Los productos aparecerán directamente en la vista principal del cliente, sin mostrar el nombre de la categoría
                        </span>
                    </div>
                </label>
                {/* 🧭 MIGA DE PAN: Advertencia para categorías virtuales */}
                {isVirtualCategory && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <p className="text-sm text-purple-700">
                            <strong>💡 Tip:</strong> Las categorías virtuales son ideales para "Especiales del Día", "Promociones" o productos que no encajan en la estructura normal del menú.
                        </p>
                    </div>
                )}
            </div>

            <ImageUploader
                label="Imagen de la Categoría"
                onImageChange={setImageFile}
                initialImageUrl={(() => {
                    const imageUrl = category?.image ? getImagePath(category.image, 'categories') : null;
                    console.log('🔍 CategoryForm - URL construida:', imageUrl);
                    console.log('🔍 CategoryForm - category.image raw:', category?.image);
                    return imageUrl;
                })()}
            />
        </form>
    );
});

// 🧭 MIGA DE PAN: DisplayName para mejorar debugging en React DevTools
CategoryForm.displayName = 'CategoryForm';

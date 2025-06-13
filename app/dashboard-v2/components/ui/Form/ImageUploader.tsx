/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente de carga de imágenes reutilizable
 * PROBLEMA RESUELTO: useState no se actualizaba cuando cambiaba initialImageUrl
 * CONEXIONES CRÍTICAS:
 * - CategoryForm.tsx: Usa este componente para cargar imágenes de categorías
 * - SectionForm.tsx: Usa este componente para cargar imágenes de secciones  
 * - ProductForm.tsx: Usa este componente para cargar imágenes de productos
 * DECISIÓN ARQUITECTÓNICA: useEffect para sincronizar con prop initialImageUrl
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CameraIcon } from '@heroicons/react/24/solid';

interface ImageUploaderProps {
    label: string;
    onImageChange: (file: File | null) => void;
    initialImageUrl?: string | null;
    error?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    label,
    onImageChange,
    initialImageUrl,
    error,
}) => {
    const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Sincronizar preview con initialImageUrl
     * PROBLEMA RESUELTO: En edición, la imagen no se cargaba porque useState solo se inicializa una vez
     * PORQUÉ NECESARIO: Cuando se abre modal de edición, initialImageUrl cambia pero preview no se actualizaba
     * CONEXIÓN: CategoryForm y SectionForm pasan initialImageUrl que debe reflejarse inmediatamente
     */
    useEffect(() => {
        console.log('🖼️ ImageUploader useEffect:', { initialImageUrl, preview });
        setPreview(initialImageUrl || null);
    }, [initialImageUrl]);

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Manejo de selección de archivo
     * FLUJO: Usuario selecciona archivo → FileReader crea preview → onImageChange notifica al padre
     * CONEXIÓN: onImageChange se conecta con setImageFile en CategoryForm/SectionForm
     */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            onImageChange(file);
        } else {
            onImageChange(null);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div
                className={`mt-1 flex justify-center items-center w-full h-48 rounded-md border-2 ${error ? 'border-red-500' : 'border-gray-300'
                    } border-dashed cursor-pointer relative bg-gray-50 hover:bg-gray-100 transition`}
                onClick={handleClick}
            >
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                />
                {preview ? (
                    <Image
                        src={preview}
                        alt="Vista previa"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                    />
                ) : (
                    <div className="text-center">
                        <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                            Haz clic para subir una imagen
                        </p>
                    </div>
                )}
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

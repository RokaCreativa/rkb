/**
 * 📜 Mandamiento #7: Separación Absoluta de Lógica y Presentación
 * -----------------------------------------------------------------
 * Este componente es un ejemplo perfecto de un componente de UI "tonto".
 * No tiene lógica de negocio. Su única responsabilidad es:
 * 1. Mostrar una imagen inicial si se le proporciona (`initialImageUrl`).
 * 2. Permitir al usuario seleccionar un nuevo archivo.
 * 3. Notificar al componente padre cuando se selecciona un archivo (`onImageChange`).
 * No sabe cómo se construye una URL ni qué se hará con el archivo.
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
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Sincronizar preview con initialImageUrl
     * PROBLEMA RESUELTO: La URL de la imagen se duplicaba (`/images/.../images/...`)
     * PORQUÉ NECESARIO: Este componente debe ser "tonto". No debe construir rutas, solo
     * mostrar la `initialImageUrl` que recibe. La construcción de la ruta es responsabilidad
     * de quien lo llama (usando la utilidad `getImagePath`).
     */
    useEffect(() => {
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
            // Creamos una URL local para la previsualización instantánea.
            // Esto es más eficiente que leer el archivo con FileReader.
            setPreview(URL.createObjectURL(file));
            onImageChange(file); // Notificamos al padre sobre el NUEVO archivo
        } else {
            // Si el usuario cancela, no hacemos nada para no perder la preview actual
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
                        // onError para manejar imágenes rotas en el servidor
                        onError={() => setPreview('/images/placeholder.png')}
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

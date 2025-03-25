"use client"

/**
 * @fileoverview Componente para la carga y vista previa de imágenes
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 */

import { useState, useRef, ChangeEvent, useEffect } from 'react'
import Image from 'next/image'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

/**
 * Props para el componente ImageUploader
 * 
 * @property {string | null} [initialImage] - URL de la imagen inicial (para modo edición)
 * @property {function} onChange - Función que recibe el archivo de imagen seleccionado o null
 * @property {boolean} [disabled] - Indica si el control está deshabilitado
 * @property {string} [label] - Etiqueta para el campo de carga
 * @property {string} [helpText] - Texto de ayuda para el usuario
 * @property {string} [className] - Clases CSS adicionales
 */
interface ImageUploaderProps {
  initialImage?: string | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  label?: string;
  helpText?: string;
  className?: string;
}

/**
 * Componente para la carga y previsualización de imágenes
 * 
 * Este componente proporciona una interfaz para subir imágenes con:
 * - Previsualización de la imagen seleccionada
 * - Botón para eliminar la imagen actual
 * - Drag & drop para facilitar la carga
 * - Validación visual del estado (seleccionada/no seleccionada)
 * 
 * Se utiliza en diversos formularios de la aplicación para la gestión de
 * imágenes de categorías, secciones, productos, etc.
 * 
 * @param {ImageUploaderProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de carga de imágenes
 */
export default function ImageUploader({
  initialImage = null,
  onChange,
  disabled = false,
  label = "Imagen",
  helpText = "PNG, JPG, GIF hasta 2MB",
  className
}: ImageUploaderProps) {
  // Estado para la previsualización de la imagen
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Efecto para depuración
  useEffect(() => {
    console.log('ImageUploader - initialImage:', initialImage);
  }, [initialImage]);

  // Manejar la selección de archivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(null); // Reiniciar primero para forzar actualización
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      console.log('ImageUploader - Archivo seleccionado:', file.name, file.type, file.size);
      onChange(file);
    }
  };

  // Limpiar la imagen seleccionada
  const handleClearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    console.log('ImageUploader - Imagen eliminada');
    onChange(null);
  };

  return (
    <div className={`mb-6 ${className || ''}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        {imagePreview ? (
          <div className="relative">
            <div className="h-40 w-40 mx-auto relative mb-2">
              <Image 
                src={imagePreview} 
                alt="Vista previa" 
                fill
                sizes="160px"
                className="object-cover rounded-md" 
              />
            </div>
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 focus:outline-none"
              disabled={disabled}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-1 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
              <PhotoIcon className="h-10 w-10" />
            </div>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="image-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <span>Subir una imagen</span>
                <input
                  id="image-upload"
                  name="image-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={disabled}
                />
              </label>
              <p className="pl-1">o arrastra y suelta</p>
            </div>
            <p className="text-xs text-gray-500">
              {helpText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
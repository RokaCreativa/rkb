/**
 * Componente ImageUpload
 * 
 * Permite subir y previsualizar imágenes con vista previa y validaciones.
 */

import React, { useState, useRef, ChangeEvent } from 'react';
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/tailwind';

export interface ImageUploadProps {
  /** Valor actual de la imagen (URL o File) */
  value?: File | string | null;
  /** Función llamada cuando cambia la imagen */
  onChange: (file: File | null) => void;
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Permitir eliminar la imagen */
  allowRemove?: boolean;
  /** Mensaje de error */
  error?: string;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Tipos de archivo permitidos */
  accept?: string;
  /** Tamaño máximo en bytes */
  maxSize?: number;
  /** Texto para el placeholder */
  placeholder?: string;
  /** Alto del componente */
  height?: string;
}

export default function ImageUpload({
  value,
  onChange,
  className,
  allowRemove = true,
  error,
  disabled = false,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB por defecto
  placeholder = "Subir imagen",
  height = "h-40",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generar vista previa cuando cambia el valor
  React.useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    if (typeof value === 'string') {
      setPreview(value);
    } else if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      
      // Limpiar URL cuando se desmonte el componente
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [value]);

  // Manejar la selección de archivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    validateAndSetFile(file);
    
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manejar el arrastre y soltar
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Validar el archivo y establecerlo
  const validateAndSetFile = (file: File | null) => {
    setSizeError(null);
    
    if (!file) {
      onChange(null);
      return;
    }
    
    // Validar tamaño
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / 1024 / 1024);
      setSizeError(`La imagen excede el tamaño máximo permitido (${sizeMB}MB)`);
      return;
    }
    
    onChange(file);
  };

  // Eliminar la imagen
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSizeError(null);
  };

  // Abrir el selector de archivos
  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          height,
          isDragging && !disabled ? "border-indigo-500 bg-indigo-50" : "border-gray-300",
          preview ? "bg-gray-100" : "bg-white",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          error || sizeError ? "border-red-500" : ""
        )}
        onClick={handleClick}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
        />
        
        {/* Vista previa de la imagen */}
        {preview ? (
          <div className="relative h-full w-full">
            <img
              src={preview}
              alt="Vista previa"
              className="h-full w-full rounded-lg object-contain p-2"
            />
            
            {/* Botón para eliminar */}
            {allowRemove && !disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 rounded-full bg-gray-100 p-1 text-gray-600 shadow-sm hover:bg-gray-200 hover:text-gray-900"
              >
                <span className="sr-only">Eliminar imagen</span>
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
            <PhotoIcon
              className={cn(
                "h-10 w-10",
                isDragging ? "text-indigo-500" : "text-gray-400"
              )}
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                {placeholder}
              </p>
              <p className="text-xs text-gray-500">
                Arrastra y suelta o haz clic para subir
              </p>
            </div>
            <ArrowUpTrayIcon
              className={cn(
                "mt-2 h-6 w-6",
                isDragging ? "text-indigo-500" : "text-gray-400"
              )}
            />
          </div>
        )}
      </div>
      
      {/* Mensaje de error */}
      {(error || sizeError) && (
        <p className="text-xs text-red-500">
          {error || sizeError}
        </p>
      )}
    </div>
  );
} 
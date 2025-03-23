"use client"

import { useState, useRef, ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { ImageIcon, X, UploadCloud } from 'lucide-react'
import Image from 'next/image'

/**
 * Interfaz para los datos del formulario de categoría
 */
interface CategoryFormData {
  name: string;
  status: boolean;
}

/**
 * Interfaz para las propiedades del componente CategoryForm
 */
interface CategoryFormProps {
  /** Función a llamar cuando se envía el formulario */
  onSubmit: (data: FormData) => void;
  /** Función a llamar cuando se cancela */
  onCancel: () => void;
  /** Título personalizado para el formulario */
  title?: string;
  /** Datos iniciales para edición */
  initialData?: {
    name?: string;
    status?: boolean;
    image?: string;
  };
  /** Si está cargando actualmente */
  isLoading?: boolean;
}

/**
 * Componente de formulario para crear o editar categorías
 * 
 * Maneja la carga de imágenes, validación y envío del formulario
 */
export default function CategoryForm({
  onSubmit,
  onCancel,
  title = "Nueva Categoría",
  initialData,
  isLoading = false
}: CategoryFormProps) {
  // Configuración de React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm<CategoryFormData>({
    defaultValues: {
      name: initialData?.name || '',
      status: initialData?.status !== false // Por defecto activo
    }
  });

  // Estado para la previsualización de la imagen
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejar la selección de archivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Limpiar la imagen seleccionada
  const handleClearImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Envío del formulario validado
  const handleFormSubmit = (data: CategoryFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('status', data.status ? '1' : '0');
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Campo de nombre */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="Nombre de la categoría"
            className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-400'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            {...register("name", { 
              required: "El nombre es obligatorio",
              maxLength: {
                value: 50,
                message: "El nombre no puede tener más de 50 caracteres"
              }
            })}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        
        {/* Campo de imagen */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen 
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
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
                  <UploadCloud className="h-10 w-10" />
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
                      disabled={isLoading}
                    />
                  </label>
                  <p className="pl-1">o arrastra y suelta</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF hasta 2MB
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Campo de estado */}
        <div className="mb-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-indigo-600"
              {...register("status")}
              disabled={isLoading}
            />
            <span className="ml-2 text-gray-700">Activa</span>
          </label>
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
} 
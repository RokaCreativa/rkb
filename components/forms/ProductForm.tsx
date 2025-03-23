"use client"

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import ImageUploader from './ImageUploader'

/**
 * Interfaz para los datos del formulario de producto
 */
interface ProductFormData {
  name: string;
  status: boolean;
  price: string;
}

/**
 * Interfaz para las propiedades del componente ProductForm
 */
interface ProductFormProps {
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
    price?: string;
    section_id?: number;
  };
  /** Si está cargando actualmente */
  isLoading?: boolean;
  /** ID de la sección a la que pertenece el producto */
  sectionId?: number;
}

/**
 * Componente de formulario para crear o editar productos
 * 
 * Maneja la carga de imágenes, validación y envío del formulario
 */
export default function ProductForm({
  onSubmit,
  onCancel,
  title = "Nuevo Producto",
  initialData,
  isLoading = false,
  sectionId
}: ProductFormProps) {
  // Configuración de React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      name: initialData?.name || '',
      status: initialData?.status !== false, // Por defecto activo
      price: initialData?.price || ''
    }
  });

  // Estado para la imagen
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Envío del formulario validado
  const handleFormSubmit = (data: ProductFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('status', data.status ? '1' : '0');
    formData.append('price', data.price);
    
    // Agregar el ID de la sección, ya sea del prop o de los datos iniciales
    const secId = sectionId || initialData?.section_id;
    if (secId) {
      formData.append('section_id', secId.toString());
    }
    
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
            placeholder="Nombre del producto"
            className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
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
        
        {/* Campo de precio */}
        <div className="mb-6">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Precio <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">€</span>
            </div>
            <input
              id="price"
              type="text"
              placeholder="0.00"
              className={`w-full pl-7 px-3 py-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              {...register("price", {
                required: "El precio es obligatorio",
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: "Formato de precio inválido (ejemplo: 12.99)"
                }
              })}
              disabled={isLoading}
            />
          </div>
          {errors.price && (
            <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>
        
        {/* Campo de imagen usando el componente ImageUploader */}
        <ImageUploader
          initialImage={initialData?.image}
          onChange={setImageFile}
          disabled={isLoading}
          label="Imagen del producto"
          helpText="PNG, JPG, GIF hasta 2MB"
        />
        
        {/* Campo de estado */}
        <div className="mb-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-indigo-600"
              {...register("status")}
              disabled={isLoading}
            />
            <span className="ml-2 text-gray-700">Activo</span>
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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 
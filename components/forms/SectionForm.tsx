"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import ImageUploader from './ImageUploader'

/**
 * Interfaz para los datos del formulario de sección
 */
interface SectionFormData {
  name: string;
  status: boolean;
}

/**
 * Interfaz para las propiedades del componente SectionForm
 */
interface SectionFormProps {
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
    category_id?: number;
  };
  /** Si está cargando actualmente */
  isLoading?: boolean;
  /** ID de la categoría a la que pertenece la sección */
  categoryId?: number;
}

/**
 * Componente de formulario para crear o editar secciones
 * 
 * Maneja la carga de imágenes, validación y envío del formulario
 */
export default function SectionForm({
  onSubmit,
  onCancel,
  title = "Nueva Sección",
  initialData,
  isLoading = false,
  categoryId
}: SectionFormProps) {
  // Configuración de React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm<SectionFormData>({
    defaultValues: {
      name: initialData?.name || '',
      status: initialData?.status !== false // Por defecto activo
    }
  });

  // Estado para la imagen
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Envío del formulario validado
  const handleFormSubmit = (data: SectionFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('status', data.status ? '1' : '0');
    
    // Agregar el ID de la categoría, ya sea del prop o de los datos iniciales
    const catId = categoryId || initialData?.category_id;
    if (catId) {
      formData.append('category_id', catId.toString());
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
            placeholder="Nombre de la sección"
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
        
        {/* Campo de imagen usando ImageUploader */}
        <ImageUploader
          initialImage={initialData?.image}
          onChange={setImageFile}
          disabled={isLoading}
          label="Imagen de la sección"
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
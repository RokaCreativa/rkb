"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import ImageUploader from './ImageUploader'

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

  // Estado para la imagen
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Depuración
  useEffect(() => {
    console.log('CategoryForm - Estado actual:', {
      imageFile: imageFile ? `${imageFile.name} (${imageFile.type}, ${imageFile.size} bytes)` : 'null',
      initialImage: initialData?.image || 'null',
      isEditing: !!initialData?.name
    });
  }, [imageFile, initialData]);

  /**
   * Maneja los cambios en la imagen seleccionada
   * @param file - Archivo de imagen o null si se eliminó
   */
  const handleImageChange = (file: File | null) => {
    console.log('ImageUploader onChange:', file ? `${file.name} (${file.type}, ${file.size} bytes)` : 'null');
    setImageFile(file);
  };

  // Envío del formulario validado
  const handleFormSubmit = (data: CategoryFormData) => {
    // Verificar tamaño de imagen
    if (imageFile && imageFile.size > 2 * 1024 * 1024) { // 2MB
      alert('La imagen no puede superar los 2MB');
      return;
    }
    
    const formData = new FormData();
    
    // Depuración: registrar qué datos se están enviando
    console.log('Enviando formulario:', {
      name: data.name,
      status: data.status ? '1' : '0',
      imageFile: imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : 'null',
      isEditing: !!initialData?.name
    });
    
    // Agregar los campos básicos
    formData.append('name', data.name);
    formData.append('status', data.status ? '1' : '0');
    
    // Añadir imagen solo si existe
    if (imageFile) {
      console.log('Agregando imagen al FormData:', imageFile.name);
      formData.append('image', imageFile);
    }
    
    // Si estamos editando y no hay una nueva imagen, pero hay una imagen previa
    // podemos añadir un campo para indicar que no se debe cambiar la imagen
    if (!imageFile && initialData?.image) {
      console.log('Manteniendo imagen existente:', initialData.image);
      formData.append('keep_existing_image', 'true');
    }
    
    // Registrar el contenido completo del FormData para depuración
    console.log('FormData enviado:');
    for (const pair of formData.entries()) {
      console.log(`- ${pair[0]}: ${typeof pair[1] === 'object' ? 'File object' : pair[1]}`);
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
        
        {/* Campo de imagen usando ImageUploader */}
        <ImageUploader
          initialImage={initialData?.image}
          onChange={handleImageChange}
          disabled={isLoading}
          label="Imagen de la categoría"
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
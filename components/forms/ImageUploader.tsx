import { useState, useRef, ChangeEvent, useEffect } from 'react'
import Image from 'next/image'
import { X, UploadCloud } from 'lucide-react'

/**
 * Propiedades del componente ImageUploader
 * @property {string | null} initialImage - URL de la imagen inicial (si existe)
 * @property {(file: File | null) => void} onChange - Función llamada cuando cambia la imagen seleccionada
 * @property {boolean} disabled - Indica si el componente está deshabilitado
 * @property {string} label - Etiqueta del campo
 * @property {boolean} required - Indica si el campo es obligatorio
 * @property {string} accept - Tipos de archivo aceptados (ej: "image/*")
 * @property {string} helpText - Texto de ayuda para mostrar debajo del uploader
 */
interface ImageUploaderProps {
  initialImage?: string | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  accept?: string;
  helpText?: string;
}

/**
 * Componente para cargar y previsualizar imágenes
 * 
 * Este componente permite a los usuarios seleccionar una imagen, previsualizar la imagen
 * seleccionada y eliminarla si es necesario. La función onChange devuelve el archivo seleccionado
 * o null si se eliminó la selección.
 * 
 * Uso:
 * ```tsx
 * <ImageUploader
 *   initialImage={product.image}
 *   onChange={(file) => setImageFile(file)}
 *   label="Imagen del producto"
 *   helpText="PNG, JPG, GIF hasta 2MB"
 * />
 * ```
 * 
 * @author Rodolfo - RokaMenu
 * @date 23-03-2025 (UTC+0 - Londres)
 */
export default function ImageUploader({
  initialImage = null,
  onChange,
  disabled = false,
  label = "Imagen",
  required = false,
  accept = "image/*",
  helpText = "PNG, JPG, GIF hasta 2MB"
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
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
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
                  accept={accept}
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
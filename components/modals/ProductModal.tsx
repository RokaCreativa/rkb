import { useState, useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import BaseModal from './BaseModal';
import { Product } from '@/app/types/menu';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSave: (productData: FormData) => Promise<void>;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
  onSave,
  isLoading = false,
  mode
}: ProductModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Inicializar los valores del formulario cuando se carga un producto para editar
  useEffect(() => {
    if (product && mode === 'edit') {
      setName(product.name);
      setPrice(product.price);
      setDescription(product.description || '');
      
      if (product.image) {
        const imagePath = `/images/products/${product.image}`;
        setImagePreview(imagePath);
      } else {
        setImagePreview(null);
      }
    } else {
      // Limpiar el formulario en modo crear o cuando se cierra
      setName('');
      setPrice('');
      setDescription('');
      setImage(null);
      setImagePreview(null);
    }
  }, [product, mode]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      
      // Crear una URL para previsualizar la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async () => {
    try {
      // Validar campos obligatorios
      if (!name.trim()) {
        toast.error('El nombre del producto es obligatorio');
        return;
      }
      
      if (!price.trim()) {
        toast.error('El precio es obligatorio');
        return;
      }
      
      // Crear FormData para enviar la información
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      
      if (description) {
        formData.append('description', description);
      }
      
      if (image) {
        formData.append('image', image);
      }
      
      // Si estamos editando, incluir el ID del producto
      if (mode === 'edit' && product) {
        formData.append('product_id', product.product_id.toString());
      }
      
      // Incluir section_id si estamos creando un nuevo producto
      if (mode === 'create' && product?.section_id) {
        formData.append('section_id', product.section_id.toString());
      }
      
      await onSave(formData);
      
      // Cerrar el modal después de guardar exitosamente
      onClose();
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      toast.error('Error al guardar el producto');
    }
  };
  
  const footerContent = (
    <>
      <button
        type="button"
        className="mr-2 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:text-sm"
        onClick={onClose}
        disabled={isLoading}
      >
        Cancelar
      </button>
      <button
        type="button"
        className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleSubmit}
        disabled={isLoading || !name.trim() || !price.trim()}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {mode === 'create' ? 'Creando...' : 'Actualizando...'}
          </>
        ) : (
          mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'
        )}
      </button>
    </>
  );
  
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
      footer={footerContent}
      size="lg"
    >
      <div className="space-y-4">
        {/* Nombre del producto */}
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
            Nombre del producto *
          </label>
          <input
            type="text"
            name="productName"
            id="productName"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        {/* Precio */}
        <div>
          <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">
            Precio *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">€</span>
            </div>
            <input
              type="text"
              name="productPrice"
              id="productPrice"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>
        
        {/* Descripción */}
        <div>
          <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            id="productDescription"
            name="productDescription"
            rows={3}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
            placeholder="Descripción del producto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        {/* Imagen */}
        <div>
          <label htmlFor="productImage" className="block text-sm font-medium text-gray-700">
            Imagen del producto
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="relative mx-auto w-40 h-40 mb-2">
                  <Image 
                    src={imagePreview} 
                    alt="Vista previa" 
                    fill
                    className="object-cover rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                  >
                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="product-image-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Subir imagen</span>
                  <input 
                    id="product-image-upload" 
                    name="product-image-upload" 
                    type="file" 
                    className="sr-only" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                <p className="pl-1">o arrastra y suelta</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
} 
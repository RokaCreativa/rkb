"use client";

import React, { Fragment, useState, useRef } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Section, Product } from '@/app/types/menu';
import { PrismaClient } from '@prisma/client';

/**
 * Props para el componente NewProductModal
 * @property {boolean} isOpen - Controla si el modal está abierto o cerrado
 * @property {Function} onClose - Función para cerrar el modal
 * @property {PrismaClient} client - Cliente de Prisma para realizar operaciones en la base de datos
 * @property {Section | null} selectedSection - Sección seleccionada donde se añadirá el producto
 * @property {Function} setProducts - Función para actualizar el estado de productos
 */
interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: PrismaClient;
  selectedSection: Section | null;
  setProducts: React.Dispatch<React.SetStateAction<Record<string, Product[]>>>;
}

/**
 * Componente modal para crear un nuevo producto en una sección
 * 
 * Este componente permite al usuario crear un nuevo producto dentro de una sección seleccionada,
 * proporcionando nombre, precio, descripción y una imagen opcional para el producto.
 * 
 * @param {NewProductModalProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente renderizado del modal de creación de producto
 */
const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  client,
  selectedSection,
  setProducts
}) => {
  // Estados para el formulario
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Referencia para el input de archivos
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Maneja el cambio de la imagen del producto
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio del input de archivo
   */
  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductImage(file);
      
      // Crear una vista previa de la imagen
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setImagePreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Método para abrir el selector de archivos
   */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /**
   * Maneja el envío del formulario para crear un nuevo producto
   * @param {React.FormEvent} e - Evento de formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSection) {
      toast.error('Por favor, selecciona una sección primero');
      return;
    }
    
    if (!productName.trim()) {
      toast.error('Por favor, ingresa un nombre para el producto');
      return;
    }
    
    if (!productPrice || isNaN(parseFloat(productPrice))) {
      toast.error('Por favor, ingresa un precio válido');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Preparar los datos del nuevo producto
      const formData = new FormData();
      formData.append('name', productName);
      formData.append('price', productPrice);
      formData.append('description', productDescription);
      formData.append('section_id', selectedSection.section_id.toString());
      
      if (productImage) {
        formData.append('image', productImage);
      }
      
      // Crear el producto en la base de datos
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el producto');
      }
      
      const newProduct: Product = await response.json();
      
      // Actualizar el estado local con el nuevo producto
      setProducts(prevProducts => ({
        ...prevProducts,
        [selectedSection.section_id]: [...(prevProducts[selectedSection.section_id] || []), newProduct]
      }));
      
      // Mostrar mensaje de éxito
      toast.success('Producto creado correctamente');
      
      // Reiniciar el formulario
      setProductName('');
      setProductPrice('');
      setProductDescription('');
      setProductImage(null);
      setImagePreview(null);
      
      // Cerrar el modal
      onClose();
    } catch (error) {
      console.error('Error al crear el producto:', error);
      toast.error('Error al crear el producto');
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Reinicia el formulario y cierra el modal
   */
  const handleCancel = () => {
    setProductName('');
    setProductPrice('');
    setProductDescription('');
    setProductImage(null);
    setImagePreview(null);
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Capa de fondo oscura */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* Truco para centrar el modal verticalmente */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          {/* Contenido del modal con animación */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                  Crear nuevo producto en {selectedSection?.name}
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-4">
                  {/* Campo de nombre de producto */}
                  <div className="mb-4">
                    <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">
                      Nombre del producto
                    </label>
                    <input
                      type="text"
                      id="product-name"
                      name="product-name"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Escribe el nombre del producto"
                      required
                    />
                  </div>
                  
                  {/* Campo de precio del producto */}
                  <div className="mb-4">
                    <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">
                      Precio (€)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">€</span>
                      </div>
                      <input
                        type="text"
                        id="product-price"
                        name="product-price"
                        value={productPrice}
                        onChange={(e) => {
                          // Permitir solo números y un punto decimal
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          // Asegurar que solo haya un punto decimal
                          const parts = value.split('.');
                          if (parts.length > 2) {
                            return;
                          }
                          // Limitar a 2 decimales
                          if (parts[1] && parts[1].length > 2) {
                            return;
                          }
                          setProductPrice(value);
                        }}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Campo de descripción del producto */}
                  <div className="mb-4">
                    <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">
                      Descripción (opcional)
                    </label>
                    <textarea
                      id="product-description"
                      name="product-description"
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      rows={3}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Escribe una descripción para el producto"
                    />
                  </div>
                  
                  {/* Campo de imagen del producto */}
                  <div className="mb-4">
                    <label htmlFor="product-image" className="block text-sm font-medium text-gray-700">
                      Imagen del producto (opcional)
                    </label>
                    
                    <input
                      type="file"
                      id="product-image"
                      name="product-image"
                      ref={fileInputRef}
                      onChange={handleProductImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                    
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {imagePreview ? (
                          <div className="mb-3">
                            <Image
                              src={imagePreview}
                              alt="Vista previa"
                              width={200}
                              height={200}
                              className="mx-auto object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setProductImage(null);
                                setImagePreview(null);
                              }}
                              className="mt-2 text-sm text-red-600 hover:text-red-900"
                            >
                              Eliminar imagen
                            </button>
                          </div>
                        ) : (
                          <>
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
                            <div className="flex text-sm text-gray-600">
                              <button
                                type="button"
                                onClick={triggerFileInput}
                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                              >
                                Subir una imagen
                              </button>
                              <p className="pl-1">o arrastra y suelta</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm ${
                        isCreating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creando...
                        </>
                      ) : (
                        'Crear producto'
                      )}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={handleCancel}
                      disabled={isCreating}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default NewProductModal; 
"use client";

/**
 * @fileoverview Componente modal para la edición de productos en el menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este componente proporciona una interfaz de usuario para editar productos existentes
 * en el sistema de gestión de menús. Permite modificar el nombre, precio, descripción
 * e imagen del producto.
 */

import React, { Fragment, useState, useRef, useEffect, FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Section, Product, Client } from '@/app/types/menu';
import useProducts from '@/app/hooks/useProducts';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Props para el componente EditProductModal
 * 
 * @property {boolean} isOpen - Controla si el modal está abierto o cerrado
 * @property {Function} onClose - Función para cerrar el modal y limpiar el estado
 * @property {object} product - Datos básicos del producto a editar (id y nombre)
 * @property {Client | null} client - Cliente propietario del menú y productos
 * @property {Section | null} selectedSection - Sección a la que pertenece el producto
 * @property {Function} setProducts - Función para actualizar el estado global de productos
 * @property {Function} [onSuccess] - Callback opcional ejecutado tras una edición exitosa
 */
export interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any; // Accept a Product object
  client: Client | null;
  selectedSection: Section | null;
  setProducts: React.Dispatch<React.SetStateAction<Record<string, Product[]> | any[]>>;
  onSuccess?: () => void;
}

/**
 * Componente modal para editar productos existentes
 * 
 * Este componente proporciona una interfaz visual para que los usuarios modifiquen
 * las propiedades de un producto existente en el sistema. Características:
 * 
 * - Carga automática de detalles del producto al abrir el modal
 * - Formulario para editar nombre, precio y descripción
 * - Selector de imágenes con vista previa
 * - Validación de datos antes del envío
 * - Comunicación con la API mediante FormData para manejar archivos
 * - Notificaciones de éxito/error usando toast
 * 
 * El componente utiliza el hook personalizado useProducts para gestionar
 * las operaciones CRUD relacionadas con productos.
 * 
 * @param {EditProductModalProps} props - Propiedades del componente
 * @returns {JSX.Element} Modal de edición de productos
 */
const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  client,
  selectedSection,
  setProducts,
  onSuccess
}) => {
  // Estados para el formulario
  const [editProductName, setEditProductName] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductDescription, setEditProductDescription] = useState('');
  const [editProductImage, setEditProductImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  
  // Obtener producto completo desde el estado
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Usar el hook de productos
  const { updateProduct } = useProducts({
    onSuccess: () => {
      if (onSuccess) {
        console.log("Ejecutando onSuccess después de actualizar producto");
        onSuccess();
      }
    }
  });

  /**
   * Efecto para cargar los datos del producto cuando se abre el modal
   * o cuando cambia el producto a editar
   */
  useEffect(() => {
    if (!product || !selectedSection) return;
    
    // Obtener el producto completo del estado de productos
    const fetchProductDetails = async () => {
      try {
        setIsUpdatingProduct(true); // Mostrar estado de carga
        const productId = product.id;
        console.log('Intentando obtener detalles del producto:', { 
          productId, 
          productToEdit: product,
          selectedSection: selectedSection
        });
        console.time('fetchProductDetails');
        
        // Usar explícitamente la ruta /api/products/[id]
        const response: Response = await fetch(`/api/products/${productId}?_t=${Date.now()}`);
        console.log('Respuesta API:', { status: response.status, ok: response.ok });
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error de API:', errorText);
          throw new Error('Error al obtener detalles del producto');
        }
        const productData: Product = await response.json();
        
        console.log('Producto obtenido:', productData);
        setCurrentProduct(productData);
        
        // Establecer valores iniciales
        setEditProductName(productData.name || '');
        setEditProductPrice(productData.price ? productData.price.toString() : '');
        setEditProductDescription(productData.description || '');
        
        if (productData.image) {
          console.log('Imagen del producto:', productData.image);
          // La imagen ya incluye la ruta completa desde la API
          setEditImagePreview(productData.image);
        } else {
          setEditImagePreview(null);
        }
        console.timeEnd('fetchProductDetails');
      } catch (error) {
        console.error('Error al cargar detalles del producto:', error);
        toast.error('No se pudieron cargar los detalles del producto');
      } finally {
        setIsUpdatingProduct(false);
      }
    };
    
    fetchProductDetails();
  }, [product, selectedSection, isOpen]);

  /**
   * Maneja el cambio de la imagen del producto
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio del input de archivo
   */
  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditProductImage(file);
      
      // Crear una vista previa de la imagen
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setEditImagePreview(event.target.result);
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
   * Maneja el envío del formulario para actualizar un producto
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedSection) {
      toast.error('No se ha seleccionado ninguna sección');
      return;
    }
    
    if (!product) {
      toast.error('No se ha seleccionado ningún producto para editar');
      return;
    }
    
    if (!editProductName.trim()) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }
    
    setIsUpdatingProduct(true);
    
    try {
      // Crear un objeto FormData para enviar datos e imagen
      const formData = new FormData();
      formData.append('product_id', product.id.toString());
      formData.append('name', editProductName);
      formData.append('price', editProductPrice);
      formData.append('description', editProductDescription || '');
      formData.append('section_id', selectedSection.section_id.toString());
      formData.append('client_id', client?.id.toString() || '');
      
      // Solo agregar la imagen si se ha seleccionado una nueva
      if (editProductImage) {
        formData.append('image', editProductImage);
      } else if (currentProduct?.image) {
        // Si no hay una nueva imagen pero hay una imagen existente, incluirla en el formulario
        formData.append('image', currentProduct.image);
      }

      // Usar la función updateProduct del hook
      await updateProduct(formData);
      
      // Mostrar notificación de éxito
      toast.success('Producto actualizado correctamente');
      
      // Cerrar el modal
      onClose();
      
      // Solución drástica: Recargar la página completa para asegurar una vista actualizada
      console.log("Programando recarga completa después de editar producto...");
      setTimeout(() => {
        try {
          console.log("Ejecutando recarga de página...");
          window.location.href = window.location.href;
        } catch (reloadError) {
          console.error("Error al recargar con location.href, intentando reload():", reloadError);
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      toast.error('Error al actualizar el producto');
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  /**
   * Reinicia el formulario y cierra el modal
   */
  const handleCloseModal = () => {
    setEditProductName('');
    setEditProductPrice('');
    setEditProductDescription('');
    setEditProductImage(null);
    setEditImagePreview(null);
    setCurrentProduct(null);
    onClose();
  };

  // Referencia para el input de archivos
  const fileInputRef = useRef<HTMLInputElement>(null);

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
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    Editar Producto
                  </Dialog.Title>
                  
                  {isUpdatingProduct && (
                    <div className="mt-2 flex items-center justify-center py-4">
                      <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-2 text-sm text-gray-600">Cargando datos...</span>
                    </div>
                  )}
                  
                  <div className={`mt-2 ${isUpdatingProduct ? 'opacity-50 pointer-events-none' : ''}`}>
                    {/* Campo de nombre de producto */}
                    <div className="mb-4">
                      <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                        Nombre del producto
                      </label>
                      <input
                        type="text"
                        name="productName"
                        id="productName"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={editProductName}
                        onChange={(e) => setEditProductName(e.target.value)}
                        placeholder="Nombre del producto"
                      />
                    </div>
                    
                    {/* Campo de precio */}
                    <div className="mb-4">
                      <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">
                        Precio
                      </label>
                      <input
                        type="text"
                        name="productPrice"
                        id="productPrice"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={editProductPrice}
                        onChange={(e) => setEditProductPrice(e.target.value)}
                        placeholder="Precio del producto"
                      />
                    </div>
                    
                    {/* Campo de descripción */}
                    <div className="mb-4">
                      <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">
                        Descripción (opcional)
                      </label>
                      <textarea
                        name="productDescription"
                        id="productDescription"
                        rows={3}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={editProductDescription}
                        onChange={(e) => setEditProductDescription(e.target.value)}
                        placeholder="Descripción del producto"
                      />
                    </div>
                    
                    {/* Campo de imagen */}
                    <div className="mb-4">
                      <label htmlFor="productImage" className="block text-sm font-medium text-gray-700">
                        Imagen del producto
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {editImagePreview ? (
                            <div className="relative mx-auto w-24 h-24 mb-2">
                              <Image 
                                src={editImagePreview} 
                                alt="Vista previa" 
                                fill
                                className="object-cover rounded-md"
                              />
                              <button 
                                type="button"
                                className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                                onClick={() => {
                                  setEditProductImage(null);
                                  setEditImagePreview(null);
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
                          
                          <div className="flex text-sm text-gray-600">
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
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleProductImageChange}
                              />
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${
                          isUpdatingProduct ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleSubmit}
                        disabled={isUpdatingProduct || !editProductName.trim() || !editProductPrice.trim()}
                      >
                        {isUpdatingProduct ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando...
                          </span>
                        ) : (
                          'Guardar Cambios'
                        )}
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleCloseModal}
                        disabled={isUpdatingProduct}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

// Exportar componente optimizado
export default React.memo(EditProductModal); 
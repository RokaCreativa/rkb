"use client";

/**
 * @fileoverview Componente modal para la creación de nuevos productos en el menú (T32 FIXED)
 * @author RokaMenu Team  
 * @version 2.0.0 - T32 Jerarquía Híbrida
 * @updated 2024-12-26
 * 
 * 🎯 T32 FIX: Este componente ahora soporta crear productos tanto en:
 * - Categorías simples (usando categoryId directamente)
 * - Categorías complejas (usando sectionId tradicionalmente)
 */

import React, { Fragment, useState, useRef } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { Section, Product } from '@/app/dashboard-v2/types';
import { PrismaClient } from '@prisma/client';
import eventBus, { Events } from '@/app/lib/eventBus';

/**
 * Props para el componente NewProductModal
 * 
 * @property {boolean} isOpen - Controla si el modal está abierto o cerrado
 * @property {Function} onClose - Función para cerrar el modal y restablecer el estado del formulario
 * @property {PrismaClient} client - Cliente de Prisma para realizar operaciones en la base de datos
 * @property {Section | null} selectedSection - Sección seleccionada donde se añadirá el nuevo producto
 * @property {Function} setProducts - Función para actualizar el estado global de productos después de la creación
 * @property {number} sectionId - Identificador de la sección seleccionada
 * @property {number} categoryId - Identificador de la categoría seleccionada
 * @property {Function} onSuccess - Callback opcional que se ejecuta después de crear un producto con éxito
 */
interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: PrismaClient;
  selectedSection?: Section | null;
  setProducts?: React.Dispatch<React.SetStateAction<Record<string, Product[]>>>;
  sectionId?: number;
  categoryId?: number;
  onSuccess?: () => void;
}

/**
 * Componente modal para crear un nuevo producto en el menú
 * 
 * Este componente proporciona un formulario completo para la creación de productos
 * con las siguientes características:
 * 
 * - Formulario con validación de campos obligatorios
 * - Carga y previsualización de imágenes para el producto
 * - Integración con la API para crear el producto en la base de datos
 * - Actualización automática del estado global para reflejar el nuevo producto
 * - Gestión de estados de carga durante el proceso de creación
 * - Notificaciones de éxito/error para informar al usuario sobre el resultado
 * 
 * El componente requiere una sección seleccionada para poder crear el producto,
 * ya que cada producto debe pertenecer a una sección específica.
 * 
 * @param {NewProductModalProps} props - Propiedades del componente
 * @returns {JSX.Element} Modal interactivo para crear nuevos productos
 */
const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  client,
  selectedSection,
  setProducts,
  sectionId,
  categoryId,
  onSuccess
}) => {
  /**
   * Estados del formulario para la creación de productos
   * 
   * @property {string} productName - Nombre del producto
   * @property {string} productPrice - Precio del producto (se almacena como string para facilitar la entrada)
   * @property {string} productDescription - Descripción detallada del producto
   * @property {File | null} productImage - Archivo de imagen seleccionado para el producto
   * @property {string | null} imagePreview - URL de previsualización de la imagen como data URL
   * @property {boolean} isCreating - Controla el estado de carga durante la creación
   */
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  /** 
   * Referencia al input de tipo file para la carga de imágenes
   * Se utiliza para activarlo programáticamente desde otros elementos de la UI
   */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Maneja la selección de una imagen para el producto
   * 
   * Este método:
   * 1. Captura el archivo seleccionado por el usuario
   * 2. Actualiza el estado con el archivo seleccionado
   * 3. Crea una previsualización de la imagen utilizando FileReader
   * 4. Muestra la previsualización en la interfaz
   * 
   * La previsualización permite al usuario confirmar que ha seleccionado
   * la imagen correcta antes de enviar el formulario.
   * 
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
   * Activa el selector de archivos nativo del navegador
   * 
   * Este método simula un clic en el input de tipo file oculto,
   * lo que abre el selector de archivos del sistema operativo.
   * Se utiliza para mejorar la experiencia de usuario al ofrecer un botón
   * estilizado personalizado en lugar del input nativo.
   */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /**
   * Procesa el envío del formulario para crear un nuevo producto
   * 
   * Este método:
   * 1. Previene el comportamiento predeterminado del formulario
   * 2. Valida todos los campos requeridos (nombre, precio, sección)
   * 3. Prepara los datos del formulario, incluyendo la imagen si existe
   * 4. Envía los datos al servidor mediante una petición POST
   * 5. Actualiza el estado global con el nuevo producto
   * 6. Muestra una notificación de éxito y reinicia el formulario
   * 
   * Si ocurre algún error durante el proceso, se muestra una notificación
   * y se registra el error en la consola para diagnóstico.
   * 
   * @param {React.FormEvent} e - Evento de envío del formulario
   */
  const handleSubmit = async () => {
    if (!productName.trim()) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }

    if (!productPrice.trim()) {
      toast.error('El precio del producto es obligatorio');
      return;
    }

    // 🎯 VALIDACIÓN ADAPTATIVA: Verificar que tenemos categoryId O sectionId
    if (!categoryId && !sectionId) {
      toast.error('Error: No se puede determinar dónde crear el producto');
      return;
    }

    setIsCreating(true);

    const formData = new FormData();
    formData.append('name', productName);
    formData.append('price', productPrice);
    formData.append('description', productDescription || '');
    formData.append('status', '1'); // 🎯 FIX: Crear productos habilitados por defecto

    // 🎯 LÓGICA ADAPTATIVA: Enviar category_id O section_id según el caso
    if (categoryId) {
      // Para categorías simples - nueva funcionalidad T32
      formData.append('category_id', categoryId.toString());
    } else if (sectionId) {
      // Para categorías complejas - funcionalidad tradicional
      formData.append('section_id', sectionId.toString());
    }

    if (productImage) {
      formData.append('image', productImage);
    }

    try {
      // Mostrar toast de carga
      toast.loading("Creando producto...", { id: "create-product" });

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al crear el producto');
      }

      const newProduct: Product = await response.json();

      // Normalizar el status para consistencia en la UI
      const normalizedProduct = {
        ...newProduct,
        status: typeof newProduct.status === 'boolean' ?
          (newProduct.status ? 1 : 0) : Number(newProduct.status)
      };

      // Actualizar el estado local con el nuevo producto, verificando que setProducts existe
      if (setProducts) {
        setProducts(prev => {
          // Crear copia del estado para modificarlo
          const updated = { ...prev };

          // Para categorías simples, usar key especial cat-{categoryId}
          if (categoryId) {
            const key = `cat-${categoryId}`;
            if (!updated[key]) {
              updated[key] = [];
            }
            updated[key] = [...updated[key], normalizedProduct as Product];
          }
          // Para categorías complejas, usar sectionId tradicional
          else if (sectionId) {
            if (!updated[sectionId]) {
              updated[sectionId] = [];
            }
            updated[sectionId] = [...updated[sectionId], normalizedProduct as Product];
          }

          return updated;
        });
      }

      // Emisión de evento para notificar que se creó un producto
      eventBus.emit(Events.PRODUCT_CREATED, {
        product: normalizedProduct as Product,
        categoryId: categoryId,
        sectionId: sectionId
      });

      // Toast de éxito
      toast.success('Producto creado correctamente', { id: "create-product" });

      // Cerrar el modal y limpiar el formulario
      handleCancel();

      // Si hay una función de éxito, ejecutarla
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al crear el producto:', error);
      toast.error('Error al crear el producto', { id: "create-product" });
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Reinicia el formulario y cierra el modal
   * 
   * Este método:
   * 1. Limpia todos los campos del formulario (nombre, precio, descripción)
   * 2. Elimina la imagen seleccionada y su previsualización
   * 3. Cierra el modal de creación de producto
   * 
   * Se utiliza cuando el usuario cancela la creación o después de
   * crear un producto exitosamente para preparar el formulario para
   * una nueva entrada.
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
            <Dialog.Panel className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                  {/* 🎯 T32 FIX - TÍTULO ADAPTATIVO */}
                  {categoryId ?
                    `Crear nuevo producto` :
                    `Crear nuevo producto en ${selectedSection?.name}`
                  }
                </Dialog.Title>

                <div className="mt-4">
                  <div className="mb-4">
                    <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">
                      Nombre del producto
                    </label>
                    <input
                      type="text"
                      id="product-name"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Escribe el nombre del producto"
                      required
                    />
                  </div>

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
                        value={productPrice}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          const parts = value.split('.');
                          if (parts.length > 2) return;
                          if (parts[1] && parts[1].length > 2) return;
                          setProductPrice(value);
                        }}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">
                      Descripción (opcional)
                    </label>
                    <textarea
                      id="product-description"
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      rows={3}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Escribe una descripción para el producto"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Imagen del producto (opcional)
                    </label>

                    <input
                      type="file"
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
                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
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

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-0 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm ${isCreating ? 'opacity-50 cursor-not-allowed' : ''
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
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-0 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={handleCancel}
                      disabled={isCreating}
                    >
                      Cancelar
                    </button>
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

export default NewProductModal; 
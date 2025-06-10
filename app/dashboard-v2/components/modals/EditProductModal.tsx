"use client";

/**
 * @fileoverview Componente modal para la edición de productos en el menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 * 
 * Este componente proporciona una interfaz de usuario para editar productos existentes
 * en el sistema de gestión de menús. Permite modificar el nombre, precio, descripción
 * e imagen del producto.
 */

import React, { Fragment, useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Product, Section, Client } from '@/app/dashboard-v2/types';
import useProductManagement from '@/app/dashboard-v2/hooks/domain/product/useProductManagement';
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
  product: Product | null;
  client: Client | null;
  selectedSection: Section | null;
  setProducts: React.Dispatch<React.SetStateAction<Record<string, Product[]>>>;
  onSuccess?: () => void;
  onProductUpdated?: (updatedProduct: Product) => void;
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
 * El componente utiliza el hook personalizado useProductManagement para gestionar
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
  onSuccess,
  onProductUpdated,
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

  // Referencia para el input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Usar el hook de productos
  const { updateProduct } = useProductManagement();

  // Después definimos onUpdateSuccess para manejar el éxito de la actualización
  const onUpdateSuccess = useCallback(() => {
    if (onSuccess) {
      onSuccess();
    }
  }, [onSuccess]);

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
        const productId = product.product_id;
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
      // Identificador único para el toast de carga
      const toastId = "update-product-" + product.product_id;

      // Mostrar indicador de carga
      toast.loading("Actualizando producto...", { id: toastId });

      // Crear un objeto FormData para enviar datos e imagen
      const formData = new FormData();
      formData.append('product_id', product.product_id.toString());
      formData.append('name', editProductName);
      formData.append('price', editProductPrice);
      formData.append('description', editProductDescription || '');
      formData.append('section_id', selectedSection.section_id.toString());
      formData.append('client_id', client?.id.toString() || '');

      // Solo agregar la imagen si se ha seleccionado una nueva
      if (editProductImage) {
        formData.append('image', editProductImage);
      } else if (currentProduct?.image) {
        // Si no hay una nueva imagen, NO enviar la imagen existente como un archivo,
        // sino como una referencia de ruta para que el backend la procese correctamente
        formData.append('existing_image', currentProduct.image || '');
      }

      console.log("🔧 Enviando actualización de producto con ID:", product.product_id);

      // Enviar datos al servidor directamente para tener control total sobre el proceso
      const response = await fetch('/api/products', {
        method: 'PUT',
        body: formData,
      });

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorResponse = await response.text();
        console.error("❌ Error del servidor:", errorResponse);

        try {
          const errorData = JSON.parse(errorResponse);
          throw new Error(errorData.message || 'Error al actualizar el producto');
        } catch (parseError) {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
      }

      // Procesar la respuesta exitosa
      const updatedProduct = await response.json();
      console.log("✅ Producto actualizado recibido:", updatedProduct);

      // Normalizar estado para UI
      const normalizedProduct = {
        ...updatedProduct,
        status: typeof updatedProduct.status === 'boolean' ?
          (updatedProduct.status ? 1 : 0) : Number(updatedProduct.status)
      };

      // SISTEMA DUAL: Actualizar el estado LOCAL inmediatamente
      setProducts(prevProducts => {
        // Crear una copia del objeto actual
        const updated: Record<string, Product[]> = { ...prevProducts };

        // Si tenemos una sección seleccionada, actualizar sus productos
        if (selectedSection && selectedSection.section_id) {
          const sectionId = selectedSection.section_id.toString();

          if (!updated[sectionId]) {
            updated[sectionId] = [];
          }

          updated[sectionId] = updated[sectionId].map((p: Product) =>
            p.product_id === product.product_id ? normalizedProduct : p
          );
        }

        return updated;
      });

      // Toast de éxito
      toast.success("Producto actualizado correctamente", { id: toastId });

      // Limpiar formulario y cerrar modal
      handleCloseModal();

      // Si hay una función de éxito, ejecutarla
      if (onSuccess) {
        console.log("🔄 Ejecutando onSuccess callback");
        onSuccess();
      }
    } catch (error: any) {
      console.error("❌ Error:", error);
      toast.error(error.message || 'Error al actualizar el producto');
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  /**
   * Cierra el modal y limpia el estado
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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={handleCloseModal}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-4 sm:p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex justify-between items-start">
                <Dialog.Title
                  as="h3"
                  className="text-base sm:text-lg font-medium leading-6 text-gray-900"
                >
                  Editar Producto
                </Dialog.Title>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 touch-optimized rounded-full p-1 hover:bg-gray-100"
                  onClick={handleCloseModal}
                  aria-label="Cerrar"
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4">
                {isUpdatingProduct && !currentProduct ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    <span className="ml-2 text-gray-600">Cargando datos del producto...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="editProductName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="editProductName"
                        id="editProductName"
                        className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3"
                        value={editProductName}
                        onChange={(e) => setEditProductName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="editProductPrice"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Precio (€)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">€</span>
                        </div>
                        <input
                          type="text"
                          name="editProductPrice"
                          id="editProductPrice"
                          className="focus:ring-amber-500 focus:border-amber-500 block w-full pl-7 pr-12 py-2 sm:text-sm border-gray-300 rounded-md"
                          value={editProductPrice}
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
                            setEditProductPrice(value);
                          }}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="editProductDescription"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Descripción (opcional)
                      </label>
                      <textarea
                        name="editProductDescription"
                        id="editProductDescription"
                        rows={3}
                        className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3"
                        value={editProductDescription}
                        onChange={(e) => setEditProductDescription(e.target.value)}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="editProductImage"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Imagen
                      </label>
                      <div className="mt-1 flex flex-col sm:flex-row items-center">
                        <div className="h-32 w-32 rounded-md overflow-hidden bg-gray-100 mb-3 sm:mb-0 sm:mr-4">
                          {editImagePreview ? (
                            <Image
                              src={editImagePreview}
                              alt="Previsualización"
                              width={128}
                              height={128}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                              <span className="text-gray-400">Sin imagen</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          className="touch-optimized w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                          Cambiar imagen
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleProductImageChange}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                      <button
                        type="button"
                        className="touch-optimized w-full sm:w-auto inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        onClick={handleCloseModal}
                        disabled={isUpdatingProduct}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="touch-optimized w-full sm:w-auto inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        disabled={isUpdatingProduct}
                      >
                        {isUpdatingProduct ? (
                          <div className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Actualizando...
                          </div>
                        ) : (
                          "Guardar cambios"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditProductModal; 
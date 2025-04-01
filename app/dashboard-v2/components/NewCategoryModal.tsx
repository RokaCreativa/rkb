"use client";

/**
 * @fileoverview Componente modal para la creación de nuevas categorías en el menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este componente proporciona una interfaz de usuario para crear nuevas categorías
 * en el sistema de gestión de menús. Las categorías son la estructura principal
 * de organización en el menú, agrupando diversas secciones de productos.
 */

import React, { Fragment, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Category } from '@/app/types/menu';
import { PrismaClient } from '@prisma/client';
import eventBus, { Events } from '@/app/lib/eventBus';
import { CheckIcon } from '@heroicons/react/24/outline';
import SuccessMessage from './ui/SuccessMessage';

/**
 * Props para el componente NewCategoryModal
 * 
 * @property {boolean} isOpen - Controla si el modal está abierto o cerrado
 * @property {Function} onClose - Función para cerrar el modal y limpiar el estado
 * @property {PrismaClient} client - Cliente de Prisma para realizar operaciones en la base de datos
 * @property {Function} setCategories - Función para actualizar el estado global de categorías
 * @property {Function} onSuccess - Función opcional para ejecutar después de crear exitosamente
 */
interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: PrismaClient;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onSuccess?: () => void;
}

/**
 * Componente modal para crear nuevas categorías
 * 
 * Este componente proporciona una interfaz gráfica para que los administradores
 * puedan crear nuevas categorías en el sistema de menús. Características:
 * 
 * - Formulario con validación para el nombre de la categoría
 * - Selector de imágenes con previsualización
 * - Comunicación con la API mediante FormData para manejar archivos
 * - Notificaciones de estado mediante toast
 * - Integración con el estado global de categorías
 * 
 * Una vez creada la categoría, se actualiza automáticamente el listado
 * sin necesidad de recargar la página.
 * 
 * @param {NewCategoryModalProps} props - Propiedades del componente 
 * @returns {JSX.Element} Modal interactivo para creación de categorías
 */
const NewCategoryModal: React.FC<NewCategoryModalProps> = ({
  isOpen,
  onClose,
  client,
  setCategories,
  onSuccess
}) => {
  /**
   * Estados del formulario y gestión de categorías
   */
  // Estados para los campos del formulario
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Estado para controlar el proceso de creación
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Referencia para el input de archivos oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Maneja el cambio de la imagen de la categoría
   * 
   * Este método gestiona el proceso de selección de una imagen:
   * - Obtiene el archivo seleccionado por el usuario
   * - Actualiza el estado con el archivo seleccionado
   * - Genera una vista previa de la imagen para mostrarla al usuario
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio del input de archivo
   */
  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCategoryImage(file);
      
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
   * Abre el selector de archivos nativo del sistema
   * 
   * Este método simula un clic en el input de tipo file oculto,
   * permitiendo mostrar un botón personalizado en la interfaz
   * en lugar del selector de archivos predeterminado.
   */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /**
   * Maneja el envío del formulario para crear una nueva categoría
   * 
   * Este método:
   * - Valida que los datos ingresados sean correctos
   * - Prepara el FormData con los datos del formulario
   * - Envía la solicitud a la API para crear la categoría
   * - Actualiza el estado global con la nueva categoría creada
   * - Muestra notificaciones de éxito o error al usuario
   * - Limpia el formulario y cierra el modal si la operación es exitosa
   * 
   * @param {React.FormEvent} e - Evento de envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Preparar los datos de la nueva categoría
      const formData = new FormData();
      formData.append('name', categoryName);
      
      if (categoryImage) {
        formData.append('image', categoryImage);
      }
      
      // Crear la categoría en la base de datos
      const response = await fetch('/api/categories', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al crear la categoría');
      }
      
      const newCategory: Category = await response.json();
      
      // Actualizar el estado local con la nueva categoría
      setCategories(prevCategories => [...prevCategories, newCategory]);
      
      // Emisión de evento para notificar que se creó una categoría
      console.log("Emitiendo evento de categoría creada");
      eventBus.emit(Events.CATEGORY_CREATED, newCategory);
      
      // Mostrar mensaje de éxito con secuencia de recarga
      // Primer mensaje de éxito
      setSuccessMessage(`Categoría "${categoryName}" creada correctamente.`);
      
      // Después de un momento, avisar que vamos a recargar
      setTimeout(() => {
        setSuccessMessage(`Categoría "${categoryName}" creada correctamente. Recargando...`);
        
        // Finalmente recargar después de un tiempo para que se vea el mensaje
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }, 800);
      
    } catch (error) {
      console.error('Error al crear la categoría:', error);
      toast.error('Error al crear la categoría');
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Cancela la creación y cierra el modal
   * 
   * Este método:
   * - Limpia todos los campos del formulario
   * - Elimina cualquier vista previa de imagen
   * - Cierra el modal sin crear la categoría
   * 
   * Se utiliza cuando el usuario decide cancelar manualmente la operación.
   */
  const handleCancel = () => {
    setCategoryName('');
    setCategoryImage(null);
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
              {successMessage ? (
                <SuccessMessage 
                  title="¡Categoría creada con éxito!"
                  message={successMessage} 
                  color="green" 
                  progressDuration={2.3} 
                />
              ) : (
                <div>
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    Crear nueva categoría
                  </Dialog.Title>
                  
                  <form onSubmit={handleSubmit} className="mt-4">
                    {/* Campo de nombre de categoría */}
                    <div className="mb-4">
                      <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
                        Nombre de la categoría
                      </label>
                      <input
                        type="text"
                        id="category-name"
                        name="category-name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Escribe el nombre de la categoría"
                        required
                      />
                    </div>
                    
                    {/* Campo de imagen de categoría */}
                    <div className="mb-4">
                      <label htmlFor="category-image" className="block text-sm font-medium text-gray-700">
                        Imagen de la categoría (opcional)
                      </label>
                      
                      <input
                        type="file"
                        id="category-image"
                        name="category-image"
                        ref={fileInputRef}
                        onChange={handleCategoryImageChange}
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
                                  setCategoryImage(null);
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
                          'Crear categoría'
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
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default NewCategoryModal; 
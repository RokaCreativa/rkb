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
import { XMarkIcon } from '@heroicons/react/24/outline';

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
  client: any;
  setCategories: React.Dispatch<React.SetStateAction<any[]>>;
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
  const [status, setStatus] = useState<number>(1);
  const [displayOrder, setDisplayOrder] = useState<number | null>(null);
  
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
      setImagePreview(URL.createObjectURL(file));
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
      return;
    }
    
    setIsCreating(true);
    
    // Primero mostrar un toast indicando que se está creando
    toast.loading("Creando categoría...", { id: "create-category" });
    
    try {
      const formData = new FormData();
      formData.append('name', categoryName);
      if (categoryImage) {
        formData.append('image', categoryImage);
      }
      formData.append('status', status.toString());
      if (displayOrder !== null) {
        formData.append('display_order', displayOrder.toString());
      }
      
      // Subir la categoría a través de la API
      const response = await fetch('/api/categories', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Asegurarnos de que status sea un número para consistencia en UI
      const newCategory = {
        ...data,
        category_id: data.category_id,
        name: data.name,
        image: data.image,
        status: typeof data.status === 'boolean' ? (data.status ? 1 : 0) : Number(data.status),
        display_order: data.display_order,
        sections_count: 0,
        visible_sections_count: 0
      };
      
      // Actualizar el estado de categorías
      setCategories(prev => [...prev, newCategory]);
      
      // Mostrar mensaje de éxito visible
      toast.success(`Categoría "${categoryName}" creada correctamente`, { id: "create-category", duration: 3000 });
      
      // Cerrar el modal
      handleCancel();
      
      // Llamar al callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al crear categoría:', error);
      toast.error("Error al crear la categoría", { id: "create-category" });
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
   */
  const handleCancel = () => {
    setCategoryName('');
    setCategoryImage(null);
    setImagePreview(null);
    setStatus(1);
    setDisplayOrder(null);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Crear Nueva Categoría
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                      Nombre de la Categoría
                    </label>
                    <input
                      type="text"
                      id="categoryName"
                      name="categoryName"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Ejemplo: Platos Principales"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Imagen (opcional)
                    </label>
                    <div className="mt-1 flex items-center">
                      <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Vista previa"
                            className="h-full w-full object-cover"
                            width={80}
                            height={80}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-50">
                            <span className="text-gray-400 text-xs text-center">
                              Sin imagen
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="ml-4 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={triggerFileInput}
                      >
                        Seleccionar Imagen
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="categoryImage"
                        name="categoryImage"
                        onChange={handleCategoryImageChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="categoryStatus" className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <select
                      id="categoryStatus"
                      name="categoryStatus"
                      value={status}
                      onChange={(e) => setStatus(parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value={1}>Visible</option>
                      <option value={0}>No visible</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700">
                      Orden de visualización (opcional)
                    </label>
                    <input
                      type="number"
                      id="displayOrder"
                      name="displayOrder"
                      min="1"
                      value={displayOrder || ''}
                      onChange={(e) => setDisplayOrder(e.target.value ? parseInt(e.target.value) : null)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Ejemplo: 1"
                    />
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-indigo-600 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creando...
                        </div>
                      ) : "Crear Categoría"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-3 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={handleCancel}
                      disabled={isCreating}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NewCategoryModal; 
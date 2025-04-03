"use client";

/**
 * @fileoverview Componente modal para la edición de categorías existentes en el menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 * 
 * Este componente proporciona una interfaz de usuario para editar categorías
 * existentes en el sistema de gestión de menús. Las categorías son la estructura 
 * principal de organización en el menú.
 */

import React, { Fragment, useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Category, Client } from '@/app/types/menu';
import { PrismaClient } from '@prisma/client';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Props para el componente EditCategoryModal
 * @property {boolean} isOpen - Controla si el modal está abierto o cerrado
 * @property {Function} onClose - Función para cerrar el modal
 * @property {Category | null} categoryToEdit - Categoría que se va a editar
 * @property {PrismaClient} client - Cliente de Prisma para realizar operaciones en la base de datos
 * @property {Function} setCategories - Función para actualizar el estado de categorías
 * @property {Function} onSuccess - Callback opcional para cuando la edición es exitosa
 */
export interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit: Category | null;
  client: Client | null;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onSuccess?: (updatedCategory?: Category) => void;
}

/**
 * Componente modal para editar una categoría existente
 * 
 * Este componente permite al usuario editar una categoría existente,
 * modificando su nombre y/o imagen.
 * 
 * @param {EditCategoryModalProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente renderizado del modal de edición de categoría
 */
const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  client,
  setCategories,
  onSuccess
}) => {
  // Estados para el formulario
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

  // Referencia para el input de archivos
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Efecto para cargar los datos de la categoría cuando se abre el modal
   * o cuando cambia la categoría a editar
   */
  useEffect(() => {
    if (categoryToEdit) {
      setEditCategoryName(categoryToEdit.name || '');
      
      if (categoryToEdit.image) {
        // Usar la URL completa de la imagen
        setEditImagePreview(categoryToEdit.image);
        console.log('Imagen de categoría cargada:', categoryToEdit.image);
      } else {
        setEditImagePreview(null);
        console.log('La categoría no tiene imagen');
      }
    }
  }, [categoryToEdit, isOpen]);

  /**
   * Maneja el cambio de la imagen de la categoría
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio del input de archivo
   */
  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditCategoryImage(file);
      
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
   * Maneja el envío del formulario para editar una categoría
   * 
   * Este método recopila los datos del formulario, los valida,
   * y envía la solicitud de actualización al servidor.
   * Implementa:
   * - Sistema de gestión dual del estado (local + global)
   * - Manejo de errores robusto
   * - Prevención de mensajes duplicados con IDs únicos
   */
  const handleSubmit = async () => {
    if (!editCategoryName.trim()) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }

    if (!categoryToEdit) {
      toast.error('No se ha seleccionado ninguna categoría para editar');
      return;
    }

    // Comenzar actualización
    setIsUpdatingCategory(true);

    // Crear FormData para enviar la imagen si existe
    const formData = new FormData();
    formData.append('name', editCategoryName);
    formData.append('category_id', categoryToEdit.category_id.toString());
    formData.append('client_id', client?.id.toString() || '');
    if (editCategoryImage) {
      formData.append('image', editCategoryImage);
    }

    // ID único para el toast de esta operación
    const toastId = `update-category-${categoryToEdit.category_id}`;

    try {
      // Mostrar toast de carga con ID único
      toast.loading('Actualizando categoría...', { id: toastId });

      // Enviar datos al servidor
      const response = await fetch('/api/categories', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar la categoría');
      }

      const updatedCategory = await response.json();
      console.log("✅ Categoría actualizada recibida:", updatedCategory);

      // IMPORTANTE: Preservamos el nombre editado para asegurar la actualización
      // independientemente de la respuesta del servidor
      const categoryWithUpdatedName = {
        ...updatedCategory,
        name: editCategoryName, // Forzar el nombre editado
        status: typeof updatedCategory.status === 'boolean' ? 
          (updatedCategory.status ? 1 : 0) : Number(updatedCategory.status)
      };

      console.log("🔧 Categoría con nombre forzado para actualizar UI:", categoryWithUpdatedName);

      // SISTEMA DUAL: Actualizar el estado LOCAL inmediatamente con el nombre forzado
      setCategories((prevCategories) => {
        const updatedCategories = prevCategories.map((cat) => 
          cat.category_id === categoryToEdit.category_id ? categoryWithUpdatedName : cat
        );
        console.log("📊 Estado local de categorías actualizado con nombre forzado");
        return updatedCategories;
      });

      // Actualizar el toast con mensaje de éxito
      toast.success('Categoría actualizada correctamente', { id: toastId });
      
      // IMPORTANTE: Modificamos la categoría actual para que tenga el nombre actualizado
      // Esto asegura que cuando se llame onSuccess, se use el nombre actualizado
      categoryToEdit.name = editCategoryName;
      
      // Limpiar el estado local y cerrar el modal
      setEditCategoryName('');
      setEditCategoryImage(null);
      setEditImagePreview(null);
      
      // Cerrar el modal después de actualizar los estados
      onClose();
      
      // SISTEMA DUAL: Ejecutar callback de éxito después de todo lo demás
      if (onSuccess) {
        console.log("🔄 Ejecutando callback onSuccess con nombre actualizado forzado");
        onSuccess();
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Error al actualizar la categoría');
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  /**
   * Cierra el modal y limpia el estado
   */
  const handleCloseModal = () => {
    setEditCategoryName('');
    setEditCategoryImage(null);
    setEditImagePreview(null);
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

          {/* Este elemento es para centrar verticalmente el modal */}
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
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex justify-between items-start">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Editar Categoría
                </Dialog.Title>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={handleCloseModal}
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4">
                <div className="mb-4">
                  <label
                    htmlFor="editCategoryName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="editCategoryName"
                    id="editCategoryName"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="editCategoryImage"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Imagen
                  </label>
                  <div className="mt-1 flex items-center">
                    <div className="h-32 w-32 rounded-md overflow-hidden bg-gray-100 mr-4">
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
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cambiar imagen
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCategoryImageChange}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleCloseModal}
                  disabled={isUpdatingCategory}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleSubmit}
                  disabled={isUpdatingCategory}
                >
                  {isUpdatingCategory ? (
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
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditCategoryModal; 
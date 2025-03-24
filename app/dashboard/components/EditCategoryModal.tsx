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
interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit: Category | null;
  client: Client | null;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onSuccess?: () => void;
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
        // Para imágenes de categorías, necesitamos la ruta completa
        const imagePath = `/images/categories/${categoryToEdit.image}`;
        setEditImagePreview(imagePath);
      } else {
        setEditImagePreview(null);
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
   * Maneja el envío del formulario para actualizar una categoría
   * @param {React.FormEvent} e - Evento de formulario
   */
  const handleSubmit = async () => {
    if (!categoryToEdit || !client) return;
    
    // Prevenir múltiples envíos
    if (isUpdatingCategory) return;
    
    setIsUpdatingCategory(true);

    try {
      // Crear un objeto FormData para enviar datos e imagen
      const formData = new FormData();
      formData.append('category_id', categoryToEdit.category_id.toString());
      formData.append('name', editCategoryName);
      formData.append('client_id', client.id.toString());
      
      // Solo agregar la imagen si se ha seleccionado una nueva
      if (editCategoryImage) {
        formData.append('image', editCategoryImage);
      }

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

      // Actualizar el estado local
      setCategories((prevCategories) => 
        prevCategories.map((cat) => 
          cat.category_id === categoryToEdit.category_id ? updatedCategory : cat
        )
      );

      // Mostrar mensaje de éxito y cerrar el modal
      toast.success('Categoría actualizada correctamente');
      
      // Llamar al callback de éxito si existe
      if (onSuccess) {
        console.log("Ejecutando onSuccess después de actualizar categoría");
        onSuccess();
      }
      
      handleCloseModal();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al actualizar la categoría');
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  /**
   * Reinicia el formulario y cierra el modal
   */
  const handleCloseModal = () => {
    setEditCategoryName('');
    setEditCategoryImage(null);
    setEditImagePreview(null);
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
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    Editar Categoría
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="mb-4">
                      <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                        Nombre de la categoría
                      </label>
                      <input
                        type="text"
                        name="categoryName"
                        id="categoryName"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        placeholder="Nombre de la categoría"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-700">
                        Imagen de la categoría
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {editImagePreview ? (
                            <div className="relative mx-auto w-24 h-24 mb-2">
                              <Image 
                                src={editImagePreview} 
                                alt="Vista previa" 
                                fill
                                className="object-cover rounded-full"
                              />
                              <button 
                                type="button"
                                className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                                onClick={() => {
                                  setEditCategoryImage(null);
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
                              htmlFor="category-image-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Subir imagen</span>
                              <input 
                                id="category-image-upload" 
                                name="category-image-upload" 
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                onChange={handleCategoryImageChange}
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
                          isUpdatingCategory ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleSubmit}
                        disabled={isUpdatingCategory || !editCategoryName.trim()}
                      >
                        {isUpdatingCategory ? (
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
                        disabled={isUpdatingCategory}
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

export default EditCategoryModal; 
import React, { Fragment, useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Category } from '@/app/types/menu';
import { PrismaClient } from '@prisma/client';

/**
 * Props para el componente EditCategoryModal
 * @property {boolean} isOpen - Controla si el modal está abierto o cerrado
 * @property {Function} onClose - Función para cerrar el modal
 * @property {Category | null} categoryToEdit - Categoría que se va a editar
 * @property {PrismaClient} client - Cliente de Prisma para realizar operaciones en la base de datos
 * @property {Function} setCategories - Función para actualizar el estado de categorías
 */
interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit: Category | null;
  client: PrismaClient;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
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
  setCategories
}) => {
  // Estados para el formulario
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteCurrentImage, setDeleteCurrentImage] = useState(false);

  // Referencia para el input de archivos
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Efecto para cargar los datos de la categoría cuando se abre el modal
   * o cuando cambia la categoría a editar
   */
  useEffect(() => {
    if (categoryToEdit) {
      setCategoryName(categoryToEdit.name || '');
      setCurrentImageUrl(categoryToEdit.image || null);
      setImagePreview(null);
      setCategoryImage(null);
      setDeleteCurrentImage(false);
    }
  }, [categoryToEdit, isOpen]);

  /**
   * Maneja el cambio de la imagen de la categoría
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio del input de archivo
   */
  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCategoryImage(file);
      setDeleteCurrentImage(false);
      
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
   * Elimina la imagen actual de la categoría
   */
  const handleRemoveCurrentImage = () => {
    setCurrentImageUrl(null);
    setDeleteCurrentImage(true);
  };

  /**
   * Elimina la nueva imagen seleccionada
   */
  const handleRemoveNewImage = () => {
    setCategoryImage(null);
    setImagePreview(null);
  };

  /**
   * Maneja el envío del formulario para actualizar una categoría
   * @param {React.FormEvent} e - Evento de formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryToEdit) {
      toast.error('No se pudo identificar la categoría a editar');
      return;
    }
    
    if (!categoryName.trim()) {
      toast.error('Por favor, ingresa un nombre para la categoría');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Preparar los datos de la categoría actualizada
      const formData = new FormData();
      formData.append('name', categoryName);
      
      if (deleteCurrentImage) {
        formData.append('delete_image', 'true');
      }
      
      if (categoryImage) {
        formData.append('image', categoryImage);
      }
      
      // Actualizar la categoría en la base de datos
      const response = await fetch(`/api/categories/${categoryToEdit.category_id}`, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la categoría');
      }
      
      const updatedCategory: Category = await response.json();
      
      // Actualizar el estado local con la categoría actualizada
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category.category_id === updatedCategory.category_id ? updatedCategory : category
        )
      );
      
      // Mostrar mensaje de éxito
      toast.success('Categoría actualizada correctamente');
      
      // Cerrar el modal
      onClose();
    } catch (error) {
      console.error('Error al actualizar la categoría:', error);
      toast.error('Error al actualizar la categoría');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Reinicia el formulario y cierra el modal
   */
  const handleCancel = () => {
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
                  Editar categoría: {categoryToEdit?.name}
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-4">
                  {/* Campo de nombre de categoría */}
                  <div className="mb-4">
                    <label htmlFor="edit-category-name" className="block text-sm font-medium text-gray-700">
                      Nombre de la categoría
                    </label>
                    <input
                      type="text"
                      id="edit-category-name"
                      name="edit-category-name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Escribe el nombre de la categoría"
                      required
                    />
                  </div>
                  
                  {/* Campo de imagen de categoría */}
                  <div className="mb-4">
                    <label htmlFor="edit-category-image" className="block text-sm font-medium text-gray-700">
                      Imagen de la categoría (opcional)
                    </label>
                    
                    <input
                      type="file"
                      id="edit-category-image"
                      name="edit-category-image"
                      ref={fileInputRef}
                      onChange={handleCategoryImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                    
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {/* Mostrar imagen nueva si se ha seleccionado */}
                        {imagePreview ? (
                          <div className="mb-3">
                            <Image
                              src={imagePreview}
                              alt="Vista previa nueva"
                              width={200}
                              height={200}
                              className="mx-auto object-cover"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveNewImage}
                              className="mt-2 text-sm text-red-600 hover:text-red-900"
                            >
                              Eliminar imagen nueva
                            </button>
                          </div>
                        ) : currentImageUrl && !deleteCurrentImage ? (
                          /* Mostrar imagen actual si existe y no se ha marcado para eliminar */
                          <div className="mb-3">
                            <Image
                              src={currentImageUrl}
                              alt="Imagen actual"
                              width={200}
                              height={200}
                              className="mx-auto object-cover"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveCurrentImage}
                              className="mt-2 text-sm text-red-600 hover:text-red-900"
                            >
                              Eliminar imagen actual
                            </button>
                          </div>
                        ) : (
                          /* Mostrar opción para subir imagen si no hay ninguna */
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
                        isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Actualizando...
                        </>
                      ) : (
                        'Guardar cambios'
                      )}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={handleCancel}
                      disabled={isUpdating}
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

export default EditCategoryModal; 
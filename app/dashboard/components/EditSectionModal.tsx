import React, { Fragment, useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Section, Category } from '@/app/types/menu';
import { PrismaClient } from '@prisma/client';

/**
 * Props para el componente EditSectionModal
 * @property {boolean} isOpen - Controla si el modal está abierto o cerrado
 * @property {Function} onClose - Función para cerrar el modal
 * @property {Section | null} sectionToEdit - Sección que se va a editar
 * @property {PrismaClient} client - Cliente de Prisma para realizar operaciones en la base de datos
 * @property {Category | null} selectedCategory - La categoría a la que pertenece la sección
 * @property {Function} setSections - Función para actualizar el estado de secciones
 */
interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionToEdit: Section | null;
  client: PrismaClient;
  selectedCategory: Category | null;
  setSections: React.Dispatch<React.SetStateAction<Record<string, Section[]>>>;
}

/**
 * Componente de modal para editar secciones
 * 
 * Este componente muestra un formulario en un modal para editar
 * los detalles de una sección existente, incluyendo nombre e imagen.
 * 
 * @param {EditSectionModalProps} props - Propiedades del componente
 * @returns {JSX.Element} El componente de modal renderizado
 */
const EditSectionModal: React.FC<EditSectionModalProps> = ({
  isOpen,
  onClose,
  sectionToEdit,
  client,
  selectedCategory,
  setSections
}) => {
  // Estados locales para el formulario
  const [editSectionName, setEditSectionName] = useState('');
  const [editSectionImage, setEditSectionImage] = useState<File | null>(null);
  const [editSectionImagePreview, setEditSectionImagePreview] = useState<string | null>(null);
  const [isUpdatingSectionName, setIsUpdatingSectionName] = useState(false);

  /**
   * Efecto para reiniciar el formulario cuando cambia la sección seleccionada
   */
  useEffect(() => {
    if (sectionToEdit) {
      setEditSectionName(sectionToEdit.name || '');
      
      if (sectionToEdit.image) {
        const imageUrl = `/api/uploads/sections/${sectionToEdit.image}`;
        setEditSectionImagePreview(imageUrl);
      } else {
        setEditSectionImagePreview(null);
      }
    }
  }, [sectionToEdit]);

  /**
   * Función para manejar el envío del formulario
   * Actualiza la sección en la API y notifica al componente padre
   */
  const handleSubmit = () => {
    if (!sectionToEdit || !selectedCategory) return;
    
    setIsUpdatingSectionName(true);
    
    // Crear un FormData para enviar los datos
    const formData = new FormData();
    formData.append('name', editSectionName);
    formData.append('client_id', selectedCategory.client_id.toString());
    formData.append('category_id', selectedCategory.category_id.toString());
    
    if (editSectionImage) {
      formData.append('image', editSectionImage);
    }
    
    // Hacer la petición a la API
    fetch(`/api/sections/${sectionToEdit.section_id}`, {
      method: 'PUT',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al actualizar la sección');
      }
      return response.json();
    })
    .then(updatedSection => {
      // Actualizar el estado local con la sección actualizada
      setSections(prevSections => {
        const updated = { ...prevSections };
        if (updated[selectedCategory!.category_id]) {
          updated[selectedCategory!.category_id] = updated[selectedCategory!.category_id].map(section =>
            section.section_id === updatedSection.section_id ? updatedSection : section
          );
        }
        return updated;
      });
      
      // Limpiar formulario y cerrar modal
      handleCloseModal();
      toast.success('Sección actualizada correctamente');
    })
    .catch(error => {
      console.error('Error al actualizar la sección:', error);
      toast.error('Error al actualizar la sección');
    })
    .finally(() => {
      setIsUpdatingSectionName(false);
    });
  };

  /**
   * Función para manejar el cierre del modal
   * Limpia el formulario y llama a la función onClose
   */
  const handleCloseModal = () => {
    setEditSectionName('');
    setEditSectionImage(null);
    setEditSectionImagePreview(null);
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
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  {/* Título del modal */}
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    Editar sección
                  </Dialog.Title>
                  
                  {/* Formulario */}
                  <div className="mt-2">
                    {/* Campo para el nombre de la sección */}
                    <div className="mb-4">
                      <label htmlFor="sectionName" className="block text-sm font-medium text-gray-700">
                        Nombre de la sección
                      </label>
                      <input
                        type="text"
                        name="sectionName"
                        id="sectionName"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md"
                        value={editSectionName}
                        onChange={(e) => setEditSectionName(e.target.value)}
                        placeholder="Nombre de la sección"
                      />
                    </div>
                    
                    {/* Campo para la imagen de la sección */}
                    <div className="mb-4">
                      <label htmlFor="sectionImage" className="block text-sm font-medium text-gray-700">
                        Imagen de la sección
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {/* Mostrar vista previa de la imagen si existe */}
                          {editSectionImagePreview ? (
                            <div className="relative mx-auto w-24 h-24 mb-2">
                              <Image 
                                src={editSectionImagePreview} 
                                alt="Vista previa" 
                                fill
                                className="object-cover rounded-full"
                              />
                              {/* Botón para eliminar la imagen */}
                              <button 
                                type="button"
                                className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                                onClick={() => {
                                  setEditSectionImage(null);
                                  setEditSectionImagePreview(null);
                                }}
                              >
                                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          ) : (
                            /* Icono cuando no hay imagen */
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
                          
                          {/* Control para subir una imagen */}
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="edit-section-image-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Subir imagen</span>
                              <input 
                                id="edit-section-image-upload" 
                                name="edit-section-image-upload" 
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setEditSectionImage(file);
                                    
                                    // Crear vista previa de la imagen
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setEditSectionImagePreview(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex justify-between">
                      <button
                        type="button"
                        className="inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-200 text-base font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm sm:mr-2"
                        onClick={handleCloseModal}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                        onClick={handleSubmit}
                        disabled={isUpdatingSectionName}
                      >
                        {isUpdatingSectionName ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default EditSectionModal; 
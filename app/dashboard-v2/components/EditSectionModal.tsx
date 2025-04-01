"use client";

/**
 * @fileoverview Componente modal para la edición de secciones en el menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este componente proporciona una interfaz de usuario para editar secciones existentes
 * en el sistema de gestión de menús. Las secciones son agrupaciones de productos dentro
 * de una categoría, y este modal permite modificar su nombre e imagen asociada.
 */

import React, { Fragment, useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Section, Category, SectionWithFileUpload } from '@/app/types/menu';
import useSections from '@/app/hooks/useSections';
import { PlusIcon as PlusIconMini } from '@heroicons/react/20/solid';
import { getImagePath } from '@/lib/imageUtils';

/**
 * Props para el componente EditSectionModal
 * 
 * @property {boolean} isOpen - Controla si el modal está abierto o cerrado
 * @property {Function} onClose - Función para cerrar el modal y limpiar el estado
 * @property {Section | null} sectionToEdit - Datos completos de la sección a editar
 * @property {number | null} clientId - ID del cliente propietario del menú
 * @property {Category | null} selectedCategory - Categoría a la que pertenece la sección
 * @property {Function} [onSuccess] - Callback opcional que se ejecuta tras una edición exitosa
 */
export interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: any; // Accept a Section object
}

/**
 * Componente modal para editar secciones del menú
 * 
 * Este componente proporciona una interfaz visual para que los administradores
 * modifiquen las propiedades de una sección existente. Características:
 * 
 * - Formulario con validación para el nombre de la sección
 * - Carga y vista previa de imágenes para la sección
 * - Integración con el hook useSections para gestionar operaciones CRUD
 * - Manejo automático de estados de carga y notificaciones
 * - Comunicación bidireccional con el componente padre mediante callbacks
 * 
 * Las secciones son una parte fundamental de la estructura del menú, ya que
 * agrupan productos relacionados dentro de una categoría (ej: entrantes, 
 * platos principales, postres, etc.).
 * 
 * @param {EditSectionModalProps} props - Propiedades del componente
 * @returns {JSX.Element} Modal interactivo para editar secciones
 */
const EditSectionModal: React.FC<EditSectionModalProps> = ({
  isOpen,
  onClose,
  section
}) => {
  /**
   * Estados del formulario y gestión de la sección
   */
  // Estados para los campos del formulario
  const [editSectionName, setEditSectionName] = useState('');
  const [editSectionImage, setEditSectionImage] = useState<File | null>(null);
  const [editSectionImagePreview, setEditSectionImagePreview] = useState<string | null>(null);
  
  // Estado para controlar la operación de actualización
  const [isUpdatingSectionName, setIsUpdatingSectionName] = useState(false);
  
  /**
   * Hook personalizado para operaciones CRUD de secciones
   * Proporciona métodos optimizados y manejo de estado/notificaciones
   */
  const { updateSection } = useSections(section?.client_id || 0);

  /**
   * Efectos para cargar y establecer valores iniciales
   */
  useEffect(() => {
    if (isOpen && section) {
      // Solo establecer valores cuando el modal esté abierto y tengamos datos de sección
      setEditSectionName(section.name || '');
      setEditSectionImagePreview(section.image ? getImagePath(section.image, 'sections') : null);
      console.log("Datos cargados para edición:", {
        id: section.section_id,
        name: section.name,
        image: section.image,
        previewUrl: section.image ? getImagePath(section.image, 'sections') : null
      });
    }
  }, [isOpen, section]);

  /**
   * Maneja el envío del formulario de edición
   * 
   * Este método recopila los datos del formulario, valida que sean correctos,
   * y envía la solicitud de actualización al servidor a través del hook useSections.
   * Incluye:
   * - Prevención de envíos múltiples mientras se procesa una solicitud
   * - Manejo adecuado de la imagen (solo se envía si ha cambiado)
   * - Notificación al usuario sobre el resultado de la operación
   * - Ejecución del callback onSuccess si la operación es exitosa
   */
  const handleSubmit = async () => {
    if (!editSectionName.trim()) {
      toast.error('El nombre de la sección es obligatorio');
      return;
    }

    if (!section) {
      toast.error('No se ha seleccionado ninguna sección para editar');
      return;
    }

    // Comenzar actualización
    setIsUpdatingSectionName(true);

    // Crear FormData para enviar la imagen si existe
    const formData = new FormData();
    formData.append('name', editSectionName);
    formData.append('section_id', section.section_id.toString());
    if (editSectionImage) {
      formData.append('image', editSectionImage);
    }

    try {
      // Actualizar la sección utilizando la función de updateSection del hook
      // que ahora acepta FormData como primer argumento
      const success = await updateSection(formData, section.section_id, section.category_id);
      
      if (success) {
        // Mostrar notificación de éxito
        toast.success('Sección actualizada correctamente');
        
        // Cerrar el modal
        onClose();
        
        // Solución drástica: Recargar la página completa para asegurar una vista actualizada
        console.log("Programando recarga completa después de editar sección...");
        setTimeout(() => {
          try {
            console.log("Ejecutando recarga de página...");
            window.location.href = window.location.href;
          } catch (reloadError) {
            console.error("Error al recargar con location.href, intentando reload():", reloadError);
            window.location.reload();
          }
        }, 1000);
      } else {
        // toast.error se muestra desde el hook, evitar duplicación aquí
        console.error("La actualización de la sección no tuvo éxito");
      }
    } catch (error) {
      console.error("Error al actualizar sección:", error);
      toast.error('Error al actualizar la sección');
    } finally {
      setIsUpdatingSectionName(false);
    }
  };

  /**
   * Limpia el formulario y cierra el modal
   * 
   * Este método se encarga de:
   * - Reiniciar todos los campos del formulario a sus valores iniciales
   * - Eliminar cualquier vista previa de imagen
   * - Llamar a la función onClose proporcionada por el componente padre
   * 
   * Se utiliza tanto al cancelar manualmente como al completar con éxito una edición.
   */
  const handleCloseModal = () => {
    setEditSectionName('');
    setEditSectionImage(null);
    setEditSectionImagePreview(null);
    onClose();
  };

  /**
   * Maneja el cambio de la imagen de la sección
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento del input de tipo file
   */
  const handleSectionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditSectionImage(file);
      
      // Crear vista previa de la imagen
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setEditSectionImagePreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
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
                                onChange={handleSectionImageChange}
                              />
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${
                          isUpdatingSectionName ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleSubmit}
                        disabled={isUpdatingSectionName || !editSectionName.trim()}
                      >
                        {isUpdatingSectionName ? (
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
                        disabled={isUpdatingSectionName}
                      >
                        Cancelar
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
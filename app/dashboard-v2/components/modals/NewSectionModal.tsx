"use client";

/**
 * @fileoverview Componente modal para la creación de nuevas secciones en el menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 * 
 * Este componente proporciona una interfaz de usuario para crear nuevas secciones
 * dentro de una categoría seleccionada en el sistema de gestión de menús.
 * Permite configurar nombre e imagen de la sección.
 */

import React, { Fragment, useState, useRef } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Category, Section } from '@/app/types/menu';
import { PrismaClient } from '@prisma/client';
import eventBus, { Events } from '@/app/lib/eventBus';
import { Section as DashboardSection } from '@/app/dashboard-v2/types';

/**
 * Props para el componente NewSectionModal
 * 
 * @property {boolean} isOpen - Controla si el modal está abierto o cerrado
 * @property {Function} onClose - Función para cerrar el modal y restablecer el estado del formulario
 * @property {PrismaClient} client - Cliente de Prisma para realizar operaciones en la base de datos
 * @property {Category | null} selectedCategory - Categoría seleccionada donde se añadirá la nueva sección
 * @property {Function} setSections - Función para actualizar el estado global de secciones después de la creación
 * @property {number} categoryId - ID de la categoría seleccionada
 * @property {Function} onSuccess - Callback opcional para cuando la creación es exitosa
 */
interface NewSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: PrismaClient;
  selectedCategory?: Category | null;
  setSections: React.Dispatch<React.SetStateAction<{ [key: string]: Section[] }>>;
  categoryId: number;
  onSuccess?: () => void;
}

/**
 * Componente modal para crear una nueva sección en el menú
 * 
 * Este componente proporciona un formulario para la creación de secciones
 * con las siguientes características:
 * 
 * - Formulario con validación del nombre como campo obligatorio
 * - Carga y previsualización de imágenes para la sección (opcional)
 * - Integración con la API para crear la sección en la base de datos
 * - Actualización automática del estado global para reflejar la nueva sección
 * - Gestión de estados de carga durante el proceso de creación
 * - Notificaciones de éxito/error para informar al usuario sobre el resultado
 * 
 * El componente requiere una categoría seleccionada para poder crear la sección,
 * ya que cada sección debe pertenecer a una categoría específica del menú.
 * 
 * @param {NewSectionModalProps} props - Propiedades del componente
 * @returns {JSX.Element} Modal interactivo para crear nuevas secciones
 */
const NewSectionModal: React.FC<NewSectionModalProps> = ({
  isOpen,
  onClose,
  client,
  selectedCategory,
  setSections,
  categoryId,
  onSuccess
}) => {
  /**
   * Estados del formulario para la creación de secciones
   * 
   * @property {string} sectionName - Nombre de la sección
   * @property {File | null} sectionImage - Archivo de imagen seleccionado para la sección
   * @property {string | null} imagePreview - URL de previsualización de la imagen como data URL
   * @property {boolean} isCreating - Controla el estado de carga durante la creación
   * @property {boolean} sectionStatus - Estado de visibilidad de la sección (true = visible, false = oculto)
   */
  const [sectionName, setSectionName] = useState('');
  const [sectionImage, setSectionImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [sectionStatus, setSectionStatus] = useState(true); // Por defecto visible

  /** 
   * Referencia al input de tipo file para la carga de imágenes
   * Se utiliza para activarlo programáticamente desde otros elementos de la UI
   */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Maneja la selección de una imagen para la sección
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
  const handleSectionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSectionImage(file);

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
   * Procesa el envío del formulario para crear una nueva sección
   * 
   * Este método:
   * 1. Previene el comportamiento predeterminado del formulario
   * 2. Valida que exista una categoría seleccionada y un nombre de sección
   * 3. Prepara los datos del formulario, incluyendo la imagen si existe
   * 4. Envía los datos al servidor mediante una petición POST
   * 5. Actualiza el estado global con la nueva sección
   * 6. Muestra una notificación de éxito y reinicia el formulario
   * 
   * Si ocurre algún error durante el proceso, se muestra una notificación
   * y se registra el error en la consola para diagnóstico.
   * 
   * @param {React.FormEvent} e - Evento de envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sectionName.trim()) {
      toast.error('El nombre de la sección es obligatorio');
      return;
    }

    setIsCreating(true);

    // Crear FormData para enviar la imagen si existe
    const formData = new FormData();
    formData.append('name', sectionName);
    formData.append('category_id', categoryId.toString());
    formData.append('status', sectionStatus ? '1' : '0'); // Enviar estado de visibilidad

    if (sectionImage) {
      formData.append('image', sectionImage);
    }

    try {
      // Verificar si la API está disponible
      const response = await fetch('/api/sections', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al crear la sección');
      }

      const data = await response.json();

      const newSection: Section = { ...data };

      if (setSections) {
        setSections(prevSections => {
          const updatedSections = { ...prevSections };
          const categorySections = updatedSections[categoryId] || [];
          updatedSections[categoryId] = [...categorySections, newSection];
          return updatedSections;
        });
      }

      // Emisión de evento para notificar que se creó una sección
      console.log("Emitiendo evento de sección creada");
      if (selectedCategory) {
        eventBus.emit(Events.SECTION_CREATED, {
          section: newSection,
          categoryId: selectedCategory.category_id
        });
      } else {
        eventBus.emit(Events.SECTION_CREATED, {
          section: newSection,
          categoryId: categoryId
        });
      }

      // Mostrar notificación de éxito
      toast.success('Sección creada correctamente');

      // Cerrar el modal
      onClose();

      // Llamar al callback de éxito
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error al crear la sección:', error);
      toast.error('Error al crear la sección');
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Reinicia el formulario y cierra el modal
   * 
   * Este método:
   * 1. Limpia el campo de nombre de la sección
   * 2. Elimina la imagen seleccionada y su previsualización
   * 3. Resetea el estado de visibilidad a visible por defecto
   * 4. Cierra el modal de creación de sección
   * 
   * Se utiliza cuando el usuario cancela la creación o después de
   * crear una sección exitosamente para preparar el formulario para
   * una nueva entrada.
   */
  const handleCancel = () => {
    setSectionName('');
    setSectionImage(null);
    setImagePreview(null);
    setSectionStatus(true); // Resetear a visible por defecto
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
                  Crear nueva sección en {selectedCategory?.name}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  {/* Campo de nombre de sección */}
                  <div className="mb-4">
                    <label htmlFor="section-name" className="block text-sm font-medium text-gray-700">
                      Nombre de la sección
                    </label>
                    <input
                      type="text"
                      id="section-name"
                      name="section-name"
                      value={sectionName}
                      onChange={(e) => setSectionName(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Escribe el nombre de la sección"
                      required
                    />
                  </div>

                  {/* Campo de estado/visibilidad de sección */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="sectionStatus"
                          value="visible"
                          checked={sectionStatus === true}
                          onChange={() => setSectionStatus(true)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Visible</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="sectionStatus"
                          value="oculto"
                          checked={sectionStatus === false}
                          onChange={() => setSectionStatus(false)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Oculto</span>
                      </label>
                    </div>
                  </div>

                  {/* Campo de imagen de sección */}
                  <div className="mb-4">
                    <label htmlFor="section-image" className="block text-sm font-medium text-gray-700">
                      Imagen de la sección (opcional)
                    </label>

                    <input
                      type="file"
                      id="section-image"
                      name="section-image"
                      ref={fileInputRef}
                      onChange={handleSectionImageChange}
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
                                setSectionImage(null);
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
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm ${isCreating ? 'opacity-50 cursor-not-allowed' : ''
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
                        'Crear sección'
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
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default NewSectionModal; 
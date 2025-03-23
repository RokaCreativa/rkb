"use client"

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { Category, Section, Product } from '@/app/types/menu'
import { toast } from 'react-hot-toast'
import { DeleteConfirmationModal } from '@/components/ui/ModalTemplate'

export function NewCategoryModal({
  isOpen,
  onClose,
  newCategoryName,
  setNewCategoryName,
  imagePreview,
  selectedImage,
  setSelectedImage,
  setImagePreview,
  handleCreateCategory,
  isCreatingCategory
}: {
  isOpen: boolean;
  onClose: () => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  imagePreview: string | null;
  selectedImage: File | null;
  setSelectedImage: (file: File | null) => void;
  setImagePreview: (preview: string | null) => void;
  handleCreateCategory: () => void;
  isCreatingCategory: boolean;
}) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                  <PlusIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    Nueva categoría
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Por favor, introduce el nombre e imagen para la nueva categoría.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <div className="mb-4">
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                    Nombre de la categoría
                  </label>
                  <input
                    type="text"
                    name="categoryName"
                    id="categoryName"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-700">
                    Imagen de la categoría
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="relative mx-auto w-24 h-24 mb-2">
                          <Image
                            src={imagePreview}
                            alt="Vista previa"
                            fill
                            className="object-cover rounded-full"
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
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
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedImage(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setImagePreview(reader.result as string);
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
                <div className="flex justify-between">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-200 text-base font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm sm:mr-2"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={`inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm ${
                      isCreatingCategory ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleCreateCategory}
                    disabled={isCreatingCategory || !newCategoryName.trim() || !selectedImage}
                  >
                    {isCreatingCategory ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creando...
                      </>
                    ) : (
                      'Crear Categoría'
                    )}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export function DeleteSectionModal({
  isOpen,
  onClose,
  sectionToDelete,
  deleteSection,
  isDeletingSection,
  selectedCategory,
  setSections
}: {
  isOpen: boolean;
  onClose: () => void;
  sectionToDelete: number | null;
  deleteSection: (sectionId: number) => Promise<boolean>;
  isDeletingSection: boolean;
  selectedCategory: Category | null;
  setSections: React.Dispatch<React.SetStateAction<Record<string, Section[]>>>;
}) {
  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar sección"
      message="¿Estás seguro de que deseas eliminar esta sección? Esta acción no se puede deshacer."
      onConfirm={() => {
        if (!sectionToDelete) return;
        
        deleteSection(sectionToDelete)
          .then(() => {
            // Actualizar estado local
            if (selectedCategory) {
              setSections(prev => {
                const updated = {...prev};
                if (updated[selectedCategory.category_id]) {
                  updated[selectedCategory.category_id] = updated[selectedCategory.category_id].filter(
                    section => section.section_id !== sectionToDelete
                  );
                }
                return updated;
              });
            }
            
            // Cerrar modal
            onClose();
            
            toast.success('Sección eliminada correctamente');
          })
          .catch((error: Error) => {
            console.error('Error al eliminar la sección:', error);
            toast.error('Error al eliminar la sección');
          });
      }}
      isDeleting={isDeletingSection}
    />
  );
}

export function DeleteProductModal({
  isOpen,
  onClose,
  productToDelete,
  deleteProduct,
  isDeletingProduct,
  selectedSection,
  setProducts
}: {
  isOpen: boolean;
  onClose: () => void;
  productToDelete: number | null;
  deleteProduct: (productId: number) => Promise<boolean>;
  isDeletingProduct: boolean;
  selectedSection: Section | null;
  setProducts: React.Dispatch<React.SetStateAction<Record<string, Product[]>>>;
}) {
  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar producto"
      message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
      onConfirm={() => {
        if (!productToDelete) return;
        
        deleteProduct(productToDelete)
          .then(() => {
            // Actualizar estado local
            if (selectedSection) {
              setProducts(prev => {
                const updated = {...prev};
                if (updated[selectedSection.section_id]) {
                  updated[selectedSection.section_id] = updated[selectedSection.section_id].filter(
                    product => product.product_id !== productToDelete
                  );
                }
                return updated;
              });
            }
            
            // Cerrar modal
            onClose();
            
            toast.success('Producto eliminado correctamente');
          })
          .catch((error: Error) => {
            console.error('Error al eliminar el producto:', error);
            toast.error('Error al eliminar el producto');
          });
      }}
      isDeleting={isDeletingProduct}
    />
  );
} 
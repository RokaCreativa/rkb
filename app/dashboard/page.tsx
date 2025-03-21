"use client";

import { useState, useEffect, Fragment } from 'react';
import { EyeIcon, PlusIcon, ChevronDownIcon, PencilIcon, XMarkIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { PhonePreview } from '@/components/PhonePreview';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';

// Interfaces ajustadas a la estructura actualizada
interface Category {
  id: number;
  name: string;
  image: string | null;
  status: number; // Solo 1 o 0
  display_order: number;
  client_id: number;
  products: number;
}

interface Client {
  id: number;
  name: string;
  logo: string | null;
  main_logo: string | null;
}

// Obtener datos del cliente autenticado
async function fetchClientData() {
  const response = await fetch('/api/client');
  if (!response.ok) throw new Error('Error al cargar datos del cliente');
  return await response.json();
}

// Obtener categorías del cliente autenticado
async function fetchCategories() {
  const response = await fetch('/api/categories');
  if (!response.ok) throw new Error('Error al cargar categorías');
  return await response.json();
}

// Actualizar el orden de una categoría
async function updateCategoryOrder(categoryId: number, newDisplayOrder: number) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ display_order: newDisplayOrder }),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el orden');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar el orden de la categoría:', error);
    throw error;
  }
}

// Actualizar la visibilidad de una categoría
async function updateCategoryVisibility(categoryId: number, newStatus: number) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar la visibilidad');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar la visibilidad de la categoría:', error);
    throw error;
  }
}

// Eliminar una categoría
async function deleteCategory(categoryId: number) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar la categoría');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
    throw error;
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ id: number, name: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Efecto para cargar datos iniciales al autenticarse
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const clientData = await fetchClientData();
        const categoriesData = await fetchCategories();

        setClient(clientData);
        setCategories(categoriesData);
        setSelectedCategory(categoriesData[0] || null);
        
        console.log("Datos del cliente:", clientData);
        console.log("Logo principal:", clientData.main_logo);
        console.log("Logo URL completa:", `/images/main_logo/${clientData.main_logo}`);
        
      } catch (err: any) {
        setError(err.message || 'Error desconocido al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status === 'authenticated') loadData();
  }, [status]);

  // Función para manejar el final del arrastre
  const handleDragEnd = async (result: any) => {
    // Si no hay destino o es el mismo que el origen, no hacemos nada
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    
    setIsUpdatingOrder(true);
    
    try {
      // Creamos una copia del array para no mutar el estado directamente
      const newCategoryList = Array.from(categories);
      
      // Removemos el elemento arrastrado de su posición original
      const [movedCategory] = newCategoryList.splice(result.source.index, 1);
      
      // Insertamos el elemento en su nueva posición
      newCategoryList.splice(result.destination.index, 0, movedCategory);
      
      // Actualizamos el display_order en la lista
      const updatedCategories = newCategoryList.map((category, index) => ({
        ...category,
        display_order: index + 1
      }));
      
      // Actualizamos el estado de forma optimista para una UI responsiva
      setCategories(updatedCategories);
      
      // Enviamos las actualizaciones al servidor
      // Solo actualizamos las categorías que cambiaron de posición
      const changedCategories = updatedCategories.filter(
        (cat, idx) => cat.display_order !== categories[idx]?.display_order
      );
      
      await Promise.all(
        changedCategories.map(category => 
          updateCategoryOrder(category.id, category.display_order)
        )
      );
      
      console.log('Orden actualizado con éxito');
    } catch (error) {
      console.error('Error al guardar el nuevo orden:', error);
      // Revertimos al estado anterior si hay error
      const response = await fetchCategories();
      setCategories(response);
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Función para manejar el cambio de visibilidad de una categoría
  const handleToggleVisibility = async (categoryId: number, currentStatus: number) => {
    // Guardamos el ID de la categoría que está actualizando su visibilidad
    setIsUpdatingVisibility(categoryId);
    
    // Nuevo estado (si es 1 pasa a 0, si es 0 pasa a 1)
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    try {
      // Actualizamos el estado localmente para una UI responsiva
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === categoryId ? { ...cat, status: newStatus } : cat
        )
      );
      
      // Enviamos la actualización al servidor
      await updateCategoryVisibility(categoryId, newStatus);
      
      console.log(`Visibilidad de la categoría ${categoryId} actualizada a ${newStatus}`);
    } catch (error) {
      console.error('Error al actualizar la visibilidad:', error);
      // Revertimos el cambio local si hay error
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === categoryId ? { ...cat, status: currentStatus } : cat
        )
      );
    } finally {
      // Limpiamos el estado de actualización
      setIsUpdatingVisibility(null);
    }
  };

  // Función para abrir el modal de edición de categoría
  const openEditModal = (category: Category) => {
    setSelectedCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditImagePreview(category.image);
    setIsEditModalOpen(true);
  };
  
  // Función para abrir el modal de confirmación de eliminación
  const openDeleteModal = (categoryId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el evento se propague a la fila
    setCategoryToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };

  // Función para eliminar una categoría
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setIsDeletingCategory(true);
    
    try {
      // Eliminar la categoría en el servidor
      await deleteCategory(categoryToDelete);
      
      // Actualizar el estado local eliminando la categoría
      setCategories(prevCategories => 
        prevCategories.filter(cat => cat.id !== categoryToDelete)
      );
      
      // Cerrar el modal
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      console.log(`Categoría ${categoryToDelete} eliminada con éxito`);
    } catch (error) {
      console.error('Error al eliminar la categoría:', error);
    } finally {
      setIsDeletingCategory(false);
    }
  };

  // Función para crear una nueva categoría
  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', newCategoryName);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch('/api/categories', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al crear la categoría');
      }

      // Refrescar las categorías
      await reloadCategories();
      
      // Limpiar el formulario
      setNewCategoryName('');
      setSelectedImage(null);
      setImagePreview(null);
      setIsNewCategoryModalOpen(false);
      toast.success('Categoría creada correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para actualizar una categoría
  const updateCategory = async () => {
    if (!editCategoryName.trim() || !selectedCategoryId) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', editCategoryName);
      if (editCategoryImage) {
        formData.append('image', editCategoryImage);
      }

      const response = await fetch(`/api/categories/${selectedCategoryId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la categoría');
      }

      // Refrescar las categorías
      await reloadCategories();
      
      // Limpiar el formulario y cerrar el modal
      setEditCategoryName('');
      setEditCategoryImage(null);
      setEditImagePreview(null);
      setSelectedCategoryId(null);
      setIsEditModalOpen(false);
      toast.success('Categoría actualizada correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar la imagen de una categoría
  const removeImage = async (categoryId: number) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: null }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la imagen');
      }

      // Refrescar las categorías
      await reloadCategories();
      toast.success('Imagen eliminada correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar la imagen');
    }
  };

  // Función para manejar la selección de imágenes
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para manejar la selección de una imagen para editar una categoría
  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditCategoryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para abrir el modal de creación
  const openNewCategoryModal = () => {
    setNewCategoryName('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsNewCategoryModalOpen(true);
  };

  // Función para recargar las categorías
  const reloadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  // Manejo cuando el usuario no está autenticado
  if (status === 'unauthenticated') {
    return (
      <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-400">
        Debes iniciar sesión para ver esta información.
      </div>
    );
  }

  // Mostrar carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="p-8 bg-red-50 border-l-4 border-red-500 text-red-700">
        <h2 className="text-xl font-bold">Error al cargar datos</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Reintentar
        </button>
      </div>
    );
  }

  // Ruta correcta de imágenes
  const verifyImagePath = (imagePath: string | null): string => {
    if (!imagePath) return '/placeholder.png';
    return imagePath.startsWith('/images/categories/') 
      ? imagePath 
      : `/images/categories/${imagePath}`;
  };

  // Obtener la ruta del logo principal
  const getMainLogoPath = (): string => {
    if (!client || !client.main_logo) return '/images/client-logo.png';
    
    // Usar el nombre del archivo directamente desde main_logo
    return `/images/main_logo/${client.main_logo}`;
  };

  // Componente modal para crear nuevas categorías
  const NewCategoryModal = () => {
    if (!isNewCategoryModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 text-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-medium text-gray-900">Nueva Categoría</h3>
            <button 
              onClick={() => setIsNewCategoryModalOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-3">
            <label htmlFor="new-category-name" className="block text-xs font-medium text-gray-700 mb-1">
              Nombre de Categoría
            </label>
            <input
              type="text"
              id="new-category-name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm text-xs"
              placeholder="Ingrese nombre de categoría"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Imagen de Categoría
            </label>
            <div className="flex items-start space-x-3">
              <div 
                className="relative h-16 w-16 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center overflow-hidden"
                onClick={() => document.getElementById('new-category-image')?.click()}
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Vista previa"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>
              
              <div className="flex-1">
                <input
                  type="file"
                  id="new-category-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('new-category-image')?.click()}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-white border border-gray-300 hover:bg-gray-50"
                >
                  <ArrowUpTrayIcon className="h-3 w-3 mr-1" />
                  Subir imagen
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="inline-flex items-center ml-1 px-2 py-1 text-xs font-medium rounded bg-white border border-gray-300 text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-3 w-3 mr-1" />
                    Eliminar
                  </button>
                )}
                <p className="mt-1 text-[10px] text-gray-500">
                  JPG, PNG o GIF. Recomendado 400x400px.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setIsNewCategoryModalOpen(false)}
              className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={createCategory}
              disabled={isCreatingCategory || !newCategoryName.trim()}
              className={`px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white
                ${isCreatingCategory || !newCategoryName.trim() ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isCreatingCategory ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </span>
              ) : 'Crear Categoría'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Componente modal para editar categorías
  const EditCategoryModal = () => {
    if (!isEditModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 text-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-medium text-gray-900">Editar Categoría</h3>
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-3">
            <label htmlFor="edit-category-name" className="block text-xs font-medium text-gray-700 mb-1">
              Nombre de Categoría
            </label>
            <input
              type="text"
              id="edit-category-name"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm text-xs"
              placeholder="Ingrese nombre de categoría"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Imagen de Categoría
            </label>
            <div className="flex items-start space-x-3">
              <div 
                className="relative h-16 w-16 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center overflow-hidden"
                onClick={() => document.getElementById('edit-category-image')?.click()}
              >
                {editImagePreview ? (
                  <Image
                    src={editImagePreview}
                    alt="Vista previa"
                    fill
                    className="object-cover"
                  />
                ) : selectedCategory?.image ? (
                  <Image
                    src={verifyImagePath(selectedCategory.image)}
                    alt={selectedCategory.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.png';
                    }}
                  />
                ) : (
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>
              
              <div className="flex-1">
                <input
                  type="file"
                  id="edit-category-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleEditImageSelect}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('edit-category-image')?.click()}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-white border border-gray-300 hover:bg-gray-50"
                >
                  <ArrowUpTrayIcon className="h-3 w-3 mr-1" />
                  Cambiar imagen
                </button>
                {(editImagePreview || selectedCategory?.image) && (
                  <button
                    type="button"
                    onClick={() => removeImage(selectedCategoryId!)}
                    className="inline-flex items-center ml-1 px-2 py-1 text-xs font-medium rounded bg-white border border-gray-300 text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-3 w-3 mr-1" />
                    Eliminar
                  </button>
                )}
                <p className="mt-1 text-[10px] text-gray-500">
                  JPG, PNG o GIF. Recomendado 400x400px.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={updateCategory}
              disabled={isUpdatingName || !editCategoryName.trim()}
              className={`px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white
                ${isUpdatingName || !editCategoryName.trim() ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isUpdatingName ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                </span>
              ) : 'Actualizar Categoría'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col text-sm">
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-3 text-indigo-600">Categorías</h2>

          <div className="mb-3 flex justify-between">
            <button className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md bg-white">
              <EyeIcon className="h-3 w-3 mr-1" /> Ver categoría
            </button>

            <div className="flex space-x-2">
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md bg-white">
                Acciones <ChevronDownIcon className="ml-1 h-3 w-3" />
              </button>

              <button 
                onClick={openNewCategoryModal}
                className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md bg-indigo-600 text-white"
              >
                <PlusIcon className="h-3 w-3 mr-1" /> Nueva categoría
              </button>
            </div>
          </div>
          
          {/* Vista de lista con tabla */}
          <div className="overflow-hidden bg-white shadow rounded-lg mb-4 text-xs">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="categoriesDroppable">
                {(provided) => (
                  <table className="min-w-full divide-y divide-gray-200"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">NOMBRE</th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">ORDEN</th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">FOTO</th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">VISIBILIDAD</th>
                        <th className="px-3 py-2 text-center text-xs font-medium uppercase">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.map((category, index) => (
                        <Draggable 
                          key={category.id.toString()} 
                          draggableId={category.id.toString()} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <tr 
                              key={category.id} 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${snapshot.isDragging ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                            >
                              <td className="px-3 py-1 flex items-center gap-1">
                                <div {...provided.dragHandleProps} className="cursor-grab p-1 hover:bg-gray-100 rounded">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="5" r="1" />
                                    <circle cx="9" cy="12" r="1" />
                                    <circle cx="9" cy="19" r="1" />
                                    <circle cx="15" cy="5" r="1" />
                                    <circle cx="15" cy="12" r="1" />
                                    <circle cx="15" cy="19" r="1" />
                                  </svg>
                                </div>
                                <span>{category.name}</span>
                                <button 
                                  onClick={() => openEditModal(category)} 
                                  className="ml-1 p-1 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                  <PencilIcon className="h-3 w-3" />
                                </button>
                              </td>
                              <td className="px-3 py-1">{category.display_order}</td>
                              <td className="px-3 py-1 text-center">
                                <div className="relative w-8 h-8 mx-auto overflow-hidden rounded-full cursor-pointer"
                                     onClick={() => setExpandedImage(verifyImagePath(category.image))}>
                                  <Image
                                    src={verifyImagePath(category.image)}
                                    alt={category.name}
                                    fill
                                    sizes="32px"
                                    className="object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/placeholder.png';
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="px-3 py-1 text-center">
                                <button 
                                  className="relative inline-flex items-center"
                                  onClick={() => handleToggleVisibility(category.id, category.status)}
                                  disabled={isUpdatingVisibility === category.id}
                                >
                                  <div className={`w-9 h-5 rounded-full transition-colors ${category.status === 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                    <div className={`absolute w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 top-0.5 ${category.status === 1 ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                  </div>
                                  {isUpdatingVisibility === category.id && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-full">
                                      <div className="w-2 h-2 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
                                    </div>
                                  )}
                                </button>
                              </td>
                              <td className="px-3 py-1 text-center">
                                <button 
                                  onClick={(e) => openDeleteModal(category.id, e)}
                                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {categories.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-2">No se encontraron categorías.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </Droppable>
            </DragDropContext>
            {isUpdatingOrder && (
              <div className="flex justify-center py-1 bg-indigo-50">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500 mr-1"></div>
                <span className="text-xs text-indigo-600">Actualizando orden...</span>
              </div>
            )}
          </div>

          {/* Vista de cuadrícula para categorías */}
          <div className="bg-white shadow rounded-lg p-3 mb-4">
            <h3 className="text-sm font-semibold mb-2">Vista de categorías en el menú</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
              {categories.filter(cat => cat.status === 1).map((category) => (
                <div key={category.id} className="relative bg-white rounded-lg p-1">
                  <div className="flex flex-col items-center">
                    <div className="relative h-10 w-10 cursor-pointer mb-1"
                        onClick={() => setExpandedImage(verifyImagePath(category.image))}>
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <Image
                          src={verifyImagePath(category.image)}
                          alt={category.name}
                          fill
                          sizes="(max-width: 768px) 40px, 40px"
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.png";
                          }}
                        />
                      </div>
                    </div>
                    <h4 className="text-[10px] font-medium text-center truncate w-full">{category.name}</h4>
                  </div>
                </div>
              ))}
              <div className="flex flex-col items-center justify-center p-1">
                <button 
                  onClick={() => setIsNewCategoryModalOpen(true)}
                  className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 text-gray-500" />
                </button>
                <span className="text-[10px] mt-1">Añadir</span>
              </div>
            </div>
          </div>
        </div>
      
        {/* Vista previa simplificada - Mantener el mismo tamaño */}
        <div className="w-full lg:w-auto">
          <PhonePreview 
            clientName={client?.name || "Roka"} 
            categories={categories
              .filter(cat => cat.status === 1)
              .sort((a, b) => a.display_order - b.display_order)
              .map(cat => ({
                id: cat.id,
                name: cat.name || '',
                image: verifyImagePath(cat.image)
              }))
            }
            clientLogo={getMainLogoPath()}
          />
        </div>
      </div>

      {/* Modal para confirmar eliminación de categoría - Reducido */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => !isDeletingCategory && setIsDeleteModalOpen(false)}>
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
                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-lg bg-white p-4 text-left align-middle shadow-xl transition-all text-sm">
                  <Dialog.Title as="h3" className="text-base font-medium leading-6 text-gray-900 flex items-center">
                    <div className="mr-2 flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-red-100">
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </div>
                    Eliminar categoría
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      ¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDeleteModalOpen(false)}
                      disabled={isDeletingCategory}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={handleDeleteCategory}
                      disabled={isDeletingCategory}
                    >
                      {isDeletingCategory ? (
                        <>
                          <span className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-1"></span>
                          Eliminando...
                        </>
                      ) : (
                        'Eliminar'
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modales para crear y editar categorías */}
      <NewCategoryModal />
      <EditCategoryModal />

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button 
              className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-lg z-10"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedImage(null);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative w-full h-[80vh]">
              <Image
                src={expandedImage}
                alt="Imagen ampliada"
                fill
                className="object-contain"
                onError={() => setExpandedImage("/placeholder.png")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

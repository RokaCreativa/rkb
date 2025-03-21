"use client";

import { useState, useEffect, Fragment } from 'react';
import { EyeIcon, PlusIcon, ChevronDownIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { PhonePreview } from '@/components/PhonePreview';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Dialog, Transition } from '@headlessui/react';

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

// Actualizar el nombre de una categoría
async function updateCategoryName(categoryId: number, newName: string) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName }),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el nombre');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar el nombre de la categoría:', error);
    throw error;
  }
}

// Crear una nueva categoría
async function createCategory(categoryData: { name: string, image?: string }) {
  try {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear la categoría');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al crear la categoría:', error);
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
  const [editingCategory, setEditingCategory] = useState<{ id: number, name: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

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
    setEditingCategory({ id: category.id, name: category.name });
    setIsEditModalOpen(true);
  };

  // Función para guardar el nombre editado de la categoría
  const saveEditedCategoryName = async () => {
    if (!editingCategory) return;
    
    setIsUpdatingName(true);
    
    try {
      // Actualización optimista de la UI
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === editingCategory.id ? { ...cat, name: editingCategory.name } : cat
        )
      );
      
      // Enviamos la actualización al servidor
      await updateCategoryName(editingCategory.id, editingCategory.name);
      
      // Cerramos el modal
      setIsEditModalOpen(false);
      console.log(`Nombre de la categoría ${editingCategory.id} actualizado a "${editingCategory.name}"`);
    } catch (error) {
      console.error('Error al actualizar el nombre:', error);
      // Revertimos los cambios locales si hay error
      const response = await fetchCategories();
      setCategories(response);
    } finally {
      setIsUpdatingName(false);
    }
  };

  // Función para crear una nueva categoría
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsCreatingCategory(true);
    
    try {
      // Creamos la nueva categoría en el servidor
      const newCategory = await createCategory({
        name: newCategoryName,
      });
      
      // Actualizamos el estado local con la nueva categoría
      setCategories(prevCategories => [...prevCategories, newCategory]);
      
      // Limpiamos el formulario y cerramos el modal
      setNewCategoryName('');
      setIsNewCategoryModalOpen(false);
      console.log('Nueva categoría creada:', newCategory);
    } catch (error) {
      console.error('Error al crear la categoría:', error);
    } finally {
      setIsCreatingCategory(false);
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
    if (!imagePath) return '/images/placeholder.png';
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

  return (
    <div className="flex flex-col">
      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
      <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4 text-indigo-600">Categorías</h2>

          <div className="mb-4 flex justify-between">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white">
              <EyeIcon className="h-4 w-4 mr-2" /> Ver categoría
            </button>

            <div className="flex space-x-2">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white">
                Acciones <ChevronDownIcon className="ml-2 h-4 w-4" />
              </button>

              <button 
                onClick={() => setIsNewCategoryModalOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white"
              >
                <PlusIcon className="h-4 w-4 mr-2" /> Nueva categoría
              </button>
            </div>
          </div>
          
          <div className="overflow-hidden bg-white shadow rounded-lg">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="categoriesDroppable">
                {(provided) => (
                  <table className="min-w-full divide-y divide-gray-200"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">NOMBRE</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">ORDEN</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">FOTO</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">VISIBILIDAD</th>
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
                              <td className="px-6 py-4 flex items-center gap-2">
                                <div {...provided.dragHandleProps} className="cursor-grab p-1 hover:bg-gray-100 rounded">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                  className="ml-2 p-1 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              </td>
                              <td className="px-6 py-4">{category.display_order}</td>
                              <td className="px-6 py-4 text-center">
                                <div className="relative w-16 h-16 mx-auto overflow-hidden rounded-md">
                                  <Image
                                    src={verifyImagePath(category.image)}
                                    alt={category.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/placeholder.png';
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button 
                                  className="relative inline-flex items-center"
                                  onClick={() => handleToggleVisibility(category.id, category.status)}
                                  disabled={isUpdatingVisibility === category.id}
                                >
                                  <div className={`w-12 h-6 rounded-full transition-colors ${category.status === 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                    <div className={`absolute w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 top-0.5 ${category.status === 1 ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                  </div>
                                  {isUpdatingVisibility === category.id && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-full">
                                      <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
                                    </div>
                                  )}
                                </button>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {categories.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-4">No se encontraron categorías.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </Droppable>
            </DragDropContext>
            {isUpdatingOrder && (
              <div className="flex justify-center py-2 bg-indigo-50">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500 mr-2"></div>
                <span className="text-sm text-indigo-600">Actualizando orden...</span>
              </div>
            )}
          </div>
        </div>
      
        {/* Vista previa simplificada */}
        <div className="w-full lg:w-1/3">
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

      {/* Modal para editar nombre de categoría */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsEditModalOpen(false)}>
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Editar categoría
                  </Dialog.Title>
                  <div className="mt-4">
                    <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
                      Nombre de la categoría
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="category-name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={editingCategory?.name || ''}
                        onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      onClick={saveEditedCategoryName}
                      disabled={isUpdatingName}
                    >
                      {isUpdatingName ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                          Guardando...
                        </>
                      ) : (
                        'Guardar'
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal para crear nueva categoría */}
      <Transition appear show={isNewCategoryModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsNewCategoryModalOpen(false)}>
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Crear nueva categoría
                  </Dialog.Title>
                  <div className="mt-4">
                    <label htmlFor="new-category-name" className="block text-sm font-medium text-gray-700">
                      Nombre de la categoría
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="new-category-name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsNewCategoryModalOpen(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      onClick={handleCreateCategory}
                      disabled={isCreatingCategory || !newCategoryName.trim()}
                    >
                      {isCreatingCategory ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                          Creando...
                        </>
                      ) : (
                        'Crear'
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

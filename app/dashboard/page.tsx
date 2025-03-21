"use client";

import { useState, useEffect } from 'react';
import { EyeIcon, PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { PhonePreview } from '@/components/PhonePreview';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

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

              <Link href="/dashboard/categories/new" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white">
                <PlusIcon className="h-4 w-4 mr-2" /> Nueva categoría
              </Link>
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
                              className={`cursor-pointer ${snapshot.isDragging ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                              onClick={() => setSelectedCategory(category)}
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
                              </td>
                              <td className="px-6 py-4">{category.display_order}</td>
                              <td className="px-6 py-4">
                                <Image
                                  src={verifyImagePath(category.image)}
                                  alt={category.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block w-10 h-5 rounded-full ${category.status === 1 ? 'bg-indigo-400' : 'bg-gray-200'}`}>
                                  <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${category.status === 1 ? 'translate-x-5' : 'translate-x-0'}`}/>
                                </span>
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
              .map(cat => ({
                id: cat.id,
                name: cat.name || '',
                image: cat.image || undefined
              }))
            }
            clientLogo={getMainLogoPath()}
          />
        </div>
      </div>
    </div>
  );
}

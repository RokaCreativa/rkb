"use client"

import { useState, useEffect } from 'react'
import { 
  EyeIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

// Definir la interfaz para la categoría
interface Category {
  id: number;
  name: string;
  image: string | null;
  status: string; // 'A' para activo, 'I' para inactivo
  display_order: number;
  client_id: number;
  products: number;
}

// Definir la interfaz para el cliente
interface Client {
  id: number;
  name: string;
  logo: string | null;
}

// Función para obtener datos del cliente
async function fetchClientData() {
  try {
    const response = await fetch('/api/cliente');
    if (!response.ok) {
      throw new Error('Error al cargar datos del cliente');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al cargar datos del cliente:", error);
    return null;
  }
}

// Función para obtener categorías
async function fetchCategories() {
  try {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Error al cargar categorías');
    }
    const data = await response.json();
    console.log("Datos de categorías recibidos:", data);
    return data;
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    return [];
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Estado para guardar la categoría seleccionada para la previsualización
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Cargar datos al inicio
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Intentar cargar datos reales
        const clientData = await fetchClientData();
        console.log("Datos del cliente cargados:", clientData);
        
        const categoriesData = await fetchCategories();
        console.log("Categorías cargadas:", categoriesData);
        
        if (clientData) {
          setClient(clientData);
        }
        
        if (categoriesData && categoriesData.length > 0) {
          console.log("Estableciendo categorías:", categoriesData);
          setCategories(categoriesData);
          
          // Seleccionar la primera categoría para la previsualización
          setSelectedCategory(categoriesData[0]);
        } else {
          // Si no hay datos reales, usar datos de ejemplo
          console.log("No se encontraron categorías, usando datos de ejemplo");
          const exampleCategories = [
            {
              id: 1,
              name: "Entrantes",
              image: "/images/categories/entrantes.jpg",
              status: "A", // Activo
              display_order: 1,
              client_id: 1,
              products: 0
            },
            {
              id: 2,
              name: "Principales",
              image: "/images/categories/principales.jpg",
              status: "A", // Activo
              display_order: 2,
              client_id: 1,
              products: 0
            },
            {
              id: 3,
              name: "Postres",
              image: "/images/categories/postres.jpg",
              status: "A", // Activo
              display_order: 3,
              client_id: 1,
              products: 0
            },
            {
              id: 4,
              name: "Bebidas",
              image: "/images/categories/bebidas.jpg",
              status: "A", // Activo
              display_order: 4,
              client_id: 1,
              products: 0
            }
          ];
          
          setCategories(exampleCategories);
          setSelectedCategory(exampleCategories[0]);
        }
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'Error desconocido al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  // Función para seleccionar una categoría para previsualización
  const selectCategoryForPreview = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setSelectedCategory(category);
    }
  };

  // Verificar si hay imágenes y si existen en la ruta pública
  const verifyImagePath = (imagePath: string | null): string => {
    if (!imagePath) return '/images/placeholder.png';
    // Usar el nombre exacto como viene de la base de datos
    return `/images/categories/${imagePath}`;
  };

  // Mostrar mensaje de carga si es necesario
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Cargando datos del cliente...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si ocurrió alguno
  if (error) {
    return (
      <div className="p-8 bg-red-50 border-l-4 border-red-500 text-red-700">
        <h2 className="text-xl font-bold mb-2">Error al cargar datos</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header con titulo Dashboard */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Panel principal */}
        <div className="flex-1">
          <div>
            <h2 className="text-2xl font-bold mb-4">Categorías</h2>
            
            <div className="mb-4 flex justify-between">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <EyeIcon className="h-4 w-4 mr-2" />
                Ver categoría
              </button>
              
              <div className="flex space-x-2">
                <div className="relative">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Acciones
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </button>
                </div>
                
                <Link href="/dashboard/categories/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nueva categoría
                </Link>
              </div>
            </div>
            
            <div className="overflow-hidden bg-white shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NOMBRE
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ORDEN
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      FOTO
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VISIBILIDAD
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => {
                    return (
                      <tr key={category.id} onClick={() => selectCategoryForPreview(category.id)} className="cursor-pointer hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">
                                {category.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{category.display_order}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            <Image 
                              src={verifyImagePath(category.image)}
                              alt={category.name}
                              width={40}
                              height={40}
                              className="object-cover"
                              onError={(e) => {
                                console.error(`Error cargando imagen: ${category.image}`);
                                // Crear un elemento fallback
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                
                                // Añadir texto de fallback
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.classList.add('flex', 'items-center', 'justify-center');
                                  const fallback = document.createElement('span');
                                  fallback.className = 'text-xs text-gray-500';
                                  fallback.textContent = 'Sin foto';
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`relative inline-block w-10 h-5 transition-colors duration-200 ease-in-out rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${category.status === 'A' ? 'bg-indigo-400' : 'bg-gray-200'}`}>
                            <span
                              className={`absolute inset-0 flex items-center justify-${category.status === 'A' ? 'end' : 'start'} w-6 h-6 transition-transform duration-200 ease-in-out transform ${category.status === 'A' ? 'translate-x-5' : 'translate-x-0'} rounded-full bg-white shadow`}
                            ></span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Previsualización móvil */}
        <div className="w-full lg:w-96">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Previsualización Móvil</h3>
            
            {selectedCategory && (
              <div className="relative border-8 border-gray-900 rounded-3xl overflow-hidden max-w-xs mx-auto">
                <div className="absolute top-0 left-0 right-0 h-6 bg-gray-900 flex items-center justify-center">
                  <div className="w-16 h-1 rounded bg-gray-700"></div>
                </div>
                <div className="h-[500px] bg-gray-900 overflow-hidden">
                  <div className="h-full bg-gray-800 text-white overflow-y-auto">
                    <div className="p-4 flex items-center">
                      <button className="text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                      </button>
                      <h2 className="ml-4 text-lg font-semibold">Categorías</h2>
                    </div>
                    
                    <div className="border-t border-gray-700">
                      <div className="p-4">
                        <h3 className="text-xl font-bold mb-4">{selectedCategory.name}</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {selectedCategory.image && (
                            <div className="col-span-2 rounded-lg overflow-hidden h-40 relative">
                              <Image 
                                src={verifyImagePath(selectedCategory.image)}
                                alt={selectedCategory.name}
                                width={320}
                                height={160}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  console.error(`Error cargando imagen en preview: ${selectedCategory.image}`);
                                  // Crear un elemento fallback
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  
                                  // Añadir texto de fallback
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-700');
                                    const fallback = document.createElement('span');
                                    fallback.className = 'text-sm text-gray-400';
                                    fallback.textContent = 'Sin imagen disponible';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            </div>
                          )}
                          
                          {selectedCategory.products && selectedCategory.products > 0 ? (
                            <div className="col-span-2 text-center py-8 text-gray-400">
                              No hay productos en esta categoría
                            </div>
                          ) : (
                            <div className="col-span-2 text-center py-8 text-gray-400">
                              No hay productos en esta categoría
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-800 p-3">
                      <button className="w-full py-3 bg-white text-gray-900 rounded-full text-sm font-medium">
                        Valora tu experiencia
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

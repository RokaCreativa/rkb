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
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import MobilePreview from '../components/MobilePreview'
import { useSession } from 'next-auth/react'
import { Menu, Producto, Cliente } from '../api/auth/models'

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

// Función para obtener menús
async function fetchMenus() {
  try {
    const response = await fetch('/api/menus');
    if (!response.ok) {
      throw new Error('Error al cargar menús');
    }
    const data = await response.json();
    
    // Transformar los datos para incluir la propiedad expanded
    return data.map((menu: any) => ({
      ...menu,
      expanded: false,
      productos: menu.productos || []
    }));
  } catch (error) {
    console.error("Error al cargar menús:", error);
    return [];
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  
  const [menus, setMenus] = useState<Menu[]>([]);

  // Estado para guardar el menú seleccionado para la previsualización
  const [selectedMenuForPreview, setSelectedMenuForPreview] = useState<Menu | null>(null);
  
  // Estado para controlar el modal de edición de producto
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [currentProducto, setCurrentProducto] = useState<Producto | null>(null);
  const [currentMenuId, setCurrentMenuId] = useState<number | null>(null);

  // Cargar datos al inicio
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Intentar cargar datos reales
        const clienteData = await fetchClientData();
        const menusData = await fetchMenus();
        
        if (clienteData) {
          setCliente(clienteData);
        }
        
        if (menusData && menusData.length > 0) {
          setMenus(menusData);
          
          // Seleccionar el primer menú con productos para la previsualización
          const menuWithProducts = menusData.find((menu: Menu) => menu.productos && menu.productos.length > 0);
          if (menuWithProducts) {
            setSelectedMenuForPreview(menuWithProducts);
          } else {
            setSelectedMenuForPreview(menusData[0]);
          }
        } else {
          // Si no hay datos reales, usar datos de ejemplo
          setMenus([
            {
              id: 1,
              nombre: "Menu Pasta y Platanos",
              platos: 4,
              disponibilidad: "Todos los días",
              visible: true,
              expanded: false,
              productos: [
                { id: 1, nombre: "Ensalada caprese", descripcion: "Una sencilla ensalada italiana hecha con tomates frescos, queso mozzarella...", precio: 12.00, imagen: "/images/products/ensalada.jpg", visible: true },
                { id: 2, nombre: "Gazpacho", descripcion: "", precio: 9.00, imagen: "/images/products/gazpacho.jpg", visible: true },
                { id: 3, nombre: "Aros de cebolla", descripcion: "", precio: 8.00, imagen: "/images/products/aros.jpg", visible: true },
                { id: 4, nombre: "Platano Canario", descripcion: "Platano de las islas canarias", precio: 15.00, imagen: "/images/products/platano.jpg", visible: true }
              ]
            },
            {
              id: 2,
              nombre: "Menu solo postres",
              platos: 1,
              disponibilidad: "Todos los días",
              visible: true,
              expanded: false,
              productos: [
                { id: 5, nombre: "Flan casero", descripcion: "Delicioso flan con caramelo", precio: 5.50, imagen: "/images/products/flan.jpg", visible: true }
              ]
            },
            {
              id: 3,
              nombre: "Nuestro menúAAA",
              platos: 0,
              disponibilidad: "Todos los días",
              visible: true,
              expanded: false,
              productos: []
            },
            {
              id: 4,
              nombre: "Carnes foryou",
              platos: 2,
              disponibilidad: "Todos los días",
              visible: true,
              expanded: false,
              productos: [
                { id: 6, nombre: "Entrecot", descripcion: "Entrecot de vaca gallega", precio: 22.50, imagen: "/images/products/entrecot.jpg", visible: true },
                { id: 7, nombre: "Solomillo", descripcion: "Solomillo de ternera", precio: 25.00, imagen: "/images/products/solomillo.jpg", visible: true }
              ]
            }
          ]);
          
          // Seleccionar el primer menú para la previsualización con datos de ejemplo
          setSelectedMenuForPreview({
            id: 1,
            nombre: "Menu Pasta y Platanos",
            platos: 4,
            disponibilidad: "Todos los días",
            visible: true,
            expanded: false,
            productos: [
              { id: 1, nombre: "Ensalada caprese", descripcion: "Una sencilla ensalada italiana hecha con tomates frescos, queso mozzarella...", precio: 12.00, imagen: "/images/products/ensalada.jpg", visible: true },
              { id: 2, nombre: "Gazpacho", descripcion: "", precio: 9.00, imagen: "/images/products/gazpacho.jpg", visible: true },
              { id: 3, nombre: "Aros de cebolla", descripcion: "", precio: 8.00, imagen: "/images/products/aros.jpg", visible: true },
              { id: 4, nombre: "Platano Canario", descripcion: "Platano de las islas canarias", precio: 15.00, imagen: "/images/products/platano.jpg", visible: true }
            ]
          });
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  // Función para expandir/colapsar un menú
  const toggleMenu = (menuId: number) => {
    setMenus(menus.map(menu => {
      if (menu.id === menuId) {
        return { ...menu, expanded: !menu.expanded };
      }
      return menu;
    }));
  };

  // Función para seleccionar un menú para previsualización
  const selectMenuForPreview = (menuId: number) => {
    const menu = menus.find(m => m.id === menuId);
    if (menu) {
      setSelectedMenuForPreview(menu);
    }
  };
  
  // Función para abrir el modal de edición de producto
  const openEditModal = (menuId: number, producto: Producto) => {
    setCurrentMenuId(menuId);
    setCurrentProducto({...producto}); // Clonar para evitar modificar directamente
    setIsEditModalOpen(true);
  };
  
  // Función para cerrar el modal de edición
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentProducto(null);
    setCurrentMenuId(null);
  };
  
  // Función para guardar cambios del producto
  const saveProductChanges = async () => {
    if (!currentProducto || currentMenuId === null) return;
    
    try {
      // Aquí iría la llamada al API para guardar los cambios del producto
      // Por ejemplo: await fetch(`/api/productos/${currentProducto.id}`, { method: 'PUT', body: JSON.stringify(currentProducto) });
      
      // Por ahora solo actualizamos el estado local
      setMenus(menus.map(menu => {
        if (menu.id === currentMenuId) {
          return {
            ...menu,
            productos: menu.productos?.map(producto => 
              producto.id === currentProducto.id ? currentProducto : producto
            ) || []
          };
        }
        return menu;
      }));
      
      // Si el menú editado es el que se está previsualizando, actualizarlo también
      if (selectedMenuForPreview && selectedMenuForPreview.id === currentMenuId) {
        setSelectedMenuForPreview({
          ...selectedMenuForPreview,
          productos: selectedMenuForPreview.productos?.map(producto => 
            producto.id === currentProducto.id ? currentProducto : producto
          ) || []
        });
      }
      
      closeEditModal();
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      // Aquí se podría mostrar un mensaje de error
    }
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
            <h2 className="text-2xl font-bold mb-4">Menús</h2>
            
            <div className="mb-4 flex justify-between">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <EyeIcon className="h-4 w-4 mr-2" />
                Ver menú
              </button>
              
              <div className="flex space-x-2">
                <div className="relative">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Acciones
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </button>
                </div>
                
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nuevo menú
                </button>
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
                      PLATOS
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DISPONIBILIDAD
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
                  {menus.map((menu) => (
                    <tr key={menu.id} onClick={() => selectMenuForPreview(menu.id)} className="cursor-pointer hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">
                              {menu.nombre}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{menu.platos}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{menu.disponibilidad}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`relative inline-block w-10 h-5 transition-colors duration-200 ease-in-out rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${menu.visible ? 'bg-indigo-400' : 'bg-gray-200'}`}>
                          <span
                            className={`absolute inset-0 flex items-center justify-${menu.visible ? 'end' : 'start'} w-6 h-6 transition-transform duration-200 ease-in-out transform ${menu.visible ? 'translate-x-5' : 'translate-x-0'} rounded-full bg-white shadow`}
                          ></span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Previsualización móvil */}
        <div className="w-full lg:w-96">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Previsualización Móvil</h3>
            
            {selectedMenuForPreview && (
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
                      <h2 className="ml-4 text-lg font-semibold">{selectedMenuForPreview.nombre}</h2>
                    </div>
                    
                    <div className="border-t border-gray-700">
                      <div className="flex px-4 py-2 space-x-2">
                        <button className="px-3 py-1 rounded-full bg-gray-700 text-white text-sm font-medium">
                          Entrantes
                        </button>
                        <button className="px-3 py-1 rounded-full bg-gray-600 text-white text-sm font-medium">
                          Principales
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-xl font-bold mb-4">Entrantes</h3>
                        
                        {selectedMenuForPreview.productos?.map((producto) => (
                          <div key={producto.id} className="mb-6">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-bold">{producto.nombre}</h4>
                                {producto.descripcion && (
                                  <p className="text-sm text-gray-400 mt-1">{producto.descripcion}</p>
                                )}
                                <p className="mt-2 font-semibold">{producto.precio.toFixed(2)} €</p>
                              </div>
                              {producto.imagen && (
                                <div className="w-16 h-16 bg-gray-600 rounded-lg overflow-hidden">
                                  <img 
                                    src={producto.imagen} 
                                    alt={producto.nombre}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
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

      {/* Modal de edición de producto */}
      {isEditModalOpen && currentProducto && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeEditModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={closeEditModal}
                >
                  <span className="sr-only">Cerrar</span>
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Editar Producto</h3>
                  
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        value={currentProducto.nombre}
                        onChange={(e) => setCurrentProducto({...currentProducto, nombre: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                        Descripción
                      </label>
                      <textarea
                        id="descripcion"
                        value={currentProducto.descripcion || ''}
                        onChange={(e) => setCurrentProducto({...currentProducto, descripcion: e.target.value})}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
                        Precio (€)
                      </label>
                      <input
                        type="number"
                        id="precio"
                        value={currentProducto.precio}
                        onChange={(e) => setCurrentProducto({...currentProducto, precio: parseFloat(e.target.value)})}
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="visible" className="block text-sm font-medium text-gray-700">
                        Visibilidad
                      </label>
                      <select
                        id="visible"
                        value={currentProducto.visible ? 'visible' : 'hidden'}
                        onChange={(e) => setCurrentProducto({...currentProducto, visible: e.target.value === 'visible'})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="visible">Visible</option>
                        <option value="hidden">Oculto</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={saveProductChanges}
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={closeEditModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

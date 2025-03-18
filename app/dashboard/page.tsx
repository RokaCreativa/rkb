"use client"

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  UsersIcon, 
  ShoppingCartIcon, 
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

const stats = [
  { name: 'Visitas Totales', stat: '71,897', icon: EyeIcon, change: '+4.75%', changeType: 'increase' },
  { name: 'Nuevos Clientes', stat: '58', icon: UsersIcon, change: '+2.5%', changeType: 'increase' },
  { name: 'Ventas', stat: '$45,231', icon: ShoppingCartIcon, change: '+54.02%', changeType: 'increase' },
  { name: 'Conversión', stat: '24.57%', icon: ChartBarIcon, change: '+1.39%', changeType: 'increase' }
]

// Definición de tipos
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  visible: boolean;
}

interface Menu {
  id: number;
  nombre: string;
  platos: number;
  disponibilidad: string;
  visible: boolean;
  expanded: boolean;
  productos: Producto[];
}

interface Cliente {
  nombre: string;
  logo: string;
}

// Función para obtener datos del cliente
async function getClienteData() {
  try {
    const cliente = await prisma.clientes.findFirst();
    return cliente;
  } catch (error) {
    console.error("Error al cargar datos del cliente:", error);
    return null;
  }
}

export default function DashboardPage() {
  // En el cliente, usaríamos estos datos de API/getServerSideProps
  // Pero para esta demo, los definimos directamente
  const [cliente, setCliente] = useState<Cliente>({
    nombre: "Restaurante Demo",
    logo: "logo-demo.png"
  });
  
  const [menus, setMenus] = useState<Menu[]>([
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

  // Estado para guardar el menú seleccionado para la previsualización
  const [selectedMenuForPreview, setSelectedMenuForPreview] = useState<Menu | null>(null);
  
  // Estado para controlar el modal de edición de producto
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [currentProducto, setCurrentProducto] = useState<Producto | null>(null);
  const [currentMenuId, setCurrentMenuId] = useState<number | null>(null);

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
  const saveProductChanges = () => {
    if (!currentProducto || currentMenuId === null) return;
    
    // Actualizar el producto en el estado de los menús
    setMenus(menus.map(menu => {
      if (menu.id === currentMenuId) {
        return {
          ...menu,
          productos: menu.productos.map(producto => 
            producto.id === currentProducto.id ? currentProducto : producto
          )
        };
      }
      return menu;
    }));
    
    // Si el menú editado es el que se está previsualizando, actualizarlo también
    if (selectedMenuForPreview && selectedMenuForPreview.id === currentMenuId) {
      setSelectedMenuForPreview({
        ...selectedMenuForPreview,
        productos: selectedMenuForPreview.productos.map(producto => 
          producto.id === currentProducto.id ? currentProducto : producto
        )
      });
    }
    
    closeEditModal();
  };

  // Al iniciar, seleccionar el primer menú con productos para la previsualización
  useEffect(() => {
    const menuWithProducts = menus.find(menu => menu.productos.length > 0);
    if (menuWithProducts) {
      setSelectedMenuForPreview(menuWithProducts);
    }

    // En un entorno real, cargaríamos los datos del cliente
    // Esta llamada es opcional y sólo si realmente necesitas datos del servidor
    /* 
    const fetchData = async () => {
      const clienteData = await getClienteData();
      if (clienteData) {
        setCliente({
          nombre: clienteData.nombre || "Restaurante sin nombre",
          logo: clienteData.logo || "default-logo.png"
        });
      }
    };
    fetchData(); 
    */
  }, [menus]);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Panel principal - toma 3/4 del espacio */}
      <div className="w-3/4 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Menús
          </h2>
        </div>

        {/* Acciones principales */}
        <div className="flex justify-between mb-6">
          <div className="flex items-center space-x-2">
            <button className="bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center space-x-1 text-sm text-gray-700 hover:bg-gray-50">
              <EyeIcon className="h-4 w-4" />
              <span>Ver menú</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button className="bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center space-x-1 text-sm text-gray-700 hover:bg-gray-50">
                <span>Acciones</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              {/* Dropdown hidden by default */}
            </div>
            <button className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm hover:bg-indigo-700 flex items-center space-x-1">
              <PlusIcon className="h-4 w-4" />
              <span>Nuevo menú</span>
            </button>
          </div>
        </div>

        {/* Tabla de menús */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Encabezado de la tabla */}
          <div className="grid grid-cols-12 bg-gray-50 py-3 px-4 text-sm font-medium text-gray-500 border-b">
            <div className="col-span-4">NOMBRE</div>
            <div className="col-span-2 text-center">PLATOS</div>
            <div className="col-span-3">DISPONIBILIDAD</div>
            <div className="col-span-2 text-center">VISIBILIDAD</div>
            <div className="col-span-1"></div>
          </div>

          {/* Filas de menús */}
          <div className="divide-y divide-gray-200">
            {menus.map((menu) => (
              <div key={menu.id} className="hover:bg-gray-50">
                {/* Fila principal del menú */}
                <div 
                  className="grid grid-cols-12 py-4 px-4 text-sm text-gray-900 items-center cursor-pointer"
                  onClick={() => {
                    toggleMenu(menu.id);
                    selectMenuForPreview(menu.id);
                  }}
                >
                  <div className="col-span-4 flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
                    </svg>
                    <span className="font-medium">{menu.nombre}</span>
                  </div>
                  <div className="col-span-2 text-center">{menu.platos}</div>
                  <div className="col-span-3">{menu.disponibilidad}</div>
                  <div className="col-span-2 flex justify-center">
                    <div className={`w-12 h-6 rounded-full ${menu.visible ? 'bg-green-500' : 'bg-gray-300'} relative`}>
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 ${menu.visible ? 'right-0.5' : 'left-0.5'} transition-all`}></div>
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {menu.expanded ? 
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : 
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    }
                  </div>
                </div>

                {/* Panel expandible de productos */}
                {menu.expanded && (
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    {/* Encabezado de productos */}
                    <div className="grid grid-cols-12 py-2 text-xs font-medium text-gray-500 border-b border-gray-300">
                      <div className="col-span-5">PLATO</div>
                      <div className="col-span-3">PRECIO</div>
                      <div className="col-span-2 text-center">VISIBILIDAD</div>
                      <div className="col-span-2 text-right">ACCIONES</div>
                    </div>

                    {/* Lista de productos */}
                    <div className="divide-y divide-gray-200">
                      {menu.productos.length > 0 ? (
                        menu.productos.map((producto: Producto) => (
                          <div key={producto.id} className="grid grid-cols-12 py-3 text-sm text-gray-900 items-center">
                            <div className="col-span-5 flex items-center space-x-2">
                              <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden">
                                {producto.imagen && (
                                  <img 
                                    src={producto.imagen} 
                                    alt={producto.nombre}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{producto.nombre}</p>
                                {producto.descripcion && (
                                  <p className="text-xs text-gray-500 truncate max-w-xs">{producto.descripcion}</p>
                                )}
                              </div>
                            </div>
                            <div className="col-span-3">{producto.precio.toFixed(2)} €</div>
                            <div className="col-span-2 flex justify-center">
                              <div className={`w-10 h-5 rounded-full ${producto.visible ? 'bg-green-500' : 'bg-gray-300'} relative`}>
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 ${producto.visible ? 'right-0.5' : 'left-0.5'} transition-all`}></div>
                              </div>
                            </div>
                            <div className="col-span-2 text-right space-x-2">
                              <button 
                                className="text-gray-600 hover:text-gray-900"
                                onClick={(e) => {
                                  e.stopPropagation(); // Evitar que se propague al padre
                                  openEditModal(menu.id, producto);
                                }}
                              >
                                <PencilIcon className="h-4 w-4 inline" />
                              </button>
                              <button className="text-gray-600 hover:text-red-600">
                                <TrashIcon className="h-4 w-4 inline" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center text-sm text-gray-500">
                          No hay platos en este menú
                        </div>
                      )}
                    </div>

                    {/* Botones para agregar */}
                    <div className="pt-4 space-x-2">
                      <button className="bg-indigo-600 text-white rounded-md px-3 py-1.5 text-xs hover:bg-indigo-700 flex items-center space-x-1 inline-flex">
                        <PlusIcon className="h-3 w-3" />
                        <span>Nuevo plato</span>
                      </button>
                      <button className="bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center space-x-1 inline-flex">
                        <PlusIcon className="h-3 w-3" />
                        <span>Nueva categoría</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel de previsualización móvil - toma 1/4 del espacio */}
      <div className="w-1/4 bg-gray-100 border-l border-gray-200 p-4 flex flex-col">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Previsualización Móvil</h3>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-64 h-[500px] bg-black rounded-xl overflow-hidden shadow-xl border-4 border-gray-800 relative">
            {/* Barra de estado */}
            <div className="h-6 bg-gray-800 w-full flex items-center justify-between px-4">
              <div className="text-white text-[10px]">20:45</div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            {/* Contenido */}
            {selectedMenuForPreview ? (
              <div className="bg-gray-900 text-white h-[calc(100%-6rem)] overflow-y-auto">
                {/* Header */}
                <div className="p-4 flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  <span className="text-sm font-medium">{selectedMenuForPreview.nombre}</span>
                </div>
                
                {/* Filtros */}
                <div className="flex px-3 pb-3 space-x-1">
                  <div className="bg-white text-black rounded-full px-3 py-1 text-xs">Entrantes</div>
                  <div className="bg-gray-700 text-white rounded-full px-3 py-1 text-xs">Principales</div>
                </div>
                
                {/* Sección */}
                <div className="pt-3 pb-2 px-4 bg-black">
                  <h3 className="text-lg font-bold">Entrantes</h3>
                </div>
                
                {/* Productos */}
                <div className="divide-y divide-gray-800">
                  {selectedMenuForPreview.productos.map((producto: Producto) => (
                    <div key={producto.id} className="p-4 flex justify-between">
                      <div className="flex-1 pr-3">
                        <h4 className="font-medium flex items-center space-x-1">
                          <span>{producto.nombre}</span>
                          {producto.visible && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-gray-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          )}
                        </h4>
                        {producto.descripcion && (
                          <p className="text-xs text-gray-400 mt-1">{producto.descripcion}</p>
                        )}
                        <p className="text-sm mt-1">{producto.precio.toFixed(2)} €</p>
                      </div>
                      <div className="w-16 h-16 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                        {producto.imagen && (
                          <img 
                            src={producto.imagen} 
                            alt={producto.nombre}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 text-white h-[calc(100%-6rem)] flex items-center justify-center">
                <p className="text-sm text-gray-400">Selecciona un menú para previsualizar</p>
              </div>
            )}
            
            {/* Barra inferior */}
            <div className="h-18 bg-gray-800 absolute bottom-0 w-full px-4 py-3">
              <div className="bg-white text-black rounded-full text-center py-2 text-xs">
                Valora tu experiencia
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de edición de producto */}
      {isEditModalOpen && currentProducto && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Editar Plato</h3>
                <button 
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="px-6 py-4">
                <div className="mb-4">
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={currentProducto.nombre}
                    onChange={(e) => setCurrentProducto({...currentProducto, nombre: e.target.value})}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={currentProducto.descripcion}
                    onChange={(e) => setCurrentProducto({...currentProducto, descripcion: e.target.value})}
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (€)
                  </label>
                  <input
                    type="number"
                    id="precio"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={currentProducto.precio}
                    onChange={(e) => setCurrentProducto({...currentProducto, precio: parseFloat(e.target.value)})}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen
                  </label>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 mr-3">
                      {currentProducto.imagen && (
                        <img 
                          src={currentProducto.imagen} 
                          alt={currentProducto.nombre}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <button className="bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 text-sm hover:bg-gray-50">
                      Cambiar imagen
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={currentProducto.visible}
                      onChange={(e) => setCurrentProducto({...currentProducto, visible: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-700">Visible en el menú</span>
                  </label>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={closeEditModal}
                  className="bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveProductChanges}
                  className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm hover:bg-indigo-700"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

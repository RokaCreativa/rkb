"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Categoria, Seccion, Producto, Cliente } from '@/app/api/auth/models'

export default function ProductosPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Obtener datos del cliente
        const clienteResponse = await fetch('/api/cliente');
        if (clienteResponse.ok) {
          const clienteData = await clienteResponse.json();
          setCliente(clienteData);
        }
        
        // Obtener categorías y productos
        const categoriasResponse = await fetch('/api/categorias');
        if (categoriasResponse.ok) {
          const categoriasData = await categoriasResponse.json();
          setCategorias(categoriasData);
        } else {
          console.error('Error al cargar categorías:', categoriasResponse.statusText);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Productos
                {cliente?.nombre && (
                  <span className="ml-2 text-lg font-normal text-gray-500">
                    {cliente.nombre}
                  </span>
                )}
              </h1>
              {cliente?.logo && (
                <div className="relative h-8 w-8">
                  <Image 
                    src={`/images/${cliente.logo}`}
                    alt={cliente.nombre || 'Logo'}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
            <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Nuevo Producto
            </button>
          </div>
        </div>
      </header>
      
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 relative z-10">
            {categorias.length > 0 ? (
              categorias.map((categoria) => (
                <div key={categoria.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center gap-4">
                      {categoria.foto ? (
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden shadow-sm">
                          <Image 
                            src={`/images/${categoria.foto}`}
                            alt={categoria.nombre}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {categoria.nombre}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {categoria.totalProductos} productos en total
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-8">
                      {categoria.secciones && categoria.secciones.map((seccion) => (
                        <div key={seccion.id} className="group">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {seccion.foto ? (
                                <div className="relative h-10 w-10 rounded-lg overflow-hidden shadow-sm">
                                  <Image 
                                    src={`/images/${seccion.foto}`}
                                    alt={seccion.nombre}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                  </svg>
                                </div>
                              )}
                              <div>
                                <h3 className="text-base font-medium text-gray-900">
                                  {seccion.nombre}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {seccion.productos?.length || 0} productos
                                </p>
                              </div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                              Añadir Producto
                              <svg className="ml-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>

                          {seccion.productos && seccion.productos.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {seccion.productos.map((producto) => (
                                <div 
                                  key={producto.id}
                                  className="group/item relative bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                                >
                                  {producto.foto ? (
                                    <div className="relative h-48 bg-gray-200">
                                      <Image 
                                        src={`/images/${producto.foto}`}
                                        alt={producto.nombre}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                                      <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                      </svg>
                                    </div>
                                  )}
                                  
                                  <div className="p-4">
                                    <h4 className="text-base font-medium text-gray-900 mb-1">{producto.nombre}</h4>
                                    {producto.descripcion && (
                                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{producto.descripcion}</p>
                                    )}
                                    <div className="flex justify-between items-center">
                                      <span className="text-base font-semibold text-gray-900">{producto.precio.toFixed(2)} €</span>
                                      <div className="flex space-x-2">
                                        <button className="p-1 text-gray-400 hover:text-blue-500">
                                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                          </svg>
                                        </button>
                                        <button className="p-1 text-gray-400 hover:text-red-500">
                                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                              </svg>
                              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                              <p className="mt-1 text-sm text-gray-500">Añade productos a esta sección para empezar.</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay categorías</h3>
                <p className="mt-1 text-sm text-gray-500">Comienza creando una categoría para tus productos.</p>
                <div className="mt-6">
                  <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                    <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    Nueva Categoría
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 
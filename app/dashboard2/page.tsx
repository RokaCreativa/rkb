import { prisma } from '@/lib/prisma'
import type { CategoriaListado } from '@/app/types'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Obtiene la lista de categorías activas para el cliente especificado
 * @returns Promise<CategoriaListado[]>
 */
async function getCategorias(): Promise<CategoriaListado[]> {
  try {
    const CLIENTE_ID = 1; // TODO: Obtener del contexto de autenticación

    const categorias = await prisma.categorias.findMany({
      where: {
        cliente: CLIENTE_ID,
        eliminado: 'N',
        estatus: 'A'
      },
      orderBy: {
        orden: 'asc'
      },
      select: {
        id: true,
        nombre: true,
        foto: true,
        estatus: true,
        orden: true,
        cliente: true,
        registrado: true,
        eliminado: true,
        fecha_eliminacion: true,
        usuario_eliminacion: true,
        ip_eliminacion: true
      }
    });

    return categorias;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }
}

export default async function Dashboard2Page() {
  const categorias = await getCategorias();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              Nueva Categoría
            </button>
          </div>
        </div>
      </header>

      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Stats Section */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Categorías</dt>
                      <dd className="text-lg font-semibold text-gray-900">{categorias.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Categorías Activas</dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {categorias.filter(cat => cat.estatus === 'A').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Última Actualización</dt>
                      <dd className="text-lg font-semibold text-gray-900">Hoy</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h2 className="text-xl font-semibold text-gray-900">Categorías</h2>
                  <p className="mt-2 text-sm text-gray-700">
                    Lista de todas las categorías disponibles en el sistema.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categorias.map((categoria: CategoriaListado) => (
                  <div 
                    key={categoria.id}
                    className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 hover:bg-gray-50 rounded-lg border transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {categoria.foto ? (
                          <img 
                            src={`/images/categories/${categoria.foto}`}
                            alt={categoria.nombre}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/dashboard2/categorias/${categoria.id}`}
                          className="focus:outline-none"
                        >
                          <span className="absolute inset-0" aria-hidden="true" />
                          <p className="text-sm font-medium text-gray-900 truncate">{categoria.nombre}</p>
                          <p className="text-sm text-gray-500 truncate">Orden: {categoria.orden}</p>
                        </Link>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          categoria.estatus === 'A' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {categoria.estatus === 'A' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button className="flex-1 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        Editar
                      </button>
                      <button className="flex-1 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}

                {categorias.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay categorías</h3>
                    <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva categoría.</p>
                    <div className="mt-6">
                      <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
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
          </div>
        </div>
      </main>
    </div>
  );
}
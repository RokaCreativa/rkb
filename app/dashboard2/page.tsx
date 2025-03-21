import prisma from '@/prisma/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { categories } from '@prisma/client'

/**
 * Obtiene la lista de categorías activas para el cliente especificado
 */
async function getCategories() {
  try {
    const CLIENT_ID = 3; // Cliente de prueba (bakery@bakery.com)

    const categories = await prisma.categories.findMany({
      where: {
        client_id: CLIENT_ID,
        deleted: 'N',
        status: true
      },
      orderBy: {
        display_order: 'asc'
      }
    });

    return categories;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }
}

export default async function Dashboard2Page() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold leading-6 text-gray-900">Dashboard (Legacy)</h1>
          <p className="mt-1 text-sm text-gray-500">Vista antigua para pruebas y desarrollo</p>
        </div>
      </header>

      {/* Contenido principal */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Sección de categorías */}
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-lg border-4 border-dashed border-gray-200 p-4">
              <h2 className="text-xl font-bold mb-4">Categorías</h2>
              
              {categories.length === 0 ? (
                <p className="text-gray-500">No hay categorías disponibles</p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {categories.map((category) => (
                    <div 
                      key={category.id} 
                      className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-40 w-full bg-gray-200">
                        {category.image ? (
                          <Image
                            src={`/images/categories/${category.image}`}
                            alt={category.name || ''}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-gray-400">Sin imagen</span>
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-4">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{category.name}</h3>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="mr-2">Orden:</span>
                          <span className="font-medium">{category.display_order}</span>
                      </div>
                        <div className="mt-2 flex items-center text-sm">
                          <span className="mr-2">Estado:</span>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            category.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {category.status ? 'Activo' : 'Inactivo'}
                        </span>
                        </div>
                    </div>
                  </div>
                ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
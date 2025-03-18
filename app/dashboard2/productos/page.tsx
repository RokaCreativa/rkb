import { prisma } from '@/lib/prisma'
import type { CategoriaConSecciones, Seccion, Cliente } from '@/app/types'
import type { productos } from '@prisma/client'
import { Prisma } from '@prisma/client'

type AlergenoRow = {
  id_producto: number;
  id: number;
  nombre: string;
  icono: string;
  orden: number | null;
}

type ProductoConAlergenos = productos & {
  alergenos: Array<{
    id: number;
    nombre: string;
    icono: string;
    orden: number | null;
  }>;
};

async function getClienteInfo(clienteId: number): Promise<Cliente | null> {
  try {
    const cliente = await prisma.clientes.findFirst({
      where: {
        cliente: clienteId
      },
      select: {
        cliente: true,
        nombre: true,
        foto_qr: true,
        imagen_fondo_menu: true
      }
    });

    if (cliente && cliente.nombre) {
      return {
        cliente: cliente.cliente,
        nombre: cliente.nombre,
        qr: cliente.foto_qr || undefined,
        fondo_menu: cliente.imagen_fondo_menu || undefined
      };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener información del cliente:', error);
    return null;
  }
}

async function getProductosConCategoriasYSecciones(clienteId: number) {
  try {
    // Obtener información del cliente
    const cliente = await getClienteInfo(clienteId);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // 1. Obtener categorías
    const categorias = await prisma.categorias.findMany({
      where: {
        cliente: clienteId,
        eliminado: 'N',
        estatus: 'A'
      },
      select: {
        id: true,
        nombre: true,
        foto: true,
        estatus: true,
        orden: true,
        cliente: true
      },
      orderBy: {
        orden: 'asc'
      }
    });

    // 2. Para cada categoría, obtener sus secciones y productos
    const categoriasConSecciones = await Promise.all(
      categorias.map(async (categoria) => {
        const secciones = await prisma.secciones.findMany({
          where: {
            cliente: clienteId,
            categoria: categoria.id,
            estatus: 'A'
          },
          select: {
            id: true,
            nombre: true,
            foto: true,
            estatus: true,
            orden: true
          },
          orderBy: {
            orden: 'asc'
          }
        });

        // 3. Para cada sección, obtener sus productos
        const seccionesConProductos = await Promise.all(
          secciones.map(async (seccion) => {
            const productosSeccion = await prisma.productos_secciones.findMany({
              where: {
                id_seccion: seccion.id
              }
            });

            const productosIds = productosSeccion.map(ps => ps.id_producto);
            
            if (productosIds.length === 0) {
              return {
                ...seccion,
                productos: []
              };
            }

            const productos = await prisma.productos.findMany({
              where: {
                id: {
                  in: productosIds
                },
                cliente: clienteId,
                eliminado: "N",
                estatus: "A"
              },
              include: {
                alergenos_producto: {
                  include: {
                    alergenos: true
                  }
                }
              },
              orderBy: {
                orden: 'asc'
              }
            });

            const productosConAlergenos = productos.map(producto => ({
              ...producto,
              alergenos: producto.alergenos_producto.map(pa => pa.alergenos)
            }));

            return {
              ...seccion,
              productos: productosConAlergenos
            };
          })
        );

        return {
          ...categoria,
          secciones: seccionesConProductos
        };
      })
    );

    return {
      cliente,
      categorias: categoriasConSecciones
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      cliente: null,
      categorias: []
    };
  }
}

export default async function ProductosPage() {
  const CLIENTE_ID = 3; // BAKERY
  const { cliente, categorias } = await getProductosConCategoriasYSecciones(CLIENTE_ID);

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
                <img 
                  src={`/images/${cliente.logo}`}
                  alt={cliente.nombre || 'Logo'}
                  className="h-8 w-auto object-contain"
                />
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

      {cliente?.fondo_menu && (
        <div 
          className="fixed inset-0 z-0 opacity-5" 
          style={{
            backgroundImage: `url(/images/${cliente.fondo_menu})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            pointerEvents: 'none'
          }}
        />
      )}
      
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 relative z-10">
            {categorias.map((categoria) => (
              <div key={categoria.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="flex items-center gap-4">
                    {categoria.foto ? (
                      <img 
                        src={`/images/categories/${categoria.foto}`}
                        alt={categoria.nombre}
                        className="h-12 w-12 object-cover rounded-lg shadow-sm"
                      />
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
                        {categoria.secciones.reduce((total, seccion) => total + seccion.productos.length, 0)} productos en total
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-8">
                    {categoria.secciones.map((seccion) => (
                      <div key={seccion.id} className="group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {seccion.foto ? (
                              <img 
                                src={`/images/sections/${seccion.foto}`}
                                alt={seccion.nombre}
                                className="h-10 w-10 object-cover rounded-lg shadow-sm"
                              />
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
                                {seccion.productos.length} productos
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

                        {seccion.productos.length > 0 ? (
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {seccion.productos.map((producto: ProductoConAlergenos) => (
                              <div 
                                key={producto.id}
                                className="group/item relative bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                              >
                                {producto.foto ? (
                                  <div className="relative h-48 bg-gray-200">
                                    <img 
                                      src={`/images/products/${producto.foto}`}
                                      alt={producto.nombre}
                                      className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-200" />
                                  </div>
                                ) : (
                                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}

                                <div className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                                      {producto.sku && producto.sku !== 'N/A' && (
                                        <p className="text-sm text-gray-500">SKU: {producto.sku}</p>
                                      )}
                                    </div>
                                    <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      producto.estatus === 'A' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {producto.estatus === 'A' ? 'Activo' : 'Inactivo'}
                                    </span>
                                  </div>
                                  
                                  {producto.descripcion && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                      {producto.descripcion}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-900">
                                      ${producto.precio?.toString() || 'N/A'}
                                    </span>
                                    <span className="text-gray-500">
                                      Orden: {producto.orden}
                                    </span>
                                  </div>

                                  {producto.alergenos && producto.alergenos.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                                      {producto.alergenos.map((alergeno) => (
                                        <div 
                                          key={alergeno.id}
                                          className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs"
                                          title={alergeno.nombre}
                                        >
                                          <img 
                                            src={`/images/icons/${alergeno.icono}`}
                                            alt={alergeno.nombre}
                                            className="w-3 h-3"
                                          />
                                          <span className="text-gray-700">{alergeno.nombre}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-200" />
                                
                                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 p-4 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                                  <button className="inline-flex items-center rounded-md bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                    Editar
                                  </button>
                                  <button className="inline-flex items-center rounded-md bg-white px-2 py-1 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                            <p className="mt-1 text-sm text-gray-500">Comienza añadiendo productos a esta sección.</p>
                          </div>
                        )}
                      </div>
                    ))}

                    {categoria.secciones.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay secciones</h3>
                        <p className="mt-1 text-sm text-gray-500">Comienza creando una sección en esta categoría.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {categorias.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay categorías disponibles</h3>
                <p className="mt-1 text-sm text-gray-500">Comienza creando una categoría.</p>
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
      </main>
    </div>
  );
}
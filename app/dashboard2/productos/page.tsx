import { prisma } from '@/lib/prisma'
import type { CategoriaConSecciones, Seccion, Producto, Cliente } from '@/app/types'
import Image from 'next/image'

async function getClienteInfo(clienteId: number): Promise<Cliente | null> {
  try {
    const cliente = await prisma.clientes.findFirst({
      where: {
        cliente: clienteId
      },
      select: {
        cliente: true,
        nombre: true,
        comp_logo: true
      }
    });

    if (cliente) {
      return {
        cliente: cliente.cliente,
        nombre: cliente.nombre,
        comp_logo: cliente.comp_logo
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

            const productos = await prisma.productos.findMany({
              where: {
                id: {
                  in: productosSeccion.map(ps => ps.id_producto)
                },
                cliente: clienteId,
                eliminado: 'N',
                estatus: 'A'
              },
              select: {
                id: true,
                nombre: true,
                foto: true,
                precio: true,
                sku: true,
                descripcion: true,
                estatus: true,
                orden: true
              },
              orderBy: {
                orden: 'asc'
              }
            });

            // Agregar console.log para depurar
            console.log('Productos encontrados:', productos);

            return {
              ...seccion,
              productos
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
  const CLIENTE_ID = 3; // BAKERY - Esto deberá venir del usuario logueado
  const { cliente, categorias } = await getProductosConCategoriasYSecciones(CLIENTE_ID);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Productos por Categoría
          {cliente?.nombre && <span className="ml-2 text-gray-500">- {cliente.nombre}</span>}
        </h1>
        {cliente?.comp_logo && (
          <img 
            src={cliente.comp_logo} 
            alt={cliente.nombre || 'Logo'} 
            className="h-12 w-auto object-contain"
          />
        )}
      </div>
      
      <div className="space-y-8">
        {categorias.map((categoria) => (
          <div key={categoria.id} className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                {categoria.foto && (
                  <img 
                    src={`/images/categories/${categoria.foto}`}
                    alt={categoria.nombre}
                    className="h-16 w-16 object-cover rounded"
                  />
                )}
                <h2 className="text-xl font-semibold">
                  {categoria.nombre}
                </h2>
              </div>
              
              <div className="space-y-6">
                {categoria.secciones.map((seccion) => (
                  <div key={seccion.id} className="border-t pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      {seccion.foto && (
                        <img 
                          src={`/images/sections/${seccion.foto}`}
                          alt={seccion.nombre}
                          className="h-12 w-12 object-cover rounded"
                        />
                      )}
                      <h3 className="text-lg font-medium">
                        {seccion.nombre}
                        <span className="ml-2 text-sm text-gray-500">
                          ({seccion.productos.length} productos)
                        </span>
                      </h3>
                    </div>

                    {seccion.productos.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {seccion.productos.map((producto) => (
                          <div 
                            key={producto.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{producto.nombre}</h4>
                                <span className={`px-2 py-1 text-xs rounded ${
                                  producto.estatus === 'A' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {producto.estatus === 'A' ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>
                              
                              {producto.foto && (
                                <img 
                                  src={`/images/products/${producto.foto}`}
                                  alt={producto.nombre}
                                  className="w-full h-40 object-cover rounded"
                                />
                              )}
                              
                              <div className="text-sm text-gray-500">
                                <p>SKU: {producto.sku || 'N/A'}</p>
                                <p>Precio: ${producto.precio?.toString() || 'N/A'}</p>
                                <p>Orden: {producto.orden}</p>
                              </div>
                              
                              {producto.descripcion && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {producto.descripcion}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No hay productos en esta sección</p>
                    )}
                  </div>
                ))}

                {categoria.secciones.length === 0 && (
                  <p className="text-gray-500 italic">No hay secciones en esta categoría</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {categorias.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay categorías disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
} 
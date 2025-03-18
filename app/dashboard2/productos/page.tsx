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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Productos por Categoría
          {cliente?.nombre && <span className="ml-2 text-gray-500">- {cliente.nombre}</span>}
        </h1>
        {cliente?.logo && (
          <img 
            src={`/images/${cliente.logo}`}
            alt={cliente.nombre || 'Logo'}
            className="h-12 w-auto object-contain"
          />
        )}
      </div>

      {cliente?.fondo_menu && (
        <div 
          className="fixed inset-0 z-0 opacity-10" 
          style={{
            backgroundImage: `url(/images/${cliente.fondo_menu})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            pointerEvents: 'none'
          }}
        />
      )}
      
      <div className="space-y-8 relative z-10">
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
                        {seccion.productos.map((producto: ProductoConAlergenos) => (
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
                                {producto.sku && producto.sku !== 'N/A' && (
                                  <p>SKU: {producto.sku}</p>
                                )}
                                <p>Precio: ${producto.precio?.toString() || 'N/A'}</p>
                                <p>Orden: {producto.orden}</p>
                              </div>
                              
                              {producto.descripcion && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {producto.descripcion}
                                </p>
                              )}

                              {producto.alergenos && producto.alergenos.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {producto.alergenos.map((alergeno) => (
                                    <div 
                                      key={alergeno.id}
                                      className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs"
                                      title={alergeno.nombre}
                                    >
                                      <img 
                                        src={`/images/icons/${alergeno.icono}`}
                                        alt={alergeno.nombre}
                                        className="w-4 h-4"
                                      />
                                      <span>{alergeno.nombre}</span>
                                    </div>
                                  ))}
                                </div>
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
  );
}
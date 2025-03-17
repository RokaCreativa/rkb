import { prisma } from '@/lib/prisma'

async function getSecciones() {
  try {
    const CLIENTE_ID = 1; // Esto deberá venir del usuario logueado después

    const secciones = await prisma.secciones.findMany({
      where: {
        cliente: CLIENTE_ID,
        eliminado: 'N',
        estatus: 'A'
      },
      orderBy: {
        orden: 'asc'
      }
    });

    // Obtener los productos de cada sección
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
            cliente: CLIENTE_ID,
            eliminado: 'N',
            estatus: 'A'
          }
        });

        return {
          ...seccion,
          productos
        };
      })
    );

    return seccionesConProductos;
  } catch (error) {
    console.error('Error al obtener secciones:', error);
    return [];
  }
}

export default async function SeccionesPage() {
  const secciones = await getSecciones();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Secciones</h1>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="grid gap-4">
            {secciones.map((seccion) => (
              <div 
                key={seccion.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{seccion.nombre}</h3>
                    <p className="text-sm text-gray-500">
                      Orden: {seccion.orden}
                      {seccion.categoria && 
                        <span className="ml-2">| Categoría: {seccion.categoria}</span>
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      Productos: {seccion.productos.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {seccion.foto && (
                      <img 
                        src={seccion.foto} 
                        alt={seccion.nombre}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <span className={`px-2 py-1 text-xs rounded ${
                      seccion.estatus === 'A' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {seccion.estatus === 'A' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {secciones.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay secciones disponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
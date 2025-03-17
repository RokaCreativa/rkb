import { prisma } from '@/lib/prisma'
import type { CategoriaListado } from '@/app/types'

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard 2 (Versión de prueba)</h1>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Categorías</h2>
          <div className="grid gap-4">
            {categorias.map((categoria: CategoriaListado) => (
              <div 
                key={categoria.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{categoria.nombre}</h3>
                    <p className="text-sm text-gray-500">Orden: {categoria.orden}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {categoria.foto && (
                      <img 
                        src={`/images/${categoria.foto}`} 
                        alt={categoria.nombre}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <span className={`px-2 py-1 text-xs rounded ${
                      categoria.estatus === 'A' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {categoria.estatus === 'A' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {categorias.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No hay categorías disponibles
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
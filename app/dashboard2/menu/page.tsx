import { prisma } from '@/lib/prisma';

async function getClienteInfo(clienteId: number) {
  try {
    const cliente = await prisma.clientes.findFirst({
      where: {
        cliente: clienteId
      },
      select: {
        cliente: true,
        nombre: true,
        menu_type: true
      }
    });
    return cliente;
  } catch (error) {
    console.error('Error al obtener información del cliente:', error);
    return null;
  }
}

export default async function MenuPage() {
  const clienteId = 3; // Por ahora hardcodeado
  const cliente = await getClienteInfo(clienteId);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Menú del Cliente</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        {cliente ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Cliente: {cliente.nombre}</h2>
              <p className="text-gray-600">
                Tipo de menú: {cliente.menu_type || 'No especificado'}
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Enlaces del Menú</h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  URL del menú digital: <a href={`/menu/${cliente.cliente}`} className="text-blue-600 hover:underline" target="_blank">Ver menú</a>
                </p>
                <p className="text-gray-600">
                  URL del menú para compartir: <a href={`/share/${cliente.cliente}`} className="text-blue-600 hover:underline" target="_blank">Compartir menú</a>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">No se encontró información del cliente</p>
        )}
      </div>
    </div>
  );
} 
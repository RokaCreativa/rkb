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
        comp_logo: true
      }
    });
    return cliente;
  } catch (error) {
    console.error('Error al obtener información del cliente:', error);
    return null;
  }
}

export default async function LogoPage() {
  const clienteId = 3; // Por ahora hardcodeado
  const cliente = await getClienteInfo(clienteId);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Logo del Cliente</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Cliente: {cliente?.nombre}</h2>
          {cliente?.comp_logo ? (
            <div>
              <img 
                src={`/images/logos/${cliente.comp_logo}`}
                alt={`Logo de ${cliente.nombre}`}
                className="max-w-xs rounded border"
              />
            </div>
          ) : (
            <p className="text-gray-500 italic">No hay logo configurado</p>
          )}
        </div>
      </div>
    </div>
  );
} 
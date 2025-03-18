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
        comp_direccion: true,
        comp_cuenta_instagram_etiq: true,
        comp_whatsup_etiq: true,
        comp_logo: true,
        email: true
      }
    });
    return cliente;
  } catch (error) {
    console.error('Error al obtener información del cliente:', error);
    return null;
  }
}

export default async function ClientePage() {
  const clienteId = 3; // Por ahora hardcodeado
  const cliente = await getClienteInfo(clienteId);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Datos del Cliente</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        {cliente ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <p className="mt-1 text-gray-900">{cliente.nombre || 'No especificado'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{cliente.email || 'No especificado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <p className="mt-1 text-gray-900">{cliente.comp_direccion || 'No especificada'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Instagram</label>
                <p className="mt-1 text-gray-900">{cliente.comp_cuenta_instagram_etiq || 'No especificado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                <p className="mt-1 text-gray-900">{cliente.comp_whatsup_etiq || 'No especificado'}</p>
              </div>

              {cliente.comp_logo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Logo</label>
                  <img 
                    src={`/images/logos/${cliente.comp_logo}`}
                    alt="Logo del cliente"
                    className="mt-1 h-20 w-auto object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">No se encontró información del cliente</p>
        )}
      </div>
    </div>
  );
} 
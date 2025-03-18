import { prisma } from '@/lib/prisma'

async function getClienteData() {
  const cliente = await prisma.clientes.findFirst();
  return cliente;
}

export default async function FotosPage() {
  const cliente = await getClienteData();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Logo del Cliente</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Logo actual</h2>
          {cliente?.logo ? (
            <div className="relative w-48 h-48 border rounded-lg overflow-hidden">
              <img 
                src={`/images/avatars/${cliente.logo}`}
                alt={`Logo de ${cliente.nombre}`}
                className="object-contain w-full h-full"
              />
            </div>
          ) : (
            <div className="text-gray-500">No hay logo cargado</div>
          )}
        </div>
      </div>
    </div>
  )
} 
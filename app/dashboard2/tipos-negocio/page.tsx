import { prisma } from '@/lib/prisma'

async function getData() {
  const cliente = await prisma.clientes.findFirst({
    select: {
      cliente: true,
      nombre: true,
      tipo: true
    }
  });

  const tiposNegocio = await prisma.$queryRaw`SELECT * FROM rokamenu_dbv1.tipo_negocio`;
  
  return { cliente, tiposNegocio };
}

export default async function TiposNegocioPage() {
  const { cliente, tiposNegocio } = await getData();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tipo de Negocio</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Seleccione el tipo de negocio</h2>
          <select 
            className="w-full p-2 border rounded-lg"
            defaultValue={cliente?.tipo || ''}
          >
            <option value="">Seleccione...</option>
            {Array.isArray(tiposNegocio) && tiposNegocio.map((tipo: any) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.descripcion}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
} 
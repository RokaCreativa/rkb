import { prisma } from '@/lib/prisma'

async function getClienteData() {
  const cliente = await prisma.clientes.findFirst({
    select: {
      cliente: true,
      nombre: true,
      moneda: true
    }
  });
  return cliente;
}

export default async function MonedasPage() {
  const cliente = await getClienteData();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Moneda</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Seleccione la moneda</h2>
          <select 
            className="w-full p-2 border rounded-lg"
            defaultValue={cliente?.moneda || ''}
          >
            <option value="">Seleccione...</option>
            <option value="USD">Dólar Estadounidense (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="VES">Bolívar Venezolano (VES)</option>
            <option value="COP">Peso Colombiano (COP)</option>
          </select>
        </div>
      </div>
    </div>
  )
} 
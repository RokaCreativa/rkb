import { prisma } from '@/lib/prisma'

export default async function AlergenosPage() {
  const alergenos = await prisma.alergenos.findMany({
    orderBy: {
      orden: 'asc'
    }
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Alérgenos</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {alergenos.map((alergeno) => (
          <div 
            key={alergeno.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <img 
                src={`/images/icons/${alergeno.icono}`}
                alt={alergeno.nombre}
                className="w-8 h-8"
              />
              <div>
                <h3 className="font-medium">{alergeno.nombre}</h3>
                <p className="text-sm text-gray-500">Orden: {alergeno.orden || 'No definido'}</p>
              </div>
            </div>
          </div>
        ))}

        {alergenos.length === 0 && (
          <p className="text-gray-500 italic col-span-full text-center py-8">
            No hay alérgenos registrados
          </p>
        )}
      </div>
    </div>
  )
} 
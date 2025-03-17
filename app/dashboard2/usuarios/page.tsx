import { prisma } from '@/lib/prisma'

async function getUsuarios() {
  try {
    const CLIENTE_ID = 1; // Esto deberá venir del usuario logueado después

    const usuarios = await prisma.usuarios.findMany({
      where: {
        cliente: CLIENTE_ID,
        us_estatus: 'A'
      },
      include: {
        roles: true
      }
    });

    return usuarios;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
}

export default async function UsuariosPage() {
  const usuarios = await getUsuarios();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Usuarios</h1>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="grid gap-4">
            {usuarios.map((usuario) => (
              <div 
                key={usuario.us_cd_usuario}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {usuario.us_nombreusuario}
                      {usuario.nombre && <span className="ml-2 text-gray-500">({usuario.nombre})</span>}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Email: {usuario.us_email || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Rol: {usuario.roles?.nombre || 'Sin rol asignado'}
                      {usuario.cargo && <span className="ml-2">| Cargo: {usuario.cargo}</span>}
                    </p>
                    {usuario.whatsapp && (
                      <p className="text-sm text-gray-500">
                        WhatsApp: {usuario.whatsapp}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {usuario.us_avatar && (
                      <img 
                        src={usuario.us_avatar}
                        alt={usuario.us_nombreusuario}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    )}
                    <span className={`px-2 py-1 text-xs rounded ${
                      usuario.us_estatus === 'A' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.us_estatus === 'A' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {usuarios.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay usuarios disponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
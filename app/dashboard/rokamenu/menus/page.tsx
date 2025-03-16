import { prisma } from '@/lib/prisma';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function MenusPage() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      redirect('/auth/signin');
    }

    // Obtener el usuario y su compañía usando la sintaxis correcta de Prisma
    const userWithCompany = await prisma.$queryRaw`
      SELECT u.*, c.name as company_name 
      FROM User u 
      JOIN Company c ON u.companyId = c.id 
      WHERE u.email = ${session.user.email}
    `;

    if (!userWithCompany || !(userWithCompany as any[])[0]) {
      throw new Error('Usuario no encontrado o no tiene una compañía asignada');
    }

    const user = (userWithCompany as any[])[0];

    const categorias = await prisma.$queryRaw`
      SELECT c.*, COUNT(p.id) as producto_count 
      FROM categorias c 
      LEFT JOIN productos p ON c.id = p.categoria_id AND p.eliminado = 'N'
      WHERE c.eliminado = 'N' AND c.estatus = 'A' AND c.compania = ${user.companyId}
      GROUP BY c.id
      ORDER BY c.orden ASC
    `;

    if (!categorias || (categorias as any[]).length === 0) {
      return (
        <div className="text-center">
          <p>No hay categorías disponibles</p>
        </div>
      );
    }

    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Categorías</h1>
            <p className="text-gray-600">{user.company_name}</p>
          </div>
          <Link 
            href="/dashboard/rokamenu/menus/nueva-categoria"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <span>Nueva Categoría</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(categorias as any[]).map((categoria) => (
            <div key={categoria.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{categoria.nombre}</h2>
                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/rokamenu/menus/${categoria.id}/edit`}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <Pencil className="h-5 w-5" />
                  </Link>
                  <button className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {categoria.foto && (
                <img
                  src={`/uploads/${categoria.foto}`}
                  alt={categoria.nombre}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <div className="text-sm text-gray-600">
                <p>Productos: {categoria.producto_count}</p>
                <p>Orden: {categoria.orden}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error al cargar las categorías:', error);
    return (
      <div className="text-center text-red-500">
        Error al cargar los menús. Por favor, intenta de nuevo más tarde.
      </div>
    );
  }
} 
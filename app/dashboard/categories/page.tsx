import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface CategoriaWithProductos {
  id: number;
  nombre: string;
  foto: string | null;
  estatus: string;
  orden: number;
  compania: number;
  productos: {
    id: number;
    nombre: string;
    estatus: string;
    eliminado: string;
  }[];
}

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.usuarios.findFirst({
    where: { 
      us_email: session.user.email 
    }
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const userCompany = await prisma.usuarios_has_empresas.findFirst({
    where: {
      us_cd_usuario: user.us_cd_usuario,
    },
    include: {
      empresas: true,
    },
  });

  if (!userCompany?.empresas) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">No tienes acceso a esta página</h1>
        <p>No estás asociado a ninguna compañía.</p>
      </div>
    );
  }

  const categories = await prisma.categorias.findMany({
    where: {
      compania: userCompany.empresas.id,
      eliminado: "N",
      estatus: "A"
    },
    orderBy: {
      orden: 'asc'
    },
    include: {
      productos: {
        where: {
          eliminado: "N",
          estatus: "A"
        },
        select: {
          id: true,
          nombre: true,
          estatus: true,
          eliminado: true
        }
      }
    }
  }) as unknown as CategoriaWithProductos[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Link
          href="/dashboard/categories/new"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay categorías disponibles.</p>
          <p className="text-gray-500">Crea una nueva categoría para empezar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                {category.foto ? (
                  <Image
                    src={category.foto}
                    alt={category.nombre}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{category.nombre}</h2>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/categories/${category.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={async () => {
                        if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
                          await fetch(`/api/categories/${category.id}`, {
                            method: "DELETE",
                          });
                          window.location.reload();
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{category.productos.length} productos</span>
                  <span>Orden: {category.orden}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/prisma/prisma";
import { CategoryForm } from "@/components/CategoryForm";

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  // Buscar usuario por email
  const user = await prisma.users.findFirst({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  // Obtener detalles del cliente asociado al usuario
  const client = await prisma.clients.findFirst({
    where: {
      client_id: user.client_id || 0,
    },
  });

  if (!client) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">
          No tienes acceso a esta sección.
        </p>
      </div>
    );
  }

  // Obtener la categoría a editar
  const categoryData = await prisma.categories.findFirst({
    where: {
      id: parseInt(params.id),
      client_id: client.client_id,
      deleted: "N",
    },
  });

  if (!categoryData) {
    redirect("/dashboard/categories");
  }

  // Adaptar los datos al formato esperado por CategoryForm
  const category = {
    id: categoryData.id,
    nombre: categoryData.name || "",
    foto: categoryData.image,
    orden: categoryData.display_order || 0
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Editar Categoría</h2>
      </div>
      <div className="grid gap-4">
        <CategoryForm 
          initialData={category} 
          companyId={client.client_id.toString()} 
        />
      </div>
    </div>
  );
} 
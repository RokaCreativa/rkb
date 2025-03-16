import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/CategoryForm";

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await prisma.usuarios.findFirst({
    where: {
      us_cd_usuario: session.user.id,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const userCompany = await prisma.usuarios_has_empresas.findFirst({
    where: {
      us_cd_usuario: user.us_cd_usuario,
    },
    include: {
      empresas: true,
    },
  });

  if (!userCompany?.empresas?.id) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">
          No tienes acceso a esta sección.
        </p>
      </div>
    );
  }

  const category = await prisma.categorias.findFirst({
    where: {
      id: parseInt(params.id),
      compania: userCompany.empresas.id,
      eliminado: "N",
    },
  });

  if (!category) {
    redirect("/dashboard/categories");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Editar Categoría</h2>
      </div>
      <div className="grid gap-4">
        <CategoryForm 
          initialData={category} 
          companyId={userCompany.empresas.id} 
        />
      </div>
    </div>
  );
} 
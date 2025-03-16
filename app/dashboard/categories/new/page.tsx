import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryForm from "../_components/CategoryForm";

export default async function NewCategoryPage() {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Nueva Categoría</h1>
      <CategoryForm companyId={userCompany.empresas.id.toString()} />
    </div>
  );
} 
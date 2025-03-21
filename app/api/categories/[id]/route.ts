import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/prisma/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
    });

    if (!user?.client_id) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    const categoryId = parseInt(params.id);
    
    // Verificar que la categoría exista y pertenezca al cliente
    const existingCategory = await prisma.categories.findFirst({
      where: {
        id: categoryId,
        client_id: user.client_id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    // Obtener los datos del body
    const data = await request.json();
    
    // Actualizar la categoría
    const updatedCategory = await prisma.categories.update({
      where: {
        id: categoryId,
      },
      data: {
        // Actualizar display_order si está definido
        ...(data.display_order !== undefined && { display_order: data.display_order }),
        // Actualizar status si está definido (convertir de número a booleano para el modelo Prisma)
        ...(data.status !== undefined && { status: data.status === 1 }),
        // Permitir actualizar otros campos si se proporcionan
        ...(data.name !== undefined && { name: data.name }),
        ...(data.image !== undefined && { image: data.image }),
      },
    });

    // Convertir el status a formato numérico para la respuesta
    return NextResponse.json({
      ...updatedCategory,
      status: updatedCategory.status ? 1 : 0,
    });
  } catch (error) {
    console.error('Error al actualizar la categoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Usando cliente ID fijo para pruebas
    const CLIENT_ID = 3;
    
    const categoryId = parseInt(params.id);

    // Verificar que la categoría existe
    const existingCategory = await prisma.categories.findFirst({
      where: {
        id: categoryId,
        client_id: CLIENT_ID,
        deleted: "N"
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    // Soft delete
    const category = await prisma.categories.update({
      where: { id: categoryId },
      data: {
        deleted: "S",
        deleted_at: new Date().toISOString(),
        deleted_by: "sistema",
        deleted_ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return NextResponse.json(
      { error: "Error al eliminar categoría" },
      { status: 500 }
    );
  }
} 
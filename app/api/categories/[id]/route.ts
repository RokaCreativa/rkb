import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { company: true }
    });

    if (!user?.company) {
      return NextResponse.json(
        { error: "Usuario no asociado a una compañía" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const categoryId = parseInt(params.id);

    // Verificar que la categoría pertenece a la compañía del usuario
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        companyId: user.company.id,
        deleted: "N"
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...data,
        companyId: user.company.id
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return NextResponse.json(
      { error: "Error al actualizar categoría" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { company: true }
    });

    if (!user?.company) {
      return NextResponse.json(
        { error: "Usuario no asociado a una compañía" },
        { status: 400 }
      );
    }

    const categoryId = parseInt(params.id);

    // Verificar que la categoría pertenece a la compañía del usuario
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        companyId: user.company.id,
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
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        deleted: "S",
        deletedAt: new Date().toISOString(),
        deletedBy: session.user.email,
        deletedIp: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
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
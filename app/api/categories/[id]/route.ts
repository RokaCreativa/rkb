import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/prisma/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Usando cliente ID fijo para pruebas
    const CLIENT_ID = 3;
    
    const data = await request.json();
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

    // Actualizar la categoría
    const category = await prisma.categories.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        image: data.image,
        display_order: data.display_order,
        status: data.status
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
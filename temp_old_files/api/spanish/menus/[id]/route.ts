import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const menu = await prisma.menu.findFirst({
      where: {
        id: parseInt(params.id),
        userId: session.user.id,
        isActive: true,
      },
      include: {
        sections: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            products: {
              where: { isActive: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error al obtener menú:", error);
    return NextResponse.json(
      { error: "Error al obtener menú" },
      { status: 500 }
    );
  }
} 
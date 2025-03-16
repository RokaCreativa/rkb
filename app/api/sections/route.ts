import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET /api/sections?menuId=X
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get("menuId");

    if (!menuId) {
      return NextResponse.json(
        { error: "menuId es requerido" },
        { status: 400 }
      );
    }

    const sections = await prisma.section.findMany({
      where: {
        menuId: parseInt(menuId),
        isActive: true,
        menu: {
          userId: session.user.id,
        },
      },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error("Error al obtener secciones:", error);
    return NextResponse.json(
      { error: "Error al obtener las secciones" },
      { status: 500 }
    );
  }
}

// POST /api/sections
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
    
    // Verificar que el menú pertenece al usuario
    const menu = await prisma.menu.findFirst({
      where: {
        id: data.menuId,
        userId: session.user.id,
      },
    });

    if (!menu) {
      return NextResponse.json(
        { error: "Menú no encontrado" },
        { status: 404 }
      );
    }

    // Obtener el último orden
    const lastSection = await prisma.section.findFirst({
      where: {
        menuId: data.menuId,
        isActive: true,
      },
      orderBy: {
        order: "desc",
      },
    });

    const section = await prisma.section.create({
      data: {
        ...data,
        order: lastSection ? lastSection.order + 1 : 1,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("Error al crear sección:", error);
    return NextResponse.json(
      { error: "Error al crear la sección" },
      { status: 500 }
    );
  }
}

// PUT /api/sections
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id, ...data } = await request.json();
    
    // Verificar que la sección pertenece a un menú del usuario
    const section = await prisma.section.findFirst({
      where: {
        id,
        menu: {
          userId: session.user.id,
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Sección no encontrada" },
        { status: 404 }
      );
    }

    const updatedSection = await prisma.section.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error("Error al actualizar sección:", error);
    return NextResponse.json(
      { error: "Error al actualizar la sección" },
      { status: 500 }
    );
  }
}

// DELETE /api/sections
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await request.json();
    
    // Verificar que la sección pertenece a un menú del usuario
    const section = await prisma.section.findFirst({
      where: {
        id,
        menu: {
          userId: session.user.id,
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Sección no encontrada" },
        { status: 404 }
      );
    }

    await prisma.section.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar sección:", error);
    return NextResponse.json(
      { error: "Error al eliminar la sección" },
      { status: 500 }
    );
  }
} 
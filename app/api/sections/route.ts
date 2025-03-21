import { NextRequest, NextResponse } from "next/server";
import prisma from '@/prisma/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// Interfaz para los datos de sección procesados
interface FormattedSection {
  id: number;
  name: string | null;
  image: string | null;
  display_order: number | null;
  status: boolean;
  client_id: number;
  category_id: number;
  products: Array<{
    id: number;
    name: string | null;
    image: string | null;
    price: Prisma.Decimal | null;
    description: string | null;
  }>;
}

// Interfaz para secciones procesadas en la respuesta del API
interface ProcessedSection {
  section_id: number;
  name: string;
  image: string | null;
  status: number; // 1 o 0
  display_order: number;
  client_id: number;
  category_id: number;
}

// GET /api/sections?categoryId=X
export async function GET(request: NextRequest) {
  try {
    // Cliente fijo para pruebas
    const CLIENT_ID = 3;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        { error: "categoryId es requerido" },
        { status: 400 }
      );
    }

    // Obtener secciones con sus relaciones
    const sections = await prisma.sections.findMany({
      where: {
        category_id: parseInt(categoryId),
        status: true,
        deleted: "N",
        client_id: CLIENT_ID
      },
      include: {
        products_sections: {
          include: {
            products: true
          }
        }
      },
      orderBy: {
        display_order: "asc",
      },
    });

    // Transformar los datos a un formato más amigable
    const formattedSections: FormattedSection[] = sections.map(section => {
      // Productos filtrados por estado activo
      const filteredProducts = section.products_sections
        .filter(ps => ps.products && ps.products.status && ps.products.deleted === "N")
        .map(ps => ({
          id: ps.products.id,
          name: ps.products.name,
          image: ps.products.image,
          price: ps.products.price,
          description: ps.products.description
        }));

      return {
        id: section.id,
        name: section.name,
        image: section.image,
        display_order: section.display_order,
        status: section.status,
        client_id: section.client_id ?? 0,
        category_id: section.category_id ?? 0,
        products: filteredProducts
      };
    });

    const processedSections: ProcessedSection[] = formattedSections.map(section => ({
      section_id: section.id,
      name: section.name || '',
      image: section.image,
      status: section.status ? 1 : 0,
      display_order: section.display_order || 0,
      client_id: section.client_id ?? 0,
      category_id: section.category_id ?? 0,
    }));

    return NextResponse.json(processedSections);
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
    // Cliente fijo para pruebas
    const CLIENT_ID = 3;

    const data = await request.json();
    
    // Validaciones básicas
    if (!data.name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    if (!data.category_id) {
      return NextResponse.json(
        { error: "La categoría es requerida" },
        { status: 400 }
      );
    }

    // Crear sección
    const section = await prisma.sections.create({
      data: {
        name: data.name,
        image: data.image,
        status: true,
        display_order: data.display_order || 0,
        category_id: parseInt(data.category_id),
        client_id: CLIENT_ID,
        registered_at: new Date(),
        deleted: "N"
      }
    });

    // Procesar la sección creada para la respuesta
    const processedSection: ProcessedSection = {
      section_id: section.id,
      name: section.name || '',
      image: section.image,
      status: section.status ? 1 : 0,
      display_order: section.display_order || 0,
      client_id: section.client_id ?? 0,
      category_id: section.category_id ?? 0,
    };

    return NextResponse.json(processedSection);
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

    const { section_id, ...data } = await request.json();
    
    // Verificar que la sección existe
    const section = await prisma.sections.findFirst({
      where: {
        id: section_id,
        client_id: 3, // Cliente fijo para pruebas
        deleted: "N"
      }
    });

    if (!section) {
      return NextResponse.json(
        { error: "Sección no encontrada" },
        { status: 404 }
      );
    }

    const updatedSection = await prisma.sections.update({
      where: { id: section_id },
      data: {
        name: data.name,
        image: data.image,
        display_order: data.display_order,
        status: data.status
      }
    });

    if (!updatedSection) {
      return NextResponse.json({ error: 'No se pudo actualizar la sección' }, { status: 404 });
    }

    const processedSection: ProcessedSection = {
      section_id: updatedSection.id,
      name: updatedSection.name || '',
      image: updatedSection.image,
      status: updatedSection.status ? 1 : 0,
      display_order: updatedSection.display_order || 0,
      client_id: updatedSection.client_id ?? 0,
      category_id: updatedSection.category_id ?? 0,
    };

    return NextResponse.json(processedSection);
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
    
    // Verificar que la sección existe
    const section = await prisma.sections.findFirst({
      where: {
        id: id,
        client_id: 3, // Cliente fijo para pruebas
        deleted: "N"
      }
    });

    if (!section) {
      return NextResponse.json(
        { error: "Sección no encontrada" },
        { status: 404 }
      );
    }

    // Soft delete - marcar como eliminado en lugar de eliminar físicamente
    await prisma.sections.update({
      where: { id: id },
      data: {
        deleted: "S",
        deleted_at: new Date().toISOString(),
        deleted_by: session.user.email || "sistema",
        deleted_ip: "127.0.0.1" // IP ficticia para pruebas
      }
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
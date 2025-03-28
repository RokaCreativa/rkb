import { NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'ID de categoría inválido' },
        { status: 400 }
      );
    }

    // Primero obtener las secciones asociadas a esta categoría
    const sections = await prisma.sections.findMany({
      where: {
        category_id: parseInt(params.id),
        deleted: 0 as any
      }
    });

    // Si no hay secciones, devolver array vacío
    if (!sections.length) {
      return NextResponse.json([]);
    }

    // Extraer los IDs de las secciones
    const sectionIds = sections.map(section => section.section_id);

    // Consulta para obtener productos por sección
    const products = await prisma.products_sections.findMany({
      where: {
        section_id: { in: sectionIds },
        products: {
          deleted: 0 as any,
        }
      },
      include: {
        sections: true,
        products: true
      }
    });

    // Obtener productos únicos y ordenarlos
    const uniqueProducts = Array.from(
      new Set(products.map(ps => ps.product_id))
    ).map(productId => {
      const productSection = products.find(ps => ps.product_id === productId);
      return productSection?.products;
    }).filter((product): product is NonNullable<typeof product> => product !== null && product !== undefined)
    .sort((a, b) => {
      const orderA = a.display_order || 0;
      const orderB = b.display_order || 0;
      return orderA - orderB;
    });

    return NextResponse.json(uniqueProducts);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    );
  }
} 
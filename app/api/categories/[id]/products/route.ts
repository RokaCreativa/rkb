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
        category_id: categoryId,
        status: true,
        deleted: 'N'
      }
    });

    const sectionIds = sections.map(section => section.id);

    // Luego obtener los productos asociados a estas secciones
    const products = await prisma.products.findMany({
      where: {
        status: true,
        deleted: 'N',
        products_sections: {
          some: {
            section_id: {
              in: sectionIds
            }
          }
        }
      },
      orderBy: {
        display_order: 'asc'
      },
      include: {
        products_sections: {
          include: {
            sections: true
          }
        }
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    );
  }
} 
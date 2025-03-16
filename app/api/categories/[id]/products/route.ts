import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    const products = await prisma.producto.findMany({
      where: {
        categoria_id: categoryId,
        estatus: 'A',
        eliminado: 'N'
      },
      orderBy: {
        orden: 'asc'
      },
      include: {
        alergenos: {
          include: {
            alergeno: true
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
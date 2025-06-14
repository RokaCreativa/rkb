import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * Maneja la solicitud GET para obtener todos los productos de una sección específica
 * 
 * @param request - Objeto de solicitud HTTP
 * @param params - Parámetros de la ruta, incluye el ID de la sección
 * @returns Respuesta HTTP con los productos de la sección solicitada
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Obtener el ID de sección de los parámetros de ruta
    const sectionId = parseInt(params.id);
    
    // Verificar que el ID de sección es un número válido
    if (isNaN(sectionId)) {
      return NextResponse.json(
        { error: 'ID de sección inválido' },
        { status: 400 }
      );
    }
    
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Buscar la sección para verificar que existe
    const section = await prisma.sections.findUnique({
      where: {
        section_id: sectionId
      }
    });
    
    if (!section) {
      return NextResponse.json(
        { error: 'Sección no encontrada' },
        { status: 404 }
      );
    }
    
    // Obtener todos los productos asociados a esta sección a través de la tabla de relación
    const productRelations = await prisma.products_sections.findMany({
      where: {
        section_id: sectionId
      },
      include: {
        products: true
      }
    });
    
    // Extraer solo los productos de las relaciones
    const products = productRelations
      .map(relation => relation.products)
      // Filtrar para excluir productos eliminados
      .(product => product.deleted === 0);
    
    // Ordenar productos por su orden de visualización
    products.sort((a, b) => {
      const orderA = a.display_order || 999;
      const orderB = b.display_order || 999;
      return orderA - orderB;
    });
    
    // Devolver los productos encontrados
    return NextResponse.json(products);
    
  } catch (error) {
    console.error('Error al obtener productos de sección:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 
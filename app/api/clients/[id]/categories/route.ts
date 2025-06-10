/**
 * @fileoverview API Route for Fetching Categories by Client ID
 * @description This route retrieves all categories associated with a specific client ID.
 * @module app/api/clients/[id]/categories/route
 */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const IMAGE_BASE_PATH = '/images/categories/';

/**
 * Endpoint para obtener categorías por cliente
 * Este endpoint es un adaptador para mantener compatibilidad con el hook useCategories
 * mientras reutiliza la lógica existente del endpoint principal de categorías
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = parseInt(params.id);

    if (isNaN(clientId)) {
      return NextResponse.json(
        { error: 'ID de cliente inválido' },
        { status: 400 }
      );
    }

    // Consultar todas las categorías que no están borradas para este cliente
    const categories = await prisma.categories.findMany({
      where: {
        client_id: clientId,
        deleted: {
          not: 1
        } as any
      },
      orderBy: {
        display_order: 'asc'
      }
    });

    // Transformar los datos para el frontend
    const formattedCategories = categories.map(category => ({
      category_id: category.category_id,
      name: category.name || '',
      image: category.image ? `${IMAGE_BASE_PATH}${category.image}` : null,
      status: category.status ? 1 : 0,
      display_order: category.display_order || 0,
      client_id: category.client_id || 0
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
} 
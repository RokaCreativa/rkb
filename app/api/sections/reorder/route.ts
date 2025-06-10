/**
 * @fileoverview API Route for Reordering Sections
 * @description Handles bulk updates to the display order of sections.
 * @module app/api/sections/reorder/route
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma/prisma';

interface Section {
  id: number;
  order: number;
}

/**
 * API para reordenar secciones
 * Maneja las solicitudes POST para actualizar el orden de múltiples secciones a la vez
 * 
 * @route POST /api/sections/reorder
 * @returns NextResponse con los resultados actualizados o un mensaje de error
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body || !body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json({ error: 'Invalid request format. Expected sections array.' }, { status: 400 });
    }

    const sections: Section[] = body.sections;

    console.log('Reordenando secciones:', sections);

    // Aquí iría la lógica para actualizar las secciones en la base de datos

    // Ejemplo de implementación (simulado):
    // Construir la consulta SQL o llamada a la API
    const updatePromises = sections.map(section => {
      // Simulamos la actualización 
      console.log(`Actualizando sección ${section.id} a orden ${section.order}`);
      // En un entorno real, aquí irían las llamadas a la base de datos
      return Promise.resolve();
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Sections reordered successfully',
      updated: sections.length
    });

  } catch (error) {
    console.error('Error reordenando secciones:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
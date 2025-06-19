/**
 * @fileoverview API Route for Reordering Sections
 * @description Handles bulk updates to the display order of sections.
 * @module app/api/sections/reorder/route
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma/prisma';

interface SectionReorderItem {
  section_id: number;
  display_order: number;
}

/**
 * API para reordenar secciones
 * Maneja las solicitudes PUT para actualizar el orden de múltiples secciones a la vez
 * 
 * @route PUT /api/sections/reorder
 * @returns NextResponse con los resultados actualizados o un mensaje de error
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body || !body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json({ error: 'Invalid request format. Expected sections array.' }, { status: 400 });
    }

    const sections: SectionReorderItem[] = body.sections;

    console.log('🔥 API sections/reorder - Recibido:', sections);

    // Actualizar cada sección con su nuevo display_order
    const updatePromises = sections.map(async (section) => {
      return await prisma.sections.update({
        where: { section_id: section.section_id },
        data: {
          display_order: section.display_order,
          // También actualizar el nuevo campo contextual
          sections_display_order: section.display_order
        }
      });
    });

    const updatedSections = await Promise.all(updatePromises);

    console.log('🔥 API sections/reorder - Actualizado:', updatedSections.length, 'secciones');

    return NextResponse.json({
      success: true,
      message: 'Sections reordered successfully',
      updated: updatedSections.length
    });

  } catch (error) {
    console.error('🔥 API sections/reorder - Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
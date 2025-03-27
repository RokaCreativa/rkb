import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma/prisma';

/**
 * API para reordenar secciones
 * Maneja las solicitudes POST para actualizar el orden de múltiples secciones a la vez
 * 
 * @route POST /api/sections/reorder
 * @returns NextResponse con los resultados actualizados o un mensaje de error
 */
export async function POST(request: Request) {
  try {
    // 1. Verificación de autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Obtener el usuario y verificar que tenga un cliente asociado
    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
    });

    if (!user?.client_id) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // 3. Obtener y validar los datos de la solicitud
    const data = await request.json();
    
    if (!data.sections || !Array.isArray(data.sections)) {
      return NextResponse.json(
        { error: 'Formato inválido: se requiere un array de secciones' }, 
        { status: 400 }
      );
    }

    // 4. Verificar que todas las secciones pertenezcan al cliente
    const sectionIds = data.sections.map((sec: any) => sec.id);
    
    const existingSections = await prisma.sections.findMany({
      where: {
        section_id: { in: sectionIds },
        client_id: user.client_id,
        deleted: { not: 'Y' },
      },
      select: {
        section_id: true,
      },
    });

    if (existingSections.length !== sectionIds.length) {
      return NextResponse.json(
        { error: 'Una o más secciones no existen o no pertenecen a este cliente' }, 
        { status: 400 }
      );
    }

    // 5. Actualizar el orden de las secciones en una transacción
    const updates = await prisma.$transaction(
      data.sections.map((sec: any) => 
        prisma.sections.update({
          where: {
            section_id: sec.id,
          },
          data: {
            display_order: sec.display_order,
          },
        })
      )
    );

    // 6. Devolver respuesta de éxito
    return NextResponse.json({
      success: true,
      message: 'Orden de secciones actualizado correctamente',
      updated: updates.length,
    });
    
  } catch (error) {
    // 7. Manejo centralizado de errores
    console.error('Error al reordenar secciones:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el orden de las secciones' }, 
      { status: 500 }
    );
  }
} 
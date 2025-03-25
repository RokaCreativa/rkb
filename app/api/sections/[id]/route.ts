import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/prisma/prisma';

/**
 * @route DELETE /api/sections/[id]
 * @description Elimina una sección específica por su ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // 3. Obtener y validar el ID de la sección
    const sectionId = parseInt(params.id);
    
    if (isNaN(sectionId)) {
      return NextResponse.json({ error: 'ID de sección inválido' }, { status: 400 });
    }
    
    // 4. Verificar que la sección exista y pertenezca al cliente
    const section = await prisma.sections.findFirst({
      where: {
        section_id: sectionId,
        client_id: user.client_id,
        deleted: { not: 'Y' }, // Comprobamos que no esté ya eliminada
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Sección no encontrada o ya eliminada' }, { status: 404 });
    }

    // 5. En lugar de eliminar físicamente la sección, la marcamos como eliminada
    // utilizando el campo 'deleted' con valor 'Y'
    await prisma.sections.update({
      where: {
        section_id: sectionId,
      },
      data: {
        deleted: 'Y',
        deleted_at: new Date().toISOString().substring(0, 19).replace('T', ' '),
        deleted_by: (session.user.email || '').substring(0, 50),
        deleted_ip: (request.headers.get('x-forwarded-for') || 'API').substring(0, 20),
        status: false, // Desactivamos también el estado
      },
    });

    // 6. Devolver respuesta de éxito
    return NextResponse.json({ 
      success: true, 
      message: 'Sección eliminada correctamente' 
    });
  } catch (error) {
    // 7. Manejo centralizado de errores
    console.error('Error al eliminar la sección:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 
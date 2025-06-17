/**
 * 🧭 MIGA DE PAN CONTEXTUAL
 * 
 * 📍 UBICACIÓN: app/api/sections/[id]/route.ts
 * 
 * 🎯 OBJETIVO: Proveer endpoints para operaciones CRUD sobre una SECCIÓN específica.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. PUT (Actualizar): Recibe datos parciales de una sección. Valida con Zod. Actualiza en BD.
 * 2. DELETE (Eliminar): Recibe el ID de una sección. La elimina de la BD.
 *
 * 🔗 CONEXIONES:
 * - Es consumido por `updateSection` y `deleteSection` en `dashboardStore.ts`.
 * - `EditSectionModal` y `DeleteConfirmationModal` (a través del store) disparan estas operaciones.
 * 
 * ⚠️ CONSIDERACIONES:
 * - Este archivo contiene lógica de autenticación (`getServerSession`) que debe ser consistente con otros endpoints.
 * - La validación de Zod previene datos malformados.
 */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * @route PUT /api/sections/[id]
 * @description Actualiza completamente una sección (edición completa)
 * 🧭 MIGA DE PAN: Esta función corrige el error 405 reportado en móvil
 * Se conecta con updateSection() en dashboardStore.ts y SectionForm.tsx
 */
const updateSectionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  status: z.boolean().optional(),
  image: z.string().optional().nullable(),
  display_order: z.number().optional(),
  category_id: z.number().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sectionId = parseInt(params.id, 10);
    if (isNaN(sectionId)) {
      return NextResponse.json({ error: 'ID de sección inválido' }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateSectionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.formErrors.fieldErrors }, { status: 400 });
    }

    const updatedSection = await prisma.sections.update({
      where: { section_id: sectionId },
      data: validation.data,
    });

    return NextResponse.json(updatedSection, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la sección:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * @route PATCH /api/sections/[id]
 * @description Actualiza parcialmente una sección (principalmente usado para visibilidad)
 */
export async function PATCH(
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
    const id = params.id;
    const sectionId = parseInt(id);

    if (isNaN(sectionId)) {
      return NextResponse.json({ error: 'ID de sección inválido' }, { status: 400 });
    }

    // 4. Verificar que la sección exista y pertenezca al cliente
    const section = await prisma.sections.findFirst({
      where: {
        section_id: sectionId,
        OR: [
          { deleted: 0 },
          { deleted: null }
        ]
      },
      include: {
        categories: true,
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Sección no encontrada' }, { status: 404 });
    }

    // Verificar que la categoría de la sección pertenezca al cliente
    if (section.categories && section.categories.client_id !== user.client_id) {
      return NextResponse.json({ error: 'No tienes permiso para modificar esta sección' }, { status: 403 });
    }

    // 5. Obtener los datos a actualizar
    const data = await request.json();
    const updateData: Record<string, any> = {};

    // Actualizar el estado si se proporciona
    if (data.status !== undefined) {
      updateData.status = data.status === 1;
    }

    // 6. Actualizar la sección
    const updatedSection = await prisma.sections.update({
      where: {
        section_id: sectionId,
      },
      data: updateData,
    });

    // 7. Devolver respuesta de éxito
    return NextResponse.json({
      ...updatedSection,
      status: updatedSection.status ? 1 : 0, // Convertir a formato numérico
    });
  } catch (error) {
    // 8. Manejo centralizado de errores
    console.error('Error al actualizar la sección:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * @route DELETE /api/sections/[id]
 * @description Elimina una sección específica por su ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sectionId = parseInt(params.id, 10);
    if (isNaN(sectionId)) {
      return NextResponse.json({ error: 'ID de sección inválido' }, { status: 400 });
    }

    await prisma.sections.delete({
      where: { section_id: sectionId },
    });

    return NextResponse.json({ message: 'Sección eliminada con éxito' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar la sección:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 
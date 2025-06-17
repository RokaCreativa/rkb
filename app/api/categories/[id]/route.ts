/**
 * 🧭 MIGA DE PAN CONTEXTUAL
 * 
 * 📍 UBICACIÓN: app/api/categories/[id]/route.ts
 * 
 * 🎯 OBJETIVO: Proveer endpoints para operaciones CRUD sobre una CATEGORÍA específica.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. PUT (Actualizar): Recibe datos parciales de una categoría. Valida con Zod. Actualiza en BD.
 * 2. DELETE (Eliminar): Recibe el ID de una categoría. La elimina de la BD.
 *
 * 🔗 CONEXIONES:
 * - Es consumido por `updateCategory` y `deleteCategory` en `dashboardStore.ts`.
 * - `EditCategoryModal` y `DeleteConfirmationModal` (a través del store) disparan estas operaciones.
 * 
 * ⚠️ CONSIDERACIONES:
 * - No hay lógica de autenticación aquí; se asume que un middleware la manejará o se añadirá después.
 * - La validación de Zod asegura la integridad de los datos antes de tocar la base de datos.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from '@/prisma/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prismaClient = new PrismaClient();

/**
 * @route PATCH /api/categories/[id]
 * @description Actualiza parcialmente una categoría (principalmente usado para visibilidad)
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

    // 3. Obtener y validar el ID de la categoría
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID de categoría inválido' }, { status: 400 });
    }

    // 4. Verificar que la categoría exista y pertenezca al cliente
    const category = await prisma.categories.findFirst({
      where: {
        category_id: categoryId,
        client_id: user.client_id,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    // 5. Obtener los datos a actualizar
    const data = await request.json();
    const updateData: Record<string, any> = {};

    // Actualizar el estado si se proporciona
    if (data.status !== undefined) {
      updateData.status = data.status === 1;
    }

    // 6. Actualizar la categoría
    const updatedCategory = await prisma.categories.update({
      where: {
        category_id: categoryId,
      },
      data: updateData,
    });

    // 7. Devolver respuesta de éxito
    return NextResponse.json({
      ...updatedCategory,
      status: updatedCategory.status ? 1 : 0, // Convertir a formato numérico
    });
  } catch (error) {
    // 8. Manejo centralizado de errores
    console.error('Error al actualizar la categoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

const updateCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  status: z.boolean().optional(),
  image: z.string().optional().nullable(),
  display_order: z.number().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID de categoría inválido' }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.formErrors.fieldErrors }, { status: 400 });
    }

    const updatedCategory = await prismaClient.categories.update({
      where: { category_id: categoryId },
      data: validation.data,
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la categoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID de categoría inválido' }, { status: 400 });
    }

    await prismaClient.categories.delete({
      where: { category_id: categoryId },
    });

    return NextResponse.json({ message: 'Categoría eliminada con éxito' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 
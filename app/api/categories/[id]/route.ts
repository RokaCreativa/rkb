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
 * - #6 (Separación de Responsabilidades): La lógica de consulta y formateo de datos de categorías vive aquí, no en el cliente.
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
import { Category } from '@/app/dashboard-v2/types';

const prismaClient = new PrismaClient();

/**
 * @route PATCH /api/categories/[id]
 * @description Actualiza parcialmente una categoría (principalmente usado para visibilidad)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const categoryId = parseInt(params.id, 10);
  console.log(`\n--- [API] 🚀 Petición PATCH para /api/categories/${categoryId} ---`);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.client_id) {
      console.log(`[API] 🛑 Rechazado: Usuario no autorizado.`);
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const clientId = session.user.client_id;
    console.log(`[API] 👤 Autorizado para cliente ID: ${clientId}`);

    if (isNaN(categoryId)) {
      console.log(`[API] 🛑 Rechazado: ID de categoría inválido: ${params.id}`);
      return NextResponse.json({ error: 'ID de categoría inválido' }, { status: 400 });
    }

    const contentType = request.headers.get('content-type') || '';
    let dataToUpdate: Partial<Category> = {};
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      console.log('[API] 📦 Procesando como multipart/form-data.');
      const formData = await request.formData();
      const categoryDataString = formData.get('categoryData') as string;
      imageFile = formData.get('image') as File | null;

      if (categoryDataString) {
        dataToUpdate = JSON.parse(categoryDataString);
      }
      console.log('[API] Datos de formulario extraídos:', { dataToUpdate, tieneImagen: !!imageFile });

    } else if (contentType.includes('application/json')) {
      console.log('[API] 📄 Procesando como application/json.');
      dataToUpdate = await request.json();
      console.log('[API] Datos de JSON extraídos:', dataToUpdate);
    } else {
      console.log(`[API] 🛑 Rechazado: Content-Type no soportado: ${contentType}`);
      return NextResponse.json({ error: 'Content-Type no soportado' }, { status: 415 });
    }

    // Lógica para manejar la subida de imagen si existe
    if (imageFile) {
      console.log(`[API] 🖼️  Procesando subida de imagen: ${imageFile.name}`);
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const fileName = `${timestamp}_${imageFile.name}`;
      const imagePath = join(process.cwd(), 'public', 'images', 'categories', fileName);
      await writeFile(imagePath, buffer);
      dataToUpdate.image = fileName;
      console.log(`[API] ✅ Imagen guardada en: ${imagePath}`);
    }

    // Aquí puedes añadir validación con Zod si es necesario
    console.log('[API] 💾 Datos finales para actualizar en DB:', dataToUpdate);

    const updatedCategory = await prisma.categories.update({
      where: {
        category_id: categoryId,
        client_id: clientId,
      },
      data: dataToUpdate,
    });

    console.log('[API] ✅ Actualización en DB exitosa.');
    return NextResponse.json(updatedCategory);

  } catch (error: any) {
    console.error(`[API] 💥 Error catastrófico en PATCH /api/categories/${categoryId}:`, error);
    return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
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
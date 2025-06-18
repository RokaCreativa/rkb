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
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

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
/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Actualización Polimórfica de Secciones
 *
 * 🎯 PORQUÉ EXISTE:
 * Esta función PATCH es el endpoint unificado para actualizar una sección. Al igual que su contraparte de
 * productos, es polimórfica: acepta `application/json` para cambios simples y `multipart/form-data`
 * cuando se sube una nueva imagen.
 *
 * 🔄 FLUJO DE DATOS:
 *  Idéntico al endpoint de productos, pero guarda las imágenes en `public/images/sections`.
 *
 * 🚨 PROBLEMA RESUELTO:
 * Soluciona el bug que impedía guardar una nueva imagen para una sección, ya que antes solo
 * estaba preparada para peticiones JSON (usadas por el toggle de visibilidad) y no para `FormData`.
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - #6 (Separación de Responsabilidades): La API maneja la lógica de archivos.
 * - #8 (Consistencia): Se unifica el comportamiento de las APIs de actualización del proyecto.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const sectionId = parseInt(params.id, 10);
  if (isNaN(sectionId)) {
    return NextResponse.json({ error: 'ID de sección inválido' }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    let updateData: any;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      updateData = {};

      formData.forEach((value, key) => {
        if (key !== 'image') {
          if (key === 'status') {
            updateData[key] = value === 'true';
          } else if (key === 'display_order' && typeof value === 'string') {
            const num = parseInt(value, 10);
            if (!isNaN(num)) updateData.display_order = num;
          } else if (key === 'category_id' && typeof value === 'string') {
            const num = parseInt(value, 10);
            if (!isNaN(num)) updateData.category_id = num;
          } else {
            updateData[key] = value;
          }
        }
      });

      const imageFile = formData.get('image') as File | null;
      if (imageFile) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const filename = `${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;
        const imagePath = path.join(process.cwd(), 'public/images/sections', filename);
        await writeFile(imagePath, buffer);
        updateData.image = filename;
      }
    } else {
      updateData = await request.json();
    }

    // Limpieza de datos antes de enviar a Prisma
    if (updateData.display_order === null || updateData.display_order === undefined) {
      delete updateData.display_order;
    }
    if (updateData.category_id === null || updateData.category_id === undefined) {
      delete updateData.category_id;
    }

    const updatedSection = await prisma.sections.update({
      where: { section_id: sectionId },
      data: updateData,
    });

    return NextResponse.json(updatedSection);

  } catch (error) {
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
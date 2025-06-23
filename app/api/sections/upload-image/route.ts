import { NextRequest, NextResponse } from "next/server";
import prisma from '@/prisma/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Ruta base para las imágenes de secciones
const IMAGE_BASE_PATH = '/images/sections/';

/**
 * API para cargar imágenes de secciones
 * POST /api/sections/upload-image
 * Recibe un FormData con:
 * - section_id: ID de la sección
 * - image: Archivo de imagen
 */
export async function POST(request: NextRequest) {
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

    // 3. Obtener los datos del formulario
    const formData = await request.formData();
    const sectionId = formData.get('section_id') as string;
    const file = formData.get('image') as File | null;

    if (!sectionId || !file) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // 4. Verificar que la sección existe y pertenece al cliente
    const section = await prisma.sections.findFirst({
      where: {
        section_id: parseInt(sectionId),
        client_id: user.client_id,
      }
    });

    if (!section) {
      return NextResponse.json({ error: 'Sección no encontrada' }, { status: 404 });
    }

    // 5. Procesar y guardar la imagen
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear un nombre de archivo único con timestamp
    const timestamp = Date.now();
    const fileName = file.name;
    const uniqueFileName = `${timestamp}_${fileName}`;

    // Guardar la imagen en el sistema de archivos
    const path = join(process.cwd(), 'public', 'images', 'sections', uniqueFileName);
    await writeFile(path, buffer);

    // 6. Actualizar la referencia en la base de datos
    await prisma.sections.update({
      where: {
        section_id: parseInt(sectionId),
      },
      data: {
        image: uniqueFileName,
      },
    });

    // 7. Obtener la sección actualizada para devolver la imagen con ruta completa
    const updatedSection = await prisma.sections.findUnique({
      where: {
        section_id: parseInt(sectionId),
      },
    });

    return NextResponse.json({
      success: true,
      image: updatedSection?.image ? `${IMAGE_BASE_PATH}${updatedSection.image}` : null,
    });

  } catch (error) {
    console.error('Error al cargar la imagen de la sección:', error);
    return NextResponse.json({ error: 'Error al cargar la imagen' }, { status: 500 });
  }
} 
/**
 * @fileoverview API Route for Sections
 * @description Handles all API requests related to sections,
 *              including fetching, creating, and updating.
 * @module app/api/sections/route
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from '@/prisma/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { Prisma } from "@prisma/client";
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Ruta base para las imágenes de secciones
const IMAGE_BASE_PATH = '/images/sections/';

/**
 * @swagger
 * /api/sections:
 *   get:
 *     summary: Obtiene las secciones de una categoría.
 *     description: Retorna una lista de secciones para una categoría específica, incluyendo el conteo total de productos y el conteo de productos visibles para cada sección.
 *     tags: [Sections]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID de la categoría de la cual se quieren obtener las secciones.
 *     responses:
 *       200:
 *         description: Una lista de secciones con sus respectivos conteos de productos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SectionWithProductCounts'
 *       400:
 *         description: Error de validación (Falta el category_id).
 *       401:
 *         description: No autenticado.
 *       500:
 *         description: Error interno del servidor.
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🔥 SUPER TRACK API: GET /api/sections iniciado');
    // Obtener los parámetros de la URL
    const url = new URL(req.url);
    const categoryId = url.searchParams.get('category_id');
    console.log('🔥 SUPER TRACK API: categoryId recibido:', categoryId);

    // Parámetros de paginación (opcionales)
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '0'); // 0 significa sin límite

    // Validar parámetros de paginación
    const validPage = page < 1 ? 1 : page;
    const validLimit = limit < 0 ? 0 : limit;
    const isPaginated = validLimit > 0;

    if (!categoryId) {
      console.log('🔥 SUPER TRACK API ERROR: Category ID requerido');
      return new Response(JSON.stringify({ error: 'Category ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log('🔥 SUPER TRACK API ERROR: No autenticado');
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener el ID del cliente del usuario autenticado
    const userEmail = session.user.email as string;
    const user = await prisma.users.findFirst({
      where: {
        email: userEmail
      }
    });

    if (!user || !user.client_id) {
      console.log('🔥 SUPER TRACK API ERROR: Usuario no asociado con cliente');
      return new Response(JSON.stringify({ error: 'User not associated with a client' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const clientId = user.client_id;
    console.log('🔥 SUPER TRACK API: clientId encontrado:', clientId);

    // Calcular parámetros de paginación para Prisma
    const skip = isPaginated ? (validPage - 1) * validLimit : undefined;
    const take = isPaginated ? validLimit : undefined;

    console.log('🔥 SUPER TRACK API: Ejecutando query Prisma con where:', {
      client_id: clientId,
      category_id: parseInt(categoryId),
      deleted: 0,
    });

    // Buscar las secciones para la categoría especificada con paginación opcional
    const sections = await prisma.sections.findMany({
      where: {
        client_id: clientId,
        category_id: parseInt(categoryId),
        deleted: 0,
      },
      orderBy: [
        { status: 'desc' },
        { sections_display_order: 'asc' }
      ],
      skip,
      take
    });

    console.log('🔥 SUPER TRACK API: Secciones encontradas:', sections.length);
    console.log('🔥 SUPER TRACK API: Primera sección raw:', sections[0]);

    // Si se solicita paginación, obtener también el total de registros
    let totalSections: number | undefined;
    if (isPaginated) {
      totalSections = await prisma.sections.count({
        where: {
          client_id: clientId,
          category_id: parseInt(categoryId),
          deleted: 0,
        }
      });
    }

    // Para cada sección, obtener el conteo de productos
    const sectionsWithProductCounts = await Promise.all(
      sections.map(async (section) => {
        // Contar todos los productos asociados a esta sección
        const totalProductsCount = await prisma.products.count({
          where: {
            section_id: section.section_id,
            deleted: false,
          }
        });

        // Contar solo los productos visibles (status = true)
        const visibleProductsCount = await prisma.products.count({
          where: {
            section_id: section.section_id,
            deleted: false,
            status: true
          }
        });

        return {
          ...section,
          // Convertir el valor booleano de status a numérico (1 para true, 0 para false)
          status: section.status ? 1 : 0,
          products_count: totalProductsCount,
          visible_products_count: visibleProductsCount
        };
      })
    );

    // Devolver la respuesta según sea paginada o no
    if (isPaginated && totalSections !== undefined) {
      const totalPages = Math.ceil(totalSections / validLimit);

      return new Response(JSON.stringify({
        data: sectionsWithProductCounts,
        meta: {
          total: totalSections,
          page: validPage,
          limit: validLimit,
          totalPages
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Si no hay paginación, devolver directamente el array
      return new Response(JSON.stringify(sectionsWithProductCounts), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error getting sections:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST /api/sections
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

    // 3. Obtener y validar los datos del formulario
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const categoryId = parseInt(formData.get('category_id') as string);
    const file = formData.get('image') as File | null;
    const status = formData.get('status') === '1'; // Convertir a booleano

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    if (!categoryId || isNaN(categoryId)) {
      return NextResponse.json({ error: 'La categoría es requerida' }, { status: 400 });
    }

    // 4. Verificar que la categoría existe y pertenece al cliente
    const category = await prisma.categories.findFirst({
      where: {
        category_id: categoryId,
        client_id: user.client_id,
        deleted: 0
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Categoría no válida o no pertenece al cliente' }, { status: 403 });
    }

    let imageUrl: string | null = null;
    if (file) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generar un nombre de archivo único
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const imagePath = join(process.cwd(), 'public', IMAGE_BASE_PATH, filename);

        // Guardar el archivo
        await writeFile(imagePath, buffer);
        imageUrl = filename;
      } catch (e) {
        console.error('Error al subir la imagen:', e);
        return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
      }
    }

    // 5. Determinar el próximo valor de sections_display_order usando Prisma ORM
    // 🧹 CORREGIDO: Calculamos el máximo en lugar de hardcodear 0
    const maxOrderSection = await prisma.sections.aggregate({
      where: {
        category_id: categoryId,
        client_id: user.client_id,
        deleted: { not: 1 } as any
      },
      _max: {
        sections_display_order: true
      }
    });

    const maxOrder = maxOrderSection._max.sections_display_order || 0;

    // 6. Crear la nueva sección en la base de datos
    const newSection = await prisma.sections.create({
      data: {
        name,
        category_id: categoryId,
        image: imageUrl,
        status,
        client_id: user.client_id,
        sections_display_order: maxOrder + 1,
      },
    });

    // 7. Devolver la sección creada
    return NextResponse.json(newSection, { status: 201 });
  } catch (error) {
    console.error('Error al crear la sección:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: 'Error en la base de datos', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT /api/sections
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
    });

    if (!user?.client_id) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    const formData = await request.formData();
    const sectionId = parseInt(formData.get('id') as string);
    const name = formData.get('name') as string | null;
    const file = formData.get('image') as File | null;
    const status = formData.get('status');
    const deleteImage = formData.get('deleteImage') === 'true';

    if (isNaN(sectionId)) {
      return NextResponse.json({ error: 'ID de sección no válido' }, { status: 400 });
    }

    const section = await prisma.sections.findFirst({
      where: {
        section_id: sectionId,
        client_id: user.client_id,
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Sección no encontrada o no pertenece al cliente' }, { status: 404 });
    }

    const dataToUpdate: Prisma.sectionsUpdateInput = {};

    if (name) {
      dataToUpdate.name = name;
    }
    if (status !== null) {
      dataToUpdate.status = status === '1';
    }

    let imageUrl = section.image;
    if (deleteImage) {
      // Aquí iría la lógica para borrar el archivo de imagen del servidor si existe
      imageUrl = null;
    } else if (file) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const imagePath = join(process.cwd(), 'public', IMAGE_BASE_PATH, filename);
        await writeFile(imagePath, buffer);
        imageUrl = filename;
      } catch (e) {
        console.error('Error al subir la nueva imagen:', e);
        return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
      }
    }
    dataToUpdate.image = imageUrl;

    const updatedSection = await prisma.sections.update({
      where: { section_id: sectionId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedSection, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la sección:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/sections
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
    });

    if (!user?.client_id) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    const { id } = await request.json();

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID de sección no válido' }, { status: 400 });
    }

    const section = await prisma.sections.findFirst({
      where: {
        section_id: id,
        client_id: user.client_id,
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Sección no encontrada o no pertenece al cliente' }, { status: 404 });
    }

    await prisma.sections.update({
      where: { section_id: id },
      data: {
        deleted: 1,
        deleted_at: new Date().toISOString(),
        deleted_by: user.email,
        deleted_ip: request.headers.get('x-forwarded-for') ?? 'unknown',
      },
    });

    return NextResponse.json({ message: 'Sección eliminada (marcada como borrada)' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar la sección:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 
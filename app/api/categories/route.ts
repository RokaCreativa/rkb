/**
 * @fileoverview API Route for Categories
 * @description This route handles all API requests related to categories,
 *              including fetching, creating, updating, and reordering.
 * @module app/api/categories/route
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from "@/prisma/prisma";
import { writeFile } from 'fs/promises';
import { join } from 'path';
// O la ruta relativa que corresponda

// Ruta base para las imágenes
const IMAGE_BASE_PATH = '/images/categories/';

/**
 * Interfaz para categorías procesadas para el frontend
 * Define la estructura de datos que se enviará al cliente
 */
interface ProcessedCategory {
  category_id: number;
  name: string;
  image: string | null;
  status: number; // 1 (activo) o 0 (inactivo)
  display_order: number;
  client_id: number;
  products: number;
  sections_count?: number;
  visible_sections_count?: number;
}

/**
 * Interfaz para la respuesta paginada de categorías
 * Se usa cuando se solicitan datos con paginación
 */
interface PaginatedCategoriesResponse {
  data: ProcessedCategory[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Obtiene las categorías del cliente actual
 * Soporta paginación opcional mediante parámetros de consulta
 * 
 * @param request - Objeto de solicitud HTTP
 * @returns Respuesta HTTP con las categorías o un mensaje de error
 */
export async function GET(request: Request) {
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

    // 3. Obtener y procesar parámetros de consulta para paginación
    const url = new URL(request.url);

    // Parámetros de paginación (opcionales)
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '0'); // 0 significa "sin límite"

    // Validar parámetros
    const validPage = isNaN(page) || page < 1 ? 1 : page;
    const validLimit = isNaN(limit) || limit < 0 ? 0 : limit;
    const isPaginated = validLimit > 0;

    // 4. Calcular parámetros de paginación para la consulta
    const skip = isPaginated ? (validPage - 1) * validLimit : undefined;
    const take = isPaginated ? validLimit : undefined;

    // 5. Obtener el total de categorías para metadatos de paginación
    const totalCategories = await prisma.categories.count({
      where: {
        client_id: user.client_id,
      },
    });

    // 6. Obtener las categorías con paginación opcional
    const categories = await prisma.categories.findMany({
      where: {
        client_id: user.client_id,
        deleted: { not: 1 } as any
      },
      orderBy: [
        { status: 'desc' },
        { display_order: 'asc' },
      ],
      // Solo seleccionar los campos necesarios para optimizar rendimiento
      select: {
        category_id: true,
        name: true,
        image: true,
        status: true,
        display_order: true,
        client_id: true,
      },
      skip,
      take,
    });

    // 7. Obtener contadores de secciones para cada categoría
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        console.log(`🔍 Contando secciones para categoría ID=${category.category_id}, nombre="${category.name || 'sin nombre'}"`);

        // 7.1 Contar total de secciones para esta categoría
        const totalSections = await prisma.sections.count({
          where: {
            category_id: category.category_id,
            deleted: { not: 1 } as any
          },
        });

        // 7.2 Contar secciones visibles para esta categoría
        const visibleSections = await prisma.sections.count({
          where: {
            category_id: category.category_id,
            status: true,
            deleted: { not: 1 } as any
          },
        });

        console.log(`📊 Resultado para categoría ID=${category.category_id}: total=${totalSections}, visibles=${visibleSections}`);

        // 7.3 Procesar la categoría con la información de contadores
        return {
          category_id: category.category_id,
          name: category.name || '',
          image: category.image ? `${IMAGE_BASE_PATH}${category.image}` : null,
          status: category.status ? 1 : 0,
          display_order: category.display_order || 0,
          client_id: category.client_id || 0,
          products: 0, // Simplificación temporal: no calculamos productos para evitar errores
          sections_count: totalSections,
          visible_sections_count: visibleSections
        };
      })
    );

    console.log(`✅ Categorías procesadas: ${categoriesWithCounts.length}`);

    // 8. Devolver respuesta según si se solicitó paginación o no
    if (isPaginated) {
      // Respuesta paginada con metadatos
      const totalPages = Math.ceil(totalCategories / validLimit);
      const response: PaginatedCategoriesResponse = {
        data: categoriesWithCounts,
        meta: {
          total: totalCategories,
          page: validPage,
          limit: validLimit,
          totalPages,
        },
      };
      return NextResponse.json(response);
    } else {
      // Mantener el formato original de respuesta cuando no hay paginación
      return NextResponse.json(categoriesWithCounts);
    }
  } catch (error) {
    // 9. Manejo centralizado de errores
    console.error('Error al obtener categorías:', error);
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}

/**
 * Crea una nueva categoría para el cliente actual
 * 
 * @param request - Objeto de solicitud HTTP con datos de la categoría
 * @returns Respuesta HTTP con la categoría creada o un mensaje de error
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

    // 3. Obtener y validar los datos del formulario
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const file = formData.get('image') as File | null;
    const status = formData.get('status') !== '0'; // Si no se especifica explícitamente como 0, será activo

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    // 4. Determinar el próximo valor de display_order
    const maxOrderResult = await prisma.$queryRaw`
      SELECT MAX(display_order) as maxOrder 
      FROM categories 
      WHERE client_id = ${user.client_id}
    `;

    // @ts-ignore - La respuesta SQL puede variar
    const maxOrder = maxOrderResult[0]?.maxOrder || 0;

    // 5. Procesar la imagen si existe
    let imageUrl = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Crear un nombre de archivo único con timestamp
      const timestamp = Date.now();
      const fileName = file.name;
      const uniqueFileName = `${timestamp}_${fileName}`;

      // Guardar la imagen en el sistema de archivos
      const path = join(process.cwd(), 'public', 'images', 'categories', uniqueFileName);
      await writeFile(path, buffer);

      // URL relativa para la base de datos
      imageUrl = uniqueFileName;
    }

    // 6. Crear la nueva categoría
    const newCategory = await prisma.categories.create({
      data: {
        name,
        image: imageUrl,
        status: true, // Por defecto activo
        display_order: maxOrder !== null && maxOrder !== undefined ? maxOrder + 1 : 1,
        client_id: user.client_id,
        deleted: 0 as any,
      },
    });

    // 7. Preparar la respuesta
    const processedCategory: ProcessedCategory = {
      category_id: newCategory.category_id,
      name: newCategory.name || '',
      image: imageUrl ? `${IMAGE_BASE_PATH}${imageUrl}` : null,
      status: newCategory.status ? 1 : 0,
      display_order: newCategory.display_order || 0,
      client_id: newCategory.client_id || 0,
      products: 0, // Nueva categoría, sin productos
    };

    return NextResponse.json(processedCategory);
  } catch (error) {
    // 8. Manejo centralizado de errores
    console.error('Error al crear la categoría:', error);
    return NextResponse.json({ error: 'Error al crear la categoría' }, { status: 500 });
  }
}

/**
 * Actualiza una categoría existente (visibilidad, nombre, orden, etc.)
 * 
 * @param request - Objeto de solicitud HTTP con datos de actualización
 * @returns Respuesta HTTP con la categoría actualizada o un mensaje de error
 */
export async function PUT(request: Request) {
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

    // 3. Obtener y validar los datos de actualización
    const formData = await request.formData();
    const categoryId = parseInt(formData.get('category_id') as string);
    const name = formData.get('name') as string;
    const status = formData.get('status') !== '0'; // Si no se especifica explícitamente como 0, será activo
    const file = formData.get('image') as File | null;

    if (!categoryId || isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID de categoría inválido' }, { status: 400 });
    }

    // 4. Verificar que la categoría existe y pertenece al cliente
    const existingCategory = await prisma.categories.findFirst({
      where: {
        client_id: user.client_id,
        category_id: categoryId,
        deleted: { not: 1 } as any
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    // 5. Procesar la imagen si existe
    let imageUrl = undefined;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Crear un nombre de archivo único con timestamp
      const timestamp = Date.now();
      const fileName = file.name;
      const uniqueFileName = `${timestamp}_${fileName}`;

      // Guardar la imagen en el sistema de archivos
      const path = join(process.cwd(), 'public', 'images', 'categories', uniqueFileName);
      await writeFile(path, buffer);

      // URL relativa para la base de datos
      imageUrl = uniqueFileName;
    }

    // 6. Actualizar la categoría
    const updateData: any = {};
    if (name) updateData.name = name;
    if (typeof status !== 'undefined') updateData.status = status;
    if (imageUrl) updateData.image = imageUrl;

    const updatedCategory = await prisma.categories.update({
      where: {
        category_id: categoryId
      },
      data: updateData,
    });

    // 7. Preparar la respuesta
    const processedCategory: ProcessedCategory = {
      category_id: updatedCategory.category_id,
      name: updatedCategory.name || '',
      image: updatedCategory.image ? `${IMAGE_BASE_PATH}${updatedCategory.image}` : null,
      status: updatedCategory.status ? 1 : 0,
      display_order: updatedCategory.display_order || 0,
      client_id: updatedCategory.client_id || 0,
      products: 0, // Simplificación temporal: no calculamos productos para evitar errores
    };

    return NextResponse.json(processedCategory);
  } catch (error) {
    // 8. Manejo centralizado de errores
    console.error('Error al actualizar la categoría:', error);
    return NextResponse.json({ error: 'Error al actualizar la categoría' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from "@/prisma/prisma";
import { writeFile } from 'fs/promises';
import { join } from 'path';
// O la ruta relativa que corresponda

// Ruta base para las imágenes
const IMAGE_BASE_PATH = '/images/categories/';

// Interfaz para categorías procesadas para el frontend
interface ProcessedCategory {
  category_id: number;
  name: string;
  image: string | null;
  status: number; // 1 (activo) o 0 (inactivo)
  display_order: number;
  client_id: number;
  products: number;
}

/**
 * Obtiene todas las categorías del cliente actual
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

    // 3. Obtener las categorías del cliente
    const categories = await prisma.categories.findMany({
      where: {
        client_id: user.client_id,
        deleted: { not: 'Y' },
      },
      orderBy: {
        display_order: 'asc',
      },
    });

    // 4. Procesar las categorías para el formato esperado por el frontend
    const processedCategories = categories.map(category => ({
      category_id: category.category_id,
      name: category.name || '',
      image: category.image ? `${IMAGE_BASE_PATH}${category.image}` : null,
      status: category.status ? 1 : 0,
      display_order: category.display_order || 0,
      client_id: category.client_id || 0,
      products: 0, // Simplificación temporal: no calculamos productos para evitar errores
    }));

    // 5. Devolver las categorías procesadas
    return NextResponse.json(processedCategories);
  } catch (error) {
    // 6. Manejo centralizado de errores
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
    const status = formData.get('status') === '1'; // Convertir a booleano

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
        status,
        display_order: maxOrder !== null && maxOrder !== undefined ? maxOrder + 1 : 1,
        client_id: user.client_id,
        deleted: 'N', // Mantener compatibilidad con el esquema actual
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
    const data = await request.json();
    console.log('PUT /api/categories - Datos recibidos:', data);

    if (!data.category_id) {
      return NextResponse.json({ error: 'ID de categoría requerido' }, { status: 400 });
    }

    // 4. Preparar los datos de actualización
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.display_order !== undefined) updateData.display_order = data.display_order;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.status !== undefined) updateData.status = data.status === 1; // Convertir numérico a booleano
    
    console.log('PUT /api/categories - Datos a actualizar:', updateData);

    // 5. Actualizar la categoría
    await prisma.categories.updateMany({
      where: {
        category_id: data.category_id,
        client_id: user.client_id,
      },
      data: updateData,
    });

    // 6. Obtener la categoría actualizada
    const updatedCategory = await prisma.categories.findFirst({
      where: {
        category_id: data.category_id,
        client_id: user.client_id,
      },
    });

    if (!updatedCategory) {
      return NextResponse.json({ error: 'No se pudo actualizar la categoría' }, { status: 404 });
    }

    // 7. Preparar la respuesta
    const processedCategory: ProcessedCategory = {
      category_id: updatedCategory.category_id,
      name: updatedCategory.name || '',
      image: updatedCategory.image ? `${IMAGE_BASE_PATH}${updatedCategory.image}` : null,
      status: updatedCategory.status ? 1 : 0,
      display_order: updatedCategory.display_order || 0,
      client_id: updatedCategory.client_id || 0,
      products: 0, // No calculamos productos para esta respuesta
    };

    return NextResponse.json(processedCategory);
  } catch (error) {
    // 8. Manejo centralizado de errores
    console.error('Error al actualizar la categoría:', error);
    return NextResponse.json({ error: 'Error al actualizar la categoría' }, { status: 500 });
  }
}

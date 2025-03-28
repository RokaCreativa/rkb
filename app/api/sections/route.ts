import { NextRequest, NextResponse } from "next/server";
import prisma from '@/prisma/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Ruta base para las imágenes de secciones
const IMAGE_BASE_PATH = '/images/sections/';

// Interfaz para los datos de sección procesados
interface FormattedSection {
  id: number;
  name: string | null;
  image: string | null;
  display_order: number | null;
  status: boolean;
  client_id: number;
  category_id: number;
  products: Array<{
    id: number;
    name: string | null;
    image: string | null;
    price: Prisma.Decimal | null;
    description: string | null;
  }>;
}

// Interfaz para secciones procesadas en la respuesta del API
interface ProcessedSection {
  section_id: number;
  name: string;
  image: string | null;
  status: number; // 1 o 0
  display_order: number;
  client_id: number;
  category_id: number;
  products_count: number;
}

// GET /api/sections?categoryId=X
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

    // 3. Obtener parámetros de consulta (si existe category_id)
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('category_id');

    // 4. Construir la consulta base - evitando el uso de tipos incompatibles
    const whereClause: {
      client_id: number | undefined;
      category_id?: number;
      deleted?: any;
    } = {
      client_id: user.client_id,
      deleted: { not: 1 }
    };

    // 5. Añadir filtro por categoría si se especifica
    if (categoryId) {
      whereClause.category_id = parseInt(categoryId);
    }

    // 6. Obtener las secciones con los filtros aplicados
    const sections = await prisma.sections.findMany({
      where: whereClause,
      orderBy: {
        display_order: 'asc',
      },
    });

    // 7. Procesar las secciones para el formato esperado por el frontend
    const processedSections = await Promise.all(sections.map(async (section) => {
      // Contar productos por sección
      const productsCount = await prisma.products_sections.count({
        where: {
          section_id: section.section_id,
        },
      });

      return {
        section_id: section.section_id,
        name: section.name || '',
        image: section.image ? `${IMAGE_BASE_PATH}${section.image}` : null,
        status: section.status ? 1 : 0,
        display_order: section.display_order || 0,
        client_id: section.client_id || 0,
        category_id: section.category_id || 0,
        products_count: productsCount,
      };
    }));

    // 8. Devolver las secciones procesadas
    return NextResponse.json(processedSections);
  } catch (error) {
    // 9. Manejo centralizado de errores
    console.error('Error al obtener secciones:', error);
    return NextResponse.json({ error: 'Error al obtener secciones' }, { status: 500 });
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
        deleted: { not: 1 } as any,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    // 5. Determinar el próximo valor de display_order
    const maxOrderResult = await prisma.$queryRaw`
      SELECT MAX(display_order) as maxOrder 
      FROM sections 
      WHERE client_id = ${user.client_id} 
      AND category_id = ${categoryId}
    `;
    
    // @ts-ignore - La respuesta SQL puede variar
    const maxOrder = maxOrderResult[0]?.maxOrder || 0;

    // 6. Procesar la imagen si existe
    let imageUrl = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Crear un nombre de archivo único con timestamp
      const timestamp = Date.now();
      const fileName = file.name;
      const uniqueFileName = `${timestamp}_${fileName}`;
      
      // Guardar la imagen en el sistema de archivos
      const path = join(process.cwd(), 'public', 'images', 'sections', uniqueFileName);
      await writeFile(path, buffer);
      
      // URL relativa para la base de datos
      imageUrl = uniqueFileName;
    }

    // 7. Crear la nueva sección
    const newSection = await prisma.sections.create({
      data: {
        name,
        image: imageUrl,
        status: true, // Por defecto activo
        display_order: maxOrder + 1,
        category_id: categoryId,
        client_id: user.client_id,
        deleted: 0 as any,
      },
    });

    // 8. Preparar la respuesta
    const processedSection: ProcessedSection = {
      section_id: newSection.section_id,
      name: newSection.name || '',
      image: imageUrl ? `${IMAGE_BASE_PATH}${imageUrl}` : null,
      status: newSection.status ? 1 : 0,
      display_order: newSection.display_order || 0,
      client_id: newSection.client_id || 0,
      category_id: newSection.category_id || 0,
      products_count: 0, // Nueva sección, sin productos
    };

    return NextResponse.json(processedSection);
  } catch (error) {
    // 9. Manejo centralizado de errores
    console.error('Error al crear la sección:', error);
    return NextResponse.json({ error: 'Error al crear la sección' }, { status: 500 });
  }
}

// PUT /api/sections
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

    // 3. Determinar si la solicitud viene como formData o como JSON
    let data;
    let sectionId;
    let file = null;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      // Procesar FormData
      const formData = await request.formData();
      sectionId = formData.get('section_id') as string;
      
      // Extraer archivo si existe
      file = formData.get('image') as File | null;
      
      // Extraer otros campos
      data = {
        section_id: parseInt(sectionId),
        name: formData.get('name') as string,
      };
      
      console.log('PUT /api/sections - FormData recibido:', {
        section_id: data.section_id,
        name: data.name,
        hasFile: !!file
      });
    } else {
      // Procesar JSON
      data = await request.json();
      sectionId = data.section_id;
      console.log('PUT /api/sections - JSON recibido:', data);
    }

    if (!sectionId) {
      return NextResponse.json({ error: 'ID de sección requerido' }, { status: 400 });
    }

    // 4. Preparar los datos de actualización
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.display_order !== undefined) updateData.display_order = data.display_order;
    if (data.status !== undefined) updateData.status = data.status === 1; // Convertir numérico a booleano
    if (data.category_id !== undefined) updateData.category_id = data.category_id;
    
    // 5. Procesar la imagen si se envió como parte de la solicitud
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Crear un nombre de archivo único con timestamp
      const timestamp = Date.now();
      const fileName = file.name;
      const uniqueFileName = `${timestamp}_${fileName}`;
      
      // Guardar la imagen en el sistema de archivos
      const path = join(process.cwd(), 'public', 'images', 'sections', uniqueFileName);
      await writeFile(path, buffer);
      
      // Añadir el nombre de archivo a los datos de actualización
      updateData.image = uniqueFileName;
    }
    
    console.log('PUT /api/sections - Datos a actualizar:', updateData);

    // 6. Actualizar la sección
    await prisma.sections.updateMany({
      where: {
        section_id: parseInt(sectionId.toString()),
        client_id: user.client_id,
      },
      data: updateData,
    });

    // 7. Obtener la sección actualizada
    const updatedSection = await prisma.sections.findFirst({
      where: {
        section_id: parseInt(sectionId),
        client_id: user.client_id,
      },
    });

    if (!updatedSection) {
      return NextResponse.json({ error: 'No se pudo actualizar la sección' }, { status: 404 });
    }

    // 8. Contar productos de la sección
    const productsCount = await prisma.products_sections.count({
      where: {
        section_id: parseInt(sectionId),
      },
    });

    // 9. Preparar la respuesta
    const processedSection: ProcessedSection = {
      section_id: updatedSection.section_id,
      name: updatedSection.name || '',
      image: updatedSection.image ? `${IMAGE_BASE_PATH}${updatedSection.image}` : null,
      status: updatedSection.status ? 1 : 0,
      display_order: updatedSection.display_order || 0,
      client_id: updatedSection.client_id || 0,
      category_id: updatedSection.category_id || 0,
      products_count: productsCount,
    };

    return NextResponse.json(processedSection);
  } catch (error) {
    // 10. Manejo centralizado de errores
    console.error('Error al actualizar la sección:', error);
    return NextResponse.json({ error: 'Error al actualizar la sección' }, { status: 500 });
  }
}

// DELETE /api/sections
export async function DELETE(request: Request) {
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
    const url = new URL(request.url);
    const sectionId = url.searchParams.get('section_id');

    if (!sectionId) {
      return NextResponse.json({ error: 'ID de sección no proporcionado' }, { status: 400 });
    }

    // 4. Verificar que la sección exista y pertenezca al cliente
    const section = await prisma.sections.findFirst({
      where: {
        section_id: parseInt(sectionId),
        client_id: user.client_id,
        deleted: { in: [0, null] as any }, // Verificar que no esté ya eliminada
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Sección no encontrada o ya eliminada' }, { status: 404 });
    }

    // 5. En lugar de eliminar físicamente la sección, la marcamos como eliminada
    // utilizando el campo 'deleted' con valor 1 para indicar que está eliminada
    await prisma.sections.updateMany({
      where: {
        section_id: parseInt(sectionId),
        client_id: user.client_id,
      },
      data: {
        deleted: 1 as any,
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
    return NextResponse.json({ error: 'Error al eliminar la sección' }, { status: 500 });
  }
} 
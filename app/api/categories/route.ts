import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from "@/prisma/prisma";
import { writeFile } from 'fs/promises';
import { join } from 'path';
// O la ruta relativa que corresponda

// Definir una constante para la ruta base de las imágenes
const IMAGE_BASE_PATH = '/images/categories/';

// Interfaz para categorías procesadas en la respuesta del API
interface ProcessedCategory {
  category_id: number;
  name: string;
  image: string | null;
  status: number; // Ahora solo 1 o 0
  display_order: number;
  client_id: number; // Ahora siempre es un número
  products: number;
}

// Método GET para obtener las categorías
export async function GET(request: Request) {
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

    // Obtener categorías no eliminadas para el cliente actual
    const categories = await prisma.categories.findMany({
      where: {
        client_id: user.client_id,
        deleted: { not: 'Y' }, // Cualquier valor que no sea 'Y' (incluido null)
      },
      orderBy: {
        display_order: 'asc',
      },
    });

    // Procesamos las categorías para el formato que espera el frontend
    const formattedCategories = categories.map(category => ({
      ...category,
      image: category.image 
        ? `${IMAGE_BASE_PATH}${category.image}`
        : null,
    }));

    const processedCategories: ProcessedCategory[] = formattedCategories.map(category => ({
      category_id: category.category_id,
      name: category.name || '',
      image: category.image,
      status: category.status ? 1 : 0,
      display_order: category.display_order || 0,
      client_id: category.client_id ?? 0,
      products: 0,
    }));

    return NextResponse.json(processedCategories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Método POST para crear una nueva categoría
export async function POST(request: Request) {
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

    // Verificar si el request es multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    
    let data: any = {};
    let imageFile: ArrayBuffer | null = null;
    let imageName: string | null = null;
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data.name = formData.get('name') as string;
      
      const file = formData.get('image') as File;
      if (file && file.size > 0) {
        imageFile = await file.arrayBuffer();
        imageName = file.name; // Solo guardamos el nombre, no la ruta completa
      }
    } else {
      data = await request.json();
    }
    
    if (!data.name || data.name.trim() === '') {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    // Determinar el orden máximo actual
    const maxOrderCategory = await prisma.categories.findFirst({
      where: {
        client_id: user.client_id,
      },
      orderBy: {
        display_order: 'desc',
      },
    });

    const maxOrder = maxOrderCategory?.display_order;

    // Si hay una imagen, guardarla
    if (imageFile && imageName) {
      try {
        // Asegurarse de que el directorio existe
        const publicImagesDir = join(process.cwd(), 'public', 'images', 'categories');
        
        // Guardar la imagen
        await writeFile(join(publicImagesDir, imageName), Buffer.from(imageFile));
      } catch (error) {
        console.error('Error al guardar la imagen:', error);
        // Continuamos aunque haya error con la imagen
      }
    }

    // Crear la categoría
    const newCategory = await prisma.categories.create({
      data: {
        name: data.name,
        image: imageName, // Guardamos solo el nombre de la imagen
        status: true,
        display_order: maxOrder !== null && maxOrder !== undefined ? maxOrder + 1 : 1,
        client_id: user.client_id,
      },
    });

    // URL completo de la imagen para la respuesta
    const imageUrl = imageName ? `${IMAGE_BASE_PATH}${imageName}` : null;
    
    // Procesar la categoría creada para la respuesta
    const processedCategory: ProcessedCategory = {
      category_id: newCategory.category_id,
      name: newCategory.name || '',
      image: imageUrl,
      status: newCategory.status ? 1 : 0,
      display_order: newCategory.display_order || 0,
      client_id: newCategory.client_id ?? 0,
      products: 0,
    };

    return NextResponse.json(processedCategory);
  } catch (error) {
    console.error('Error al crear la categoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Método PUT para cambiar la visibilidad de una categoría
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

    const data = await request.json();

    if (!data.category_id || typeof data.status !== 'number') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const category = await prisma.categories.update({
      where: {
        category_id: data.category_id,
      },
      data: {
        status: data.status === 1,
      },
    });

    const processedCategory: ProcessedCategory = {
      category_id: category.category_id,
      name: category.name || '',
      image: category.image ? `${IMAGE_BASE_PATH}${category.image}` : null,
      status: category.status ? 1 : 0,
      display_order: category.display_order || 0,
      client_id: category.client_id ?? 0,
      products: 0,
    };

    return NextResponse.json(processedCategory);
  } catch (error) {
    console.error('Error al actualizar la categoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

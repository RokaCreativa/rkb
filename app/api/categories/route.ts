import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from "@/prisma/prisma";
import { writeFile } from 'fs/promises';
import { join } from 'path';
// O la ruta relativa que corresponda


// Interfaz para categorías procesadas en la respuesta del API
interface ProcessedCategory {
  id: number;
  name: string;
  image: string | null;
  status: number; // Ahora solo 1 o 0
  display_order: number;
  client_id: number; // Ahora siempre es un número
  products: number;
}

const IMAGE_BASE_PATH = '/images/categories/';

// Método GET para obtener las categorías del cliente autenticado
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

    const categories = await prisma.categories.findMany({
      where: { client_id: user.client_id },
      orderBy: { display_order: 'asc' },
    });

    console.log(`Recuperadas ${categories.length} categorías para el cliente ${user.client_id}`);

    // Formatear la respuesta para que incluya la URL correcta de la imagen
    const formattedCategories = categories.map(category => {
      // Solo añadir la ruta base si hay una imagen
      const imageUrl = category.image 
        ? `${IMAGE_BASE_PATH}${category.image}` 
        : null;
      
      return {
        ...category,
        image: imageUrl,
        status: category.status ? 1 : 0, // Convertir boolean a 0/1 para frontend
      };
    });

    return NextResponse.json(formattedCategories);
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

    let imageFileName = null;
    let categoryData: any = {
      client_id: user.client_id,
      status: true,
    };
    
    // Verificar si la solicitud es multipart/form-data o JSON
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Procesar FormData para imagen
      const formData = await request.formData();
      const name = formData.get('name');
      const image = formData.get('image') as File | null;
      const displayOrder = formData.get('display_order');
      
      if (!name) {
        return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
      }
      
      categoryData.name = name.toString();
      
      if (displayOrder) {
        categoryData.display_order = parseInt(displayOrder.toString());
      }
      
      if (image) {
        // Crear nombre de archivo único (timestamp + nombre original)
        const timestamp = Date.now();
        const fileName = image.name.toLowerCase().replace(/\s+/g, '-');
        imageFileName = `${timestamp}-${fileName}`;
        
        // Guardar la imagen en el directorio público
        const publicDir = join(process.cwd(), 'public');
        const categoriesDir = join(publicDir, 'images', 'categories');
        
        try {
          const bytes = await image.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const imagePath = join(categoriesDir, imageFileName);
          
          await writeFile(imagePath, buffer);
          categoryData.image = imageFileName;
        } catch (error) {
          console.error('Error al guardar la imagen:', error);
          return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
        }
      }
    } else {
      // Procesar JSON para crear sin imagen
      const data = await request.json();
      
      if (!data.name) {
        return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
      }
      
      categoryData.name = data.name;
      
      if (data.display_order !== undefined) {
        categoryData.display_order = data.display_order;
      }
      
      if (data.status !== undefined) {
        categoryData.status = data.status === 1;
      }
      
      if (data.image) {
        categoryData.image = data.image;
      }
    }
    
    // Determinar el display_order si no se proporcionó
    if (categoryData.display_order === undefined) {
      const maxOrderCategory = await prisma.categories.findFirst({
        where: { client_id: user.client_id },
        orderBy: { display_order: 'desc' },
      });
      
      categoryData.display_order = maxOrderCategory && maxOrderCategory.display_order !== null 
        ? maxOrderCategory.display_order + 1 
        : 1;
    }
    
    // Crear la nueva categoría
    const newCategory = await prisma.categories.create({
      data: categoryData,
    });

    // Formatear la imagen para la respuesta
    const imageUrl = newCategory.image 
      ? `${IMAGE_BASE_PATH}${newCategory.image}` 
      : null;
    
    // Convertir el status a formato numérico para la respuesta
    return NextResponse.json({
      ...newCategory,
      image: imageUrl,
      status: newCategory.status ? 1 : 0,
    });
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

    if (!data.id || typeof data.status !== 'number') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const category = await prisma.categories.update({
      where: {
        id: data.id,
        client_id: user.client_id,
      },
      data: {
        status: data.status === 1,
      },
    });

    const processedCategory: ProcessedCategory = {
      id: category.id,
      name: category.name || '',
      image: category.image,
      status: category.status ? 1 : 0,
      display_order: category.display_order || 0,
      client_id: category.client_id ?? 0,
      products: 0,
    };

    return NextResponse.json(processedCategory);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

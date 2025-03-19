import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Interfaz para las categorías procesadas
interface ProcessedCategory {
  id: number;
  name: string;
  image: string | null;
  status: string | number; // Puede ser 'A'/'I' o 1/0
  display_order: number;
  client_id: number;
  products: number;
}

// Constante para la ruta base de las imágenes
const IMAGE_BASE_PATH = '/images/categories/';

export async function GET() {
  try {
    // Forzar cliente específico para pruebas (ID 3)
    const client_id = 3;
    console.log("Usando client_id fijo:", client_id);

    // Obtener todas las categorías para el cliente
    const categories = await prisma.categories.findMany({
      where: {
        client_id: client_id
      },
      orderBy: {
        display_order: 'asc'
      }
    });

    // Mostrar información detallada de cada categoría
    console.log(`Recuperadas ${categories.length} categorías para el cliente ID ${client_id}`);
    categories.forEach((cat) => {
      console.log(`ID: ${cat.id}, Nombre: ${cat.name || 'Sin nombre'}, Estado: ${cat.status ? 'Activo' : 'Inactivo'}, Imagen: ${cat.image || 'Sin imagen'}`);
    });

    // Procesar categorías y formatear respuesta
    const processedCategories: ProcessedCategory[] = categories.map((cat) => {
      // Enviar solo el nombre del archivo de imagen, sin prefijo
      const imageFileName = cat.image || null;
      console.log(`Imagen de categoría ${cat.id}: ${imageFileName || 'Sin imagen'}`);
      
      return {
        id: cat.id,
        name: cat.name || '',
        image: imageFileName, // Solo enviar el nombre del archivo
        status: cat.status ? 'A' : 'I',
        display_order: cat.display_order || 0,
        client_id: cat.client_id || 0,
        products: 0
      };
    });

    console.log(`Devolviendo ${processedCategories.length} categorías procesadas`);
    
    return NextResponse.json(processedCategories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    console.error('Detalles del error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Buscar el usuario por email
    const user = await prisma.users.findFirst({
      where: {
        email: session.user.email
      }
    });
    
    if (!user || !user.client_id) {
      return NextResponse.json({ error: 'Usuario sin cliente asociado' }, { status: 404 });
    }
    
    const client_id = user.client_id;

    const data = await request.json();
    
    // Convertir status a booleano dependiendo del tipo que llega
    let statusBoolean = false;
    if (typeof data.status === 'string') {
      statusBoolean = data.status === 'A';
    } else if (typeof data.status === 'number') {
      statusBoolean = data.status === 1;
    } else if (typeof data.status === 'boolean') {
      statusBoolean = data.status;
    }
    
    // Guardar solo el nombre del archivo, sin manipular la ruta
    let imageName = data.image;
    
    // Crear categoría
    const category = await prisma.categories.create({
      data: {
        name: data.name,
        image: imageName,
        status: statusBoolean,
        deleted: 'N',
        client_id: client_id,
        display_order: data.display_order || 0,
        registered_at: new Date()
      }
    });

    // Devolver solo el nombre del archivo de imagen
    const imageFileName = category.image || null;

    // Transformar la categoría para la respuesta
    const processedCategory: ProcessedCategory = {
      id: category.id,
      name: category.name || '',
      image: imageFileName, // Solo enviar el nombre del archivo
      status: category.status ? 'A' : 'I',
      display_order: category.display_order || 0,
      client_id: category.client_id || 0,
      products: 0
    };

    return NextResponse.json(processedCategory);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    console.error('Detalles del error:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json({ 
      error: 'Error al crear categoría', 
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Endpoint para cambiar el estado de visibilidad de una categoría
export async function PUT(request: Request) {
  try {
    // Forzar cliente específico para pruebas (ID 3)
    const client_id = 3;
    
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID de categoría no proporcionado' }, { status: 400 });
    }
    
    console.log("Datos recibidos para actualizar:", data);

    // Obtener la categoría actual
    const currentCategory = await prisma.categories.findUnique({
      where: { id: data.id },
      select: { status: true, client_id: true, name: true, image: true }
    });

    // Verificar que la categoría pertenezca al cliente actual
    if (!currentCategory || currentCategory.client_id !== client_id) {
      return NextResponse.json({ error: 'Categoría no encontrada o acceso denegado' }, { status: 404 });
    }

    // Convertir status a booleano
    let newStatus = false;
    if (typeof data.status === 'string') {
      newStatus = data.status === 'A';
    } else if (typeof data.status === 'number') {
      newStatus = data.status === 1;
    } else if (typeof data.status === 'boolean') {
      newStatus = data.status;
    }

    console.log(`Cambiando estado de categoría ${currentCategory.name} (ID: ${data.id}) de ${currentCategory.status ? 'Activo' : 'Inactivo'} a ${newStatus ? 'Activo' : 'Inactivo'}`);

    // Actualizar la categoría
    const updatedCategory = await prisma.categories.update({
      where: { id: data.id },
      data: { status: newStatus }
    });

    console.log(`Categoría actualizada: ${updatedCategory.name}, nuevo estado = ${updatedCategory.status ? 'Activo' : 'Inactivo'}`);

    // Devolver solo el nombre del archivo de imagen, sin prefijo
    const imageFileName = updatedCategory.image || null;

    // Transformar la categoría para la respuesta
    const processedCategory: ProcessedCategory = {
      id: updatedCategory.id,
      name: updatedCategory.name || '',
      image: imageFileName, // Solo enviar el nombre del archivo
      status: updatedCategory.status ? 'A' : 'I',
      display_order: updatedCategory.display_order || 0,
      client_id: updatedCategory.client_id || 0,
      products: 0
    };

    return NextResponse.json(processedCategory);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return NextResponse.json({ 
      error: 'Error al actualizar categoría', 
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
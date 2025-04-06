import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Interfaz para la solicitud de reordenamiento
interface ReorderRequest {
  categories: {
    category_id: number;
    display_order: number;
  }[];
}

const prisma = new PrismaClient();

/**
 * Endpoint para reordenar categorías
 * Recibe un array de categorías con sus nuevas posiciones y actualiza la base de datos
 * 
 * @param req - Solicitud HTTP con un body que contiene el array de categorías a reordenar
 * @returns Respuesta HTTP con las categorías actualizadas o un error
 */
export async function PUT(req: NextRequest) {
  try {
    // Verificar la autenticación
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Extraer el ID del cliente de la sesión
    const clientId = (session.user as any).client_id;
    
    if (!clientId) {
      return NextResponse.json({ error: 'ID de cliente no encontrado' }, { status: 400 });
    }
    
    // Obtener los datos del cuerpo de la solicitud
    const data: ReorderRequest = await req.json();
    
    if (!data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
      return NextResponse.json({ error: 'Datos de categorías inválidos' }, { status: 400 });
    }
    
    // Array para guardar los resultados de las operaciones
    const updateResults = [];
    
    // Actualizar cada categoría
    for (const item of data.categories) {
      // Verificar que la categoría pertenece al cliente autenticado
      const category = await prisma.categories.findUnique({
        where: { 
          category_id: item.category_id,
          client_id: clientId
        }
      });
      
      if (!category) {
        continue; // Omitir categorías que no pertenecen al cliente
      }
      
      // Actualizar el orden de visualización
      const updatedCategory = await prisma.categories.update({
        where: { category_id: item.category_id },
        data: { display_order: item.display_order }
      });
      
      updateResults.push(updatedCategory);
    }
    
    // Revalidar la página de categorías para actualizar la caché
    revalidatePath('/dashboard');
    revalidatePath('/dashboard-v2');
    
    return NextResponse.json({ 
      message: 'Categorías reordenadas con éxito',
      categories: updateResults 
    });
  } catch (error) {
    console.error('Error al reordenar categorías:', error);
    
    return NextResponse.json(
      { error: 'Error al procesar la solicitud de reordenamiento' },
      { status: 500 }
    );
  }
}

interface Category {
  id: number;
  order: number;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    if (!body || !body.categories || !Array.isArray(body.categories)) {
      return NextResponse.json({ error: 'Invalid request format. Expected categories array.' }, { status: 400 });
    }
    
    const categories: Category[] = body.categories;
    
    console.log('Reordenando categorías:', categories);
    
    // Aquí iría la lógica para actualizar las categorías en la base de datos
    
    // Ejemplo de implementación (simulado):
    // Construir la consulta SQL o llamada a la API
    const updatePromises = categories.map(category => {
      // Simulamos la actualización 
      console.log(`Actualizando categoría ${category.id} a orden ${category.order}`);
      // En un entorno real, aquí irían las llamadas a la base de datos
      return Promise.resolve();
    });
    
    await Promise.all(updatePromises);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Categories reordered successfully',
      updated: categories.length
    });
    
  } catch (error) {
    console.error('Error reordenando categorías:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
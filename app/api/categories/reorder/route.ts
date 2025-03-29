import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma/prisma';

/**
 * API para reordenar categorías
 * Maneja las solicitudes POST para actualizar el orden de múltiples categorías a la vez
 * 
 * @route POST /api/categories/reorder
 * @returns NextResponse con los resultados actualizados o un mensaje de error
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

    // 3. Obtener y validar los datos de la solicitud
    const data = await request.json();
    
    if (!data.categories || !Array.isArray(data.categories)) {
      return NextResponse.json(
        { error: 'Formato inválido: se requiere un array de categorías' }, 
        { status: 400 }
      );
    }

    // 4. Obtener todas las categorías del cliente
    const categories = await prisma.categories.findMany({
      where: {
        client_id: user.client_id,
        OR: [
          { deleted: 0 as any },
          { deleted: null }
        ]
      },
      orderBy: {
        display_order: 'asc',
      },
    });

    // 5. Verificar que todas las categorías pertenezcan al cliente
    const categoryIds = data.categories.map((cat: any) => cat.id);
    
    console.log("[DEBUG] Reordenando categorías IDs:", categoryIds);
    
    const existingCategories = await prisma.categories.findMany({
      where: {
        category_id: { in: categoryIds },
        client_id: user.client_id,
        OR: [
          { deleted: 0 as any },
          { deleted: null }
        ]
      },
      select: {
        category_id: true,
      },
    });
    
    console.log("[DEBUG] Categorías encontradas:", existingCategories.map(c => c.category_id));

    if (existingCategories.length !== categoryIds.length) {
      console.warn(`[WARN] No se encontraron todas las categorías: esperadas=${categoryIds.length}, encontradas=${existingCategories.length}`);
      return NextResponse.json(
        { error: 'Una o más categorías no existen o no pertenecen a este cliente' }, 
        { status: 400 }
      );
    }

    // 6. Actualizar el orden de las categorías en una transacción
    try {
      console.log("[DEBUG] Iniciando transacción para actualizar orden");
      const updates = await prisma.$transaction(
        data.categories.map((cat: any) => {
          console.log(`[DEBUG] Actualizando categoría ID=${cat.id} a display_order=${cat.display_order}`);
          return prisma.categories.update({
            where: {
              category_id: cat.id,
            },
            data: {
              display_order: cat.display_order,
            },
          });
        })
      );
      
      console.log(`[DEBUG] Actualización exitosa: ${updates.length} categorías actualizadas`);

      // 7. Devolver respuesta de éxito
      return NextResponse.json({
        success: true,
        message: 'Orden de categorías actualizado correctamente',
        updated: updates.length,
      });
    } catch (txError) {
      console.error('[ERROR] Error en la transacción:', txError);
      return NextResponse.json(
        { error: 'Error al actualizar el orden de las categorías en la base de datos' }, 
        { status: 500 }
      );
    }
    
  } catch (error) {
    // 8. Manejo centralizado de errores
    console.error('Error al reordenar categorías:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el orden de las categorías' }, 
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/prisma/prisma';

/**
 * @route DELETE /api/products/[id]
 * @description Elimina un producto específico por su ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Iniciando eliminación del producto con ID: ${params.id}`);
    
    // 1. Verificación de autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('Error: No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Obtener el usuario y verificar que tenga un cliente asociado
    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
    });

    if (!user?.client_id) {
      console.log('Error: Cliente no encontrado');
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // 3. Obtener y validar el ID del producto
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      console.log(`Error: ID de producto inválido: ${params.id}`);
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }
    
    console.log(`Buscando producto con ID: ${productId} para el cliente: ${user.client_id}`);
    
    // 4. Verificar que el producto exista y pertenezca al cliente
    const product = await prisma.products.findFirst({
      where: {
        product_id: productId,
        client_id: user.client_id,
      },
      include: {
        products_sections: true
      }
    });

    if (!product) {
      console.log(`Error: Producto no encontrado: ${productId}`);
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    
    console.log(`Producto encontrado: ${JSON.stringify(product)}`);
    
    if (product.deleted === 'Y') {
      console.log(`Advertencia: El producto ya está marcado como eliminado: ${productId}`);
      return NextResponse.json({ 
        success: true, 
        message: 'El producto ya estaba eliminado' 
      });
    }

    // 5. Primero eliminamos todas las relaciones del producto en products_sections
    console.log(`Eliminando relaciones en products_sections para el producto: ${productId}`);
    await prisma.products_sections.deleteMany({
      where: {
        product_id: productId,
      },
    });
    
    console.log(`Relaciones en products_sections eliminadas correctamente`);

    // 6. Luego marcamos el producto como eliminado
    console.log(`Marcando producto como eliminado: ${productId}`);
    await prisma.products.update({
      where: {
        product_id: productId,
      },
      data: {
        deleted: 'Y',
        deleted_at: new Date().toISOString().substring(0, 19).replace('T', ' '),
        deleted_by: (session.user.email || '').substring(0, 50),
        deleted_ip: (request.headers.get('x-forwarded-for') || 'API').substring(0, 20),
        status: false,
      },
    });
    
    console.log(`Producto marcado como eliminado correctamente: ${productId}`);

    // 7. Devolver respuesta de éxito
    return NextResponse.json({ 
      success: true, 
      message: 'Producto eliminado correctamente' 
    });
  } catch (error) {
    // 8. Manejo centralizado de errores
    console.error('Error al eliminar el producto:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 
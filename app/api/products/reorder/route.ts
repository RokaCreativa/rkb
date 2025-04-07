import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma/prisma';

/**
 * Interfaz que define la estructura mínima requerida para un producto
 * que se va a reordenar
 */
interface Product {
  product_id: number;
  display_order: number;
}

/**
 * API para reordenar productos
 * Maneja las solicitudes POST para actualizar el orden de múltiples productos a la vez
 * 
 * @route POST /api/products/reorder
 * @returns NextResponse con los resultados actualizados o un mensaje de error
 */
export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Procesar el cuerpo de la petición
    const body = await request.json();
    
    if (!body || !body.products || !Array.isArray(body.products)) {
      return NextResponse.json({ error: 'Invalid request format. Expected products array.' }, { status: 400 });
    }
    
    const products: Product[] = body.products;
    
    console.log('👉 Reordenando productos:', products);
    
    // Validar que cada producto tenga los campos requeridos
    const invalidProducts = products.filter(p => 
      !p.product_id || typeof p.product_id !== 'number' || 
      p.display_order === undefined || typeof p.display_order !== 'number'
    );
    
    if (invalidProducts.length > 0) {
      console.error('⚠️ Productos con formato inválido:', invalidProducts);
      return NextResponse.json({ 
        error: 'Some products have invalid format', 
        invalidProducts 
      }, { status: 400 });
    }
    
    console.log(`✅ Validación completa. Actualizando ${products.length} productos...`);
    
    // Actualizar los productos en la base de datos
    const updatePromises = products.map(product => {
      console.log(`- Actualizando producto ID ${product.product_id} a orden ${product.display_order}`);
      return prisma.products.update({
        where: { product_id: product.product_id },
        data: { display_order: product.display_order }
      }).catch(error => {
        console.error(`❌ Error actualizando producto ${product.product_id}:`, error);
        throw error; // Re-lanzar el error para que falle la promesa
      });
    });
    
    try {
      // Ejecutar todas las actualizaciones
      const updatedProducts = await Promise.all(updatePromises);
      console.log(`✅ ${updatedProducts.length} productos actualizados exitosamente`);
    
      // Devolver respuesta exitosa
      return NextResponse.json({ 
        success: true, 
        message: 'Products reordered successfully',
        updated: updatedProducts.length
      });
    } catch (updateError) {
      console.error('❌ Error en la actualización de productos:', updateError);
      return NextResponse.json({ 
        error: 'Error updating products',
        message: updateError instanceof Error ? updateError.message : 'Unknown error during update'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error general reordenando productos:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
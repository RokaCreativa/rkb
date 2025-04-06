import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
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
    
    // Verificar si el producto ya está marcado como eliminado
    if (product.deleted === true) {
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
        deleted: true,
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

// Ruta base para las imágenes de productos
const IMAGE_BASE_PATH = '/images/products/';

/**
 * Obtiene los detalles de un producto específico
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await Promise.resolve(params.id);

    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener usuario y verificar cliente
    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
    });

    if (!user?.client_id) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener el producto con sus secciones
    const product = await prisma.products.findFirst({
      where: {
        product_id: parseInt(id),
        client_id: user.client_id,
        deleted: false,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    console.log('Valor original de product.image:', product.image);

    // Obtener las secciones del producto
    const productSections = await prisma.products_sections.findMany({
      where: {
        product_id: product.product_id,
      },
      include: {
        sections: true,
      },
    });

    // Procesar el producto para el frontend
    const processedProduct = {
      product_id: product.product_id,
      name: product.name || '',
      image: product.image 
        ? (() => {
            console.log('Procesando imagen del producto:', product.image);
            
            // Primero eliminamos cualquier prefijo existente
            let cleanImage = product.image;
            const prefixes = ['/images/products/', 'images/products/'];
            
            // Eliminar cualquier prefijo existente
            for (const prefix of prefixes) {
              if (cleanImage.startsWith(prefix)) {
                console.log(`Eliminando prefijo "${prefix}" de la ruta de la imagen`);
                cleanImage = cleanImage.substring(prefix.length);
                break;
              }
            }
            
            // Ahora añadimos el prefijo correcto
            const finalImagePath = `${IMAGE_BASE_PATH}${cleanImage}`;
            console.log('Ruta final de la imagen:', finalImagePath);
            return finalImagePath;
          })()
        : null,
      status: product.status ? 1 : 0,
      display_order: product.display_order || 0,
      client_id: product.client_id || 0,
      price: parseFloat(product.price?.toString() || '0'),
      description: product.description,
      sections: productSections.map(ps => ({
        section_id: ps.sections.section_id,
        name: ps.sections.name || '',
      })),
    };

    console.log('Producto procesado:', processedProduct);
    return NextResponse.json(processedProduct);
  } catch (error) {
    console.error('Error al obtener detalles del producto:', error);
    return NextResponse.json(
      { error: 'Error al obtener detalles del producto' },
      { status: 500 }
    );
  }
}

/**
 * Actualiza un producto existente
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener usuario y verificar cliente
    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
    });

    if (!user?.client_id) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener ID del producto
    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    // Verificar que el producto existe y pertenece al cliente
    const existingProduct = await prisma.products.findFirst({
      where: {
        product_id: productId,
        client_id: user.client_id,
        deleted: false,
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Obtener los datos del body
    const data = await request.json();
    const { name, description, price, status, display_order, section_id } = data;

    console.log('Actualizando producto:', {
      productId,
      name,
      description,
      price,
      status,
      display_order,
      section_id
    });

    // Actualizar el producto
    const updatedProduct = await prisma.products.update({
      where: { product_id: productId },
      data: {
        name: name || undefined,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        status: status !== undefined ? status : undefined,
        display_order: display_order !== undefined ? display_order : undefined,
      },
    });

    // Si se proporciona un ID de sección, actualizar la relación
    if (section_id) {
      // Primero eliminar las relaciones existentes
      await prisma.products_sections.deleteMany({
        where: { product_id: productId }
      });

      // Luego crear la nueva relación
      await prisma.products_sections.create({
        data: {
          product_id: productId,
          section_id: parseInt(section_id)
        }
      });

      console.log(`Relación actualizada: producto ${productId} -> sección ${section_id}`);
    }

    // Obtener el producto actualizado con sus relaciones
    const productSections = await prisma.products_sections.findMany({
      where: {
        product_id: productId,
      },
      include: {
        sections: true,
      },
    });

    // Formatear la imagen del producto para la respuesta
    let productImage = updatedProduct.image;
    if (productImage) {
      if (!productImage.startsWith('/')) {
        productImage = `/images/products/${productImage}`;
      }
    }

    // Preparar el producto actualizado para la respuesta
    const responseProduct = {
      ...updatedProduct,
      image: productImage,
      section_id: productSections.length > 0 ? productSections[0].section_id : null,
      section_name: productSections.length > 0 ? productSections[0].sections.name : null
    };

    // Retornar el producto actualizado
    return NextResponse.json({
      success: true,
      product: responseProduct,
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 
/**
 * 🧭 MIGA DE PAN CONTEXTUAL
 * 
 * 📍 UBICACIÓN: app/api/products/[id]/route.ts
 * 
 * 🎯 OBJETIVO: Proveer endpoints para operaciones CRUD sobre un PRODUCTO específico.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. PUT (Actualizar): Recibe datos parciales de un producto. Valida con Zod. Actualiza en BD.
 * 2. DELETE (Eliminar): Recibe el ID de un producto. Lo elimina de la BD.
 *
 * 🔗 CONEXIONES:
 * - Es consumido por `updateProduct` y `deleteProduct` en `dashboardStore.ts`.
 * - `EditProductModal` y `DeleteConfirmationModal` (a través del store) disparan estas operaciones.
 * 
 * ⚠️ CONSIDERACIONES:
 * - La validación de Zod es crucial aquí por la cantidad de campos opcionales que tiene un producto.
 * - Este endpoint no maneja la subida de imágenes, solo la actualización de la ruta del archivo de imagen.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from '@/prisma/prisma';
import { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * @route DELETE /api/products/[id]
 * @description Elimina un producto específico por su ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }

    await prisma.products.delete({
      where: { product_id: productId },
    });

    return NextResponse.json({ message: 'Producto eliminado con éxito' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
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

const updateProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  description: z.string().optional().nullable(),
  price: z.number().optional(),
  status: z.boolean().optional(),
  image: z.string().optional().nullable(),
  display_order: z.number().optional(),
  section_id: z.number().optional().nullable(),
  category_id: z.number().optional().nullable(),
  is_showcased: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.formErrors.fieldErrors }, { status: 400 });
    }

    const updatedProduct = await prisma.products.update({
      where: { product_id: productId },
      data: validation.data,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 
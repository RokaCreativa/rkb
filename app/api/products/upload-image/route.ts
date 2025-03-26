import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Endpoint para subir una imagen de producto
 * @route POST /api/products/upload-image
 */
export async function POST(request: Request) {
  try {
    // 1. Verificar autenticación
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

    // 3. Procesar FormData para obtener el archivo y el ID del producto
    const formData = await request.formData();
    const productIdStr = formData.get('product_id');
    const file = formData.get('image') as File | null;

    console.log('POST /api/products/upload-image - productId:', productIdStr);

    if (!productIdStr) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
    }

    const productId = parseInt(productIdStr.toString());

    if (!file) {
      return NextResponse.json({ error: 'Imagen requerida' }, { status: 400 });
    }

    // 4. Verificar que el producto existe y pertenece al cliente
    const product = await prisma.products.findFirst({
      where: {
        product_id: productId,
        client_id: user.client_id,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // 5. Procesar y guardar la imagen
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Crear nombre de archivo único (timestamp + nombre original)
      const timestamp = Date.now();
      const fileName = file.name.replace(/\s+/g, '-').toLowerCase();
      const uniqueFileName = `${timestamp}_${fileName}`;

      // Guardar la imagen en el directorio público
      const publicDir = join(process.cwd(), 'public');
      const productsDir = join(publicDir, 'images', 'products');
      const imagePath = join(productsDir, uniqueFileName);

      await writeFile(imagePath, buffer);

      // 6. Actualizar el producto con la nueva imagen
      await prisma.products.update({
        where: {
          product_id: productId,
        },
        data: {
          image: uniqueFileName,
        },
      });

      // 7. Retornar éxito con la URL de la imagen
      return NextResponse.json({
        success: true,
        image: uniqueFileName,
        imageUrl: `/images/products/${uniqueFileName}`,
      });
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error en upload-image:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 
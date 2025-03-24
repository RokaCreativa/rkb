import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma/prisma';
import fs from 'fs';
import path from 'path';

// Ruta para procesar y guardar imágenes de productos
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

    // 3. Obtener y validar los datos del formulario
    const formData = await request.formData();
    const productId = formData.get('product_id');
    const file = formData.get('image') as File | null;

    if (!productId) {
      return NextResponse.json({ error: 'ID de producto es requerido' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ninguna imagen' }, { status: 400 });
    }

    // 4. Verificar que el producto pertenezca al cliente del usuario
    const product = await prisma.products.findFirst({
      where: {
        product_id: Number(productId),
        client_id: user.client_id,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // 5. Procesar la imagen
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear nombre de archivo único basado en timestamp
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
    const extension = path.extname(originalName);
    const filename = `product_${product.product_id}_${timestamp}${extension}`;

    // Asegurar que el directorio existe
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Escribir el archivo en el sistema de archivos
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    // 6. Actualizar la referencia de la imagen en la base de datos
    // Si hay una imagen anterior, eliminarla
    if (product.image) {
      try {
        const oldImagePath = path.join(process.cwd(), 'public', 'images', 'products', product.image as string);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (error) {
        console.error('Error al eliminar imagen anterior:', error);
      }
    }

    // Actualizar la referencia en la base de datos
    await prisma.products.update({
      where: {
        product_id: Number(productId),
      },
      data: {
        image: filename,
      },
    });

    // 7. Devolver la respuesta
    return NextResponse.json({ 
      success: true, 
      image: filename,
      imageUrl: `/images/products/${filename}`
    });

  } catch (error) {
    console.error('Error al procesar la imagen del producto:', error);
    return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
  }
} 
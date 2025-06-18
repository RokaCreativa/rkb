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
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises'

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

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Actualización Polimórfica de Productos
 *
 * 🎯 PORQUÉ EXISTE:
 * Esta función PATCH es el endpoint unificado para actualizar un producto. Está diseñada para ser
 * polimórfica, aceptando tanto peticiones `application/json` (para cambios de texto, estado, etc.)
 * como `multipart/form-data` (cuando se incluye una nueva imagen).
 *
 * 🔄 FLUJO DE DATOS:
 * 1. El `apiClient` desde el frontend envía una petición PATCH.
 * 2. Esta función revisa el `Content-Type` de la cabecera.
 * 3. Si es `multipart/form-data`:
 *    a. Parsea el `FormData`.
 *    b. Guarda el archivo de imagen en `public/images/products`.
 *    c. Construye el objeto `updateData` con el nuevo nombre de la imagen y los demás campos.
 * 4. Si es `json`:
 *    a. Parsea el body como JSON.
 * 5. Actualiza el producto en la base de datos con `updateData`.
 *
 * 🚨 PROBLEMA RESUELTO:
 * Anteriormente, esta función solo aceptaba JSON, causando un error cuando el frontend enviaba
 * una imagen (`FormData`). Esta refactorización lo unificó, solucionando el bug de guardado de imágenes.
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - #6 (Separación de Responsabilidades): La API maneja la lógica de archivos, no el frontend.
 * - #8 (Consistencia): Se alinea con el comportamiento de otros endpoints de actualización.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id, 10);
  if (isNaN(productId)) {
    return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
  }

  try {
    let updateData: any;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      updateData = {};

      // Iterar sobre los campos del FormData
      formData.forEach((value, key) => {
        if (key !== 'image') {
          // Valores de FormData son strings, necesitamos convertirlos/parsearlos
          if (key === 'status' || key === 'is_showcased') {
            updateData[key] = value === 'true';
          } else if (key === 'price' && typeof value === 'string') {
            updateData[key] = parseFloat(value);
          } else if (key === 'display_order' && typeof value === 'string') {
            const num = parseInt(value, 10);
            if (!isNaN(num)) updateData.display_order = num;
          }
          else if (key === 'section_id' && typeof value === 'string') {
            const num = parseInt(value, 10);
            if (!isNaN(num)) updateData.section_id = num;
          }
          else if (key === 'category_id' && typeof value === 'string') {
            const num = parseInt(value, 10);
            if (!isNaN(num)) updateData.category_id = num;
          }
          else {
            // Para 'name' y 'description', que son strings
            updateData[key] = value;
          }
        }
      });

      const imageFile = formData.get('image') as File | null;
      if (imageFile) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const filename = `${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;
        const imagePath = path.join(process.cwd(), 'public/images/products', filename);
        await writeFile(imagePath, buffer);
        updateData.image = filename;
      }
    } else {
      // Si no es multipart, asumimos que es JSON
      updateData = await req.json();
    }

    // Eliminar el campo display_order si es null/undefined para evitar errores de Prisma
    if (updateData.display_order === null || updateData.display_order === undefined) {
      delete updateData.display_order;
    }

    // Si section_id es null, lo eliminamos para que Prisma no intente establecer una relación inexistente
    if (updateData.section_id === null) {
      delete updateData.section_id;
    }

    if (updateData.category_id === null) {
      delete updateData.category_id;
    }


    const updatedProduct = await prisma.products.update({
      where: { product_id: productId },
      data: updateData,
    });

    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error(`Error al actualizar producto ${params.id}:`, error);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from "@/prisma/prisma";
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Ruta base para las imágenes de productos
const IMAGE_BASE_PATH = '/images/products/';

// Interfaz para productos procesados para el frontend
interface ProcessedProduct {
  product_id: number;
  name: string;
  image: string | null;
  status: number; // 1 (activo) o 0 (inactivo)
  display_order: number;
  client_id: number;
  price: number;
  description: string | null;
  sections: {
    section_id: number;
    name: string;
  }[];
}

/**
 * Obtiene todos los productos o los productos de una sección específica
 * 
 * @param request - Objeto de solicitud HTTP
 * @returns Respuesta HTTP con los productos o un mensaje de error
 */
export async function GET(request: Request) {
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

    // 3. Obtener parámetros de consulta (si existe section_id)
    const url = new URL(request.url);
    const sectionId = url.searchParams.get('section_id');

    // 4. Obtener todos los productos del cliente
    const products = await prisma.products.findMany({
      where: {
        client_id: user.client_id,
        deleted: { not: 1 } as any
      },
      orderBy: {
        display_order: 'asc',
      },
    });

    // 5. Obtener las relaciones productos-secciones
    let productsSections;
    if (sectionId) {
      // Si se especificó una sección, filtrar por ella
      productsSections = await prisma.products_sections.findMany({
        where: {
          section_id: parseInt(sectionId),
        },
      });
    } else {
      // Si no se especificó sección, obtener todas
      productsSections = await prisma.products_sections.findMany();
    }

    // 6. Obtener información de todas las secciones para incluir sus nombres
    const sections = await prisma.sections.findMany({
      where: {
        client_id: user.client_id,
        deleted: { not: 1 } as any
      },
      select: {
        section_id: true,
        name: true,
      },
    });

    // 7. Mapear secciones por ID para búsqueda rápida
    const sectionsMap = new Map(
      sections.map(section => [section.section_id, section])
    );

    // 8. Filtrar productos que están en la sección solicitada (si se especificó)
    const filteredProductIds = sectionId
      ? new Set(productsSections.map(ps => ps.product_id))
      : null;

    const filteredProducts = sectionId
      ? products.filter(product => filteredProductIds?.has(product.product_id))
      : products;

    // 9. Procesar los productos para el formato esperado por el frontend
    const processedProducts = filteredProducts.map(product => {
      // Encontrar todas las secciones a las que pertenece este producto
      const productSectionIds = productsSections
        .filter(ps => ps.product_id === product.product_id)
        .map(ps => ps.section_id);

      // Mapear las secciones con nombres
      const productSections = productSectionIds
        .map(sectionId => sectionsMap.get(sectionId))
        .filter(Boolean)
        .map(section => ({
          section_id: section!.section_id,
          name: section!.name || '',
        }));

      return {
        product_id: product.product_id,
        name: product.name || '',
        image: product.image 
          ? (() => {
              // Si ya contiene el prefijo completo, devolverlo tal cual
              if (product.image.startsWith('/images/products/')) {
                return product.image;
              }
              // Si contiene el prefijo sin la barra inicial, añadirla
              if (product.image.startsWith('images/products/')) {
                return '/' + product.image;
              }
              // En cualquier otro caso, añadir el prefijo completo
              return `${IMAGE_BASE_PATH}${product.image}`;
            })()
          : null,
        status: product.status ? 1 : 0,
        display_order: product.display_order || 0,
        client_id: product.client_id || 0,
        price: parseFloat(product.price?.toString() || '0'),
        description: product.description,
        sections: productSections,
      };
    });

    // 10. Devolver los productos procesados
    return NextResponse.json(processedProducts);
  } catch (error) {
    // 11. Manejo centralizado de errores
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

/**
 * Crea un nuevo producto para el cliente actual
 * 
 * @param request - Objeto de solicitud HTTP con datos del producto
 * @returns Respuesta HTTP con el producto creado o un mensaje de error
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

    // 3. Obtener y validar los datos del formulario
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string;
    const file = formData.get('image') as File | null;
    const status = formData.get('status') === '1'; // Convertir a booleano
    
    // Obtener secciones a las que pertenece este producto
    const sectionsJson = formData.get('sections') as string;
    let sectionIds: number[] = [];
    
    try {
      sectionIds = JSON.parse(sectionsJson);
    } catch (e) {
      console.error('Error al parsear secciones:', e);
    }

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    if (isNaN(price)) {
      return NextResponse.json({ error: 'El precio es requerido y debe ser un número' }, { status: 400 });
    }

    if (sectionIds.length === 0) {
      return NextResponse.json({ error: 'El producto debe pertenecer al menos a una sección' }, { status: 400 });
    }

    // 4. Verificar que las secciones existen y pertenecen al cliente
    const sectionsCount = await prisma.sections.count({
      where: {
        section_id: { in: sectionIds },
        client_id: user.client_id,
        deleted: { not: 1 } as any
      },
    });

    if (sectionsCount !== sectionIds.length) {
      return NextResponse.json({ error: 'Una o más secciones seleccionadas no son válidas' }, { status: 400 });
    }

    // 5. Determinar el próximo valor de display_order
    const maxOrderResult = await prisma.$queryRaw`
      SELECT MAX(display_order) as maxOrder 
      FROM products 
      WHERE client_id = ${user.client_id}
    `;
    
    // @ts-ignore - La respuesta SQL puede variar
    const maxOrder = maxOrderResult[0]?.maxOrder || 0;

    // 6. Procesar la imagen si existe
    let imageUrl = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Crear un nombre de archivo único con timestamp
      const timestamp = Date.now();
      const fileName = file.name;
      const uniqueFileName = `${timestamp}_${fileName}`;
      
      // Guardar la imagen en el sistema de archivos
      const path = join(process.cwd(), 'public', 'images', 'products', uniqueFileName);
      await writeFile(path, buffer);
      
      // URL relativa para la base de datos
      imageUrl = uniqueFileName;
    }

    // 7. Crear el nuevo producto
    const newProduct = await prisma.products.create({
      data: {
        name,
        price,
        description,
        image: imageUrl,
        status: status,
        display_order: maxOrder + 1,
        client_id: user.client_id,
        deleted: 0 as any,
      },
    });

    // 8. Crear relaciones con las secciones
    const productSectionsData = sectionIds.map(sectionId => ({
      product_id: newProduct.product_id,
      section_id: sectionId,
    }));

    await prisma.products_sections.createMany({
      data: productSectionsData,
    });

    // 9. Obtener las secciones asociadas para incluir en la respuesta
    const productSections = await prisma.sections.findMany({
      where: {
        section_id: { in: sectionIds },
      },
      select: {
        section_id: true,
        name: true,
      },
    });

    // 10. Preparar la respuesta
    const processedProduct: ProcessedProduct = {
      product_id: newProduct.product_id,
      name: newProduct.name || '',
      image: imageUrl ? `${IMAGE_BASE_PATH}${imageUrl}` : null,
      status: newProduct.status ? 1 : 0,
      display_order: newProduct.display_order || 0,
      client_id: newProduct.client_id || 0,
      price: parseFloat(newProduct.price?.toString() || '0'),
      description: newProduct.description,
      sections: productSections.map(section => ({
        section_id: section.section_id,
        name: section.name || '',
      })),
    };

    return NextResponse.json(processedProduct);
  } catch (error) {
    // 11. Manejo centralizado de errores
    console.error('Error al crear el producto:', error);
    return NextResponse.json({ error: 'Error al crear el producto' }, { status: 500 });
  }
}

/**
 * Actualiza un producto existente
 * 
 * @param request - Objeto de solicitud HTTP con datos de actualización
 * @returns Respuesta HTTP con el producto actualizado o un mensaje de error
 */
export async function PUT(request: Request) {
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

    // 3. Obtener y validar los datos de actualización
    const data = await request.json();
    console.log('PUT /api/products - Datos recibidos:', data);

    if (!data.product_id) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
    }

    // 4. Preparar los datos de actualización
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.display_order !== undefined) updateData.display_order = data.display_order;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.status !== undefined) updateData.status = data.status === 1; // Convertir numérico a booleano
    if (data.price !== undefined) updateData.price = data.price;
    if (data.description !== undefined) updateData.description = data.description;
    
    console.log('PUT /api/products - Datos a actualizar:', updateData);
    console.log('PUT /api/products - ¿Imagen incluida?:', data.image !== undefined);
    console.log('PUT /api/products - Valor de imagen:', data.image);

    // 5. Actualizar el producto
    await prisma.products.updateMany({
      where: {
        product_id: data.product_id,
        client_id: user.client_id,
      },
      data: updateData,
    });

    // 6. Actualizar relaciones con secciones si se proporcionaron
    if (data.section_ids && Array.isArray(data.section_ids)) {
      // Primero eliminar todas las relaciones existentes
      await prisma.products_sections.deleteMany({
        where: {
          product_id: data.product_id,
        },
      });

      // Luego crear las nuevas relaciones
      const productSectionsData = data.section_ids.map((sectionId: number) => ({
        product_id: data.product_id,
        section_id: sectionId,
      }));

      await prisma.products_sections.createMany({
        data: productSectionsData,
      });
    }

    // 7. Obtener el producto actualizado
    const updatedProduct = await prisma.products.findFirst({
      where: {
        product_id: data.product_id,
        client_id: user.client_id,
      },
    });

    if (!updatedProduct) {
      return NextResponse.json({ error: 'No se pudo actualizar el producto' }, { status: 404 });
    }

    // 8. Obtener las secciones asociadas al producto
    const productSections = await prisma.products_sections.findMany({
      where: {
        product_id: data.product_id,
      },
      select: {
        section_id: true,
      },
    });

    const sectionIds = productSections.map(ps => ps.section_id);

    // 9. Obtener información detallada de las secciones
    const sections = await prisma.sections.findMany({
      where: {
        section_id: { in: sectionIds },
      },
      select: {
        section_id: true,
        name: true,
      },
    });

    // 10. Preparar la respuesta
    const processedProduct: ProcessedProduct = {
      product_id: updatedProduct.product_id,
      name: updatedProduct.name || '',
      image: updatedProduct.image 
        ? (() => {
            // Si ya contiene el prefijo completo, devolverlo tal cual
            if (updatedProduct.image.startsWith('/images/products/')) {
              return updatedProduct.image;
            }
            // Si contiene el prefijo sin la barra inicial, añadirla
            if (updatedProduct.image.startsWith('images/products/')) {
              return '/' + updatedProduct.image;
            }
            // En cualquier otro caso, añadir el prefijo completo
            return `${IMAGE_BASE_PATH}${updatedProduct.image}`;
          })()
        : null,
      status: updatedProduct.status ? 1 : 0,
      display_order: updatedProduct.display_order || 0,
      client_id: updatedProduct.client_id || 0,
      price: parseFloat(updatedProduct.price?.toString() || '0'),
      description: updatedProduct.description,
      sections: sections.map(section => ({
        section_id: section.section_id,
        name: section.name || '',
      })),
    };

    return NextResponse.json(processedProduct);
  } catch (error) {
    // 11. Manejo centralizado de errores
    console.error('Error al actualizar el producto:', error);
    return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 });
  }
} 
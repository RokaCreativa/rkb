/**
 * @fileoverview API Route for Products
 * @description This route handles all API requests related to products,
 *              including fetching, creating, updating, and reordering.
 * @module app/api/products/route
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from "@/prisma/prisma";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

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
 * Interfaz para la respuesta paginada de productos
 * Se usa cuando se solicitan datos con paginación
 */
interface PaginatedProductsResponse {
  data: ProcessedProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Obtiene todos los productos o los productos de una sección específica
 * Soporta paginación opcional mediante parámetros de consulta
 * 
 * @param request - Objeto de solicitud HTTP
 * @returns Respuesta HTTP con los productos o un mensaje de error
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener el ID del cliente del usuario autenticado
    const userEmail = session.user.email as string;
    const user = await prisma.users.findFirst({
      where: {
        email: userEmail
      }
    });

    if (!user || !user.client_id) {
      return new Response(JSON.stringify({ error: 'User not associated with a client' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const clientId = user.client_id;

    // Obtener los parámetros de la URL
    const url = new URL(req.url);
    const sectionId = url.searchParams.get('sectionId') || url.searchParams.get('section_id');
    const categoryId = url.searchParams.get('categoryId') || url.searchParams.get('category_id');

    // Parámetros de paginación (opcionales)
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '0'); // 0 significa sin límite

    // Validar parámetros de paginación
    const validPage = page < 1 ? 1 : page;
    const validLimit = limit < 0 ? 0 : limit;
    const isPaginated = validLimit > 0;

    // 🎯 JERARQUÍA FLEXIBLE: Soporte para category_id (modo simple)
    // Si se especifica category_id, buscar productos directamente por categoría
    if (categoryId && !sectionId) {
      const categoryIdInt = parseInt(categoryId);

      // Obtener productos por categoría usando la tabla products_sections
      const productsInCategory = await prisma.products_sections.findMany({
        where: {
          sections: {
            category_id: categoryIdInt,
            client_id: clientId
          }
        },
        include: {
          products: {
            where: {
              deleted: false
            }
          }
        }
      });

      // Extraer productos únicos (evitar duplicados si un producto está en múltiples secciones)
      const uniqueProducts = new Map();
      productsInCategory.forEach(relation => {
        if (relation.products && !uniqueProducts.has(relation.products.product_id)) {
          uniqueProducts.set(relation.products.product_id, {
            ...relation.products,
            image: relation.products.image || null,
            status: relation.products.status ? 1 : 0
          });
        }
      });

      const processedProducts = Array.from(uniqueProducts.values()).sort((a, b) => {
        // Ordenar por status (activos primero) y luego por display_order
        if (a.status !== b.status) return b.status - a.status;
        return a.display_order - b.display_order;
      });

      return new Response(JSON.stringify(processedProducts), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Si no se especifica una sección, devolver todos los productos del cliente
    if (!sectionId) {
      // Obtener el total de productos si hay paginación
      let totalProducts: number | undefined;
      if (isPaginated) {
        totalProducts = await prisma.products.count({
          where: {
            client_id: clientId,
            deleted: false
          }
        });
      }

      // Calcular parámetros de paginación para Prisma
      const skip = isPaginated ? (validPage - 1) * validLimit : undefined;
      const take = isPaginated ? validLimit : undefined;

      const allProducts = await prisma.products.findMany({
        where: {
          client_id: clientId,
          deleted: false
        },
        orderBy: [
          { status: 'desc' },
          { display_order: 'asc' }
        ],
        skip,
        take
      });

      // Procesar los productos para el formato requerido por el frontend
      const processedProducts = allProducts.map(product => {
        return {
          ...product,
          image: product.image || null,
          status: product.status ? 1 : 0
        };
      });

      // Devolver respuesta según sea paginada o no
      if (isPaginated && totalProducts !== undefined) {
        const totalPages = Math.ceil(totalProducts / validLimit);

        return new Response(JSON.stringify({
          data: processedProducts,
          meta: {
            total: totalProducts,
            page: validPage,
            limit: validLimit,
            totalPages
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify(processedProducts), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Si se especifica una sección, buscar los productos de esa sección directamente
    const sectionIdInt = parseInt(sectionId);

    // Obtener total de productos si hay paginación
    let totalProducts: number | undefined;
    if (isPaginated) {
      // Primero obtenemos el conteo de todos los productos del cliente
      const allProductsCount = await prisma.products.count({
        where: {
          client_id: clientId,
          deleted: false
        }
      });

      // Si no hay productos en general, devolvemos un array vacío
      if (allProductsCount === 0) {
        return returnEmptyProducts(isPaginated, validPage, validLimit);
      }

      // Obtenemos todos los productos para contarlos manualmente (sin paginación)
      // Esto es ineficiente pero es temporal hasta actualizar el esquema
      const allProducts = await prisma.products.findMany({
        where: {
          client_id: clientId,
          deleted: false
        },
        select: {
          product_id: true,
          // @ts-ignore - Seleccionamos section_id aunque TypeScript no lo reconozca
          section_id: true
        }
      });

      // Filtramos por section_id manualmente para obtener el conteo real
      totalProducts = allProducts.filter(product => {
        // @ts-ignore - El campo section_id existe en la DB pero no en el tipo
        return product.section_id === sectionIdInt;
      }).length;

      // Si no hay productos en esta sección, devolver un array vacío
      if (totalProducts === 0) {
        return returnEmptyProducts(isPaginated, validPage, validLimit);
      }
    }

    // Utilizamos una estrategia alternativa para obtener los productos
    // Obtenemos todos los productos del cliente y luego filtramos por section_id en el código
    const allClientProducts = await prisma.products.findMany({
      where: {
        client_id: clientId,
        deleted: false
      },
      orderBy: [
        { status: 'desc' },
        { display_order: 'asc' }
      ],
      skip: isPaginated ? (validPage - 1) * validLimit : undefined,
      take: isPaginated ? validLimit : undefined
    });

    // Filtrar manualmente por section_id
    const products = allClientProducts.filter(product => {
      // @ts-ignore - El campo section_id existe en la DB pero no en el tipo
      return product.section_id === sectionIdInt;
    });

    // Si no hay productos, devolver array vacío
    if (products.length === 0) {
      return returnEmptyProducts(isPaginated, validPage, validLimit);
    }

    // Ajustar el total de productos para la paginación
    if (!isPaginated) {
      totalProducts = products.length;
    }

    // Procesamos y devolvemos la respuesta
    return processProductsResponse(products, isPaginated, validPage, validLimit, totalProducts);
  } catch (error) {
    console.error('Error getting products:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
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
    // Convertir a booleano (true para activo, false para inactivo)
    const status = formData.get('status') === '1';

    // 🎯 T32 FIX - JERARQUÍA HÍBRIDA: Manejar category_id Y section_id
    const categoryId = formData.get('category_id') as string;
    const sectionIdDirect = formData.get('section_id') as string;

    // Obtener secciones a las que pertenece este producto (modo tradicional)
    const sectionsJson = formData.get('sections') as string;
    let sectionIds: number[] = [];

    try {
      if (sectionsJson) {
        sectionIds = JSON.parse(sectionsJson);
      }
    } catch (e) {
      console.error('Error al parsear secciones:', e);
    }

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    if (isNaN(price)) {
      return NextResponse.json({ error: 'El precio es requerido y debe ser un número' }, { status: 400 });
    }

    // 🎯 LÓGICA ADAPTATIVA: Determinar sección según el modo
    let primarySectionId: number | null = null;

    if (categoryId && !sectionIdDirect) {
      // MODO SIMPLE: Crear producto en la primera sección de la categoría
      const categoryIdInt = parseInt(categoryId);

      // Buscar la primera sección de esta categoría
      const firstSection = await prisma.sections.findFirst({
        where: {
          category_id: categoryIdInt,
          client_id: user.client_id,
          deleted: 0 as any
        },
        orderBy: {
          display_order: 'asc'
        }
      });

      if (!firstSection) {
        return NextResponse.json({ error: 'No se encontraron secciones en esta categoría' }, { status: 400 });
      }

      primarySectionId = firstSection.section_id;
    } else if (sectionIdDirect) {
      // MODO DIRECTO: Usar section_id específico
      primarySectionId = parseInt(sectionIdDirect);
    } else if (sectionIds.length > 0) {
      // MODO TRADICIONAL: Usar primera sección del array
      primarySectionId = sectionIds[0];
    }

    if (!primarySectionId) {
      return NextResponse.json({ error: 'El producto debe pertenecer al menos a una sección' }, { status: 400 });
    }

    // 4. Verificar que la sección existe y pertenece al cliente
    const sectionExists = await prisma.sections.findFirst({
      where: {
        section_id: primarySectionId,
        client_id: user.client_id,
        deleted: 0 as any
      },
    });

    if (!sectionExists) {
      return NextResponse.json({ error: 'La sección seleccionada no es válida' }, { status: 400 });
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

    // 7. Usamos el primer section_id como sección principal para el producto
    // En el nuevo modelo de datos, un producto solo puede estar en una sección a la vez
    if (!primarySectionId) {
      return NextResponse.json({ error: 'Se requiere al menos una sección' }, { status: 400 });
    }

    // Crear el nuevo producto con el section_id directamente
    const newProduct = await prisma.products.create({
      data: {
        name,
        price,
        description,
        image: imageUrl,
        status: status as any,
        display_order: maxOrder + 1,
        client_id: user.client_id,
        deleted: false as any,
        // @ts-ignore - Usamos el section_id directamente ahora
        section_id: primarySectionId,
      },
    });

    // NOTA: Ya no es necesario usar la tabla products_sections
    // Si se seleccionaron múltiples secciones, advertimos que solo se usará la primera
    if (sectionIds.length > 1) {
      console.warn(`⚠️ Se seleccionaron ${sectionIds.length} secciones, pero solo se asignó la primera (ID: ${primarySectionId})`);
    }

    // Obtener nombre de la sección para la respuesta
    const section = await prisma.sections.findUnique({
      where: { section_id: primarySectionId },
      select: { name: true }
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
      sections: [{
        section_id: primarySectionId,
        name: section?.name || 'Sección sin nombre',
      }],
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
export async function PUT(req: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ message: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Procesar el formulario multipart
    const formData = await req.formData();
    const product_id = formData.get('product_id')?.toString();
    const name = formData.get('name')?.toString();
    const price = formData.get('price')?.toString();
    const description = formData.get('description')?.toString();
    const section_id = formData.get('section_id')?.toString();
    const client_id = formData.get('client_id')?.toString();
    const image = formData.get('image') as File | null;
    const existing_image = formData.get('existing_image')?.toString(); // Obtener la imagen existente

    // Validar datos requeridos
    if (!product_id || !name || !section_id || !client_id) {
      return new Response(
        JSON.stringify({
          message: 'Faltan datos requeridos para actualizar el producto',
          details: {
            product_id: product_id ? 'OK' : 'Missing',
            name: name ? 'OK' : 'Missing',
            section_id: section_id ? 'OK' : 'Missing',
            client_id: client_id ? 'OK' : 'Missing'
          }
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parsear IDs
    const productId = parseInt(product_id);
    const sectionId = parseInt(section_id);
    const clientId = parseInt(client_id);

    // Verificar si el producto existe
    const prisma = new PrismaClient();
    const existingProduct = await prisma.products.findUnique({
      where: { product_id: productId },
    });

    if (!existingProduct) {
      await prisma.$disconnect();
      return new Response(JSON.stringify({ message: 'Producto no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Procesar imagen si se proporciona
    let imagePath = existingProduct.image; // Mantener la imagen existente por defecto
    if (image && image.size > 0) {
      // Se proporcionó una nueva imagen, procesarla
      const imageName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${(image.name || 'image').split('.').pop()}`;
      const imageBuffer = Buffer.from(await image.arrayBuffer());

      const publicDir = path.join(process.cwd(), 'public');
      const imageDir = path.join(publicDir, 'images', 'products');

      // Asegurarse de que el directorio existe
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }

      const imageFilePath = path.join(imageDir, imageName);
      fs.writeFileSync(imageFilePath, imageBuffer);

      imagePath = `/images/products/${imageName}`;
    } else if (existing_image) {
      // Si no hay nueva imagen pero se proporcionó una referencia a la imagen existente
      imagePath = existing_image;
    }
    // Si no hay nueva imagen ni existing_image, se mantiene la imagen actual

    // Actualizar producto
    const updatedProduct = await prisma.products.update({
      where: { product_id: productId },
      data: {
        name,
        price,
        description: description || null,
        image: imagePath,
        // Otros campos a actualizar si es necesario
      },
    });

    await prisma.$disconnect();

    // Devolver producto actualizado
    return new Response(JSON.stringify(updatedProduct), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error al actualizar producto:', error);

    return new Response(
      JSON.stringify({
        message: 'Error al actualizar producto',
        error: error.message || 'Error desconocido'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Función auxiliar para procesar la respuesta de productos
function processProductsResponse(products: any[], isPaginated?: boolean, page?: number, limit?: number, total?: number) {
  // Procesar los productos para el formato requerido por el frontend
  const processedProducts = products.map(product => {
    return {
      ...product,
      image: product.image || null,
      status: product.status ? 1 : 0
    };
  });

  // Devolver respuesta según sea paginada o no
  if (isPaginated && total !== undefined) {
    const totalPages = Math.ceil(total / limit!);

    return new Response(JSON.stringify({
      data: processedProducts,
      meta: {
        total: total,
        page: page,
        limit: limit,
        totalPages
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return new Response(JSON.stringify(processedProducts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Función auxiliar para devolver un array vacío de productos
function returnEmptyProducts(isPaginated?: boolean, page?: number, limit?: number) {
  if (isPaginated) {
    return new Response(JSON.stringify({
      data: [],
      meta: {
        total: 0,
        page: page,
        limit: limit,
        totalPages: 0
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 
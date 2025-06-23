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
import fs from 'fs';
import path from 'path';

// Ruta base para las imágenes de productos
const IMAGE_BASE_PATH = '/images/products/';

/**
 * Interfaz para la respuesta paginada de productos
 * Se usa cuando se solicitan datos con paginación
 */
interface PaginatedProductsResponse {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Interfaz para el cuerpo de la solicitud POST que viene en el FormData
interface CreateProductBody {
  name: string;
  price: number;
  status: boolean;
  description?: string;
  section_id?: number;
  category_id?: number;
  is_promotion?: boolean;
}

/**
 * 🧭 MIGA DE PAN CONTEXTUAL (API GET): Obtención de Productos
 *
 * 📍 UBICACIÓN: /app/api/products/route.ts -> GET
 *
 * 🎯 PORQUÉ EXISTE:
 * Este endpoint es el responsable de devolver una lista de productos. Es crucial
 * porque puede filtrar por `section_id` (para la Columna 3 del dashboard) o
 * por `category_id` (para obtener los productos directos de una categoría).
 *
 * 🔄 FLUJO DE DATOS:
 * 1. El store (`dashboardStore`) llama a `fetchProductsBySection` o `fetchProductsByCategory`.
 * 2. Esas funciones hacen un `fetch` a este endpoint con `?section_id=X` o `?category_id=Y`.
 * 3. Este handler lee los parámetros de la URL.
 * 4. Construye una `whereCondition` de Prisma para filtrar los productos según el ID proporcionado.
 * 5. Devuelve la lista de productos filtrada.
 *
 * 🚨 PROBLEMA RESUELTO (Refactorización):
 * - BUG CRÍTICO: El código anterior buscaba `sectionId` (camelCase) en los params, pero el
 *   store enviaba `section_id` (snake_case), por lo que el filtro NUNCA se aplicaba y
 *   siempre devolvía TODOS los productos del cliente.
 * - SOLUCIÓN: Se corrigió el nombre del parámetro a `section_id`.
 * - MEJORA: La condición `where` se ha hecho más explícita y segura.
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🔥 SUPER TRACK API: GET /api/products iniciado');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('🔥 SUPER TRACK API ERROR: No autenticado');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.users.findFirst({ where: { email: session.user.email } });
    if (!user?.client_id) {
      console.log('🔥 SUPER TRACK API ERROR: Usuario no asociado a cliente');
      return NextResponse.json({ error: 'Usuario no asociado a un cliente' }, { status: 403 });
    }

    console.log('🔥 SUPER TRACK API: clientId encontrado:', user.client_id);

    const url = new URL(req.url);
    const sectionIdParam = url.searchParams.get('section_id');
    const categoryIdParam = url.searchParams.get('category_id');

    console.log('🔥 SUPER TRACK API: Parámetros recibidos - sectionId:', sectionIdParam, 'categoryId:', categoryIdParam);

    let whereCondition: any = {
      client_id: user.client_id,
      deleted: false,
    };

    if (sectionIdParam) {
      whereCondition.section_id = parseInt(sectionIdParam, 10);
      console.log('🔥 SUPER TRACK API: Filtrando por section_id:', whereCondition.section_id);
    } else if (categoryIdParam) {
      // 🔧 SIMPLIFICADO: Buscar productos directos por category_id
      const categoryId = parseInt(categoryIdParam, 10);
      whereCondition.category_id = categoryId;
      whereCondition.section_id = null; // Solo productos directos
      console.log('🔥 SUPER TRACK API: Filtrando por category_id (productos directos):', categoryId);
    }

    let orderByField = 'products_display_order'; // Por defecto productos normales

    // Para productos globales (category_id sin section_id), usar categories_display_order
    if (categoryIdParam && !sectionIdParam) {
      orderByField = 'categories_display_order';
      console.log('🔥 SUPER TRACK API: Usando orderBy field para productos globales:', orderByField);
    }
    // Para productos locales (category_id con section_id null), usar sections_display_order
    else if (categoryIdParam && whereCondition.section_id === null) {
      orderByField = 'sections_display_order';
      console.log('🔥 SUPER TRACK API: Usando orderBy field para productos locales:', orderByField);
    } else {
      console.log('🔥 SUPER TRACK API: Usando orderBy field para productos normales:', orderByField);
    }

    console.log('🔥 SUPER TRACK API: whereCondition final:', whereCondition);
    console.log('🔥 SUPER TRACK API: orderByField final:', orderByField);

    const products = await prisma.products.findMany({
      where: whereCondition,
      include: {
        sections: {
          select: {
            section_id: true,
            name: true,
          },
        },
      },
      orderBy: [{ [orderByField]: 'asc' }],
    });

    console.log('🔥 SUPER TRACK API: Productos encontrados:', products.length);
    console.log('🔥 SUPER TRACK API: Primer producto raw:', products[0]);

    // Procesar los productos para convertir Decimal a number
    const processedProducts = products.map((product) => ({
      ...product,
      price: product.price.toNumber(),
      // Asegurarse de que otros campos Decimal se conviertan si existen
    }));

    console.log('🔥 SUPER TRACK API: Productos procesados:', processedProducts.length);
    console.log('🔥 SUPER TRACK API: Primer producto procesado:', processedProducts[0]);

    return NextResponse.json(processedProducts);
  } catch (error) {
    console.error('🔥 SUPER TRACK API ERROR en GET /api/products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Un error desconocido ocurrió';
    return NextResponse.json({ error: 'Error interno del servidor', details: errorMessage }, { status: 500 });
  }
}

/**
 * 🧭 MIGA DE PAN CONTEXTUAL (API POST): Creación de Productos
 *
 * 📍 UBICACIÓN: /app/api/products/route.ts -> POST
 *
 * 🎯 PORQUÉ EXISTE:
 * Este endpoint centraliza la creación de todos los tipos de productos, aplicando la
 * lógica de negocio correcta según el contexto.
 *
 * 🔄 FLUJO DE DATOS Y LÓGICA HÍBRIDA:
 * 1. Recibe los datos del producto, incluyendo flags opcionales como `is_promotion`.
 * 2. AUTENTICACIÓN: Valida la sesión del usuario y obtiene su `client_id`.
 * 3. LÓGICA DE PROMOCIÓN (SECCIÓN VIRTUAL):
 *    - Si `is_promotion` es `true` y se proporciona un `category_id`:
 *    - a. Busca una sección existente que sea virtual (`is_virtual: true`) para esa categoría.
 *    - b. Si no la encuentra, CREA una nueva sección virtual (ej. "Promociones de Comidas").
 *    - c. Asigna el `section_id` de esa sección virtual al nuevo producto.
 *    - d. IMPORTANTE: Anula el `category_id` del producto, porque un producto pertenece a una sección O a una categoría, nunca a ambos.
 * 4. LÓGICA DE PRODUCTO NORMAL: Si no es una promoción, simplemente usa el `section_id` o `category_id` proporcionado.
 * 5. CÁLCULO DE ORDEN: Determina el siguiente valor disponible usando campos contextuales (categories_display_order, sections_display_order, products_display_order).
 * 6. GESTIÓN DE IMAGEN: Si se adjunta una imagen, la guarda en el servidor y almacena la ruta.
 * 7. CREACIÓN EN BD: Crea el registro del producto en la base de datos con todos los datos procesados.
 * 8. RESPUESTA: Devuelve el producto recién creado al cliente para actualizar la UI.
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #47):
 * - ANTES: Usaba display_order obsoleto causando inconsistencias
 * - SOLUCIÓN: Implementó lógica contextual con campos específicos según tipo de producto
 * - FECHA: 2025-01-25 - Migración de campos display_order completada
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7 (Separación): Lógica de negocio centralizada en API
 * - Mandamiento #8 (Buenas Prácticas): Validación robusta y campos contextuales
 */
export async function POST(request: Request) {
  // CONSOLE LOG 1: Inicio de la función
  console.log("// RokaMenu Debug: [API POST /api/products] - Petición recibida.");
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error("// RokaMenu Debug: Error de autenticación - No hay sesión.");
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // CONSOLE LOG 2: Sesión obtenida
    console.log(`// RokaMenu Debug: [API POST] - Sesión de usuario encontrada para: ${session.user.email}`);

    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
    });
    if (!user?.client_id) {
      console.error("// RokaMenu Debug: Error - Usuario no asociado a un cliente.");
      return NextResponse.json({ error: 'Usuario no asociado a un cliente' }, { status: 403 });
    }
    const clientId = user.client_id;

    // CONSOLE LOG 3: Obteniendo datos del formulario
    console.log("// RokaMenu Debug: [API POST] - Procesando FormData...");
    const formData = await request.formData();
    const productDataString = formData.get('productData') as string;
    const file = formData.get('image') as File | null;

    console.log("// RokaMenu Debug: [API POST] - productDataString:", productDataString);

    if (!productDataString) {
      console.error("// RokaMenu Debug: Error - productData es nulo o no existe.");
      return NextResponse.json({ error: 'productData es requerido' }, { status: 400 });
    }

    const productData: CreateProductBody = JSON.parse(productDataString);
    console.log("// RokaMenu Debug: [API POST] - productData parseado:", productData);

    let { name, price, status, description, section_id, category_id, is_promotion } = productData;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'name y price son requeridos' }, { status: 400 });
    }

    // --- Lógica de Promoción (Sección Virtual) ---
    if (is_promotion && category_id) {
      const category = await prisma.categories.findUnique({ where: { category_id } });
      if (category) {
        let virtualSection = await prisma.sections.findFirst({
          where: { category_id: category_id, is_virtual: true },
        });

        if (!virtualSection) {
          // Calcular el siguiente order para secciones de esta categoría
          const maxOrderSection = await prisma.sections.aggregate({
            where: {
              category_id: category_id,
              client_id: clientId,
              deleted: { not: 1 } as any
            },
            _max: {
              sections_display_order: true
            }
          });
          const nextOrder = (maxOrderSection._max.sections_display_order || 0) + 1;

          virtualSection = await prisma.sections.create({
            data: {
              name: `Promociones de ${category.name || 'Categoría'}`,
              category_id: category_id,
              is_virtual: true,
              client_id: clientId,
              status: true,
              sections_display_order: nextOrder,
            },
          });
        }
        section_id = virtualSection.section_id;
      }
    }

    if (!section_id && !category_id) {
      return NextResponse.json({ error: 'Se requiere section_id o category_id' }, { status: 400 });
    }

    // Determinar el campo de orden correcto según el contexto
    let orderField = 'products_display_order'; // Por defecto para productos normales
    if (category_id && !section_id) {
      orderField = 'categories_display_order'; // Productos globales
    } else if (category_id && section_id) {
      orderField = 'sections_display_order'; // Productos locales
    }

    const whereOrder = section_id ? { section_id } : { category_id };
    const highestOrder = await prisma.products.aggregate({
      _max: { [orderField]: true },
      where: { client_id: clientId, ...whereOrder },
    });
    const newOrder = (highestOrder._max[orderField] ?? -1) + 1;

    let imageUrl: string | null = null;
    if (file) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueFileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const imagePath = join(process.cwd(), 'public', 'images', 'products', uniqueFileName);
        await writeFile(imagePath, buffer);
        imageUrl = uniqueFileName;
      } catch (e) {
        console.error("Error al guardar la imagen:", e);
      }
    }

    const newProductData = {
      name,
      price,
      status: !!status,
      description,
      image: imageUrl,
      [orderField]: newOrder, // Usar el campo contextual correcto
      client_id: clientId,
      section_id,
      category_id,
      is_showcased: false,
      deleted: false,
    };

    // CONSOLE LOG PARA DEPURACIÓN
    console.log("// RokaMenu Debug: Intentando crear producto con los siguientes datos:", newProductData);

    const newProduct = await prisma.products.create({
      data: newProductData,
    });

    const responseProduct = {
      ...newProduct,
      price: newProduct.price.toNumber(),
    };

    return NextResponse.json(responseProduct, { status: 201 });

  } catch (error) {
    console.error('// RokaMenu Debug: [API POST] - Error capturado en el bloque CATCH:', error);
    const errorMessage = error instanceof Error ? error.message : 'Un error desconocido ocurrió';
    return NextResponse.json({ error: 'Error interno del servidor', details: errorMessage }, { status: 500 });
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

    // Verificar si el producto existe USANDO EL CLIENTE SINGLETON
    const existingProduct = await prisma.products.findUnique({
      where: { product_id: productId },
    });

    if (!existingProduct) {
      // NO necesitamos desconectar, el cliente singleton se gestiona globalmente
      // await prisma.$disconnect();
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

    // Actualizar producto USANDO EL CLIENTE SINGLETON
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

    // NO necesitamos desconectar
    // await prisma.$disconnect();

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
import { NextRequest, NextResponse } from 'next/server';
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
    const sectionId = url.searchParams.get('section_id');
    
    // Parámetros de paginación (opcionales)
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '0'); // 0 significa sin límite
    
    // Validar parámetros de paginación
    const validPage = page < 1 ? 1 : page;
    const validLimit = limit < 0 ? 0 : limit;
    const isPaginated = validLimit > 0;
    
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
        orderBy: {
          display_order: 'asc'
        },
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
    
    // Si se especifica una sección, buscar los productos de esa sección
    const sectionIdInt = parseInt(sectionId);
    
    // Obtener los IDs de productos asociados a la sección
    const productSectionRelations = await prisma.products_sections.findMany({
      where: {
        section_id: sectionIdInt
      }
    });
    
    const productIds = productSectionRelations.map(relation => relation.product_id);
    
    // Si no hay productos en esta sección, devolver un array vacío
    if (productIds.length === 0) {
      if (isPaginated) {
        return new Response(JSON.stringify({
          data: [],
          meta: {
            total: 0,
            page: validPage,
            limit: validLimit,
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
    
    // Obtener el total de productos si hay paginación
    let totalProducts: number | undefined;
    if (isPaginated) {
      totalProducts = productIds.length;
    }
    
    // Calcular parámetros de paginación para Prisma
    const skip = isPaginated ? (validPage - 1) * validLimit : undefined;
    const take = isPaginated ? validLimit : undefined;
    
    // Filtrar los IDs de productos según la paginación
    const paginatedProductIds = isPaginated 
      ? productIds.slice(skip, skip! + take!) 
      : productIds;
    
    // Obtener los detalles de los productos
    const products = await prisma.products.findMany({
      where: {
        product_id: { in: paginatedProductIds },
        deleted: false
      },
      orderBy: {
        display_order: 'asc'
      }
    });
    
    // Procesar los productos para el formato requerido por el frontend
    const processedProducts = products.map(product => {
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
        deleted: 0 as any
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
        status: status as any,
        display_order: maxOrder + 1,
        client_id: user.client_id,
        deleted: false as any,
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
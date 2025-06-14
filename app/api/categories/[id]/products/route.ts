import { NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';

/**
 * 🎯 T31: API MODIFICADA - Productos por Categoría (Tradicionales + Directos)
 * 
 * PORQUÉ MODIFICADA: Implementación de productos directos en categorías sin secciones intermedias
 * CONEXIÓN: dashboardStore.fetchProductsByCategory() → esta API → productos híbridos
 * FLUJO: Obtiene productos tradicionales (vía secciones) + productos directos (vía category_id)
 * 
 * CASOS DE USO:
 * - Categoría tradicional: "HAMBURGUESAS" → Secciones → Productos
 * - Categoría directa: "BEBIDAS" → Productos directos (sin secciones)
 * - Categoría híbrida: Ambos tipos de productos
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'ID de categoría inválido' },
        { status: 400 }
      );
    }

    // 🎯 T31: OBTENER PRODUCTOS HÍBRIDOS - Tradicionales + Directos
    // PORQUÉ: Una categoría puede tener productos vía secciones Y productos directos
    // CONEXIÓN: CategoryGridView necesita mostrar todos los productos de la categoría

    let allProducts: any[] = [];

    // 1. PRODUCTOS TRADICIONALES: A través de secciones
    const sections = await prisma.sections.findMany({
      where: {
        category_id: categoryId,
        deleted: 0 as any
      }
    });

    if (sections.length > 0) {
      // Extraer los IDs de las secciones
      const sectionIds = sections.map(section => section.section_id);

      // Consulta para obtener productos por sección (modo tradicional)
      const traditionalProducts = await prisma.products_sections.findMany({
        where: {
          section_id: { in: sectionIds },
          products: {
            deleted: 0 as any,
          }
        },
        include: {
          sections: true,
          products: true
        }
      });

      // Procesar productos tradicionales
      const processedTraditional = Array.from(
        new Set(traditionalProducts.map(ps => ps.product_id))
      ).map(productId => {
        const productSection = traditionalProducts.find(ps => ps.product_id === productId);
        return productSection?.products;
      }).filter((product): product is NonNullable<typeof product> => product !== null && product !== undefined);

      allProducts.push(...processedTraditional);
    }

    // 🎯 T31: 2. PRODUCTOS DIRECTOS - Directamente en la categoría
    // PORQUÉ: Implementa la propuesta de "relaciones opcionales" de Gemini
    // CONEXIÓN: products.category_id → categories.category_id (nueva relación)
    // CASOS DE USO: Categorías simples como "BEBIDAS" con productos directos
    const directProducts = await prisma.products.findMany({
      where: {
        category_id: categoryId,
        deleted: false,
      }
    });

    allProducts.push(...directProducts);

    // 3. ELIMINAR DUPLICADOS Y ORDENAR
    // PORQUÉ: Un producto podría aparecer tanto en modo tradicional como directo
    // SOLUCIÓN: Usar Set para eliminar duplicados por product_id
    const uniqueProducts = Array.from(
      new Set(allProducts.map(product => product.product_id))
    ).map(productId => {
      return allProducts.find(product => product.product_id === productId);
    }).filter((product): product is NonNullable<typeof product> => product !== null && product !== undefined)
      .sort((a, b) => {
        const orderA = a.display_order || 0;
        const orderB = b.display_order || 0;
        return orderA - orderB;
      });

    return NextResponse.json(uniqueProducts);
  } catch (error) {
    console.error('🎯 T31: Error al obtener productos híbridos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    );
  }
} 
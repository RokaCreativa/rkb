import { NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: T31 - API HÍBRIDA PARA PRODUCTOS DIRECTOS EN CATEGORÍAS
 * 
 * PORQUÉ MODIFICADA: Implementación completa de productos directos en categorías sin secciones intermedias
 * PROBLEMA RESUELTO: Antes solo se podían obtener productos vía secciones, ahora soporta jerarquía flexible
 * ARQUITECTURA: Combina productos tradicionales (Category → Section → Product) + directos (Category → Product)
 * 
 * CONEXIONES CRÍTICAS:
 * - dashboardStore.fetchProductsByCategory() línea 280 → esta API → productos híbridos
 * - CategoryGridView.tsx: Renderizará productos directos + secciones usando esta data
 * - createProductDirect() línea 620: Tras crear producto directo, recarga usando esta API
 * - prisma/schema.prisma líneas 60-63: Nueva relación direct_products en categories
 * 
 * 🎯 T31: FLUJO HÍBRIDO COMPLETO
 * 1. Consulta productos tradicionales (products_sections → products)
 * 2. Consulta productos directos (products.category_id = categoryId)
 * 3. Elimina duplicados por product_id
 * 4. Ordena por display_order
 * 5. Retorna array unificado para UI
 * 
 * CASOS DE USO REALES:
 * - Categoría tradicional: "HAMBURGUESAS" → Secciones ("Clásicas", "Gourmet") → Productos
 * - Categoría directa: "BEBIDAS" → Productos directos ("Coca Cola", "Cerveza")
 * - Categoría híbrida: Ambos tipos coexistiendo en misma categoría
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
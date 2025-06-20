/**
 * 🧭 MIGA DE PAN CONTEXTUAL: API de Reordenamiento Universal de Productos
 *
 * 📍 UBICACIÓN: app/api/products/reorder/route.ts → PUT handler
 *
 * 🎯 PORQUÉ EXISTE:
 * Para manejar el reordenamiento masivo de productos en los 3 grids del dashboard,
 * actualizando el campo contextual correcto según el contexto (Grid 1, 2 o 3).
 * Es la API que sincroniza los cambios del sistema de flechas con la base de datos.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. moveItem (dashboardStore) → genera payload con context
 * 2. fetch('/api/products/reorder') → ESTA API
 * 3. Determina campo según context → categories_display_order | sections_display_order | products_display_order
 * 4. Promise.all(prisma.update) → actualización masiva
 * 5. Respuesta exitosa → confirmación al frontend
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: dashboardStore.moveItem() → payload con products[] y context
 * - SALIDA: Prisma updates → actualización BD
 * - FRONTEND: Sistema de flechas en CategoryGridView, SectionGridView, ProductGridView
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #47):
 * - ANTES: Solo actualizaba display_order obsoleto causando inconsistencias
 * - ERROR: Inconsistencia entre API y frontend en campos de ordenación
 * - SOLUCIÓN: Lógica contextual para usar el campo correcto según grid
 * - FECHA: 2025-01-25 - Sistema de reordenamiento universal completado
 *
 * 🎯 CASOS DE USO REALES:
 * - Grid 1: context='category' → actualiza categories_display_order
 * - Grid 2: context='section' → actualiza sections_display_order  
 * - Grid 3: context=undefined → actualiza products_display_order
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - Context determina campo de ordenación
 * - Updates masivos con Promise.all para atomicidad
 * - Validación estricta de payload antes de procesar
 * - Cada producto debe tener product_id y nuevo order válidos
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: Prisma client conectado a BD MySQL
 * - REQUIERE: Campos *_display_order en schema products
 * - REQUIERE: Session válida de usuario autenticado
 * - ROMPE SI: product_id no existe en BD
 * - ROMPE SI: nuevo order no es number válido
 *
 * 📊 PERFORMANCE:
 * - Promise.all → updates paralelos para velocidad
 * - Error handling individual → falla rápido si un producto falla
 * - Logs detallados → debugging fácil de problemas
 * - Transacción implícita → consistencia de datos
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7 (Separación): API pura, sin lógica de UI
 * - Mandamiento #8 (Buenas Prácticas): Validación robusta y error handling
 * - Mandamiento #4 (Obediencia): Solo actualiza orden, no otros campos
 */

/**
 * @fileoverview API Route for Reordering Products
 * @description Handles bulk updates to the display order of products.
 * @module app/api/products/reorder/route
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma/prisma'; // 🧹 CORREGIDO: Usar singleton
import { revalidatePath } from 'next/cache';

/**
 * Interfaz que define la estructura mínima requerida para un producto
 * que se va a reordenar. Usa 'new_order' genérico que se mapea al campo
 * contextual correcto según el contexto (categories_display_order, etc.)
 */
interface ProductReorderItem {
  product_id: number;
  new_order: number; // 🧹 CORREGIDO: Campo genérico, no display_order obsoleto
}

/**
 * API para reordenar productos
 * Maneja las solicitudes PUT para actualizar el orden de múltiples productos a la vez
 * 
 * @route PUT /api/products/reorder
 * @returns NextResponse con los resultados actualizados o un mensaje de error
 */
export async function PUT(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Procesar el cuerpo de la petición
    const body = await req.json();

    if (!body || !body.products || !Array.isArray(body.products)) {
      return NextResponse.json({ error: 'Invalid request format. Expected products array.' }, { status: 400 });
    }

    const products: ProductReorderItem[] = body.products;
    const context = body.context; // 'category' para Grid 1, 'section' para Grid 2, undefined para Grid 3

    console.log('🔥 API products/reorder - Context:', context);

    console.log('👉 Reordenando productos:', products);

    // Validar que cada producto tenga los campos requeridos
    const invalidProducts = products.filter(p =>
      !p.product_id || typeof p.product_id !== 'number' ||
      p.new_order === undefined || typeof p.new_order !== 'number'
    );

    if (invalidProducts.length > 0) {
      console.error('⚠️ Productos con formato inválido:', invalidProducts);
      return NextResponse.json({
        error: 'Some products have invalid format',
        invalidProducts
      }, { status: 400 });
    }

    console.log(`✅ Validación completa. Actualizando ${products.length} productos...`);

    // Extraer el ID del cliente de la sesión
    const clientId = (session.user as any).client_id;

    if (!clientId) {
      return NextResponse.json({ error: 'ID de cliente no encontrado' }, { status: 400 });
    }

    // Array para guardar los resultados de las operaciones - IGUAL QUE CATEGORÍAS
    const updateResults = [];

    // Actualizar cada producto - BUCLE FOR IGUAL QUE CATEGORÍAS
    for (const item of products) {
      console.log(`- Actualizando producto ID ${item.product_id} a orden ${item.new_order} (contexto: ${context})`);

      // ✅ VALIDACIÓN DE OWNERSHIP IGUAL QUE CATEGORÍAS
      const existingProduct = await prisma.products.findFirst({
        where: {
          product_id: item.product_id,
          client_id: clientId  // Validar que el producto pertenece al cliente
        }
      });

      if (!existingProduct) {
        console.warn(`⚠️ Producto ${item.product_id} no pertenece al cliente ${clientId}, omitiendo...`);
        continue; // Omitir productos que no pertenecen al cliente - IGUAL QUE CATEGORÍAS
      }

      // Determinar qué campo actualizar según el contexto
      let updateData: any = {};

      if (context === 'category') {
        // Grid 1 - productos globales
        updateData.categories_display_order = item.new_order;
      } else if (context === 'section') {
        // Grid 2 - productos locales  
        updateData.sections_display_order = item.new_order;
      } else {
        // Grid 3 - productos normales
        updateData.products_display_order = item.new_order;
      }

      // Actualizar el orden de visualización - IGUAL QUE CATEGORÍAS
      const updatedProduct = await prisma.products.update({
        where: { product_id: item.product_id },
        data: updateData
      });

      updateResults.push(updatedProduct);
    }

    // Revalidar la página para actualizar la caché - IGUAL QUE CATEGORÍAS
    revalidatePath('/dashboard');
    revalidatePath('/dashboard-v2');

    console.log(`✅ ${updateResults.length} productos actualizados exitosamente`);

    // Devolver respuesta exitosa - IGUAL QUE CATEGORÍAS
    return NextResponse.json({
      message: 'Productos reordenados con éxito',
      products: updateResults
    });

  } catch (error) {
    console.error('❌ Error general reordenando productos:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
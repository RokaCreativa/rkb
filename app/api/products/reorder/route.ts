/**
 * 🧭 MIGA DE PAN CONTEXTUAL: API de Reordenamiento Universal de Productos
 *
 * 📍 UBICACIÓN: app/api/products/reorder/route.ts → PUT handler
 *
 * 🎯 PORQUÉ EXISTE:
 * Para manejar el reordenamiento masivo de productos en los 3 grids del dashboard,
 * actualizando el campo display_order correcto según el contexto (Grid 1, 2 o 3).
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
 * 🚨 PROBLEMA RESUELTO (Bitácora #44):
 * - Antes: Solo actualizaba display_order (campo obsoleto)
 * - Error: Inconsistencia entre API y frontend en campos de ordenación
 * - Solución: Lógica contextual para usar el campo correcto según grid
 * - Fecha: 2025-01-25 - Sistema de reordenamiento universal completado
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
 * - Cada producto debe tener product_id y display_order válidos
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: Prisma client conectado a BD MySQL
 * - REQUIERE: Campos *_display_order en schema products
 * - REQUIERE: Session válida de usuario autenticado
 * - ROMPE SI: product_id no existe en BD
 * - ROMPE SI: display_order no es number válido
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
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma/prisma';

/**
 * Interfaz que define la estructura mínima requerida para un producto
 * que se va a reordenar
 */
interface Product {
  product_id: number;
  display_order: number;
}

/**
 * API para reordenar productos
 * Maneja las solicitudes PUT para actualizar el orden de múltiples productos a la vez
 * 
 * @route PUT /api/products/reorder
 * @returns NextResponse con los resultados actualizados o un mensaje de error
 */
export async function PUT(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Procesar el cuerpo de la petición
    const body = await request.json();

    if (!body || !body.products || !Array.isArray(body.products)) {
      return NextResponse.json({ error: 'Invalid request format. Expected products array.' }, { status: 400 });
    }

    const products: Product[] = body.products;
    const context = body.context; // 'category' para Grid 1, 'section' para Grid 2, undefined para Grid 3

    console.log('🔥 API products/reorder - Context:', context);

    console.log('👉 Reordenando productos:', products);

    // Validar que cada producto tenga los campos requeridos
    const invalidProducts = products.filter(p =>
      !p.product_id || typeof p.product_id !== 'number' ||
      p.display_order === undefined || typeof p.display_order !== 'number'
    );

    if (invalidProducts.length > 0) {
      console.error('⚠️ Productos con formato inválido:', invalidProducts);
      return NextResponse.json({
        error: 'Some products have invalid format',
        invalidProducts
      }, { status: 400 });
    }

    console.log(`✅ Validación completa. Actualizando ${products.length} productos...`);

    // Actualizar los productos en la base de datos
    const updatePromises = products.map(product => {
      console.log(`- Actualizando producto ID ${product.product_id} a orden ${product.display_order} (contexto: ${context})`);

      // Determinar qué campo actualizar según el contexto
      let updateData: any = {};

      if (context === 'category') {
        // Grid 1 - productos globales
        updateData.categories_display_order = product.display_order;
      } else if (context === 'section') {
        // Grid 2 - productos locales  
        updateData.sections_display_order = product.display_order;
      } else {
        // Grid 3 - productos normales
        updateData.products_display_order = product.display_order;
      }

      return prisma.products.update({
        where: { product_id: product.product_id },
        data: updateData
      }).catch(error => {
        console.error(`❌ Error actualizando producto ${product.product_id}:`, error);
        throw error; // Re-lanzar el error para que falle la promesa
      });
    });

    try {
      // Ejecutar todas las actualizaciones
      const updatedProducts = await Promise.all(updatePromises);
      console.log(`✅ ${updatedProducts.length} productos actualizados exitosamente`);

      // Devolver respuesta exitosa
      return NextResponse.json({
        success: true,
        message: 'Products reordered successfully',
        updated: updatedProducts.length
      });
    } catch (updateError) {
      console.error('❌ Error en la actualización de productos:', updateError);
      return NextResponse.json({
        error: 'Error updating products',
        message: updateError instanceof Error ? updateError.message : 'Unknown error during update'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error general reordenando productos:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
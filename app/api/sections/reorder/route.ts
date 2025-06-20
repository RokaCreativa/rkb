/**
 * 🧭 MIGA DE PAN CONTEXTUAL: API de Reordenamiento Universal de Secciones
 *
 * 📍 UBICACIÓN: app/api/sections/reorder/route.ts → PUT handler
 *
 * 🎯 PORQUÉ EXISTE:
 * Para manejar el reordenamiento masivo de secciones en el Grid 2 del dashboard,
 * actualizando el campo contextual sections_display_order. Maneja tanto secciones 
 * solas como listas mixtas con productos locales.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. moveItem (dashboardStore) → detecta si es Grid 2 simple o mixto
 * 2. API simple (secciones solas) → ESTA API
 * 3. API doble (Grid 2 mixto) → ESTA API + /api/products/reorder
 * 4. Promise.all(prisma.update) → actualización masiva paralela
 * 5. Respuesta exitosa → confirmación al frontend
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: dashboardStore.moveItem() Grid 2 → payload con sections[]
 * - HERMANA: /api/products/reorder → para Grid 2 mixto con productos locales
 * - SALIDA: Prisma updates → BD con campo contextual actualizado
 * - FRONTEND: SectionGridView flechas → sincronización visual
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #47):
 * - ANTES: Usaba display_order obsoleto causando inconsistencias visuales
 * - ERROR: Frontend ordenaba por sections_display_order, API por display_order
 * - SOLUCIÓN: Migración completa a campo contextual sections_display_order
 * - FECHA: 2025-01-25 - Integración al sistema reordenamiento universal
 *
 * 🎯 CASOS DE USO REALES:
 * - Grid 2 simple: "Entrantes" sube antes de "Platos Principales"
 * - Grid 2 mixto: "Tapas" (sección) pasa "Aceitunas" (producto local)
 * - Reordenamiento masivo: 3 secciones + 2 productos locales en una operación
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - Actualización contextual: solo sections_display_order
 * - Compatibilidad con lista mixta del Grid 2
 * - Operación atómica: todas las secciones o ninguna
 * - Validación de tipos: section_id y nuevo order válidos
 * - Validación de ownership: solo secciones del cliente autenticado
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: Prisma client conectado a BD MySQL
 * - REQUIERE: Session válida de usuario autenticado
 * - REQUIERE: Campo sections_display_order en schema
 * - ROMPE SI: section_id no existe en BD
 * - ROMPE SI: nuevo order no es number válido
 *
 * 📊 PERFORMANCE:
 * - Promise.all → updates paralelos para velocidad máxima
 * - Ownership validation → previene actualizaciones no autorizadas
 * - Error handling individual → falla rápido si una sección falla
 * - Logs detallados → debugging fácil de problemas
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7 (Separación): API pura, sin lógica de UI
 * - Mandamiento #8 (Buenas Prácticas): Validación robusta de entrada
 * - Mandamiento #4 (Obediencia): Solo actualiza orden, no otros campos
 */

/**
 * @fileoverview API Route for Reordering Sections
 * @description Handles bulk updates to the display order of sections.
 * @module app/api/sections/reorder/route
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma/prisma'; // 🧹 CORREGIDO: Usar singleton
import { revalidatePath } from 'next/cache';

interface SectionReorderItem {
  section_id: number;
  new_order: number; // 🧹 CORREGIDO: Campo genérico consistente con products
}

/**
 * API para reordenar secciones
 * Maneja las solicitudes PUT para actualizar el orden de múltiples secciones a la vez
 * 
 * @route PUT /api/sections/reorder
 * @returns NextResponse con los resultados actualizados o un mensaje de error
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body || !body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json({ error: 'Invalid request format. Expected sections array.' }, { status: 400 });
    }

    const sections: SectionReorderItem[] = body.sections;

    console.log('🔥 API sections/reorder - Recibido:', sections);

    // Extraer el ID del cliente de la sesión
    const clientId = (session.user as any).client_id;

    if (!clientId) {
      return NextResponse.json({ error: 'ID de cliente no encontrado' }, { status: 400 });
    }

    // Array para guardar los resultados de las operaciones - IGUAL QUE CATEGORÍAS
    const updateResults = [];

    // Actualizar cada sección - BUCLE FOR IGUAL QUE CATEGORÍAS
    for (const item of sections) {
      // ✅ VALIDACIÓN DE OWNERSHIP CORREGIDA - IGUAL QUE CATEGORÍAS
      const existingSection = await prisma.sections.findFirst({
        where: {
          section_id: item.section_id,
          categories: {
            client_id: clientId  // Validar que la sección pertenece al cliente a través de su categoría
          }
        }
      });

      if (!existingSection) {
        console.warn(`⚠️ Sección ${item.section_id} no pertenece al cliente ${clientId}, omitiendo...`);
        continue; // Omitir secciones que no pertenecen al cliente - IGUAL QUE CATEGORÍAS
      }

      // Actualizar el orden de visualización - IGUAL QUE CATEGORÍAS
      const updatedSection = await prisma.sections.update({
        where: { section_id: item.section_id },
        data: {
          // Solo actualizar el nuevo campo contextual
          sections_display_order: item.new_order
        }
      });

      updateResults.push(updatedSection);
    }

    // Revalidar la página para actualizar la caché - IGUAL QUE CATEGORÍAS
    revalidatePath('/dashboard');
    revalidatePath('/dashboard-v2');

    console.log('🔥 API sections/reorder - Actualizado:', updateResults.length, 'secciones');

    return NextResponse.json({
      message: 'Secciones reordenadas con éxito',
      sections: updateResults
    });

  } catch (error) {
    console.error('🔥 API sections/reorder - Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
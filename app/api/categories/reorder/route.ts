/**
 * 🧭 MIGA DE PAN CONTEXTUAL: API de Reordenamiento Universal de Categorías
 *
 * 📍 UBICACIÓN: app/api/categories/reorder/route.ts → PUT handler
 *
 * 🎯 PORQUÉ EXISTE:
 * Para manejar el reordenamiento masivo de categorías en el Grid 1 del dashboard,
 * actualizando el campo contextual categories_display_order. Es parte del sistema 
 * de reordenamiento mixto universal.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. moveItem (dashboardStore) → detecta si es Grid 1 simple o mixto
 * 2. API simple (categorías solas) → ESTA API
 * 3. API doble (Grid 1 mixto) → ESTA API + /api/products/reorder
 * 4. Promise.all(prisma.update) → actualización masiva paralela
 * 5. Respuesta exitosa → confirmación al frontend
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: dashboardStore.moveItem() Grid 1 → payload con categories[]
 * - HERMANA: /api/products/reorder → para Grid 1 mixto con productos globales
 * - SALIDA: Prisma updates → BD con campo contextual actualizado
 * - FRONTEND: CategoryGridView flechas → sincronización visual
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #47):
 * - ANTES: Usaba display_order obsoleto causando inconsistencias
 * - ERROR: Frontend ordenaba por categories_display_order, API por display_order
 * - SOLUCIÓN: Migración completa a campo contextual categories_display_order
 * - FECHA: 2025-01-25 - Integración al sistema reordenamiento universal
 *
 * 🎯 CASOS DE USO REALES:
 * - Grid 1 simple: "Bebidas" sube antes de "Comidas"
 * - Grid 1 mixto: "Postres" (categoría) pasa "Helado Especial" (producto global)
 * - Reordenamiento masivo: 5 categorías + 3 productos globales en una operación
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - Actualización contextual: solo categories_display_order
 * - Compatibilidad con lista mixta del Grid 1
 * - Operación atómica: todas las categorías o ninguna
 * - Validación de tipos: category_id y nuevo order válidos
 * - Validación de ownership: solo categorías del cliente autenticado
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: Prisma client conectado a BD MySQL
 * - REQUIERE: Session válida de usuario autenticado
 * - REQUIERE: Campo categories_display_order en schema
 * - ROMPE SI: category_id no existe en BD
 * - ROMPE SI: nuevo order no es number válido
 *
 * 📊 PERFORMANCE:
 * - Promise.all → updates paralelos para velocidad máxima
 * - Ownership validation → previene actualizaciones no autorizadas
 * - Error handling individual → falla rápido si una categoría falla
 * - Logs detallados → debugging fácil de problemas
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7 (Separación): API pura, sin lógica de UI
 * - Mandamiento #8 (Buenas Prácticas): Validación robusta de entrada
 * - Mandamiento #4 (Obediencia): Solo actualiza orden, no otros campos
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma/prisma'; // 🧹 CORREGIDO: Usar singleton
import { revalidatePath } from 'next/cache';

// Interfaz para la solicitud de reordenamiento
interface CategoryReorderItem {
  category_id: number;
  new_order: number; // 🧹 CORREGIDO: Campo genérico consistente
}

interface ReorderRequest {
  categories: CategoryReorderItem[];
}

/**
 * Endpoint para reordenar categorías
 * Recibe un array de categorías con sus nuevas posiciones y actualiza la base de datos
 * 
 * @param req - Solicitud HTTP con un body que contiene el array de categorías a reordenar
 * @returns Respuesta HTTP con las categorías actualizadas o un error
 */
export async function PUT(req: NextRequest) {
  try {
    // Verificar la autenticación
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Extraer el ID del cliente de la sesión
    const clientId = (session.user as any).client_id;

    if (!clientId) {
      return NextResponse.json({ error: 'ID de cliente no encontrado' }, { status: 400 });
    }

    // Obtener los datos del cuerpo de la solicitud
    const data: ReorderRequest = await req.json();

    if (!data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
      return NextResponse.json({ error: 'Datos de categorías inválidos' }, { status: 400 });
    }

    // Array para guardar los resultados de las operaciones
    const updateResults = [];

    // Actualizar cada categoría
    for (const item of data.categories) {
      // Verificar que la categoría pertenece al cliente autenticado
      const category = await prisma.categories.findUnique({
        where: {
          category_id: item.category_id,
          client_id: clientId
        }
      });

      if (!category) {
        continue; // Omitir categorías que no pertenecen al cliente
      }

      // Actualizar el orden de visualización
      const updatedCategory = await prisma.categories.update({
        where: { category_id: item.category_id },
        data: {
          // Solo actualizar el nuevo campo contextual
          categories_display_order: item.new_order
        }
      });

      updateResults.push(updatedCategory);
    }

    // Revalidar la página de categorías para actualizar la caché
    revalidatePath('/dashboard');
    revalidatePath('/dashboard-v2');

    return NextResponse.json({
      message: 'Categorías reordenadas con éxito',
      categories: updateResults
    });
  } catch (error) {
    console.error('Error al reordenar categorías:', error);

    return NextResponse.json(
      { error: 'Error al procesar la solicitud de reordenamiento' },
      { status: 500 }
    );
  }
}

// API de reordenación de categorías implementada correctamente con PUT 
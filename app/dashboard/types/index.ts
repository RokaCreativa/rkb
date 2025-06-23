/**
 * @fileoverview Tipos e interfaces centralizados para el dashboard v2
 * @author RokaMenu Team
 * @version 1.2.0
 * @updated 2024-06-15
 * 
 * Este archivo centraliza todos los tipos e interfaces utilizados en el dashboard v2,
 * re-exportándolos desde sus ubicaciones específicas para mantener compatibilidad.
 */

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Barrel File Central de Tipos del Dashboard
 *
 * 📍 UBICACIÓN: types/index.ts → Punto Central de Exportación de Tipos
 *
 * 🎯 PORQUÉ EXISTE:
 * Actúa como "barrel file" centralizando todas las exportaciones de tipos del dashboard.
 * Permite imports limpios desde una sola ubicación y mantiene la arquitectura de tipos
 * organizada por dominio (domain/) y UI (ui/). Facilita refactorings futuros y
 * evita imports relativos complejos en toda la aplicación.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Archivos de tipos específicos → definiciones en domain/ y ui/
 * 2. ESTE ARCHIVO → re-exporta todo con export * from
 * 3. Componentes → import { Category, Product } from '@/app/dashboard/types'
 * 4. TypeScript → resolución automática de tipos
 * 5. IDE → autocompletado y type checking
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: domain/category.ts, domain/product.ts, domain/section.ts
 * - ENTRADA: domain/mixed.ts, domain/permissions.ts
 * - ENTRADA: ui/common.ts, ui/modals.ts
 * - SALIDA: TODOS los componentes del dashboard
 * - CONSUMIDORES: dashboardStore.ts, hooks/, components/
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #58 - Limpieza Masiva):
 * - Antes: Tipos duplicados en múltiples archivos
 * - Error: Imports inconsistentes desde rutas relativas complejas
 * - Solución: Barrel file único con re-exportaciones centralizadas
 * - Beneficio: Imports limpios, mantenimiento simplificado
 * - Fecha: 2025-01-20 - Limpieza arquitectónica masiva
 *
 * 🎯 CASOS DE USO REALES:
 * - dashboardStore: import { Category, Product, Section } from '../types'
 * - Componentes: import { Category } from '@/app/dashboard/types'
 * - Hooks: import { ModalType, ItemType } from '@/app/dashboard/types'
 * - APIs: import { Product, Section } from '@/app/dashboard/types'
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - SOLO re-exportaciones (export * from), NUNCA definiciones aquí
 * - Mantener separación domain/ vs ui/ en comentarios
 * - NO duplicar exports entre archivos fuente
 * - Actualizar imports cuando se añadan nuevos archivos de tipos
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: Archivos de tipos en domain/ y ui/ existentes
 * - REQUIERE: Estructura de carpetas types/ mantenida
 * - ROMPE SI: Circular dependencies entre archivos de tipos
 * - ROMPE SI: Exports duplicados con mismo nombre
 *
 * 📊 PERFORMANCE:
 * - Tree shaking → solo imports usados en bundle final
 * - TypeScript → resolución rápida de tipos
 * - IDE → autocompletado eficiente
 * - Build time → compilación optimizada
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #3 (DRY): Evita duplicación de imports
 * - Mandamiento #6 (Consistencia): Imports uniformes en toda la app
 * - Mandamiento #7 (Separación): Tipos separados por responsabilidad
 * - Mandamiento #2 (Actualización): Refleja cambios en arquitectura
 */

// =================================================================
// 📍 TIPOS DE DOMINIO - Entidades de Negocio
// =================================================================
export * from './domain/category';
export * from './domain/product';
export * from './domain/section';
export * from './domain/mixed';
export * from './domain/permissions';

// =================================================================
// 📍 TIPOS DE UI - Estados y Componentes de Interfaz
// =================================================================
export * from './ui/common';
export * from './ui/modals'; 
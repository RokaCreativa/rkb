/**
 * @fileoverview Tipos e interfaces centralizados para el dashboard v2
 * @author RokaMenu Team
 * @version 1.2.0
 * @updated 2024-06-15
 * 
 * Este archivo centraliza todos los tipos e interfaces utilizados en el dashboard v2,
 * re-exportándolos desde sus ubicaciones específicas para mantener compatibilidad.
 */

// =================================================================
// 📍 Barrel file | types/index.ts
// -----------------------------------------------------------------
// Este archivo es el punto central para exportar todos los tipos
// de datos del dominio de la aplicación. No debe contener lógica,
// solo definiciones y exportaciones de tipos.
// =================================================================

export * from './domain/category';
export * from './domain/product';
export * from './domain/section';
export * from './domain/mixed';
export * from './domain/permissions';

// Re-exportar tipos de UI
export * from './ui/common';
export * from './ui/modals'; 
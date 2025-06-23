/**
 * @fileoverview Barrel File - Lib Exports
 * @description Punto de entrada centralizado para todas las utilidades
 * @module lib
 */

// 🎯 Configuración y autenticación
export { authOptions } from "./auth";
export * from "./types/auth";
export * from "./middleware/auth";

// 🎯 Base de datos
export { default as prisma } from "./prisma";

// 🎯 Utilidades
export { cn } from "./utils";

// 🎯 Configuraciones (si existen)
// export * from "./config/env"; 
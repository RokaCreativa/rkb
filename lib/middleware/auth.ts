/**
 * @fileoverview Authentication Middleware
 * @description Lógica de autenticación para middleware de Next.js
 * @module lib/middleware/auth
 */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Verifica si la ruta requiere autenticación
 */
export const isProtectedRoute = (pathname: string): boolean => {
    const protectedPaths = [
        "/dashboard",
        "/api/categories",
        "/api/products",
        "/api/sections",
        "/api/menus",
    ];

    return protectedPaths.some(path => pathname.startsWith(path));
};

/**
 * Maneja la autenticación del usuario
 * @param request - Request de Next.js
 * @returns Response con redirección o null si está autenticado
 */
export const handleAuthentication = async (
    request: NextRequest
): Promise<NextResponse | null> => {
    // 🧪 MODO PRUEBAS: Autenticación DESHABILITADA
    // ================================================================
    // ⚠️ SOLO PARA PRUEBAS - REACTIVAR EN PRODUCCIÓN
    // ================================================================

    // Para reactivar seguridad, descomenta el siguiente código:
    /*
    const token = await getToken({ req: request });
  
    if (!token) {
      // Store the original URL to redirect back after login
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    */

    return null; // No redirigir - acceso libre
}; 
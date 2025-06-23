/**
 * @fileoverview Middleware Principal de Next.js
 * @description Maneja redirects y autenticación usando funciones modulares
 * @module middleware
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { shouldRedirectToDashboardV2 } from "./app/routes";
import { isProtectedRoute, handleAuthentication } from "./lib/middleware/auth";

export async function middleware(request: NextRequest) {
  // 1. Manejar redirects de dashboard legacy
  if (shouldRedirectToDashboardV2(request)) {
    const url = request.nextUrl.clone();
    url.pathname = url.pathname.replace('/dashboard', '/dashboard');
    return NextResponse.redirect(url);
  }

  // 2. Manejar autenticación solo en rutas protegidas
  if (isProtectedRoute(request.nextUrl.pathname)) {
    const authResponse = await handleAuthentication(request);
    if (authResponse) {
      return authResponse; // Redirigir a login si no está autenticado
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/categories/:path*",
    "/api/products",
    "/api/products/:path*",
    "/api/menus/:path*"
  ]
};

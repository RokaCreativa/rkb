import { NextRequest } from 'next/server';

// Routes that should redirect to dashboard-v2
export const DASHBOARD_ROUTES = [
  // Comentado para permitir acceso al dashboard original
  // '/dashboard',
];

// Function to check if a request path should be redirected to dashboard-v2
export function shouldRedirectToDashboardV2(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  return DASHBOARD_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));
} 
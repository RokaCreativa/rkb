import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { shouldRedirectToDashboardV2 } from "./app/routes";

export async function middleware(request: NextRequest) {
  // First, handle dashboard redirects
  if (shouldRedirectToDashboardV2(request)) {
    const url = request.nextUrl.clone();
    url.pathname = url.pathname.replace('/dashboard', '/dashboard-v2');
    return NextResponse.redirect(url);
  }

  // Then, handle authentication
  const token = await getToken({ req: request });

  if (!token) {
    // Store the original URL to redirect back after login
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard-v2/:path*",
    "/api/categories/:path*",
    "/api/products/:path*",
    "/api/menus/:path*",
    "/dashboard"
  ]
};

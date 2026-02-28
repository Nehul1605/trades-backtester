import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/auth/login", "/auth/sign-up", "/auth/sign-up-success", "/auth/error", "/api/auth", "/api/keep-alive"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and auth API
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Check for Auth.js v5 session token
  const token =
    request.cookies.get("__Secure-authjs.session-token") ??
    request.cookies.get("authjs.session-token");

  if (!token?.value) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

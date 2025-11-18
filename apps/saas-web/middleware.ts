import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface BasicSession {
  readonly user?: { readonly id?: string };
}

function serverTimingHeader(startMs: number): string {
  const duration: number = Date.now() - startMs;
  return `app;dur=${duration}`;
}

async function fetchSession(request: NextRequest): Promise<BasicSession | null> {
  const url = new URL("/api/auth/get-session", request.url);
  const response = await fetch(url, { headers: { Cookie: request.headers.get("cookie") ?? "" } });
  if (!response.ok) return null;
  const data = (await response.json()) as BasicSession | null;
  return data;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  const start: number = Date.now();
  const { pathname } = request.nextUrl;

  if (process.env.E2E === "1" || request.headers.get("x-e2e") === "1") {
    const proceed = NextResponse.next();
    proceed.headers.set("Server-Timing", serverTimingHeader(start));
    return proceed;
  }

  if (pathname.startsWith("/api")) {
    const proceed = NextResponse.next();
    proceed.headers.set("Server-Timing", serverTimingHeader(start));
    return proceed;
  }

  const protectedPrefixes: readonly string[] = ["/user"];
  const isProtectionEnabled: boolean = false;
  const isProtected: boolean = isProtectionEnabled && protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isAuthPath: boolean = pathname.startsWith("/auth");

  if (isProtected) {
    const session = await fetchSession(request);
    if (!session) {
      const url = new URL("/auth/login", request.url);
      const response = NextResponse.redirect(url);
      response.headers.set("Server-Timing", serverTimingHeader(start));
      return response;
    }
  }

  if (isAuthPath) {
    const session = await fetchSession(request);
    if (session) {
      const url = new URL("/user", request.url);
      const response = NextResponse.redirect(url);
      response.headers.set("Server-Timing", serverTimingHeader(start));
      return response;
    }
  }

  const proceed = NextResponse.next();
  proceed.headers.set("Server-Timing", serverTimingHeader(start));
  return proceed;
}

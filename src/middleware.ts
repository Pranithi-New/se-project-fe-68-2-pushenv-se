import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_PAGES = new Set(["/signin", "/signup"]);
const PROTECTED_PREFIXES = ["/admin"];
const PROTECTED_PATHS = new Set(["/profile"]);
const TOKEN_COOKIE = "job-fair-token";

type TokenPayload = {
  role?: string;
};

function decodeTokenPayload(token: string): TokenPayload | null {
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

function isProtectedPath(pathname: string) {
  if (PROTECTED_PATHS.has(pathname)) return true;
  return PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

function getSignedInRedirect(role?: string) {
  if (role === "systemAdmin") {
    return "/admin/users";
  }

  return "/events";
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const payload = token ? decodeTokenPayload(token) : null;
  const isSignedIn = Boolean(token && payload);

  if (AUTH_PAGES.has(pathname)) {
    if (!isSignedIn) {
      return NextResponse.next();
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getSignedInRedirect(payload?.role);
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (!isSignedIn) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/signin";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/admin") && payload?.role !== "systemAdmin") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getSignedInRedirect(payload?.role);
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};

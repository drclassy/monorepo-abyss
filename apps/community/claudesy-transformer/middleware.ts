// Claudesy CTE V2 — Route Middleware
// Session refresh + route protection + tier check from JWT

import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware"

const TierSchema = z.enum(["GRATIS", "PRO", "TIM", "ENTERPRISE"])

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
  "/api/transform",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/callback",
  "/api/auth/session",
]
const AUTH_PATHS = ["/login", "/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Allow billing webhook (Xendit sends POST, no cookies)
  if (pathname.startsWith("/api/billing/webhook")) {
    return NextResponse.next()
  }

  const { supabase, response } = createSupabaseMiddlewareClient(request)

  // Refresh session — MUST be called to keep auth cookies alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public paths — allow without auth
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  // If user is logged in and tries to access auth pages, redirect to dashboard
  if (user && AUTH_PATHS.some((path) => pathname === path)) {
    const url = request.nextUrl.clone()
    url.pathname = "/optimizer"
    return NextResponse.redirect(url)
  }

  // Protected paths — require auth
  if (!isPublicPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Attach user tier to response headers for downstream use (optional)
  if (user) {
    const tier = TierSchema.catch("GRATIS").parse(user.app_metadata?.tier)
    response.headers.set("x-user-tier", tier)
    response.headers.set("x-user-id", user.id)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("session", session);

  // Auth routes (login, signup, etc.) - redirect to dashboard if authenticated
  if (
    request.nextUrl.pathname.startsWith("/saas/login") ||
    request.nextUrl.pathname.startsWith("/saas/signup") ||
    request.nextUrl.pathname.startsWith("/saas/banksignup")
  ) {
    if (session) {
      return NextResponse.redirect(new URL("/saas/dashboard", request.url));
    }
    return response;
  }

  // Protected routes - redirect to login if not authenticated
  if (
    request.nextUrl.pathname.startsWith("/saas/dashboard") ||
    request.nextUrl.pathname.startsWith("/saas/(private)")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/saas/login", request.url));
    }
    return response;
  }

  return response;
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    "/saas/login/:path*",
    "/saas/signup/:path*",
    "/saas/dashboard/:path*",
    "/saas/(private)/:path*",
    "/saas/banksignup/:path*",
  ],
};

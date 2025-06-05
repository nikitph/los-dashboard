import { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createClient } from "@/lib/supabase/middleware";
import { routing } from "./i18n/routing";

// Create the intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Handle internationalization first
  const intlResponse = intlMiddleware(request);

  // Skip auth logic for non-SAAS routes
  const pathname = request.nextUrl.pathname;
  if (!pathname.includes("/saas/")) {
    return intlResponse;
  }

  // Handle Supabase auth for SAAS routes
  const { supabase } = createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Extract locale and clean path
  const segments = pathname.split("/");
  const locale = segments[1]; // en or hi
  const pathWithoutLocale = pathname.replace(`/${locale}`, "");

  // Redirect authenticated users away from auth pages
  const authPages = ["/saas/login", "/saas/signup", "/saas/banksignup"];
  if (authPages.some((page) => pathWithoutLocale.startsWith(page))) {
    if (session) {
      return Response.redirect(new URL(`/${locale}/saas/dashboard`, request.url));
    }
    return intlResponse;
  }

  // Protect dashboard and private routes
  const protectedRoutes = ["/saas/dashboard", "/saas/(private)"];
  if (protectedRoutes.some((route) => pathWithoutLocale.startsWith(route))) {
    if (!session) {
      return Response.redirect(new URL(`/${locale}/saas/login`, request.url));
    }
    return intlResponse;
  }

  return intlResponse;
}

// Specify which routes the middleware should run on
// TODO correct this for banksignup
export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api routes
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - Static files (images, favicon, etc.)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};

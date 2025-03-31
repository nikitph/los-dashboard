import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

// Your supported locales
const PUBLIC_LOCALES = ["en", "hi"];
const DEFAULT_LOCALE = "en";

function getLocaleFromPath(pathname: string): string | null {
  const locale = pathname.split("/")[1];
  return PUBLIC_LOCALES.includes(locale) ? locale : null;
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Extract locale from path or fallback
  const locale = getLocaleFromPath(request.nextUrl.pathname) || DEFAULT_LOCALE;

  // If locale prefix is missing, rewrite to include it
  if (!getLocaleFromPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${url.pathname}`;
    return NextResponse.redirect(url);
  }

  // Get session from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Strip locale to simplify logic
  const pathWithoutLocale = pathname.replace(`/${locale}`, "");

  // Auth routes - redirect to dashboard if logged in
  if (
    pathWithoutLocale.startsWith("/saas/login") ||
    pathWithoutLocale.startsWith("/saas/signup") ||
    pathWithoutLocale.startsWith("/saas/banksignup")
  ) {
    if (session) {
      return NextResponse.redirect(new URL(`/${locale}/saas/dashboard`, request.url));
    }
    return response;
  }

  // Protected routes - redirect to login if not authenticated
  if (pathWithoutLocale.startsWith("/saas/dashboard") || pathWithoutLocale.startsWith("/saas/(private)")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/${locale}/saas/login`, request.url));
    }
    return response;
  }

  return response;
}

// Specify which routes the middleware should run on
// TODO correct this for banksignup
export const config = {
  matcher: [
    "/:locale(saas|en|hi)/saas/login/:path*",
    "/:locale(saas|en|hi)/saas/signup/:path*",
    "/:locale(saas|en|hi)/saas/dashboard/:path*",
    "/:locale(saas|en|hi)/saas/(private)/:path*",
  ],
};

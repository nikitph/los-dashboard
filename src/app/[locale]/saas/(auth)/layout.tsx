import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import "../../../globals.css";
import { siteConfig } from "../../../siteConfig";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/contexts/userContext";
import { ErrorBoundary } from "@sentry/nextjs";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  metadataBase: new URL("https://creditIQ.online"),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ["Saas", "Credit Management", "Software"],
  authors: [
    {
      name: "nikitph",
      url: "",
    },
  ],
  creator: "nikitph",
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  },
  other: {
    // PWA and mobile app capabilities
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": siteConfig.name,
    // Theme color for address bar (matches your manifest)
    "theme-color": "#ffffff",
    "msapplication-TileColor": "#ffffff",
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <head>
        {/* Theme color meta tag for dynamic theme support */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={`bg-white-50 h-full antialiased dark:bg-gray-950`}>
        <NextIntlClientProvider>
          <ErrorBoundary>
            <ThemeProvider defaultTheme="light" disableTransitionOnChange attribute="class">
              <UserProvider>
                <div className="w-full">
                  <main>{children}</main>
                </div>
              </UserProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

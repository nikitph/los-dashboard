import { SidebarProvider, SidebarTrigger } from "@/components/Sidebar";
import { AppSidebar } from "@/components/ui/navigation/AppSidebar";
import { Breadcrumbs } from "@/components/ui/navigation/Breadcrumbs";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import "../../../globals.css";
import { siteConfig } from "@/app/siteConfig";
import { UserProvider } from "@/contexts/userContext";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Toaster } from "@/components/ui/toaster";
import { AbilityProvider } from "@/lib/casl/abilityContext";
import { getServerSessionUser } from "@/lib/getServerUser";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

// Load Inter font for sans-serif
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// Keep Geist Mono if you still want to use it for monospace
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yoururl.com"),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ["Dashboard", "Data Visualization", "Software"],
  authors: [
    {
      name: "yourname",
      url: "",
    },
  ],
  creator: "yourname",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@yourname",
  },
  icons: {
    icon: "/favicon.ico",
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
  const serverUser = await getServerSessionUser();
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} bg-white-50 h-full font-sans antialiased dark:bg-gray-950`}
      >
        <NextIntlClientProvider>
          <ThemeProvider defaultTheme="system" disableTransitionOnChange attribute="class">
            <UserProvider initialUser={serverUser}>
              <AbilityProvider>
                <SidebarProvider defaultOpen={defaultOpen}>
                  <AppSidebar />
                  <div className="w-full">
                    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
                      <SidebarTrigger className="-ml-1" />
                      <div className="mr-2 h-4 w-px bg-gray-200 dark:bg-gray-800" />
                      <Breadcrumbs />
                    </header>
                    <main>{children}</main>
                  </div>
                </SidebarProvider>
              </AbilityProvider>
            </UserProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

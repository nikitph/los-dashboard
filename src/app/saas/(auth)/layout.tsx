import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import "../../globals.css";
import { siteConfig } from "../../siteConfig";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/contexts/userContext";
import { ErrorBoundary } from "@sentry/nextjs";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`bg-white-50 h-full antialiased dark:bg-gray-950`}>
        <ErrorBoundary>
          <ThemeProvider defaultTheme="light" disableTransitionOnChange attribute="class">
            <UserProvider>
              <div className="w-full">
                <main>{children}</main>
              </div>
              <Toaster />
            </UserProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

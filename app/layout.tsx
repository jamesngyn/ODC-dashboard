import "./globals.css";

import type { Metadata } from "next/types";
import { Provider } from "@/components/provider";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "ODC Dashboard",
  generator: "Next.js",
  applicationName: "ODC Dashboard",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Next.js",
    "React",
    "JavaScript",
    "Boilerplate",
    "Template",
    "shadcn-ui",
  ],
  authors: [{ name: "Virgil", url: "https://obedd.vercel.app" }],
  creator: "Virgil",
  publisher: "Virgil",
  alternates: {},
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://Neit.vercel.app"),
  openGraph: {
    title: "ODC Dashboard",
    description: "Next.js, TailwindCSS and shadcn-ui Starter Template",
    url: "https://Neit.vercel.app",
    siteName: "ODC Dashboard",
    images: [
      {
        url: "https://Neit.vercel.app/og.png",
        width: 800,
        height: 600,
      },
      {
        url: "https://Neit.vercel.app/og-dark.png",
        width: 1800,
        height: 1600,
        alt: "Next.js, TailwindCSS and shadcn-ui Starter Template",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  robots: {
    index: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read locale from cookie on server
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE");
  const locale = localeCookie?.value && ["en", "vi", "ja"].includes(localeCookie.value)
    ? localeCookie.value
    : "vi";

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Script to set locale before React hydration to prevent flash */}
        {/* This script runs immediately, before any other scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var locale = '${locale}';
                if (typeof window !== 'undefined') {
                  // Set window variable immediately (before i18n init)
                  window.__NEXT_LOCALE__ = locale;
                  
                  // Also ensure localStorage is set (for i18n detection)
                  try {
                    if (!localStorage.getItem('i18nextLng')) {
                      localStorage.setItem('i18nextLng', locale);
                    }
                  } catch(e) {
                    // Ignore localStorage errors (e.g., private mode)
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <Provider attribute="class" defaultTheme="system" enableSystem>
          <main
            className={`bg-white text-zinc-700 dark:bg-black dark:text-zinc-400`}
          >
            {children}
          </main>
        </Provider>
      </body>
    </html>
  );
}

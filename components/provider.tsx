"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useTranslation } from "react-i18next";
import "@/lib/i18n"; // Initialize i18n

function I18nSync() {
  const { i18n } = useTranslation();

  React.useEffect(() => {
   
    if (typeof document !== "undefined") {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  return null;
}

export function Provider({ children, ...props }: ThemeProviderProps) {
  const [queryClient] = React.useState(() => new QueryClient());
  const [showDevtools, setShowDevtools] = React.useState(false);

  React.useEffect(() => {
    setShowDevtools(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nSync />
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function Provider({ children, ...props }: ThemeProviderProps) {
  const [queryClient] = React.useState(() => new QueryClient());
  const [showDevtools, setShowDevtools] = React.useState(false);

  React.useEffect(() => {
    setShowDevtools(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * App-wide client providers. React Query is wired up now so the project is
 * ready to swap dummy data for real API calls later without restructuring.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

// This component wraps the entire app with two providers:
// 1. QueryClientProvider — gives TanStack Query its cache/state manager
// 2. trpc.Provider — gives tRPC hooks access to the client
// Without BOTH of these, any component calling trpc.*.useMutation()
// or trpc.*.useQuery() will throw "Unable to find tRPC Context".

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          // This must match the route at app/api/trpc/[trpc]/route.ts
          url: "http://localhost:3000/api/trpc",
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

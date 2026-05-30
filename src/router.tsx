import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

/**
 * Factory function that creates the router with a shared QueryClient context.
 * The QueryClient is created in main.tsx and passed here — this avoids
 * the bug where two separate QueryClients exist (one in main.tsx, one here),
 * causing cache misses and double-fetching on route navigations.
 */
export function getRouter(queryClient?: QueryClient) {
  const qc = queryClient ?? new QueryClient();

  return createRouter({
    routeTree,
    context: { queryClient: qc },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Preload on hover/focus — improves perceived performance
    defaultPreload: "intent",
  });
}

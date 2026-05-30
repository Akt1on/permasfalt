import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getRouter } from "./router";
import "./styles.css";

// Single QueryClient instance — shared between QueryClientProvider and Router context.
// This is critical: without sharing, the router creates its own QC and route loaders
// write to a different cache than what the components read from, causing double-fetches.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,         // 1 min — prevents refetch on every navigation
      gcTime: 5 * 60 * 1000,        // 5 min — keep data in memory after component unmount
      retry: 1,                      // 1 retry on failure, not 3 (default)
      refetchOnWindowFocus: false,   // don't refetch when user switches tabs
    },
  },
});

// Pass the shared queryClient so router loaders use the same cache
const router = getRouter(queryClient);

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("#root element not found in DOM");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);

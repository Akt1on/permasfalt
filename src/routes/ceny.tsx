import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect /ceny → /tseny (canonical prices page)
// /tseny is linked from the main nav and fetches live prices from Supabase
export const Route = createFileRoute("/ceny")({
  loader: () => { throw redirect({ to: "/tseny", statusCode: 301 }); },
});

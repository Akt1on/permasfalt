import { createFileRoute, redirect } from "@tanstack/react-router";

// Редирект: /uslugi → /services (canonical URL)
export const Route = createFileRoute("/uslugi/")({
  loader: () => { throw redirect({ to: "/services", statusCode: 301 }); },
});

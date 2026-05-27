import { createFileRoute, redirect } from "@tanstack/react-router";

// Редирект: /uslugi/[slug] → /services/[slug] (canonical URL)
export const Route = createFileRoute("/uslugi/$slug")({
  loader: ({ params }) => {
    throw redirect({ to: "/services/$slug", params: { slug: params.slug }, statusCode: 301 });
  },
});

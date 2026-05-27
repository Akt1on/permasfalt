import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/kontakty")({
  loader: () => { throw redirect({ to: "/contacts", statusCode: 301 }); },
});

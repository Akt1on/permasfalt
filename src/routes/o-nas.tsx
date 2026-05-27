import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/o-nas")({
  loader: () => { throw redirect({ to: "/about", statusCode: 301 }); },
});

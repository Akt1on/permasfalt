import { createFileRoute } from "@tanstack/react-router";
import { AdminOverview } from "./_admin.overview";

export const Route = createFileRoute("/admin/")({ component: AdminOverview });

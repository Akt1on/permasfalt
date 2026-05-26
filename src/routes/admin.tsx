import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return <AdminShell>{path === "/admin" ? <Overview /> : <Outlet />}</AdminShell>;
}

function Overview() {
  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [s, p, l] = await Promise.all([
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
      ]);
      return { services: s.count ?? 0, projects: p.count ?? 0, newLeads: l.count ?? 0 };
    },
  });
  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-8">Обзор</h1>
      <div className="grid md:grid-cols-3 gap-5">
        {[
          { l: "Услуги", v: counts?.services ?? "..." },
          { l: "Проекты", v: counts?.projects ?? "..." },
          { l: "Новые заявки", v: counts?.newLeads ?? "..." },
        ].map((s, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
            <div className="font-display text-4xl font-bold text-gradient-gold mt-2">{s.v}</div>
          </div>
        ))}
      </div>

    </div>
  );
}

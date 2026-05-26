import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Wrench,
  FolderKanban,
  Star,
  Newspaper,
  Inbox,
  Settings,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

type Lead = {
  id: string;
  name: string | null;
  phone: string;
  service: string | null;
  message: string | null;
  source: string | null;
  status: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  new:         "Новая",
  in_progress: "В работе",
  done:        "Завершена",
  rejected:    "Отклонена",
};
const STATUS_COLORS: Record<string, string> = {
  new:         "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  in_progress: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  done:        "bg-sky-500/15 text-sky-400 border border-sky-500/30",
  rejected:    "bg-muted/40 text-muted-foreground border border-border",
};

function AdminDashboard() {
  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [s, p, l, r, b] = await Promise.all([
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("is_published", true),
      ]);
      return {
        services: s.count ?? 0,
        projects: p.count ?? 0,
        newLeads: l.count ?? 0,
        reviews:  r.count ?? 0,
        posts:    b.count ?? 0,
      };
    },
    refetchInterval: 30_000,
  });

  const { data: recentLeads = [], refetch: refetchLeads } = useQuery({
    queryKey: ["admin-recent-leads"],
    queryFn: async () =>
      ((await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(10)).data ?? []) as Lead[],
    refetchInterval: 15_000,
  });

  const setStatus = async (id: string, status: string) => {
    await supabase.from("leads").update({ status }).eq("id", id);
    refetchLeads();
  };

  const QUICK_LINKS = [
    { to: "/admin/services",  label: "Услуги",     icon: Wrench,       desc: `${counts?.services ?? "…"} услуг` },
    { to: "/admin/projects",  label: "Портфолио",  icon: FolderKanban, desc: `${counts?.projects ?? "…"} проектов` },
    { to: "/admin/reviews",   label: "Отзывы",     icon: Star,         desc: `${counts?.reviews ?? "…"} отзывов` },
    { to: "/admin/posts",     label: "Блог",       icon: Newspaper,    desc: `${counts?.posts ?? "…"} статей` },
    { to: "/admin/leads",     label: "Все заявки", icon: Inbox,        desc: "открыть журнал" },
    { to: "/admin/settings",  label: "Настройки",  icon: Settings,     desc: "телефон, адрес…" },
  ];

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Дашборд</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: ru })}
          </p>
        </div>
        {(counts?.newLeads ?? 0) > 0 && (
          <Link to="/admin/leads" className="flex items-center gap-2 btn-gold rounded-lg px-4 py-2 text-sm font-semibold animate-pulse">
            <AlertCircle className="h-4 w-4" />
            {counts?.newLeads} новых заявок
          </Link>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          { label: "Услуги",         value: counts?.services,  color: "text-primary" },
          { label: "Проекты",        value: counts?.projects,  color: "text-primary" },
          { label: "Новые заявки",   value: counts?.newLeads,  color: counts?.newLeads ? "text-emerald-400" : "text-muted-foreground" },
          { label: "Активных отзывов",value: counts?.reviews,  color: "text-primary" },
          { label: "Статей блога",   value: counts?.posts,     color: "text-primary" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-2xl p-4 sm:p-5">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground leading-tight">{s.label}</div>
            <div className={`font-display text-3xl font-bold mt-2 ${s.color}`}>
              {s.value ?? "…"}
            </div>
          </div>
        ))}
      </div>

      {/* Быстрый доступ */}
      <div>
        <h2 className="font-display text-lg font-bold mb-4">Управление</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ to, label, icon: Icon, desc }) => (
            <Link key={to} to={to}
              className="glass rounded-2xl p-4 hover:border-primary/50 hover:bg-surface-2 transition group flex flex-col gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <div className="font-semibold text-sm">{label}</div>
              <div className="text-[11px] text-muted-foreground">{desc}</div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition mt-auto" />
            </Link>
          ))}
        </div>
      </div>

      {/* Последние заявки */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold">Последние заявки</h2>
          <Link to="/admin/leads" className="text-sm text-primary hover:underline flex items-center gap-1">
            Все заявки <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground text-sm">
            Заявок пока нет
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="p-4 text-left">Время</th>
                  <th className="p-4 text-left">Имя / Телефон</th>
                  <th className="p-4 text-left">Сообщение</th>
                  <th className="p-4 text-left">Источник</th>
                  <th className="p-4 text-left">Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-border hover:bg-surface-2/40 transition">
                    <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(lead.created_at), "dd.MM HH:mm")}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{lead.name || "—"}</div>
                      <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                         className="text-xs text-primary hover:underline">
                        {lead.phone}
                      </a>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground max-w-[200px]">
                      <div className="line-clamp-2">{lead.message || lead.service || "—"}</div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{lead.source || "—"}</td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => setStatus(lead.id, e.target.value)}
                        className={`text-xs rounded-lg px-2 py-1 border font-medium cursor-pointer focus:outline-none ${STATUS_COLORS[lead.status] ?? STATUS_COLORS.new}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                          <option key={v} value={v} className="bg-background text-foreground">{l}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

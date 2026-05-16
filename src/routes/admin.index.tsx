import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyAdminStatus, listLeads, updateLeadStatus } from "@/lib/admin.functions";
import {
  Loader2, LogOut, Phone, MessageSquare, Clock, CheckCircle2,
  Archive, ShieldAlert, RefreshCw, Inbox, Send,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Заявки — Админка" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPage,
});

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Готово",
  archived: "Архив",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  in_progress: "bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30",
  done: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  archived: "bg-muted/40 text-muted-foreground border-border",
};

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [authReady, setAuthReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const fetchStatus = useServerFn(getMyAdminStatus);
  const fetchLeads = useServerFn(listLeads);
  const mutateStatus = useServerFn(updateLeadStatus);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      setHasSession(true);
      setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/admin/login" });
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [navigate]);

  const status = useQuery({
    queryKey: ["admin", "status"],
    queryFn: () => fetchStatus(),
    enabled: authReady && hasSession,
  });

  const leads = useQuery({
    queryKey: ["admin", "leads"],
    queryFn: () => fetchLeads(),
    enabled: !!status.data?.isAdmin,
    refetchInterval: 15_000,
  });

  const updateMut = useMutation({
    mutationFn: (vars: { id: string; status: "new" | "in_progress" | "done" | "archived" }) =>
      mutateStatus({ data: vars }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "leads"] }),
  });

  if (!authReady || status.isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  if (status.data && !status.data.isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="font-display text-2xl tracking-wide">Доступ запрещён</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Вашему аккаунту не назначена роль администратора.
          </p>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); }}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-surface-2"
          >
            <LogOut className="h-4 w-4" /> Выйти
          </button>
        </div>
      </div>
    );
  }

  const items = leads.data?.leads ?? [];
  const counts = items.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface-1 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">Админ-панель</div>
            <h1 className="font-display text-xl tracking-wide">Заявки клиентов</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => leads.refetch()}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${leads.isFetching ? "animate-spin" : ""}`} /> Обновить
            </button>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline">На сайт</Link>
            <button
              onClick={async () => { await supabase.auth.signOut(); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-2"
            >
              <LogOut className="h-3.5 w-3.5" /> Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(["new", "in_progress", "done", "archived"] as const).map((s) => (
            <div key={s} className={`rounded-xl border p-4 ${STATUS_COLORS[s]}`}>
              <div className="text-[10px] uppercase tracking-widest opacity-80">{STATUS_LABELS[s]}</div>
              <div className="font-numeric text-3xl mt-1 leading-none">{counts[s] ?? 0}</div>
            </div>
          ))}
        </div>

        {leads.isLoading ? (
          <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--gold)]" /></div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface-1 p-12 text-center">
            <Inbox className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Пока нет заявок. Они появятся здесь автоматически.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((l) => (
              <li key={l.id} className="rounded-2xl border border-border bg-surface-1 p-4 sm:p-5 hover:border-[var(--gold)]/40 transition">
                <div className="flex flex-wrap items-start gap-3 justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-bold text-base">{l.name}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_COLORS[l.status] ?? STATUS_COLORS.new}`}>
                        {STATUS_LABELS[l.status] ?? l.status}
                      </span>
                      {l.telegram_sent && (
                        <span title="Отправлено в Telegram" className="inline-flex items-center gap-1 text-[10px] text-sky-400">
                          <Send className="h-3 w-3" /> TG
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1.5 text-[var(--gold)] hover:underline">
                        <Phone className="h-3.5 w-3.5" /> {l.phone}
                      </a>
                      {l.service && <span className="text-muted-foreground">🛠 {l.service}</span>}
                    </div>
                    {l.message && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-foreground/80">
                        <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                        <span>{l.message}</span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(l.created_at).toLocaleString("ru-RU")}</span>
                      {l.source && <span>📍 {l.source}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(["new", "in_progress", "done", "archived"] as const)
                      .filter((s) => s !== l.status)
                      .map((s) => (
                        <button
                          key={s}
                          onClick={() => updateMut.mutate({ id: l.id, status: s })}
                          disabled={updateMut.isPending}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider hover:bg-surface-2 disabled:opacity-50"
                        >
                          {s === "done" ? <CheckCircle2 className="h-3 w-3" /> : s === "archived" ? <Archive className="h-3 w-3" /> : null}
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

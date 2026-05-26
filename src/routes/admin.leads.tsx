import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Phone, MessageSquare, Filter } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/leads")({ component: AdminLeads });

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
const STATUS_STYLES: Record<string, string> = {
  new:         "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  in_progress: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  done:        "bg-sky-500/15 text-sky-400 border border-sky-500/30",
  rejected:    "bg-muted/40 text-muted-foreground border border-border",
};

function AdminLeads() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () =>
      ((await supabase.from("leads").select("*").order("created_at", { ascending: false })).data ?? []) as Lead[],
    refetchInterval: 15_000,
  });

  const filtered = filterStatus === "all" ? leads : leads.filter((l) => l.status === filterStatus);

  const counts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["leads"] });
    qc.invalidateQueries({ queryKey: ["admin-counts"] });
  };

  const del = async (id: string) => {
    if (!confirm("Удалить заявку безвозвратно?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Удалено");
    qc.invalidateQueries({ queryKey: ["leads"] });
    qc.invalidateQueries({ queryKey: ["admin-counts"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Заявки</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {leads.length} всего · {counts.new ?? 0} новых
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        <FilterBtn active={filterStatus === "all"} onClick={() => setFilterStatus("all")}>
          Все <span className="ml-1 opacity-60">{leads.length}</span>
        </FilterBtn>
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <FilterBtn key={k} active={filterStatus === k} onClick={() => setFilterStatus(k)}>
            {v} {counts[k] ? <span className="ml-1 opacity-60">{counts[k]}</span> : null}
          </FilterBtn>
        ))}
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm p-8 text-center">Загрузка…</div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
          {filterStatus === "all" ? "Заявок пока нет" : `Нет заявок со статусом «${STATUS_LABELS[filterStatus]}»`}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-4">Дата</th>
                <th className="p-4">Контакт</th>
                <th className="p-4">Запрос</th>
                <th className="p-4">Источник</th>
                <th className="p-4">Статус</th>
                <th className="p-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className={`border-t border-border hover:bg-surface-2/30 transition ${l.status === "new" ? "border-l-2 border-l-emerald-500" : ""}`}>
                  <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(l.created_at), "dd MMM", { locale: ru })}
                    <br />
                    {format(new Date(l.created_at), "HH:mm")}
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{l.name || "—"}</div>
                    <a
                      href={`tel:${l.phone.replace(/[^\d+]/g, "")}`}
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Phone className="h-3 w-3" />
                      {l.phone}
                    </a>
                  </td>
                  <td className="p-4">
                    {l.service && <div className="text-xs font-medium text-primary mb-0.5">{l.service}</div>}
                    {l.message && (
                      <div className="text-xs text-muted-foreground flex items-start gap-1 max-w-xs">
                        <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{l.message}</span>
                      </div>
                    )}
                    {!l.service && !l.message && <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">{l.source || "—"}</td>
                  <td className="p-4">
                    <select
                      value={l.status}
                      onChange={(e) => setStatus(l.id, e.target.value)}
                      className={`text-xs rounded-lg px-2.5 py-1.5 font-medium cursor-pointer focus:outline-none transition ${STATUS_STYLES[l.status] ?? STATUS_STYLES.new}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([v, label]) => (
                        <option key={v} value={v} className="bg-background text-foreground">{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <button onClick={() => del(l.id)} className="p-2 rounded hover:bg-surface-2 text-destructive/70 hover:text-destructive transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center ${active ? "bg-primary text-primary-foreground" : "glass hover:bg-surface-2"}`}
    >
      {children}
    </button>
  );
}

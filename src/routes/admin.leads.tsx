import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/leads")({ component: AdminLeads });

function AdminLeads() {
  const qc = useQueryClient();
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => (await supabase.from("leads").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const setStatus = async (id: string, status: string) => {
    await supabase.from("leads").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["leads"] });
  };
  const del = async (id: string) => {
    if (!confirm("Удалить заявку?")) return;
    await supabase.from("leads").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["leads"] });
  };

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold mb-6">Заявки</h1>
      <div className="glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="p-4">Дата</th><th className="p-4">Имя</th><th className="p-4">Телефон</th><th className="p-4">Сообщение</th><th className="p-4">Источник</th><th className="p-4">Статус</th><th></th></tr>
          </thead>
          <tbody>
            {leads.map((l: any) => (
              <tr key={l.id} className="border-t border-border">
                <td className="p-4 text-xs text-muted-foreground">{format(new Date(l.created_at), "dd.MM HH:mm")}</td>
                <td className="p-4">{l.name || "—"}</td>
                <td className="p-4 font-medium"><a href={`tel:${l.phone.replace(/[^+\d]/g,'')}`} className="hover:text-primary">{l.phone}</a></td>
                <td className="p-4 text-xs max-w-xs">{l.message || "—"}</td>
                <td className="p-4 text-xs text-muted-foreground">{l.source}</td>
                <td className="p-4">
                  <select value={l.status} onChange={(e) => setStatus(l.id, e.target.value)} className="bg-input border border-border rounded px-2 py-1 text-xs">
                    <option value="new">Новая</option>
                    <option value="in_progress">В работе</option>
                    <option value="done">Завершена</option>
                    <option value="rejected">Отклонена</option>
                  </select>
                </td>
                <td className="p-4"><button onClick={() => del(l.id)} className="text-destructive p-2 hover:bg-surface-2 rounded"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
            {leads.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Заявок пока нет</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

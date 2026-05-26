import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllServices, fetchPricing, type Service } from "@/lib/site-data";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/services")({ component: AdminServices });

function AdminServices() {
  const qc = useQueryClient();
  const { data: services = [] } = useQuery({ queryKey: ["admin-services"], queryFn: fetchAllServices });
  const [edit, setEdit] = useState<Partial<Service> | null>(null);

  const save = async () => {
    if (!edit?.title || !edit?.slug) { toast.error("Название и slug обязательны"); return; }
    const payload: any = { ...edit, sort_order: edit.sort_order ?? 0, is_active: edit.is_active ?? true };
    const { error } = edit.id
      ? await supabase.from("services").update(payload).eq("id", edit.id)
      : await supabase.from("services").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено"); setEdit(null); qc.invalidateQueries({ queryKey: ["admin-services"] }); qc.invalidateQueries({ queryKey: ["services"] });
  };

  const del = async (id: string) => {
    if (!confirm("Удалить услугу?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Удалено"); qc.invalidateQueries({ queryKey: ["admin-services"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Услуги</h1>
        <button onClick={() => setEdit({ is_active: true, price_unit: "м²", sort_order: services.length })} className="btn-gold rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>
      <div className="glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="p-4">Название</th><th className="p-4">Цена</th><th className="p-4">Активна</th><th className="p-4 w-32"></th></tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-4 font-medium">{s.title}<div className="text-xs text-muted-foreground">{s.slug}</div></td>
                <td className="p-4">от {Number(s.price_from).toLocaleString("ru-RU")} ₽ / {s.price_unit}</td>
                <td className="p-4">{s.is_active ? "✓" : "—"}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => setEdit(s)} className="p-2 rounded hover:bg-surface-2"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => del(s.id)} className="p-2 rounded hover:bg-surface-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur grid place-items-center p-2 sm:p-4 z-50" onClick={() => setEdit(null)}>
          <div className="glass rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-bold mb-5">{edit.id ? "Редактировать" : "Новая услуга"}</h2>
            <div className="grid gap-3">
              <Field label="Название"><Input value={edit.title ?? ""} onChange={(v) => setEdit({ ...edit, title: v })} /></Field>
              <Field label="Slug (англ.)"><Input value={edit.slug ?? ""} onChange={(v) => setEdit({ ...edit, slug: v })} /></Field>
              <Field label="Краткое описание"><Input value={edit.short_description ?? ""} onChange={(v) => setEdit({ ...edit, short_description: v })} /></Field>
              <Field label="Полное описание"><textarea value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} rows={5} className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none" /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Цена от"><Input type="number" value={String(edit.price_from ?? "")} onChange={(v) => setEdit({ ...edit, price_from: Number(v) })} /></Field>
                <Field label="Ед."><Input value={edit.price_unit ?? "м²"} onChange={(v) => setEdit({ ...edit, price_unit: v })} /></Field>
                <Field label="Иконка (lucide)"><Input value={edit.icon ?? ""} onChange={(v) => setEdit({ ...edit, icon: v })} /></Field>
              </div>
              <Field label="Изображение"><ImageUpload value={edit.image_url} onChange={(url) => setEdit({ ...edit, image_url: url })} /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.is_active ?? true} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} /> Активна</label>
              {edit.id && <PricingEditor serviceId={edit.id} />}
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setEdit(null)} className="px-5 py-2.5 rounded-lg hover:bg-surface-2">Отмена</button>
              <button onClick={save} className="btn-gold rounded-lg px-5 py-2.5 font-semibold">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PricingEditor({ serviceId }: { serviceId: string }) {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["pricing", serviceId],
    queryFn: () => fetchPricing(serviceId),
  });
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("м²");
  const [price, setPrice] = useState("");

  const add = async () => {
    if (!name || !price) { toast.error("Введите название и цену"); return; }
    const { error } = await supabase.from("pricing_items").insert({
      service_id: serviceId, name, unit, price: Number(price), sort_order: items.length,
    });
    if (error) { toast.error(error.message); return; }
    setName(""); setPrice("");
    qc.invalidateQueries({ queryKey: ["pricing", serviceId] });
  };
  const del = async (id: string) => {
    await supabase.from("pricing_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["pricing", serviceId] });
  };

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Прайс-лист (детально)</div>
      <div className="space-y-2 mb-3">
        {items.map((it: any) => (
          <div key={it.id} className="flex items-center gap-2 bg-surface-2/50 rounded-lg px-3 py-2 text-sm">
            <span className="flex-1">{it.name}</span>
            <span className="text-primary font-semibold">{Number(it.price).toLocaleString("ru-RU")} ₽ / {it.unit}</span>
            <button onClick={() => del(it.id)} className="p-1 text-destructive hover:bg-surface-2 rounded"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-12 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Позиция" className="col-span-6 bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="ед." className="col-span-2 bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Цена" type="number" className="col-span-2 bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        <button onClick={add} className="col-span-2 btn-gold rounded-lg text-sm font-semibold flex items-center justify-center gap-1"><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1.5">{label}</label>{children}</div>;
}
function Input({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none" />;
}

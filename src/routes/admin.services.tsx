import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllServices, fetchPricing, type Service } from "@/lib/site-data";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/services")({ component: AdminServices });

function toInsertPayload(edit: Partial<Service>) {
  const { id, created_at, updated_at, ...rest } = edit as any;
  return { ...rest, sort_order: edit.sort_order ?? 0, is_active: edit.is_active ?? true };
}
function toUpdatePayload(edit: Partial<Service>) {
  const { id, created_at, updated_at, ...rest } = edit as any;
  return { ...rest, sort_order: edit.sort_order ?? 0, is_active: edit.is_active ?? true };
}

function AdminServices() {
  const qc = useQueryClient();
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: fetchAllServices,
  });
  const [edit, setEdit] = useState<Partial<Service> | null>(null);

  const save = async () => {
    if (!edit?.title?.trim()) { toast.error("Название обязательно"); return; }
    if (!edit?.slug?.trim())  { toast.error("Slug обязателен"); return; }

    const { error } = edit.id
      ? await supabase.from("services").update(toUpdatePayload(edit)).eq("id", edit.id)
      : await supabase.from("services").insert(toInsertPayload(edit));

    if (error) {
      if (error.message.includes("unique") || error.message.includes("duplicate")) {
        toast.error("Такой slug уже существует. Измените URL-идентификатор.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Сохранено");
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["admin-services"] });
    qc.invalidateQueries({ queryKey: ["services"] });
    qc.invalidateQueries({ queryKey: ["content", "services"] });
  };

  const del = async (id: string) => {
    if (!confirm("Удалить услугу? Связанные прайс-позиции тоже удалятся.")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Удалено");
    qc.invalidateQueries({ queryKey: ["admin-services"] });
  };

  const toggleActive = async (s: Service) => {
    await supabase.from("services").update({ is_active: !s.is_active }).eq("id", s.id);
    qc.invalidateQueries({ queryKey: ["admin-services"] });
  };

  const moveOrder = async (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= services.length) return;
    const a = services[idx];
    const b = services[next];
    await Promise.all([
      supabase.from("services").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("services").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    qc.invalidateQueries({ queryKey: ["admin-services"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Услуги</h1>
          <p className="text-sm text-muted-foreground mt-1">Управляйте описанием, ценами и порядком отображения услуг.</p>
        </div>
        <button
          onClick={() => setEdit({ is_active: true, price_unit: "м²", sort_order: services.length })}
          className="btn-gold rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm p-8 text-center">Загрузка…</div>
      ) : (
        <div className="glass rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-4 w-16">Порядок</th>
                <th className="p-4">Название / Slug</th>
                <th className="p-4">Цена от</th>
                <th className="p-4">Статус</th>
                <th className="p-4 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, idx) => (
                <tr key={s.id} className="border-t border-border hover:bg-surface-2/30 transition">
                  <td className="p-4">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveOrder(idx, -1)} disabled={idx === 0}
                        className="p-1 rounded hover:bg-surface-2 disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                      <button onClick={() => moveOrder(idx, 1)} disabled={idx === services.length - 1}
                        className="p-1 rounded hover:bg-surface-2 disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">/uslugi/{s.slug}</div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {s.price_from ? `от ${Number(s.price_from).toLocaleString("ru-RU")} ₽ / ${s.price_unit ?? "м²"}` : "—"}
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleActive(s)}
                      className={`text-xs rounded-full px-3 py-1 font-medium transition ${s.is_active ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}>
                      {s.is_active ? "Активна" : "Скрыта"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setEdit(s)} className="p-2 rounded hover:bg-surface-2" title="Редактировать"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => del(s.id)} className="p-2 rounded hover:bg-surface-2 text-destructive" title="Удалить"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Услуг пока нет. Нажмите «Добавить».</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {edit && (
        <Modal onClose={() => setEdit(null)}>
          <h2 className="font-display text-2xl font-bold mb-5">{edit.id ? "Редактировать услугу" : "Новая услуга"}</h2>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Название *">
                <Input value={edit.title ?? ""} onChange={(v) => setEdit({ ...edit, title: v })} placeholder="Асфальтирование" />
              </Field>
              <Field label="Slug (URL, латиница) *">
                <Input
                  value={edit.slug ?? ""}
                  onChange={(v) => setEdit({ ...edit, slug: v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
                  placeholder="asfaltirovanie"
                />
              </Field>
            </div>
            <Field label="Hero — подпись под заголовком страницы (SEO)">
              <Input value={(edit as any).hero ?? ""} onChange={(v) => setEdit({ ...edit, hero: v } as any)} placeholder="Профессиональное асфальтирование в Перми с гарантией 3 года" />
            </Field>
            <Field label="Краткое описание (карточка услуги)">
              <Input value={edit.short_description ?? ""} onChange={(v) => setEdit({ ...edit, short_description: v })} placeholder="Укладка асфальта любой сложности" />
            </Field>
            <Field label="Полное описание (SEO-текст на странице)">
              <textarea
                value={edit.description ?? ""}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                rows={5}
                className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none resize-none"
                placeholder="Подробное описание услуги для SEO и клиентов…"
              />
            </Field>
            <Field label="Что входит (каждый пункт — отдельная строка)">
              <textarea
                value={((edit as any).includes ?? []).join("\n")}
                onChange={(e) => setEdit({ ...edit, includes: e.target.value.split("\n").filter(Boolean) } as any)}
                rows={5}
                className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none resize-none font-mono text-xs"
                placeholder={"Бесплатный выезд замерщика\nУкладка асфальта финишером\nГарантия 3 года"}
              />
            </Field>
            <Field label="FAQ — Вопрос | Ответ (каждая пара с новой строки)">
              <textarea
                value={((edit as any).faq ?? []).map((f: any) => `${f.q} | ${f.a}`).join("\n")}
                onChange={(e) => {
                  const faq = e.target.value.split("\n").filter(Boolean).map((line) => {
                    const sep = line.indexOf(" | ");
                    return sep === -1 ? { q: line, a: "" } : { q: line.slice(0, sep).trim(), a: line.slice(sep + 3).trim() };
                  });
                  setEdit({ ...edit, faq } as any);
                }}
                rows={5}
                className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none resize-none font-mono text-xs"
                placeholder={"Сколько стоит 1 м²? | от 300 ₽/м²\nКакая гарантия? | 3 года в договоре"}
              />
            </Field>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Цена от (₽)">
                <Input type="number" value={String(edit.price_from ?? "")} onChange={(v) => setEdit({ ...edit, price_from: v ? Number(v) : null })} placeholder="300" />
              </Field>
              <Field label="Единица">
                <Input value={edit.price_unit ?? "м²"} onChange={(v) => setEdit({ ...edit, price_unit: v })} placeholder="м²" />
              </Field>
              <Field label="Иконка (lucide)">
                <Input value={edit.icon ?? ""} onChange={(v) => setEdit({ ...edit, icon: v })} placeholder="hard-hat" />
              </Field>
            </div>
            <Field label="Изображение услуги">
              <ImageUpload value={edit.image_url} onChange={(url) => setEdit({ ...edit, image_url: url })} />
            </Field>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={edit.is_active ?? true}
                onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} className="rounded" />
              Активна (показывать на сайте)
            </label>
            {edit.id && <PricingEditor serviceId={edit.id} />}
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button onClick={() => setEdit(null)} className="px-5 py-2.5 rounded-lg hover:bg-surface-2 transition">Отмена</button>
            <button onClick={save} className="btn-gold rounded-lg px-5 py-2.5 font-semibold">Сохранить</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PricingEditor({ serviceId }: { serviceId: string }) {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["pricing", serviceId], queryFn: () => fetchPricing(serviceId) });
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("м²");
  const [price, setPrice] = useState("");

  const add = async () => {
    if (!name.trim()) { toast.error("Введите название позиции"); return; }
    if (!price || isNaN(Number(price))) { toast.error("Введите корректную цену"); return; }
    const { error } = await supabase.from("pricing_items").insert({
      service_id: serviceId, name: name.trim(), unit: unit.trim() || "м²",
      price: Number(price), sort_order: items.length,
    });
    if (error) { toast.error(error.message); return; }
    setName(""); setPrice("");
    qc.invalidateQueries({ queryKey: ["pricing", serviceId] });
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("pricing_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["pricing", serviceId] });
  };

  return (
    <div className="mt-2 pt-4 border-t border-border">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Прайс-лист (детально)</div>
      <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
        {items.map((it: any) => (
          <div key={it.id} className="flex items-center gap-2 bg-surface-2/50 rounded-lg px-3 py-2 text-sm">
            <span className="flex-1 truncate">{it.name}</span>
            <span className="text-primary font-semibold whitespace-nowrap">{Number(it.price).toLocaleString("ru-RU")} ₽ / {it.unit}</span>
            <button onClick={() => del(it.id)} className="p-1 text-destructive hover:bg-surface-2 rounded"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        {items.length === 0 && <div className="text-xs text-muted-foreground">Позиции не добавлены</div>}
      </div>
      <div className="grid grid-cols-12 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название позиции"
          className="col-span-6 bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && add()} />
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="ед."
          className="col-span-2 bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Цена" type="number"
          className="col-span-2 bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && add()} />
        <button onClick={add} className="col-span-2 btn-gold rounded-lg text-sm font-semibold flex items-center justify-center">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-2 sm:p-4" onClick={onClose}>
      <div className="glass rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1.5">{label}</label>{children}</div>;
}
function Input({ value, onChange, type = "text", placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none" />;
}

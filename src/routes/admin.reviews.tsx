import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus, Star, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });

type Review = {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  content: string;
  rating: number;
  photo_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

function AdminReviews() {
  const qc = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () =>
      ((await supabase.from("reviews").select("*").order("sort_order")).data ?? []) as Review[],
  });
  const [edit, setEdit] = useState<Partial<Review> | null>(null);

  const save = async () => {
    if (!edit?.author_name?.trim()) { toast.error("Имя автора обязательно"); return; }
    if (!edit?.content?.trim())     { toast.error("Текст отзыва обязателен"); return; }

    const { id, created_at, ...rest } = edit as any;
    const payload = {
      ...rest,
      rating:     Math.min(5, Math.max(1, edit.rating ?? 5)),
      is_active:  edit.is_active ?? true,
      sort_order: edit.sort_order ?? 0,
    };

    const { error } = edit.id
      ? await supabase.from("reviews").update(payload).eq("id", edit.id)
      : await supabase.from("reviews").insert(payload);

    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено");
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    qc.invalidateQueries({ queryKey: ["reviews"] });
  };

  const del = async (id: string) => {
    if (!confirm("Удалить отзыв?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Удалено");
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    qc.invalidateQueries({ queryKey: ["reviews"] });
  };

  const toggleActive = async (r: Review) => {
    await supabase.from("reviews").update({ is_active: !r.is_active }).eq("id", r.id);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  };

  const moveOrder = async (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= reviews.length) return;
    const a = reviews[idx];
    const b = reviews[next];
    await Promise.all([
      supabase.from("reviews").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("reviews").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Отзывы</h1>
        <button
          onClick={() => setEdit({ rating: 5, is_active: true, sort_order: reviews.length })}
          className="btn-gold rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm p-8 text-center">Загрузка…</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {reviews.map((r, idx) => (
            <div key={r.id} className={`glass rounded-2xl p-5 ${!r.is_active ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-3">
                {r.photo_url && (
                  <img src={r.photo_url} alt={r.author_name} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-primary mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-current" : "opacity-20"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{r.content}</p>
                  <div className="mt-2 font-semibold text-sm">{r.author_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {[r.author_role, r.author_company].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <button onClick={() => moveOrder(idx, -1)} disabled={idx === 0}
                  className="p-1.5 rounded hover:bg-surface-2 disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => moveOrder(idx, 1)} disabled={idx === reviews.length - 1}
                  className="p-1.5 rounded hover:bg-surface-2 disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                <button onClick={() => setEdit(r)} className="p-1.5 rounded hover:bg-surface-2"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => del(r.id)} className="p-1.5 rounded hover:bg-surface-2 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                <button onClick={() => toggleActive(r)} className={`ml-auto text-[11px] px-2.5 py-1 rounded-full font-medium ${r.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-muted/40 text-muted-foreground"}`}>
                  {r.is_active ? "Активен" : "Скрыт"}
                </button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="col-span-full glass rounded-2xl p-12 text-center text-muted-foreground">
              Отзывов пока нет. Добавьте первый!
            </div>
          )}
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-2 sm:p-4" onClick={() => setEdit(null)}>
          <div className="glass rounded-2xl p-4 sm:p-6 max-w-xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-bold mb-5">{edit.id ? "Редактировать отзыв" : "Новый отзыв"}</h2>
            <div className="grid gap-3">
              <Field label="Имя автора *">
                <Inp value={edit.author_name ?? ""} onChange={(v) => setEdit({ ...edit, author_name: v })} placeholder="Александр Иванов" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Должность">
                  <Inp value={edit.author_role ?? ""} onChange={(v) => setEdit({ ...edit, author_role: v })} placeholder="Директор" />
                </Field>
                <Field label="Компания">
                  <Inp value={edit.author_company ?? ""} onChange={(v) => setEdit({ ...edit, author_company: v })} placeholder='ООО "СтройИнвест"' />
                </Field>
              </div>
              <Field label="Текст отзыва *">
                <textarea
                  value={edit.content ?? ""}
                  onChange={(e) => setEdit({ ...edit, content: e.target.value })}
                  rows={5}
                  className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none resize-none"
                  placeholder="Текст отзыва…"
                />
              </Field>
              <Field label="Оценка (1–5)">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setEdit({ ...edit, rating: v })}
                      className={`p-2 rounded-lg transition ${v <= (edit.rating ?? 5) ? "text-primary" : "text-muted-foreground/30"}`}
                    >
                      <Star className={`h-6 w-6 ${v <= (edit.rating ?? 5) ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Фото автора (необязательно)">
                <ImageUpload value={edit.photo_url} onChange={(url) => setEdit({ ...edit, photo_url: url })} />
              </Field>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={edit.is_active ?? true} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} className="rounded" />
                Активен (показывать на сайте)
              </label>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setEdit(null)} className="px-5 py-2.5 rounded-lg hover:bg-surface-2 transition">Отмена</button>
              <button onClick={save} className="btn-gold rounded-lg px-5 py-2.5 font-semibold">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1.5">{label}</label>{children}</div>;
}
function Inp({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none" />;
}

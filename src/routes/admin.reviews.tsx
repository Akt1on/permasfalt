import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });

type Review = {
  id: string; author_name: string; author_role: string | null;
  content: string; rating: number; photo_url: string | null;
  is_active: boolean; sort_order: number;
};

function AdminReviews() {
  const qc = useQueryClient();
  const { data: reviews = [] } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => ((await supabase.from("reviews").select("*").order("sort_order")).data ?? []) as Review[],
  });
  const [edit, setEdit] = useState<Partial<Review> | null>(null);

  const save = async () => {
    if (!edit?.author_name || !edit?.content) { toast.error("Имя и текст обязательны"); return; }
    const payload: any = {
      author_name: edit.author_name, author_role: edit.author_role ?? null,
      content: edit.content, rating: edit.rating ?? 5, photo_url: edit.photo_url ?? null,
      is_active: edit.is_active ?? true, sort_order: edit.sort_order ?? 0,
    };
    const { error } = edit.id
      ? await supabase.from("reviews").update(payload).eq("id", edit.id)
      : await supabase.from("reviews").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено"); setEdit(null);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    qc.invalidateQueries({ queryKey: ["reviews"] });
  };

  const del = async (id: string) => {
    if (!confirm("Удалить отзыв?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Отзывы</h1>
        <button onClick={() => setEdit({ rating: 5, is_active: true, sort_order: reviews.length })} className="btn-gold rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-1 text-primary mb-2">
              {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{r.content}</p>
            <div className="mt-3 font-semibold">{r.author_name}</div>
            {r.author_role && <div className="text-xs text-muted-foreground">{r.author_role}</div>}
            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => setEdit(r)} className="p-2 rounded hover:bg-surface-2"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => del(r.id)} className="p-2 rounded hover:bg-surface-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
              {!r.is_active && <span className="ml-auto text-[10px] uppercase text-muted-foreground">скрыт</span>}
            </div>
          </div>
        ))}
        {reviews.length === 0 && <div className="text-muted-foreground text-sm">Отзывов пока нет</div>}
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4" onClick={() => setEdit(null)}>
          <div className="glass rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-bold mb-5">{edit.id ? "Редактировать" : "Новый отзыв"}</h2>
            <div className="grid gap-3">
              <Field label="Имя автора"><Inp value={edit.author_name ?? ""} onChange={(v) => setEdit({ ...edit, author_name: v })} /></Field>
              <Field label="Должность / роль"><Inp value={edit.author_role ?? ""} onChange={(v) => setEdit({ ...edit, author_role: v })} /></Field>
              <Field label="Текст отзыва"><textarea value={edit.content ?? ""} onChange={(e) => setEdit({ ...edit, content: e.target.value })} rows={5} className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none" /></Field>
              <Field label="Оценка (1–5)"><Inp value={String(edit.rating ?? 5)} type="number" onChange={(v) => setEdit({ ...edit, rating: Math.min(5, Math.max(1, Number(v) || 5)) })} /></Field>
              <Field label="Фото (необяз.)"><ImageUpload value={edit.photo_url} onChange={(url) => setEdit({ ...edit, photo_url: url })} /></Field>
              <Field label="Порядок"><Inp value={String(edit.sort_order ?? 0)} type="number" onChange={(v) => setEdit({ ...edit, sort_order: Number(v) || 0 })} /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.is_active ?? true} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} /> Опубликовано</label>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1.5">{label}</label>{children}</div>;
}
function Inp({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none" />;
}

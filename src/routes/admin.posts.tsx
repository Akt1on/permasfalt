import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllPosts, type Post } from "@/lib/site-data";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/posts")({ component: AdminPosts });

function AdminPosts() {
  const qc = useQueryClient();
  const { data: posts = [] } = useQuery({ queryKey: ["admin-posts"], queryFn: fetchAllPosts });
  const [edit, setEdit] = useState<Partial<Post> | null>(null);

  const save = async () => {
    if (!edit?.title || !edit?.slug) { toast.error("Заголовок и slug обязательны"); return; }
    const payload: any = {
      ...edit,
      read_minutes: edit.read_minutes ?? 5,
      sort_order: edit.sort_order ?? 0,
      is_published: edit.is_published ?? false,
      published_at: edit.is_published && !edit.published_at ? new Date().toISOString() : edit.published_at ?? null,
    };
    const { error } = edit.id
      ? await supabase.from("posts").update(payload).eq("id", edit.id)
      : await supabase.from("posts").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено"); setEdit(null);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
    qc.invalidateQueries({ queryKey: ["posts"] });
  };

  const del = async (id: string) => {
    if (!confirm("Удалить статью?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Блог</h1>
        <button onClick={() => setEdit({ is_published: false, read_minutes: 5, sort_order: posts.length })} className="btn-gold rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" /> Добавить статью
        </button>
      </div>

      <div className="glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="p-4">Заголовок</th><th className="p-4">Slug</th><th className="p-4">Статус</th><th className="p-4 w-32"></th></tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-4 font-medium">{p.title}</td>
                <td className="p-4 text-xs text-muted-foreground">{p.slug}</td>
                <td className="p-4">{p.is_published ? <span className="text-primary">Опубликовано</span> : <span className="text-muted-foreground">Черновик</span>}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => setEdit(p)} className="p-2 rounded hover:bg-surface-2"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => del(p.id)} className="p-2 rounded hover:bg-surface-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Статей пока нет</td></tr>}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur grid place-items-center p-2 sm:p-4 z-50" onClick={() => setEdit(null)}>
          <div className="glass rounded-2xl p-4 sm:p-6 max-w-3xl w-full max-h-[95vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-bold mb-5">{edit.id ? "Редактировать" : "Новая статья"}</h2>
            <div className="grid gap-3">
              <F label="Заголовок"><I value={edit.title ?? ""} onChange={(v) => setEdit({ ...edit, title: v })} /></F>
              <F label="Slug (англ.)"><I value={edit.slug ?? ""} onChange={(v) => setEdit({ ...edit, slug: v })} /></F>
              <F label="Краткое описание (для превью и SEO)"><textarea value={edit.excerpt ?? ""} onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })} rows={2} className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none" /></F>
              <F label="Контент (markdown / простой HTML)"><textarea value={edit.content ?? ""} onChange={(e) => setEdit({ ...edit, content: e.target.value })} rows={14} className="bg-input border border-border rounded-lg px-4 py-2.5 w-full font-mono text-sm focus:border-primary focus:outline-none" /></F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Ключевые слова"><I value={edit.keywords ?? ""} onChange={(v) => setEdit({ ...edit, keywords: v })} /></F>
                <F label="Время чтения (мин)"><I type="number" value={String(edit.read_minutes ?? 5)} onChange={(v) => setEdit({ ...edit, read_minutes: Number(v) })} /></F>
              </div>
              <F label="Обложка"><ImageUpload value={edit.cover_image} onChange={(url) => setEdit({ ...edit, cover_image: url })} /></F>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.is_published ?? false} onChange={(e) => setEdit({ ...edit, is_published: e.target.checked })} /> Опубликовано</label>
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

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1.5">{label}</label>{children}</div>;
}
function I({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none" />;
}

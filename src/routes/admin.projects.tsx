import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllProjects, fetchProjectPhotos, type Project } from "@/lib/site-data";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus, Image as ImageIcon, X, ChevronUp, ChevronDown } from "lucide-react";
import { AdminModal, Field, Input } from "@/components/admin/ui";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/projects")({ component: AdminProjects });

function toInsertPayload(edit: Partial<Project>) {
  const { id, created_at, updated_at, ...rest } = edit as any;
  return { ...rest, sort_order: edit.sort_order ?? 0, is_active: edit.is_active ?? true };
}
function toUpdatePayload(edit: Partial<Project>) {
  const { id, created_at, updated_at, ...rest } = edit as any;
  return { ...rest, sort_order: edit.sort_order ?? 0, is_active: edit.is_active ?? true };
}

function AdminProjects() {
  const qc = useQueryClient();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: fetchAllProjects,
  });
  const [edit, setEdit] = useState<Partial<Project> | null>(null);
  const [photoEditId, setPhotoEditId] = useState<string | null>(null);

  const save = async () => {
    if (!edit?.title?.trim()) { toast.error("Название обязательно"); return; }
    if (!edit?.slug?.trim())  { toast.error("Slug обязателен"); return; }

    const { error } = edit.id
      ? await supabase.from("projects").update(toUpdatePayload(edit)).eq("id", edit.id)
      : await supabase.from("projects").insert(toInsertPayload(edit));

    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено");
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
    qc.invalidateQueries({ queryKey: ["projects"] });
  };

  const del = async (id: string) => {
    if (!confirm("Удалить проект? Все фотографии тоже удалятся.")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Удалено");
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
  };

  const toggleActive = async (p: Project) => {
    await supabase.from("projects").update({ is_active: !p.is_active }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
  };

  const moveOrder = async (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= projects.length) return;
    const a = projects[idx];
    const b = projects[next];
    await Promise.all([
      supabase.from("projects").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("projects").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Портфолио</h1>
        <button
          onClick={() => setEdit({ is_active: true, sort_order: projects.length })}
          className="btn-gold rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Добавить проект
        </button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm p-8 text-center">Загрузка…</div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((p, idx) => (
            <div key={p.id} className="glass rounded-2xl overflow-hidden flex flex-col">
              {p.cover_image ? (
                <img src={p.cover_image} alt={p.title} className="aspect-video w-full object-cover" />
              ) : (
                <div className="aspect-video w-full bg-surface-2 grid place-items-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <div className="text-xs uppercase tracking-widest text-primary mb-1">{p.category || "Без категории"}</div>
                <div className="font-display font-bold leading-tight">{p.title}</div>
                {p.location && <div className="text-xs text-muted-foreground mt-1">{p.location}</div>}
                <div className="text-xs text-muted-foreground mt-0.5">{p.slug}</div>

                <div className="mt-auto pt-4 flex items-center gap-1 flex-wrap">
                  <button onClick={() => moveOrder(idx, -1)} disabled={idx === 0}
                    className="p-2 rounded hover:bg-surface-2 disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                  <button onClick={() => moveOrder(idx, 1)} disabled={idx === projects.length - 1}
                    className="p-2 rounded hover:bg-surface-2 disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
                  <button onClick={() => setEdit(p)} className="p-2 rounded hover:bg-surface-2" title="Редактировать"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setPhotoEditId(p.id)} className="p-2 rounded hover:bg-surface-2" title="Фотографии"><ImageIcon className="h-4 w-4" /></button>
                  <button onClick={() => del(p.id)} className="p-2 rounded hover:bg-surface-2 text-destructive" title="Удалить"><Trash2 className="h-4 w-4" /></button>
                  <button onClick={() => toggleActive(p)} className={`ml-auto text-[11px] px-2.5 py-1 rounded-full font-medium transition ${p.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-muted/40 text-muted-foreground"}`}>
                    {p.is_active ? "Публичный" : "Скрыт"}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full glass rounded-2xl p-12 text-center text-muted-foreground">
              Проектов пока нет. Добавьте первый!
            </div>
          )}
        </div>
      )}

      {edit && (
        <AdminModal
          title={edit.id ? "Редактировать проект" : "Новый проект"}
          onClose={() => setEdit(null)}
          size="lg"
        >
          <div className="grid gap-3">
            <Field label="Название *">
              <Input value={edit.title ?? ""} onChange={(v) => setEdit({ ...edit, title: v })} placeholder="Асфальтирование парковки ТЦ" />
            </Field>
            <Field label="Slug (URL) *">
              <Input value={edit.slug ?? ""} onChange={(v) => setEdit({ ...edit, slug: v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} placeholder="asfaltirovanie-parkovki-tc" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Категория">
                <Input value={edit.category ?? ""} onChange={(v) => setEdit({ ...edit, category: v })} placeholder="Асфальтирование" />
              </Field>
              <Field label="Локация">
                <Input value={edit.location ?? ""} onChange={(v) => setEdit({ ...edit, location: v })} placeholder="г. Пермь" />
              </Field>
            </div>
            <Field label="Описание">
              <textarea
                value={edit.description ?? ""}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                rows={4}
                className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none resize-none"
                placeholder="Описание выполненных работ…"
              />
            </Field>
            <Field label="Обложка проекта">
              <ImageUpload value={edit.cover_image} onChange={(url) => setEdit({ ...edit, cover_image: url })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Площадь (м²)">
                <Input type="number" value={String((edit as any).area_m2 ?? "")} onChange={(v) => setEdit({ ...edit, area_m2: v ? Number(v) : null } as any)} placeholder="500" />
              </Field>
              <Field label="Дата завершения">
                <input
                  type="date"
                  value={edit.completed_at ?? ""}
                  onChange={(e) => setEdit({ ...edit, completed_at: e.target.value || null })}
                  className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none"
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={edit.is_active ?? true} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} className="rounded" />
              Публичный (показывать на сайте)
            </label>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button onClick={() => setEdit(null)} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-surface-2 transition-colors">Отмена</button>
            <button onClick={save} className="btn-gold rounded-xl px-5 py-2.5 font-bold text-sm">Сохранить</button>
          </div>
        </AdminModal>
      )}

      {photoEditId && <PhotosModal projectId={photoEditId} onClose={() => setPhotoEditId(null)} />}
    </div>
  );
}

function PhotosModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: photos = [] } = useQuery({
    queryKey: ["photos", projectId],
    queryFn: () => fetchProjectPhotos(projectId),
  });

  const add = async (url: string | null) => {
    if (!url) return;
    const { error } = await supabase.from("project_photos").insert({
      project_id: projectId,
      image_url: url,
      sort_order: photos.length,
    });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["photos", projectId] });
    qc.invalidateQueries({ queryKey: ["project-photos"] });
    toast.success("Фото добавлено");
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("project_photos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["photos", projectId] });
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="font-display text-2xl font-bold mb-2">Фотографии проекта</h2>
      <p className="text-sm text-muted-foreground mb-5">Загружайте по одному фото. Первое фото можно сделать обложкой в настройках проекта.</p>
      <ImageUpload value={null} onChange={add} />
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-5">
          {photos.map((p: any) => (
            <div key={p.id} className="relative rounded-lg overflow-hidden group">
              <img src={p.image_url} alt="" className="aspect-square w-full object-cover" />
              <button
                onClick={() => del(p.id)}
                className="absolute top-1 right-1 h-7 w-7 grid place-items-center rounded bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {photos.length === 0 && (
        <div className="mt-5 text-sm text-muted-foreground text-center py-4">Фотографий пока нет</div>
      )}
    </Modal>
  );
}


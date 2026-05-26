import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllProjects, fetchProjectPhotos, type Project } from "@/lib/site-data";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/projects")({ component: AdminProjects });

function AdminProjects() {
  const qc = useQueryClient();
  const { data: projects = [] } = useQuery({ queryKey: ["admin-projects"], queryFn: fetchAllProjects });
  const [edit, setEdit] = useState<Partial<Project> | null>(null);
  const [photoEditId, setPhotoEditId] = useState<string | null>(null);

  const save = async () => {
    if (!edit?.title || !edit?.slug) { toast.error("Название и slug обязательны"); return; }
    const payload: any = { ...edit, sort_order: edit.sort_order ?? 0, is_active: edit.is_active ?? true };
    const { error } = edit.id
      ? await supabase.from("projects").update(payload).eq("id", edit.id)
      : await supabase.from("projects").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено"); setEdit(null);
    qc.invalidateQueries({ queryKey: ["admin-projects"] }); qc.invalidateQueries({ queryKey: ["projects"] });
  };
  const del = async (id: string) => {
    if (!confirm("Удалить проект?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Портфолио</h1>
        <button onClick={() => setEdit({ is_active: true, sort_order: projects.length })} className="btn-gold rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Добавить</button>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.map((p) => (
          <div key={p.id} className="glass rounded-2xl overflow-hidden">
            {p.cover_image && <img src={p.cover_image} alt="" className="aspect-video w-full object-cover" />}
            <div className="p-5">
              <div className="text-xs uppercase tracking-widest text-primary mb-1">{p.category}</div>
              <div className="font-display font-bold">{p.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{p.slug}{p.is_active ? "" : " · скрыт"}</div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setEdit(p)} className="p-2 rounded hover:bg-surface-2"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => setPhotoEditId(p.id)} className="p-2 rounded hover:bg-surface-2"><ImageIcon className="h-4 w-4" /></button>
                <button onClick={() => del(p.id)} className="p-2 rounded hover:bg-surface-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <Modal onClose={() => setEdit(null)}>
          <h2 className="font-display text-2xl font-bold mb-5">{edit.id ? "Редактировать" : "Новый проект"}</h2>
          <div className="grid gap-3">
            <F label="Название"><I value={edit.title ?? ""} onChange={(v) => setEdit({ ...edit, title: v })} /></F>
            <F label="Slug"><I value={edit.slug ?? ""} onChange={(v) => setEdit({ ...edit, slug: v })} /></F>
            <F label="Категория"><I value={edit.category ?? ""} onChange={(v) => setEdit({ ...edit, category: v })} /></F>
            <F label="Локация"><I value={edit.location ?? ""} onChange={(v) => setEdit({ ...edit, location: v })} /></F>
            <F label="Описание"><textarea value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} rows={4} className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none" /></F>
            <F label="Обложка"><ImageUpload value={edit.cover_image} onChange={(url) => setEdit({ ...edit, cover_image: url })} /></F>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.is_active ?? true} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} /> Опубликовано</label>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button onClick={() => setEdit(null)} className="px-5 py-2.5 rounded-lg hover:bg-surface-2">Отмена</button>
            <button onClick={save} className="btn-gold rounded-lg px-5 py-2.5 font-semibold">Сохранить</button>
          </div>
        </Modal>
      )}

      {photoEditId && <PhotosModal projectId={photoEditId} onClose={() => setPhotoEditId(null)} />}
    </div>
  );
}

function PhotosModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: photos = [] } = useQuery({ queryKey: ["photos", projectId], queryFn: () => fetchProjectPhotos(projectId) });

  const add = async (url: string | null) => {
    if (!url) return;
    const { error } = await supabase.from("project_photos").insert({ project_id: projectId, image_url: url, sort_order: photos.length });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["photos", projectId] });
    qc.invalidateQueries({ queryKey: ["project-photos"] });
  };
  const del = async (id: string) => {
    await supabase.from("project_photos").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["photos", projectId] });
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="font-display text-2xl font-bold mb-4">Фотографии проекта</h2>
      <ImageUpload value={null} onChange={add} />
      <div className="grid grid-cols-3 gap-3 mt-6">
        {photos.map((p: any) => (
          <div key={p.id} className="relative rounded-lg overflow-hidden">
            <img src={p.image_url} alt="" className="aspect-square w-full object-cover" />
            <button onClick={() => del(p.id)} className="absolute top-1 right-1 h-7 w-7 grid place-items-center rounded bg-background/80 text-destructive"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-2 sm:p-4" onClick={onClose}>
      <div className="glass rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1.5">{label}</label>{children}</div>;
}
function I({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none" />;
}

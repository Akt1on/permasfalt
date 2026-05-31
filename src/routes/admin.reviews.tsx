import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllReviews, type Review } from "@/lib/site-data";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus, Star as StarIcon } from "lucide-react";
import { toast } from "sonner";
import {
  TitleBar, AdminModal, ModalActions, Field, Input, Textarea,
  CheckboxRow, AdminTable, SkeletonRow, EmptyState, ActionBtn,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`h-3.5 w-3.5 ${n <= rating ? "fill-primary text-primary" : "text-border"}`} />
      ))}
    </div>
  );
}

function AdminReviews() {
  const qc = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: fetchAllReviews,
  });
  const [edit, setEdit] = useState<Partial<Review> | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!edit?.author_name || !edit?.content) { toast.error("Автор и текст обязательны"); return; }
    setSaving(true);
    const payload: any = {
      author_name: edit.author_name,
      author_role: edit.author_role ?? null,
      content: edit.content,
      rating: edit.rating ?? 5,
      photo_url: edit.photo_url ?? null,
      sort_order: edit.sort_order ?? reviews.length,
      is_active: edit.is_active ?? true,
    };
    const { error } = edit.id
      ? await supabase.from("reviews").update(payload).eq("id", edit.id)
      : await supabase.from("reviews").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено");
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    qc.invalidateQueries({ queryKey: ["reviews"] });
  };

  const del = async (id: string) => {
    if (!confirm("Удалить отзыв?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  };

  return (
    <div className="space-y-6">
      <TitleBar
        title="Отзывы"
        description="Управление клиентскими отзывами на главной странице."
        action={
          <button
            onClick={() => setEdit({ rating: 5, is_active: true, sort_order: reviews.length })}
            className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
          >
            <Plus className="h-4 w-4" /> Добавить отзыв
          </button>
        }
      />

      <AdminTable columns={["Автор", "Рейтинг", "Отзыв", "Активен", ""]}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
        ) : reviews.length === 0 ? (
          <tr>
            <td colSpan={5}>
              <EmptyState icon={StarIcon} title="Отзывов пока нет" description="Добавьте первый отзыв" />
            </td>
          </tr>
        ) : (
          reviews.map((r) => (
            <tr key={r.id} className="hover:bg-surface/50 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {r.photo_url ? (
                    <img src={r.photo_url} alt={r.author_name} className="h-9 w-9 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary/10 grid place-items-center text-primary font-bold text-sm shrink-0">
                      {r.author_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-sm text-foreground">{r.author_name}</div>
                    {r.author_role && (
                      <div className="text-xs text-primary/80 font-medium">{r.author_role}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-5 py-4"><Stars rating={r.rating ?? 5} /></td>
              <td className="px-5 py-4 max-w-sm">
                <p className="text-sm text-muted-foreground line-clamp-2">{r.content}</p>
              </td>
              <td className="px-5 py-4">
                <span className={`inline-block h-2 w-2 rounded-full ${r.is_active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1 justify-end">
                  <ActionBtn onClick={() => setEdit(r)} icon={Pencil} label="Редактировать" />
                  <ActionBtn onClick={() => del(r.id)} icon={Trash2} label="Удалить" variant="danger" />
                </div>
              </td>
            </tr>
          ))
        )}
      </AdminTable>

      {edit && (
        <AdminModal
          title={edit.id ? "Редактировать отзыв" : "Новый отзыв"}
          onClose={() => setEdit(null)}
        >
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Имя и фамилия" required>
                <Input value={edit.author_name ?? ""} onChange={(v) => setEdit({ ...edit, author_name: v })} placeholder="Иван Иванов" />
              </Field>
              <Field label="Должность / роль" hint="Необязательно">
                <Input value={edit.author_role ?? ""} onChange={(v) => setEdit({ ...edit, author_role: v })} placeholder="Директор по строительству" />
              </Field>
            </div>

            <Field label="Рейтинг">
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setEdit({ ...edit, rating: n })}
                    className="transition-transform hover:scale-110"
                  >
                    <StarIcon className={`h-7 w-7 transition-colors ${n <= (edit.rating ?? 5) ? "fill-primary text-primary" : "text-border hover:text-primary/50"}`} />
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Текст отзыва" required>
              <Textarea value={edit.content ?? ""} onChange={(v) => setEdit({ ...edit, content: v })} rows={4} placeholder="Отличная работа, приехали вовремя…" />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Порядок сортировки">
                <Input type="number" value={String(edit.sort_order ?? 0)} onChange={(v) => setEdit({ ...edit, sort_order: Number(v) })} />
              </Field>
              <div className="flex items-end pb-1">
                <CheckboxRow checked={edit.is_active ?? true} onChange={(v) => setEdit({ ...edit, is_active: v })} label="Показывать на сайте" />
              </div>
            </div>

            <Field label="Фото (необязательно)">
              <ImageUpload value={edit.photo_url} onChange={(url) => setEdit({ ...edit, photo_url: url })} />
            </Field>
          </div>
          <ModalActions onCancel={() => setEdit(null)} onSave={save} saving={saving} />
        </AdminModal>
      )}
    </div>
  );
}

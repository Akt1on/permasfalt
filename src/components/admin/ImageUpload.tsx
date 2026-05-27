import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ImageUpload({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = async (file: File) => {
    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Допустимые форматы: JPG, PNG, WebP, GIF");
      return;
    }
    // Validate size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Файл слишком большой. Максимум ${MAX_SIZE_MB} МБ`);
      return;
    }

    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        // Translate common Supabase storage errors to Russian
        if (uploadError.message.includes("not authenticated") || uploadError.message.includes("policy")) {
          toast.error("Нет прав для загрузки. Убедитесь, что вы вошли как администратор.");
        } else if (uploadError.message.includes("Bucket not found")) {
          toast.error("Хранилище не настроено. Примените миграции Supabase.");
        } else {
          toast.error(`Ошибка загрузки: ${uploadError.message}`);
        }
        return;
      }

      const { data } = supabase.storage.from("site-images").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Фото загружено");
    } catch (e) {
      toast.error("Неизвестная ошибка при загрузке");
      console.error(e);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handle(file);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Превью"
            className="h-32 w-48 rounded-xl object-cover border border-border"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground grid place-items-center shadow hover:scale-110 transition"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`h-32 w-full rounded-xl border-2 border-dashed cursor-pointer grid place-items-center transition-colors ${
            dragOver
              ? "border-[var(--gold)] bg-[var(--gold)]/5"
              : "border-border hover:border-[var(--gold)]/60 hover:bg-surface-2"
          }`}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-7 w-7" />
            <span className="text-xs">Перетащите фото сюда или нажмите</span>
            <span className="text-[11px] opacity-60">JPG, PNG, WebP — до {MAX_SIZE_MB} МБ</span>
          </div>
        </div>
      )}

      <label className={`inline-flex items-center gap-2 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition ${uploading ? "opacity-60 pointer-events-none" : ""} btn-gold`}>
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Загрузка...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" /> Загрузить фото
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
          }}
        />
      </label>
    </div>
  );
}

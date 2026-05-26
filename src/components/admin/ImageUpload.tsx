import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Выберите файл изображения (JPG, PNG, WebP, GIF)");
      return;
    }
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Файл слишком большой. Максимум 10 МБ");
      return;
    }

    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        // Bucket may not exist yet in local dev — give helpful message
        if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("bucket")) {
          toast.error("Storage bucket 'site-images' не найден. Примените миграцию 20260526000001_fix_schema_final.sql");
        } else {
          toast.error(`Ошибка загрузки: ${uploadError.message}`);
        }
        return;
      }

      const { data } = supabase.storage.from("site-images").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Изображение загружено");
    } catch (err: any) {
      toast.error(err?.message ?? "Неизвестная ошибка");
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-start gap-4">
      {/* Preview or placeholder */}
      <div
        className="relative h-24 w-24 rounded-xl border-2 border-dashed border-border overflow-hidden flex-shrink-0 cursor-pointer hover:border-primary/50 transition"
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="absolute top-1 right-1 h-6 w-6 rounded-md bg-background/90 grid place-items-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : uploading ? (
          <div className="h-full w-full grid place-items-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="h-full w-full grid place-items-center text-muted-foreground">
            <ImageIcon className="h-7 w-7" />
          </div>
        )}
      </div>

      {/* Upload button */}
      <div className="flex flex-col gap-2 justify-center h-24">
        <label className={`cursor-pointer btn-gold rounded-lg px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Загрузка…</>
          ) : (
            <><Upload className="h-4 w-4" /> {label ?? "Загрузить"}</>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
          />
        </label>
        {value && (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[180px]">
            Открыть оригинал ↗
          </a>
        )}
        <p className="text-[11px] text-muted-foreground">JPG, PNG, WebP — до 10 МБ</p>
      </div>
    </div>
  );
}

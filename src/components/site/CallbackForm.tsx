import { useId, useState } from "react";
import { notifyLead } from "@/lib/notify-lead";
import { toast } from "sonner";
import { IMaskInput } from "react-imask";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

interface CallbackFormProps {
  /**
   * Used to track which section the lead came from (hero, exit-popup, footer, etc.)
   * Stored in the leads table for analytics.
   */
  source?: string;
  /** Compact mode hides the name and message fields — used in sticky CTA bars */
  compact?: boolean;
}

export function CallbackForm({ source = "website", compact = false }: CallbackFormProps) {
  const uid = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; name?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!compact && name.trim().length > 0 && name.trim().length < 2) {
      e.name = "Введите имя (минимум 2 символа)";
    }
    if (phone.replace(/\D/g, "").length < 11) {
      e.phone = "Введите корректный номер телефона";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Single save path: /api/leads handles both DB insert AND Telegram notify
      // This avoids the race condition where direct supabase.insert() saves to DB
      // but bypasses server-side validation and Telegram notification.
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Не указано",
          phone,
          message: message.trim() || null,
          source,
          utm_source: new URLSearchParams(window.location.search).get("utm_source"),
          utm_medium: new URLSearchParams(window.location.search).get("utm_medium"),
          utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign"),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Не удалось отправить заявку");
      }

      toast.success("Заявка принята! Перезвоним в течение 15 минут.");
      setDone(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Не удалось отправить. Позвоните нам напрямую.";
      toast.error(msg);

      // Fallback: try direct notification in case API is unavailable
      notifyLead({ name: name || null, phone, message: message || null, source }).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all";

  const errorCls = "mt-1.5 text-xs text-destructive flex items-center gap-1";

  if (done) {
    return (
      <div
        className="flex flex-col items-center gap-3 py-6 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="h-14 w-14 rounded-full btn-gold grid place-items-center" aria-hidden="true">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-foreground">Заявка принята!</p>
          <p className="text-sm text-muted-foreground mt-1">Перезвоним в течение 15 минут</p>
        </div>
        <button
          onClick={() => {
            setDone(false);
            setPhone("");
            setName("");
            setMessage("");
          }}
          className="text-xs text-muted-foreground hover:text-foreground underline transition"
        >
          Отправить ещё одну заявку
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-3"
      aria-busy={loading}
      noValidate
    >
      {!compact && (
        <div>
          <label htmlFor={`${uid}-name`} className="sr-only">
            Ваше имя
          </label>
          <input
            id={`${uid}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            disabled={loading}
            className={`${inputCls} ${errors.name ? "border-destructive focus:border-destructive" : ""}`}
            autoComplete="name"
            maxLength={100}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
          />
          {errors.name && (
            <p id={`${uid}-name-error`} className={errorCls} role="alert">
              {errors.name}
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor={`${uid}-phone`} className="sr-only">
          Номер телефона
        </label>
        <IMaskInput
          id={`${uid}-phone`}
          mask="+7 (000) 000-00-00"
          value={phone}
          onAccept={(v: string) => {
            setPhone(v);
            if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
          }}
          placeholder="+7 (___) ___-__-__"
          required
          disabled={loading}
          inputMode="tel"
          autoComplete="tel"
          className={`${inputCls} ${errors.phone ? "border-destructive focus:border-destructive" : ""}`}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? `${uid}-phone-error` : undefined}
          aria-required="true"
        />
        {errors.phone && (
          <p id={`${uid}-phone-error`} className={errorCls} role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      {!compact && (
        <div>
          <label htmlFor={`${uid}-message`} className="sr-only">
            Описание задачи
          </label>
          <textarea
            id={`${uid}-message`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Кратко опишите задачу (необязательно)"
            disabled={loading}
            className={`${inputCls} resize-none`}
            maxLength={2000}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-gold rounded-xl px-6 py-3.5 font-bold uppercase tracking-wide text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" aria-hidden="true" />
            <span>Отправка…</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden="true" />
            Заказать звонок
          </>
        )}
      </button>

      <p className="text-[11px] text-muted-foreground text-center">
        Нажимая кнопку, вы соглашаетесь на{" "}
        <a href="/privacy-policy" className="underline hover:text-primary">
          обработку персональных данных
        </a>
      </p>
    </form>
  );
}

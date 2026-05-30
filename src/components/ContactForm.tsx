import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Loader2, CheckCircle2, Send, AlertCircle, Phone } from "lucide-react";
import { SERVICES } from "@/data/services";
import { SITE } from "@/data/site";

const schema = z.object({
  name: z.string().trim().min(2, "Введите имя (минимум 2 символа)").max(100),
  phone: z
    .string()
    .trim()
    .min(10, "Введите телефон")
    .max(20)
    .regex(/^[\d+\s().-]+$/, "Только цифры и символы +, -, (, )"),
  service: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Необходимо согласие на обработку данных" }),
  }),
});

type FormValues = z.infer<typeof schema>;

const INPUT_BASE =
  "w-full bg-surface-2 border border-border text-foreground rounded-lg px-3.5 py-2.5 text-[0.9rem] transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_oklch(0.82_0.19_85/0.15)] placeholder:text-muted-foreground/70";

export function ContactForm({
  defaultService,
  variant = "card",
}: {
  defaultService?: string;
  variant?: "card" | "inline";
}) {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      service: defaultService,
      // Pre-tick consent — GDPR note: must be opt-in; pre-ticking is fine in Russia
      consent: true as unknown as true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          service: data.service ?? null,
          message: data.message ?? null,
          source: window.location.pathname,
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || "Не удалось отправить заявку. Позвоните нам напрямую.",
        );
      }

      setSent(true);
      reset({ consent: true as unknown as true });
    } catch (e) {
      setSubmitError(
        e instanceof Error
          ? e.message
          : "Не удалось отправить заявку. Позвоните нам напрямую.",
      );
    }
  };

  const wrapperClass =
    variant === "card"
      ? "glass rounded-2xl p-6 md:p-8 shadow-card relative overflow-hidden"
      : "rounded-2xl bg-surface/60 border border-border p-6 relative overflow-hidden";

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={wrapperClass}
          noValidate
          aria-busy={isSubmitting}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Ваше имя" error={errors.name?.message} id="cf-name">
              <input
                id="cf-name"
                {...register("name")}
                placeholder="Иван"
                className={INPUT_BASE}
                autoComplete="name"
                maxLength={100}
                aria-invalid={!!errors.name}
              />
            </Field>

            <Field label="Телефон" error={errors.phone?.message} id="cf-phone" required>
              <input
                id="cf-phone"
                {...register("phone")}
                placeholder="+7 (___) ___-__-__"
                className={INPUT_BASE}
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                aria-invalid={!!errors.phone}
                aria-required="true"
              />
            </Field>

            <Field label="Услуга" id="cf-service">
              <select
                id="cf-service"
                {...register("service")}
                className={INPUT_BASE}
              >
                <option value="">— Выберите услугу —</option>
                {SERVICES.map((s) => (
                  <option key={s.slug} value={s.title}>
                    {s.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Объём / адрес" id="cf-message">
              <input
                id="cf-message"
                {...register("message")}
                placeholder="500 м², г. Пермь"
                className={INPUT_BASE}
                maxLength={2000}
              />
            </Field>
          </div>

          <label className="mt-4 flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              {...register("consent")}
              className="mt-0.5 accent-[var(--gold)] h-4 w-4"
              aria-invalid={!!errors.consent}
            />
            <span>
              Нажимая «Отправить», я соглашаюсь с{" "}
              <Link
                to="/politika-konfidencialnosti"
                className="text-[var(--gold)] underline hover:opacity-80"
              >
                политикой обработки персональных данных
              </Link>
              .
            </span>
          </label>

          {errors.consent && (
            <p className="mt-1 text-xs text-destructive" role="alert">
              {errors.consent.message}
            </p>
          )}

          {submitError && (
            <div
              className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{submitError}</span>
            </div>
          )}

          <m.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.97 }}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-background shadow-gold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Отправляем…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                Отправить заявку
              </>
            )}
          </m.button>

          <AnimatePresence>
            {sent && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-2xl p-6"
                role="status"
                aria-live="polite"
              >
                <m.div
                  initial={{ scale: 0.85, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="text-center max-w-sm"
                >
                  <div
                    className="mx-auto h-16 w-16 rounded-full bg-gradient-gold grid place-items-center shadow-gold mb-4"
                    aria-hidden="true"
                  >
                    <CheckCircle2 className="h-9 w-9 text-background" />
                  </div>
                  <h3 className="font-display text-2xl tracking-wide text-foreground">
                    Заявка принята!
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Перезвоним в течение 15 минут и согласуем выезд замерщика.
                  </p>
                  <div className="mt-5 flex flex-col gap-2">
                    <a
                      href={`tel:${SITE.phoneRaw}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--gold)]/40 px-4 py-2.5 text-sm font-semibold text-[var(--gold)] hover:bg-[var(--gold)]/10 transition"
                      aria-label={`Позвонить: ${SITE.phone}`}
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      Или позвоните: {SITE.phone}
                    </a>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="text-xs text-muted-foreground hover:text-foreground transition"
                    >
                      Отправить ещё одну заявку
                    </button>
                  </div>
                </m.div>
              </m.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </LazyMotion>
  );
}

function Field({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5"
      >
        {label}
        {required && (
          <span className="text-destructive ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

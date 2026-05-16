import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, CheckCircle2, Send, AlertCircle } from "lucide-react";
import { SERVICES } from "@/data/services";
import { submitLead } from "@/lib/leads.functions";

const schema = z.object({
  name: z.string().min(2, "Введите имя"),
  phone: z
    .string()
    .min(10, "Введите телефон")
    .regex(/^[\d+\s()-]+$/, "Только цифры и +"),
  service: z.string().optional(),
  message: z.string().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Необходимо согласие" }) }),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm({
  defaultService,
  variant = "card",
}: {
  defaultService?: string;
  variant?: "card" | "inline";
}) {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { service: defaultService, consent: true as unknown as true },
  });

  const onSubmit = async (data: FormValues) => {
    // Stub: integration with Lovable Cloud + Telegram bot in next iteration.
    await new Promise((r) => setTimeout(r, 800));
    console.log("[application]", data);
    setSent(true);
    reset({ consent: true as unknown as true });
    setTimeout(() => setSent(false), 5000);
  };

  const wrapperClass =
    variant === "card"
      ? "glass rounded-2xl p-6 md:p-8 shadow-card"
      : "rounded-2xl bg-surface-1/60 border border-border p-6";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={wrapperClass}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Ваше имя" error={errors.name?.message}>
          <input
            {...register("name")}
            placeholder="Иван"
            className="input-base"
          />
        </Field>
        <Field label="Телефон" error={errors.phone?.message}>
          <input
            {...register("phone")}
            placeholder="+7 (___) ___-__-__"
            className="input-base"
            inputMode="tel"
          />
        </Field>
        <Field label="Услуга">
          <select {...register("service")} className="input-base">
            <option value="">— Выберите услугу —</option>
            {SERVICES.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Объём / адрес">
          <input
            {...register("message")}
            placeholder="500 м², г. Пермь"
            className="input-base"
          />
        </Field>
      </div>

      <label className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          {...register("consent")}
          className="mt-0.5 accent-[var(--gold)]"
        />
        <span>
          Нажимая «Отправить», я соглашаюсь с{" "}
          <Link
            to="/politika-konfidencialnosti"
            className="text-[var(--gold)] underline"
          >
            политикой обработки персональных данных
          </Link>
          .
        </span>
      </label>
      {errors.consent && (
        <p className="mt-1 text-xs text-destructive">{errors.consent.message}</p>
      )}

      <motion.button
        type="submit"
        disabled={isSubmitting || sent}
        whileTap={{ scale: 0.97 }}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-background shadow-gold disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Отправляем…
          </>
        ) : sent ? (
          <>
            <CheckCircle2 className="h-4 w-4" /> Заявка принята!
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Отправить заявку
          </>
        )}
      </motion.button>

      <style>{`
        .input-base {
          width: 100%;
          background: var(--surface-2);
          border: 1px solid var(--border);
          color: var(--foreground);
          border-radius: 0.5rem;
          padding: 0.7rem 0.9rem;
          font-size: 0.9rem;
          transition: border-color 150ms, box-shadow 150ms;
        }
        .input-base:focus {
          outline: none;
          border-color: var(--gold);
          box-shadow: 0 0 0 3px color-mix(in oklch, var(--gold) 25%, transparent);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

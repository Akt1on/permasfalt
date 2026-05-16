import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "exit-popup-shown-v1";

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    let timer: number | undefined;
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") trigger();
    };

    function trigger() {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
      cleanup();
    }

    function cleanup() {
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      if (timer) window.clearTimeout(timer);
    }

    // Mobile fallback: trigger after 45s of activity
    timer = window.setTimeout(trigger, 45_000);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return cleanup;
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-[var(--gold)]/30 bg-surface-1 p-7 md:p-9 shadow-2xl"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full hover:bg-surface-2 transition"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-gold grid place-items-center shadow-gold mb-4">
              <Gift className="h-7 w-7 text-background" />
            </div>

            <div className="text-xs uppercase tracking-[0.3em] text-[var(--gold)] text-center mb-2">
              Подождите!
            </div>
            <h3 className="font-display text-3xl md:text-4xl tracking-wide text-center text-foreground leading-tight">
              Скидка <span className="text-gradient-gold">10%</span>
              <br /> на первый заказ
            </h3>
            <p className="mt-3 text-sm text-center text-muted-foreground">
              Оставьте заявку сейчас — посчитаем смету бесплатно и зафиксируем скидку в договоре.
            </p>

            <Link
              to="/kontakty"
              hash="zayavka"
              onClick={() => setOpen(false)}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-background shadow-gold"
            >
              Получить скидку <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground transition"
            >
              Нет, спасибо
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

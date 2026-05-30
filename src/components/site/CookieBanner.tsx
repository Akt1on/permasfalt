import { useEffect, useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";

const CONSENT_KEY = "permasfalt_cookie_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getConsent(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${CONSENT_KEY}=1`));
}

function saveConsent(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_KEY}=1; path=/; max-age=${CONSENT_MAX_AGE}; samesite=lax`;
}

export function CookieBanner() {
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    // null = hydrating, false = need to show, true = already accepted
    setShow(!getConsent());
  }, []);

  const accept = () => {
    saveConsent();
    setShow(false);
  };

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {show === true && (
          <m.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            role="dialog"
            aria-label="Использование cookies"
            aria-live="polite"
            className="fixed inset-x-4 bottom-4 z-50 rounded-2xl border border-border bg-surface/95 p-5 shadow-2xl backdrop-blur-xl md:inset-x-auto md:right-6 md:left-auto md:max-w-md"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1.5 text-sm">
                <p className="font-semibold text-foreground">Мы используем cookies</p>
                <p className="text-muted-foreground leading-relaxed">
                  Только необходимые cookies для работы сайта. Подробнее в{" "}
                  <a
                    href="/cookie-policy"
                    className="text-primary hover:underline focus-visible:underline"
                  >
                    Политике cookie
                  </a>
                  .
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a
                  href="/cookie-policy"
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-primary/70 hover:text-primary transition"
                >
                  Подробнее
                </a>
                <button
                  type="button"
                  onClick={accept}
                  className="btn-gold rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap"
                  autoFocus
                >
                  Принять
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}

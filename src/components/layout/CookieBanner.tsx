import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";

const KEY = "permasfalt59-cookies-accepted";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem(KEY, "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 z-40 max-w-md glass rounded-xl p-4 shadow-card"
        >
          <p className="text-sm text-muted-foreground">
            Мы используем cookies для улучшения работы сайта. Подробнее в{" "}
            <Link to="/politika-konfidencialnosti" className="text-[var(--gold)] underline">
              политике конфиденциальности
            </Link>
            .
          </p>
          <div className="mt-3 flex gap-2 justify-end">
            <button
              onClick={accept}
              className="rounded-full bg-gradient-gold px-4 py-1.5 text-sm font-bold text-background"
            >
              Принять
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

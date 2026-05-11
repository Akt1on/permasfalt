import { useEffect, useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SITE } from "@/data/site";

export function MobileCallBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-2 gap-px bg-border/80 backdrop-blur-xl border-t border-border safe-area-bottom"
        >
          <a
            href={`tel:${SITE.phoneRaw}`}
            className="flex items-center justify-center gap-2 bg-gradient-gold text-background py-3.5 text-sm font-bold uppercase tracking-wider"
          >
            <Phone className="h-4 w-4" />
            Позвонить
          </a>
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-surface-1 text-foreground py-3.5 text-sm font-bold uppercase tracking-wider"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            WhatsApp
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

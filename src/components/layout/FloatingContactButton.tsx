import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, Send, X, MessageSquare } from "lucide-react";
import { SITE } from "@/data/site";

type Item = {
  icon?: typeof Phone;
  text?: string;
  label: string;
  href: string;
  bg: string;
};

const ITEMS: Item[] = [
  { icon: Phone, label: "Позвонить", href: `tel:${SITE.phoneRaw}`, bg: "bg-[#25D366]" },
  { icon: MessageCircle, label: "WhatsApp", href: SITE.whatsapp, bg: "bg-[#25D366]" },
  { icon: Send, label: "Telegram", href: SITE.telegram, bg: "bg-[#0088CC]" },
  { icon: MessageSquare, label: "ВКонтакте", href: SITE.vk, bg: "bg-[#0077FF]" },
  { text: "M", label: "Max", href: SITE.max, bg: "bg-[#0068FF]" },
];

export function FloatingContactButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex flex-col-reverse items-end gap-3">
      <button
        aria-label="Связаться"
        onClick={() => setOpen((v) => !v)}
        className="relative h-14 w-14 grid place-items-center rounded-full bg-gradient-gold text-background shadow-gold-lg animate-gold-pulse"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="p" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Phone className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open &&
          ITEMS.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.05, type: "spring", stiffness: 300, damping: 22 } }}
              exit={{ opacity: 0, y: 20, scale: 0.5, transition: { delay: (ITEMS.length - i) * 0.03 } }}
              className={`group flex items-center gap-3 ${item.bg} text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform`}
            >
              {item.icon ? (
                <item.icon className="h-5 w-5" />
              ) : (
                <span className="h-5 w-5 grid place-items-center font-bold text-sm">{item.text}</span>
              )}
              <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
            </motion.a>
          ))}
      </AnimatePresence>
    </div>
  );
}

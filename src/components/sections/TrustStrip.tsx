import { motion } from "framer-motion";
import { ShieldCheck, Truck, Banknote, FileCheck, Clock3 } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, label: "Гарантия 3 года" },
  { icon: Truck, label: "Своя техника" },
  { icon: Clock3, label: "Работаем 24/7" },
  { icon: FileCheck, label: "По договору" },
  { icon: Banknote, label: "Замер бесплатно" },
];

export function TrustStrip() {
  return (
    <section className="relative border-y border-border bg-surface-1/60 overflow-hidden">
      <div className="container-x py-6">
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-x-8 gap-y-3">
          {ITEMS.map((it, i) => (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-2 text-sm text-foreground/80"
            >
              <it.icon className="h-4 w-4 text-[var(--gold)]" />
              <span className="font-heading font-bold uppercase tracking-wider text-xs">
                {it.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

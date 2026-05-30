import { useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence  } from "framer-motion";
import { X } from "lucide-react";
import { SectionTitle, FadeInUp } from "@/components/ui-blocks";
import { GALLERY, GALLERY_FILTERS } from "@/data/gallery";

export function GallerySection({ withFilters = false }: { withFilters?: boolean }) {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<{ src: string; title: string } | null>(null);

  const items = filter === "all" ? GALLERY : GALLERY.filter((g) => g.category === filter);

  return (
    <section className="section-y">
      <div className="container-x">
        <SectionTitle
          eyebrow="Портфолио"
          title="Наши работы"
          description="Реальные фото с объектов в Перми и Пермском крае."
        />

        {withFilters && (
          <FadeInUp className="mt-8 flex flex-wrap justify-center gap-2">
            {GALLERY_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-4 py-2 text-sm transition-all border ${
                  filter === f.id
                    ? "bg-gradient-gold text-background border-transparent"
                    : "bg-surface-1 text-foreground/80 border-border hover:border-[var(--gold)]/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </FadeInUp>
        )}

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <m.button
              key={item.title + i}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (i % 8) * 0.05 }}
              onClick={() => setActive({ src: item.src, title: item.title })}
              className={`group relative overflow-hidden rounded-xl gold-border ${
                i % 5 === 0 ? "md:row-span-2 md:col-span-2 aspect-square md:aspect-auto" : "aspect-[4/3]"
              }`}
            >
              <img
                src={item.src}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent opacity-80 group-hover:opacity-100 transition" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)]">
                  {item.categoryLabel} · {item.year}
                </div>
                <div className="mt-1 font-heading font-bold text-sm text-foreground line-clamp-2">
                  {item.title}
                </div>
              </div>
            </m.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm grid place-items-center p-4"
          >
            <button
              aria-label="Закрыть"
              className="absolute top-6 right-6 h-10 w-10 grid place-items-center rounded-full bg-surface-2 text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <m.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={active.src}
              alt={active.title || "Фото объекта"}
              className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-gold-lg"
            />
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}

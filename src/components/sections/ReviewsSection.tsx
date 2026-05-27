import { useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence  } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionTitle } from "@/components/ui-blocks";
import { REVIEWS } from "@/data/reviews";

export function ReviewsSection() {
  const [i, setI] = useState(0);
  const next = () => setI((p) => (p + 1) % REVIEWS.length);
  const prev = () => setI((p) => (p - 1 + REVIEWS.length) % REVIEWS.length);
  const r = REVIEWS[i];

  return (
    <section className="section-y bg-surface-1/40">
      <div className="container-x">
        <SectionTitle eyebrow="Отзывы" title="Что говорят клиенты" />

        <div className="mt-12 max-w-3xl mx-auto relative">
          <Quote className="absolute -top-8 -left-2 h-24 w-24 text-[var(--gold)]/10" />
          <AnimatePresence mode="wait">
            <m.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-2xl p-8 md:p-10 shadow-card"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: r.rating }).map((_, k) => (
                  <Star key={k} className="h-5 w-5 fill-[var(--gold)] text-[var(--gold)]" />
                ))}
              </div>
              <p className="text-lg md:text-xl text-foreground leading-relaxed">"{r.text}"</p>
              <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="font-heading font-bold text-foreground">{r.name}</div>
                  <div className="text-sm text-muted-foreground">{r.company}</div>
                </div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{r.date}</div>
              </div>
            </m.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-between items-center">
            <div className="flex gap-2">
              {REVIEWS.map((_, k) => (
                <button
                  key={k}
                  onClick={() => setI(k)}
                  className={`h-1.5 rounded-full transition-all ${
                    k === i ? "w-8 bg-[var(--gold)]" : "w-2 bg-border hover:bg-[var(--gold)]/50"
                  }`}
                  aria-label={`Отзыв ${k + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <IconBtn onClick={prev}>
                <ChevronLeft className="h-5 w-5" />
              </IconBtn>
              <IconBtn onClick={next}>
                <ChevronRight className="h-5 w-5" />
              </IconBtn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="h-10 w-10 grid place-items-center rounded-full bg-surface-2 border border-border text-foreground hover:bg-[var(--gold)] hover:text-background hover:border-transparent transition-all"
    >
      {children}
    </button>
  );
}

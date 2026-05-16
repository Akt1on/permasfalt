import { motion } from "framer-motion";
import { Phone, Calculator, ChevronDown, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-asphalt.jpg";
import { SITE } from "@/data/site";
import { Counter } from "@/components/ui-blocks";
import { NeuralCanvas } from "@/components/NeuralCanvas";
import { PromoTimer } from "@/components/PromoTimer";

const TITLE_LINES = [
  ["АСФАЛЬТИРОВАНИЕ"],
  ["В", "ПЕРМИ"],
];

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden grain bg-[#08080a]">
      {/* Background image */}
      <motion.div
        initial={{ scale: 1.12, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <img
          src={heroImg}
          alt="Укладка асфальта в Перми ночью"
          className="h-full w-full object-cover object-center opacity-70"
          width={1920}
          height={1080}
          fetchPriority="high"
        />
        {/* Cinematic gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/55 to-transparent" />
        <div className="absolute inset-0 bg-radial-gold opacity-60" />
      </motion.div>

      {/* AI neural-network canvas overlay */}
      <NeuralCanvas className="opacity-50 mix-blend-screen" />

      {/* Subtle vignette */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative container-x flex flex-col justify-center min-h-[100svh] pt-28 pb-24 md:pb-16">
        {/* AI badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="inline-flex items-center gap-2.5 mb-7 self-start glass rounded-full px-4 py-2 text-[11px] sm:text-xs uppercase tracking-[0.28em]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" />
          <span className="text-foreground/90">AI-powered estimate</span>
          <span className="hidden sm:inline text-foreground/40">·</span>
          <span className="hidden sm:inline text-muted-foreground">с {SITE.yearFounded}</span>
        </motion.div>

        {/* Title rendered line-by-line so АСФАЛЬТИРОВАНИЕ never wraps mid-word */}
        <h1 className="max-w-5xl font-display leading-[0.88] tracking-[0.02em]">
          {TITLE_LINES.map((words, li) =>
            words.map((word, wi) => {
              const i = li * 10 + wi;
              const isAsphalt = word === "АСФАЛЬТИРОВАНИЕ";
              return (
                <motion.span
                  key={`${li}-${wi}`}
                  initial={{ opacity: 0, y: "0.4em" }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.35 + i * 0.12,
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={
                    isAsphalt
                      ? "block text-[clamp(2rem,9vw,7.5rem)] text-[var(--gold)] [text-shadow:0_2px_0_rgba(0,0,0,0.4),0_0_42px_color-mix(in_oklch,var(--gold)_45%,transparent)]"
                      : "inline-block mr-[0.22em] last:mr-0 text-[clamp(2.6rem,12vw,7.5rem)] text-foreground"
                  }
                >
                  {word}
                </motion.span>
              );
            }),
          )}
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.05, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="block mt-5 h-[3px] w-28 sm:w-36 origin-left bg-gradient-gold rounded-full"
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.7 }}
          className="mt-7 max-w-xl text-sm sm:text-base md:text-lg text-foreground/80 leading-relaxed"
        >
          Профессиональная укладка асфальта, тротуарной плитки и благоустройство территорий.
          Своя техника. Бесплатный выезд и замер.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Link
            to="/kontakty"
            hash="zayavka"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-gold px-7 py-4 text-sm font-bold uppercase tracking-wider text-background shadow-gold-lg hover:-translate-y-0.5 transition-all"
          >
            <Calculator className="h-4 w-4" />
            Получить расчёт
          </Link>
          <a
            href={`tel:${SITE.phoneRaw}`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-background/30 backdrop-blur px-7 py-4 text-sm font-bold uppercase tracking-wider text-foreground hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all"
          >
            <Phone className="h-4 w-4" />
            Позвонить
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55 }}
          className="mt-5"
        >
          <PromoTimer />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
          className="mt-14 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-7 md:gap-10 max-w-3xl"
        >
          {[
            { v: 15, s: "+", l: "лет на рынке" },
            { v: 500, s: "+", l: "сданных объектов" },
            { v: 3, s: " года", l: "гарантия" },
            { v: 0, s: " ₽", l: "выезд и замер" },
          ].map((stat) => (
            <div key={stat.l}>
              <div className="font-numeric text-4xl sm:text-5xl md:text-6xl text-[var(--gold)] leading-none">
                <Counter to={stat.v} suffix={stat.s} />
              </div>
              <div className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {stat.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#next"
        aria-label="Прокрутить вниз"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-[var(--gold)] transition-colors"
      >
        <span>scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.a>
    </section>
  );
}

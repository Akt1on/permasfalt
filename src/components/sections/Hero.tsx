import { motion } from "framer-motion";
import { Phone, Calculator } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-asphalt.jpg";
import { SITE } from "@/data/site";
import { Counter } from "@/components/ui-blocks";

const TITLE = "АСФАЛЬТИРОВАНИЕ В ПЕРМИ";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden grain">
      {/* Background image with parallax-ish ken burns */}
      <motion.div
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <img
          src={heroImg}
          alt="Асфальтоукладчик за работой"
          className="h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      </motion.div>

      <div className="relative container-x flex flex-col justify-center min-h-[100svh] pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 mb-6 self-start text-xs uppercase tracking-[0.3em] text-[var(--gold)]"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--gold)] animate-pulse" />
          с {SITE.yearFounded} года · Гарантия 3 года
        </motion.div>

        <h1
          className="font-display tracking-wide leading-[0.95] text-foreground max-w-5xl"
          style={{ fontSize: "clamp(2.5rem, 9vw, 8rem)" }}
        >
          {TITLE.split(" ").map((word, wi) => (
            <span key={wi} className="inline-block mr-[0.18em] whitespace-nowrap">
              {word.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    delay: 0.4 + (wi * 0.18 + i * 0.04),
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block"
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground"
        >
          Профессиональная укладка асфальта, тротуарной плитки и благоустройство
          территорий. Своя техника. Бесплатный выезд и замер.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link
            to="/kontakty"
            hash="zayavka"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-7 py-4 text-sm font-bold uppercase tracking-wider text-background shadow-gold-lg hover:-translate-y-0.5 transition-all"
          >
            <Calculator className="h-4 w-4" />
            Получить расчёт
          </Link>
          <a
            href={`tel:${SITE.phoneRaw}`}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--gold)]/40 bg-background/40 backdrop-blur px-7 py-4 text-sm font-bold uppercase tracking-wider text-foreground hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all"
          >
            <Phone className="h-4 w-4" />
            Позвонить
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9 }}
          className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 md:gap-10 max-w-3xl"
        >
          {[
            { v: 15, s: "+", l: "лет на рынке" },
            { v: 500, s: "+", l: "сданных объектов" },
            { v: 3, s: " года", l: "гарантия" },
            { v: 0, s: " ₽", l: "выезд и замер" },
          ].map((stat) => (
            <div key={stat.l}>
              <div className="font-display text-3xl sm:text-4xl md:text-5xl text-[var(--gold)] tracking-wide leading-none">
                <Counter to={stat.v} suffix={stat.s} />
              </div>
              <div className="mt-1.5 text-[10px] md:text-sm uppercase tracking-wider text-muted-foreground">
                {stat.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

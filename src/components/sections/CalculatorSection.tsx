import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calculator as CalcIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SectionTitle } from "@/components/ui-blocks";

const TYPES = [
  { id: "asfalt", label: "Асфальт", price: 500 },
  { id: "plitka", label: "Тротуарная плитка", price: 700 },
  { id: "shcheben", label: "Щебень", price: 250 },
];
const BASES = [
  { id: "new", label: "Новое основание", k: 1 },
  { id: "demolish", label: "С демонтажом старого", k: 1.25 },
];

export function CalculatorSection() {
  const [type, setType] = useState(TYPES[0].id);
  const [base, setBase] = useState(BASES[0].id);
  const [area, setArea] = useState(200);

  const total = useMemo(() => {
    const t = TYPES.find((x) => x.id === type)!;
    const b = BASES.find((x) => x.id === base)!;
    return Math.round(t.price * area * b.k);
  }, [type, base, area]);

  return (
    <section className="section-y relative">
      <div className="container-x">
        <SectionTitle
          eyebrow="Калькулятор"
          title="Рассчитайте стоимость работ"
          description="Ориентировочный расчёт за 30 секунд. Точную смету подготовим после выезда замерщика."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 grid lg:grid-cols-[1fr_auto] gap-8 items-stretch"
        >
          <div className="glass rounded-2xl p-6 md:p-10 shadow-card">
            <Group label="Тип покрытия">
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <ChipBtn key={t.id} active={type === t.id} onClick={() => setType(t.id)}>
                    {t.label}
                  </ChipBtn>
                ))}
              </div>
            </Group>

            <Group label="Тип основания">
              <div className="flex flex-wrap gap-2">
                {BASES.map((b) => (
                  <ChipBtn key={b.id} active={base === b.id} onClick={() => setBase(b.id)}>
                    {b.label}
                  </ChipBtn>
                ))}
              </div>
            </Group>

            <Group label={`Площадь: ${area} м²`}>
              <input
                type="range"
                min={20}
                max={5000}
                step={10}
                value={area}
                onChange={(e) => setArea(+e.target.value)}
                className="w-full accent-[var(--gold)]"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>20 м²</span>
                <span>5 000 м²</span>
              </div>
            </Group>
          </div>

          <div className="lg:w-[360px] rounded-2xl bg-gradient-gold p-8 text-background flex flex-col justify-between shadow-gold-lg">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] opacity-70">
                <CalcIcon className="h-4 w-4" /> Ориентировочно
              </div>
              <div className="mt-4 font-display text-5xl md:text-6xl tracking-wide">
                от {total.toLocaleString("ru-RU")} ₽
              </div>
              <p className="mt-3 text-sm opacity-80">
                Финальная цена — после бесплатного выезда замерщика на объект.
              </p>
            </div>
            <Link
              to="/kontakty"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-background text-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              Точный расчёт
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      {children}
    </div>
  );
}

function ChipBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition-all border ${
        active
          ? "bg-gradient-gold text-background border-transparent shadow-gold"
          : "bg-surface-2 text-foreground/80 border-border hover:border-[var(--gold)]/50"
      }`}
    >
      {children}
    </button>
  );
}

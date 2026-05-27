import { LazyMotion, domAnimation, m  } from "framer-motion";
import { SectionTitle } from "@/components/ui-blocks";

const STEPS = [
  { n: "01", title: "Заявка и звонок", text: "Оставляете заявку или звоните. Уточняем задачу за 10 минут." },
  { n: "02", title: "Бесплатный выезд", text: "Замерщик выезжает на объект, делает обмеры и фото." },
  { n: "03", title: "Смета и договор", text: "Готовим точную смету и договор с фиксированной ценой и сроком." },
  { n: "04", title: "Подготовка площадки", text: "Завоз материалов, подготовка техники и бригады." },
  { n: "05", title: "Подготовка основания", text: "Демонтаж, планировка, устройство щебёночной подушки." },
  { n: "06", title: "Производство работ", text: "Укладка по технологии. Контроль качества на каждом этапе." },
  { n: "07", title: "Сдача и гарантия", text: "Подписываем акт. Выдаём гарантийные обязательства на 3 года." },
];

export function StepsSection() {
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionTitle
          eyebrow="Этапы работы"
          title="Прозрачный процесс от заявки до сдачи"
        />
        <div className="mt-14 relative max-w-3xl mx-auto">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--gold)]/40 to-transparent" />
          <div className="space-y-8">
            {STEPS.map((s, i) => (
              <m.div
                key={s.n}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className={`relative md:grid md:grid-cols-2 md:gap-12 items-center ${
                  i % 2 === 0 ? "" : "md:[&>div:first-child]:order-2"
                }`}
              >
                <div className={`pl-16 md:pl-0 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"}`}>
                  <div className="font-display text-5xl text-gradient-gold tracking-wide">{s.n}</div>
                  <h3 className="mt-1 font-heading font-bold text-xl text-foreground">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                </div>
                <div className="hidden md:block" />
                <div className="absolute left-6 md:left-1/2 top-2 -translate-x-1/2 h-4 w-4 rounded-full bg-gradient-gold gold-glow" />
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

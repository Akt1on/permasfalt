import { Award, Clock, Users, FileCheck, Truck, ShieldCheck } from "lucide-react";
import { SectionTitle, FadeInUp } from "@/components/ui-blocks";

const ITEMS = [
  { icon: Award, title: "15+ лет опыта", text: "Работаем с 2010 года, более 500 сданных объектов." },
  { icon: ShieldCheck, title: "Гарантия 3 года", text: "Закрепляем гарантию в договоре. Бесплатный гарантийный ремонт." },
  { icon: FileCheck, title: "Работаем по договору", text: "Юрлица и физлица. Полный пакет закрывающих документов." },
  { icon: Truck, title: "Своя техника", text: "Без посредников. Асфальтоукладчики Vögele, экскаваторы JCB." },
  { icon: Clock, title: "Соблюдаем сроки", text: "Сроки фиксируются договором, штрафные санкции — наша зона ответственности." },
  { icon: Users, title: "Опытная бригада", text: "Бригадиры с опытом 10+ лет, обучение по ГОСТ." },
];

export function WhyUs() {
  return (
    <section className="section-y bg-surface-1/50">
      <div className="container-x">
        <SectionTitle eyebrow="Почему мы" title="Шесть причин выбрать нас" />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ITEMS.map((it, i) => (
            <FadeInUp key={it.title} delay={(i % 3) * 0.08}>
              <div className="group h-full rounded-2xl border border-border bg-surface-1 p-6 hover:border-[var(--gold)]/50 hover:bg-surface-2 transition-all">
                <div className="h-12 w-12 grid place-items-center rounded-xl bg-gradient-gold text-background mb-4 group-hover:scale-110 transition-transform">
                  <it.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{it.text}</p>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}

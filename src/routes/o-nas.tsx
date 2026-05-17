import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { CTASection } from "@/components/sections/CTASection";
import { FadeInUp, Counter } from "@/components/ui-blocks";
import { Seo } from "@/components/Seo";
import { Award, Truck, Users, Target } from "lucide-react";

export const Route = createFileRoute("/o-nas")({
  component: AboutPage,
});

const VALUES = [
  { icon: Target, title: "Фокус на результат", text: "Закрепляем сроки и стоимость в договоре. Никаких скрытых доплат." },
  { icon: Award, title: "Гарантия качества", text: "3 года гарантии на все основные работы. Проверка ГОСТ и СНиП." },
  { icon: Truck, title: "Своя техника", text: "Собственный парк дорожной техники: укладчики, катки, экскаваторы." },
  { icon: Users, title: "Профессионалы", text: "Бригадиры с опытом 10+ лет, регулярное обучение по технологии." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        breadcrumbs={[{ label: "О нас" }]}
        eyebrow="О компании"
        title="15 лет строим качественные дороги"
        description="«Пермь Асфальт 59» — региональный подрядчик по асфальтированию и благоустройству. Работаем с частными заказчиками, бизнесом и муниципалитетами."
      />

      <section className="section-y">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <FadeInUp>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide">Наша история</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Мы начали в 2010 году с небольшой бригады и одного асфальтоукладчика. За 15 лет
                выросли до полнопрофильного подрядчика с собственной автоколонной, парком техники
                и постоянными контрактами с крупными заказчиками региона.
              </p>
              <p>
                Сегодня «Пермь Асфальт 59» — это более 50 сотрудников, 25 единиц техники и
                стабильное качество, подкреплённое реальными отзывами и десятками сданных объектов
                каждый сезон.
              </p>
              <p>
                Мы делаем честные сметы, держим сроки и отвечаем за результат. Это правила,
                которые работают.
              </p>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.15}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { v: 15, s: "+", l: "лет работы" },
                { v: 500, s: "+", l: "объектов" },
                { v: 50, s: "+", l: "сотрудников" },
                { v: 25, s: "", l: "ед. техники" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl gold-border bg-surface-1 p-6 text-center"
                >
                  <div className="font-display text-5xl text-gradient-gold">
                    <Counter to={s.v} suffix={s.s} />
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </FadeInUp>
        </div>
      </section>

      <section className="section-y bg-surface-1/40">
        <div className="container-x">
          <FadeInUp className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl tracking-wide">Наши принципы</h2>
          </FadeInUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v, i) => (
              <FadeInUp key={v.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-surface-1 p-6">
                  <div className="h-12 w-12 grid place-items-center rounded-xl bg-gradient-gold text-background mb-4">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-lg">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </SiteLayout>
  );
}

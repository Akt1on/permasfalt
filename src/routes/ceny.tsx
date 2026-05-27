import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { PRICE_CATEGORIES } from "@/data/prices";
import { CallbackForm } from "@/components/site/CallbackForm";
import { Check, Phone, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSettings } from "@/lib/site-data";
import { SITE } from "@/data/site";

const BASE = SITE.url;

export const Route = createFileRoute("/ceny")({
  head: () => ({
    meta: [
      { title: `Цены на асфальтирование в Перми ${new Date().getFullYear()} — прайс-лист | Пермь Асфальт 59` },
      { name: "description", content: `Актуальный прайс-лист ${new Date().getFullYear()}: асфальтирование от 300 ₽/м², плитка от 450 ₽/м², ямочный ремонт, земляные работы, снос зданий. Прозрачные цены без скрытых платежей. Бесплатный выезд замерщика.` },
      { name: "keywords", content: `цены асфальтирование Пермь ${new Date().getFullYear()}, прайс укладка асфальта Пермь, стоимость асфальтирования Пермь, прайс-лист благоустройство Пермь, сколько стоит заасфальтировать Пермь` },
      { property: "og:title", content: `Цены на асфальтирование в Перми ${new Date().getFullYear()} — Пермь Асфальт 59` },
      { property: "og:description", content: "Открытый прайс-лист: асфальтирование, плитка, земляные работы, снос, аренда спецтехники. Цены без доплат." },
      { property: "og:url", content: BASE + "/ceny" },
      { property: "og:image", content: BASE + "/og-image.png" },
    ],
    links: [{ rel: "canonical", href: BASE + "/ceny" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: BASE + "/" },
          { "@type": "ListItem", position: 2, name: "Цены", item: BASE + "/ceny" },
        ],
      }),
    }],
  }),
  component: PricesPage,
});

function PricesPage() {
  const [active, setActive] = useState(PRICE_CATEGORIES[0].id);
  const cat = PRICE_CATEGORIES.find((c) => c.id === active)!;
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 5 * 60 * 1000 });
  const phone = settings?.contacts?.phone ?? SITE.phone;
  const phoneRaw = phone.replace(/[^\d+]/g, "");

  return (
    <LazyMotion features={domAnimation} strict>
      <>
        {/* BREADCRUMBS */}
        <nav className="container-x pt-28 pb-0">
          <ol className="flex items-center gap-2 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-primary transition">Главная</Link></li>
            <span>/</span>
            <li className="text-foreground font-medium">Цены</li>
          </ol>
        </nav>

        {/* HERO */}
        <section className="bg-[oklch(0.20_0.008_60)] pt-10 pb-16">
          <div className="container-x">
            <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="chip chip-white mb-4">Прайс-лист</div>
              <h1 className="font-display text-white leading-none mb-4" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
                ЦЕНЫ НА <span className="text-gradient-gold">АСФАЛЬТИРОВАНИЕ</span>
              </h1>
              <p className="text-white/65 max-w-2xl text-lg leading-relaxed">
                Актуальный прайс-лист {new Date().getFullYear()} года. Финальная стоимость рассчитывается
                после бесплатного выезда замерщика — цены могут быть ниже.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "Цены фиксируются в договоре",
                  "Нет скрытых доплат",
                  "Скидки на объём от 300 м²",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/75">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" /> {t}
                  </div>
                ))}
              </div>
            </m.div>
          </div>
        </section>

        {/* PRICE TABLE */}
        <section className="py-16">
          <div className="container-x">
            <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">
              <div>
                {/* Category tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {PRICE_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActive(c.id)}
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all border ${
                        active === c.id
                          ? "btn-gold border-transparent"
                          : "bg-white border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>

                <m.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl overflow-hidden border border-border shadow-[var(--shadow-card)]"
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="btn-gold">
                        <th className="text-left px-6 py-4 font-display font-bold uppercase tracking-wider">{cat.title}</th>
                        <th className="text-right px-6 py-4 font-display font-bold uppercase tracking-wider">Стоимость</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white">
                      {cat.rows.map((r, i) => (
                        <m.tr
                          key={r.name}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="hover:bg-primary/3 transition-colors"
                        >
                          <td className="px-6 py-4 text-foreground">{r.name}</td>
                          <td className="px-6 py-4 text-right font-display font-bold text-primary whitespace-nowrap">{r.price}</td>
                        </m.tr>
                      ))}
                    </tbody>
                  </table>
                </m.div>

                <p className="mt-4 text-xs text-muted-foreground">
                  * Цены указаны ориентировочно. Окончательная стоимость определяется после осмотра объекта и замеров.
                  Скидки для юридических лиц и ТСЖ при объёме работ свыше 300 м².
                </p>

                {/* All prices text for SEO */}
                <div className="mt-12 rounded-2xl border border-border bg-surface px-8 py-7">
                  <h2 className="font-display text-xl font-bold mb-4">О ценах на асфальтирование в Перми</h2>
                  <div className="prose prose-zinc max-w-none text-sm text-muted-foreground leading-relaxed space-y-3">
                    <p>Стоимость асфальтирования в Перми зависит от нескольких факторов: площадь объекта, толщина асфальтового слоя, состояние основания, удалённость объекта и сезон производства работ. Компания «Пермь Асфальт 59» предлагает конкурентные цены благодаря собственному парку техники — нет затрат на аренду, нет наценки посредников.</p>
                    <p>Для небольших объёмов (до 100 м²) цена за квадратный метр выше из-за минимальной загрузки техники и бригады. Для крупных заказов от 300 м² предусмотрены индивидуальные скидки. Юридическим лицам и ТСЖ выставляем счета с НДС, предоставляем закрывающие документы.</p>
                    <p>Финальная стоимость всегда фиксируется в смете и договоре до начала работ — никаких доплат «по факту». Выезд замерщика и составление сметы — бесплатно.</p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="sticky top-28 space-y-5">
                <div className="bg-white rounded-2xl border border-border p-7 shadow-[var(--shadow-elevated)] card-accent-top">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse-ring" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Бесплатно</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">Получить точную смету</h3>
                  <p className="text-sm text-muted-foreground mb-5">Замерщик приедет и рассчитает стоимость на месте</p>
                  <CallbackForm source="ceny" compact />
                  <a href={`tel:${phoneRaw}`} className="mt-4 flex items-center justify-center gap-2 text-sm text-primary font-semibold hover:underline">
                    <Phone className="h-4 w-4" /> {phone}
                  </a>
                </div>

                <div className="bg-[oklch(0.20_0.008_60)] rounded-2xl p-6">
                  <h3 className="font-display text-lg font-bold text-white mb-4">Все услуги</h3>
                  <div className="space-y-2">
                    {PRICE_CATEGORIES.map((c) => (
                      <Link
                        key={c.id}
                        to="/services/$slug"
                        params={{ slug: c.id }}
                        className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 hover:border-primary/50 hover:text-primary transition group"
                      >
                        <span>{c.title}</span>
                        <ArrowRight className="h-4 w-4 group-hover:text-primary transition shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </>
    </LazyMotion>
  );
}

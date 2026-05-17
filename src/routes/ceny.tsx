import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { CTASection } from "@/components/sections/CTASection";
import { PRICE_CATEGORIES } from "@/data/prices";
import { FadeInUp } from "@/components/ui-blocks";
import { Seo } from "@/components/Seo";

export const Route = createFileRoute("/ceny")({
  component: PricesPage,
});

function PricesPage() {
  const [active, setActive] = useState(PRICE_CATEGORIES[0].id);
  const cat = PRICE_CATEGORIES.find((c) => c.id === active)!;

  return (
    <SiteLayout>
      <Seo
        title="Цены — прайс-лист на асфальтирование и благоустройство | Пермь Асфальт 59"
        description="Полный прайс-лист: асфальтирование от 300 ₽/м², плитка от 450 ₽/м², земляные работы, доставка материалов. Прозрачные цены без скрытых платежей."
      />
      <PageHeader
        breadcrumbs={[{ label: "Цены" }]}
        eyebrow="Прайс-лист"
        title="Цены и тарифы"
        description="Открытые цены по всем направлениям. Финальная стоимость рассчитывается индивидуально после выезда замерщика."
      />

      <section className="pb-16">
        <div className="container-x">
          <FadeInUp>
            <div className="flex flex-wrap gap-2 mb-8">
              {PRICE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all border ${
                    active === c.id
                      ? "bg-gradient-gold text-background border-transparent shadow-gold"
                      : "bg-surface-1 border-border hover:border-[var(--gold)]/50"
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </FadeInUp>

          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden border border-border shadow-card"
          >
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-gold text-background">
                  <th className="text-left px-6 py-4 font-heading uppercase tracking-wider text-sm">
                    {cat.title}
                  </th>
                  <th className="text-right px-6 py-4 font-heading uppercase tracking-wider text-sm">
                    Цена
                  </th>
                </tr>
              </thead>
              <tbody>
                {cat.rows.map((r, i) => (
                  <motion.tr
                    key={r.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={i % 2 ? "bg-surface-2/50" : "bg-surface-1"}
                  >
                    <td className="px-6 py-4 text-foreground">{r.name}</td>
                    <td className="px-6 py-4 text-right text-[var(--gold)] font-bold whitespace-nowrap">
                      {r.price}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <p className="mt-6 text-xs text-muted-foreground italic">
            Цены указаны ориентировочно и не являются публичной офертой. Окончательная стоимость
            определяется после выезда специалиста.
          </p>
        </div>
      </section>

      <CTASection />
    </SiteLayout>
  );
}

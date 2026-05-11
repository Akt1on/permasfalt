import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { CTASection } from "@/components/sections/CTASection";
import { ServiceCard } from "@/components/ServiceCard";
import { FadeInUp, SectionTitle } from "@/components/ui-blocks";
import { getService, SERVICES, type Service } from "@/data/services";
import { PRICE_CATEGORIES } from "@/data/prices";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/uslugi/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    const s = loaderData?.service;
    if (!s) return { meta: [{ title: "Услуга не найдена" }] };
    return {
      meta: [
        { title: `${s.title} в Перми — ${s.priceFrom} | Пермь Асфальт 59` },
        { name: "description", content: s.hero },
        { property: "og:title", content: `${s.title} в Перми — ${s.priceFrom}` },
        { property: "og:description", content: s.hero },
        { property: "og:type", content: "website" },
      ],
    };
  },
  component: ServicePage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-x py-32 text-center">
        <h1 className="font-display text-6xl">404</h1>
        <p className="mt-4 text-muted-foreground">Услуга не найдена.</p>
        <Link
          to="/uslugi"
          className="mt-6 inline-flex rounded-full bg-gradient-gold px-6 py-3 text-sm font-bold text-background"
        >
          Все услуги
        </Link>
      </div>
    </SiteLayout>
  ),
});

function ServicePage() {
  const { service } = Route.useLoaderData() as { service: Service };
  const others = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 4);

  // Build a small price list relevant to the service when possible.
  const relatedPrices =
    PRICE_CATEGORIES.find((c) => c.id === service.slug || c.title === service.title)?.rows ||
    PRICE_CATEGORIES.flatMap((c) => c.rows).filter((r) =>
      r.name.toLowerCase().includes(service.title.toLowerCase().split(" ")[0]),
    );

  return (
    <SiteLayout>
      <PageHeader
        breadcrumbs={[{ label: "Услуги", to: "/uslugi" }, { label: service.title }]}
        eyebrow={service.priceFrom}
        title={service.title}
        description={service.hero}
      />

      <section className="section-y">
        <div className="container-x grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <FadeInUp>
              <h2 className="font-display text-3xl md:text-4xl tracking-wide">Описание услуги</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">{service.description}</p>
            </FadeInUp>

            <FadeInUp>
              <h3 className="font-heading font-bold text-xl text-foreground">Что входит в услугу</h3>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                {service.includes.map((it) => (
                  <li
                    key={it}
                    className="flex items-start gap-3 rounded-xl bg-surface-1 border border-border p-4"
                  >
                    <CheckCircle2 className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
                    <span className="text-sm">{it}</span>
                  </li>
                ))}
              </ul>
            </FadeInUp>

            {relatedPrices && relatedPrices.length > 0 && (
              <FadeInUp>
                <h3 className="font-heading font-bold text-xl text-foreground">Цены на услугу</h3>
                <div className="mt-4 rounded-xl overflow-hidden border border-border">
                  <table className="w-full text-sm">
                    <tbody>
                      {relatedPrices.map((r, i) => (
                        <tr
                          key={r.name}
                          className={i % 2 ? "bg-surface-2/50" : "bg-surface-1"}
                        >
                          <td className="px-5 py-3.5">{r.name}</td>
                          <td className="px-5 py-3.5 text-right text-[var(--gold)] font-bold whitespace-nowrap">
                            {r.price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </FadeInUp>
            )}

            <FadeInUp>
              <h3 className="font-heading font-bold text-xl text-foreground">Частые вопросы</h3>
              <Accordion type="single" collapsible className="mt-4">
                {service.faq.map((f, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border-border data-[state=open]:bg-surface-1 rounded-lg px-4 my-1"
                  >
                    <AccordionTrigger className="text-left font-heading font-bold text-foreground hover:text-[var(--gold)] hover:no-underline">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </FadeInUp>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 self-start">
            <div className="rounded-2xl bg-gradient-gold p-6 text-background shadow-gold-lg">
              <div className="text-xs uppercase tracking-[0.25em] opacity-70">Стоимость</div>
              <div className="mt-2 font-display text-4xl">{service.priceFrom}</div>
              <p className="mt-3 text-sm opacity-85">
                Точная цена — после бесплатного выезда замерщика.
              </p>
              <Link
                to="/kontakty"
                className="mt-5 block text-center rounded-full bg-background text-foreground px-5 py-3 text-sm font-bold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
              >
                Заказать расчёт
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-surface-1 p-6 text-sm text-muted-foreground space-y-2">
              <div className="text-foreground font-bold mb-2">Гарантия и документы</div>
              <p>✓ Гарантия 3 года в договоре</p>
              <p>✓ Полный пакет закрывающих документов</p>
              <p>✓ Безналичный и наличный расчёт</p>
              <p>✓ Работаем с юр- и физлицами</p>
            </div>
          </aside>
        </div>
      </section>

      <CTASection defaultService={service.title} />

      <section className="section-y">
        <div className="container-x">
          <SectionTitle eyebrow="Ещё услуги" title="Другие направления" />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {others.map((s, i) => (
              <ServiceCard key={s.slug} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

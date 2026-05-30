import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, Phone, Star,
  ChevronDown, ChevronUp, Shield, Clock, Award, Truck,
} from "lucide-react";
import { fetchSettings } from "@/lib/site-data";
import { getService, SERVICES } from "@/data/services";
import { SITE } from "@/data/site";
import { CallbackForm } from "@/components/site/CallbackForm";
import { DynIcon } from "@/components/site/icon";

const BASE = SITE.url;

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => ({ service: getService(params.slug) }),

  head: ({ loaderData, params }) => {
    const s = loaderData?.service;
    const title = s
      ? `${s.title} в Перми — ${s.priceFrom} | Пермь Асфальт 59`
      : "Услуга — Пермь Асфальт 59";
    const description = s
      ? `${s.title} в Перми и Пермском крае — ${s.priceFrom}. ${s.short}. Бесплатный выезд, гарантия 3 года, договор. Пермь Асфальт 59.`
      : "Профессиональные услуги по благоустройству в Перми. Гарантия 3 года, бесплатный выезд.";
    const url = `${BASE}/services/${params.slug}`;

    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 160) },
        { name: "keywords", content: s ? `${s.title} Пермь, ${s.title} цена, ${s.title} Пермский край, заказать ${s.title} Пермь, ${s.title} стоимость, ${s.title} недорого Пермь` : "" },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 160) },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${BASE}/og-image.png` },
        { property: "og:locale", content: "ru_RU" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: s ? [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": url + "/#service",
            name: `${s.title} в Перми`,
            description: s.short,
            url,
            provider: {
              "@type": "LocalBusiness",
              "@id": BASE + "/#business",
              name: "Пермь Асфальт 59",
              telephone: "+73422777710",
            },
            areaServed: [
              { "@type": "City", name: "Пермь" },
              { "@type": "AdministrativeArea", name: "Пермский край" },
            ],
            offers: {
              "@type": "Offer",
              description: s.priceFrom,
              priceCurrency: "RUB",
              availability: "https://schema.org/InStock",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: s.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: BASE + "/" },
              { "@type": "ListItem", position: 2, name: "Услуги", item: BASE + "/services" },
              { "@type": "ListItem", position: 3, name: s.title, item: url },
            ],
          }),
        },
      ] : [],
    };
  },

  component: ServicePage,
});

// ─── NAV ANCHORS ──────────────────────────────────────────────────────────────
const ANCHORS = [
  { id: "description", label: "Описание" },
  { id: "why-us",      label: "Почему мы" },
  { id: "steps",       label: "Этапы" },
  { id: "includes",    label: "Что входит" },
  { id: "pricing",     label: "Прайс" },
  { id: "faq",         label: "Вопросы" },
  { id: "order",       label: "Заказать" },
];

const TRUST_BADGES = [
  { icon: Shield, text: "Гарантия 3 года" },
  { icon: Truck,  text: "Своя техника" },
  { icon: Clock,  text: "Выезд за 24 ч" },
  { icon: Award,  text: "С 2010 года" },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────
function ServicePage() {
  const { slug } = useParams({ from: "/services/$slug" });
  const service = getService(slug);
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 5 * 60 * 1000 });
  const phone = settings?.contacts?.phone ?? SITE.phone;
  const phoneRaw = phone.replace(/[^\d+]/g, "");

  if (!service) {
    return (
      <div className="container-x py-40 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Услуга не найдена</h1>
        <Link to="/services" className="text-primary font-semibold hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> К списку услуг
        </Link>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <>
        {/* ══════ BREADCRUMBS ══════ */}
        <nav aria-label="Хлебные крошки" className="container-x pt-28 pb-0">
          <ol className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {[{ label: "Главная", to: "/" }, { label: "Услуги", to: "/services" }].map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <Link to={b.to} className="hover:text-primary transition">{b.label}</Link>
                <li aria-hidden="true" className="text-border select-none">/</li>
              </li>
            ))}
            <li className="text-foreground font-medium">{service.title}</li>
          </ol>
        </nav>

        {/* ══════ HERO SECTION ══════ */}
        <section className="relative overflow-hidden bg-[oklch(0.20_0.008_60)] pt-10 pb-20">
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle at 70% 50%, oklch(0.82 0.19 85), transparent 60%)" }} />
          <div className="container-x relative z-10">
            <Link to="/services"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-primary mb-8 font-medium transition">
              <ArrowLeft className="h-4 w-4" /> Все услуги
            </Link>

            <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
              <div>
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="h-14 w-14 rounded-2xl btn-gold grid place-items-center shrink-0">
                    <DynIcon name={service.icon} className="h-7 w-7" />
                  </div>
                  <div className="chip chip-white">{service.priceFrom}</div>
                </div>

                <m.h1
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="font-display text-white leading-none mb-5"
                  style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
                >
                  {service.title} <span className="text-gradient-gold">в Перми</span>
                </m.h1>

                <m.p
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-lg text-white/70 max-w-2xl leading-relaxed mb-8"
                >
                  {service.hero}
                </m.p>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-3">
                  {TRUST_BADGES.map(({ icon: Icon, text }) => (
                    <div key={text}
                      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/75">
                      <Icon className="h-4 w-4 text-primary" /> {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticky CTA card */}
              <m.div
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="bg-white rounded-2xl p-7 shadow-[0_24px_80px_-20px_oklch(0_0_0/0.55)]"
                id="order"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse-ring" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Бесплатный выезд</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">Стоимость</div>
                <div className="font-display text-3xl font-bold text-gradient-gold mb-1">{service.priceFrom}</div>
                <div className="text-xs text-muted-foreground mb-5">Точная цена — после осмотра объекта</div>
                <div className="h-px bg-border mb-5" />
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Заказать услугу</h3>
                <CallbackForm source={`service:${service.slug}`} compact />
                <a href={`tel:${phoneRaw}`}
                  className="mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:underline font-semibold">
                  <Phone className="h-4 w-4" /> {phone}
                </a>
              </m.div>
            </div>
          </div>
        </section>

        {/* ══════ STICKY NAV ══════ */}
        <div className="sticky top-[64px] z-30 bg-white border-b border-border shadow-sm">
          <div className="container-x overflow-x-auto scrollbar-none">
            <div className="flex gap-1 py-2 min-w-max">
              {ANCHORS.map((a) => (
                <a key={a.id} href={`#${a.id}`}
                  className="rounded-full px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 transition whitespace-nowrap">
                  {a.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ══════ MAIN CONTENT ══════ */}
        <div className="container-x py-16">
          <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">

            {/* ── LEFT COLUMN ── */}
            <div className="space-y-8">

              {/* DESCRIPTION */}
              <ContentCard id="description" title={`${service.title} в Перми — подробное описание`}>
                <div className="prose prose-zinc max-w-none text-muted-foreground leading-relaxed">
                  {service.description.split("\n\n").map((para, i) => (
                    <p key={i} className="mb-4 last:mb-0">{para}</p>
                  ))}
                </div>
              </ContentCard>

              {/* WHY US */}
              <ContentCard id="why-us" title="Почему заказывают у нас">
                <div className="grid sm:grid-cols-2 gap-4">
                  {service.whyUs.map((item, i) => (
                    <m.div key={i}
                      initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/15 grid place-items-center shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">{item}</span>
                    </m.div>
                  ))}
                </div>
              </ContentCard>

              {/* STEPS */}
              <ContentCard id="steps" title="Этапы выполнения работ">
                <div className="space-y-4">
                  {service.steps.map((step, i) => (
                    <m.div key={i}
                      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                      className="flex gap-5 rounded-xl bg-surface border border-border p-5 hover:border-primary/30 transition-all"
                    >
                      <div className="font-display text-3xl font-bold text-primary/25 w-12 shrink-0 leading-none pt-1">
                        {step.num}
                      </div>
                      <div>
                        <div className="font-bold text-foreground mb-1">{step.title}</div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                      </div>
                    </m.div>
                  ))}
                </div>
              </ContentCard>

              {/* INCLUDES */}
              <ContentCard id="includes" title="Что входит в услугу">
                <div className="grid sm:grid-cols-2 gap-3">
                  {service.includes.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-surface border border-border px-4 py-3">
                      <div className="h-5 w-5 rounded-full bg-primary/15 grid place-items-center shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </ContentCard>

              {/* PRICING */}
              <ContentCard id="pricing" title="Прайс-лист">
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface border-b border-border">
                        <th className="text-left px-5 py-3 font-semibold text-foreground">Вид работ</th>
                        <th className="text-right px-5 py-3 font-semibold text-foreground whitespace-nowrap">Стоимость</th>
                        <th className="text-right px-5 py-3 font-semibold text-foreground">Ед.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {service.pricing.map((row, i) => (
                        <tr key={i} className="hover:bg-primary/3 transition-colors">
                          <td className="px-5 py-3.5 text-foreground">{row.name}</td>
                          <td className="px-5 py-3.5 text-right font-display font-bold text-primary whitespace-nowrap">{row.price} ₽</td>
                          <td className="px-5 py-3.5 text-right text-muted-foreground whitespace-nowrap">{row.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  * Цены указаны ориентировочно. Точная стоимость рассчитывается после выезда замерщика на объект.
                </p>
              </ContentCard>

              {/* FAQ */}
              <ContentCard id="faq" title="Частые вопросы">
                <div className="space-y-3">
                  {service.faq.map((f, i) => (
                    <FAQItem key={i} q={f.q} a={f.a} />
                  ))}
                </div>
              </ContentCard>

              {/* SEO TEXT */}
              <div className="rounded-2xl bg-surface border border-border px-8 py-7">
                <div className="prose prose-zinc max-w-none text-sm text-muted-foreground leading-relaxed">
                  {service.seoText.split("\n\n").map((para, i) => (
                    <p key={i} className="mb-3 last:mb-0">{para}</p>
                  ))}
                </div>
              </div>

            </div>{/* end left column */}

            {/* ── RIGHT COLUMN (sticky sidebar) ── */}
            <aside className="space-y-5 lg:sticky lg:top-28">

              {/* Order form repeated */}
              <div className="bg-white rounded-2xl border border-border p-7 shadow-[var(--shadow-elevated)] card-accent-top">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Цена</div>
                <div className="font-display text-3xl font-bold text-gradient-gold mb-1">{service.priceFrom}</div>
                <div className="text-xs text-muted-foreground mb-5">Финальная цена — после выезда замерщика</div>
                <div className="h-px bg-border mb-5" />
                <CallbackForm source={`service:${service.slug}:sidebar`} compact />
                <a href={`tel:${phoneRaw}`}
                  className="mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:underline font-semibold">
                  <Phone className="h-4 w-4" /> {phone}
                </a>
              </div>

              {/* Trust block */}
              <div className="bg-[oklch(0.20_0.008_60)] rounded-2xl p-6 space-y-3">
                <div className="font-display text-lg font-bold text-white mb-2">Наши гарантии</div>
                {[
                  "Гарантия 3 года — в договоре",
                  "Фиксированная смета без доплат",
                  "Собственная техника, нет простоев",
                  "Документы, акт, отчётность",
                ].map((g) => (
                  <div key={g} className="flex items-start gap-2.5">
                    <Star className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-white/70">{g}</span>
                  </div>
                ))}
              </div>

              {/* Other services */}
              <OtherServices currentSlug={service.slug} />
            </aside>

          </div>
        </div>
      </>
    </LazyMotion>
  );
}

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

function ContentCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <m.div
      id={id}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.45 }}
      className="bg-white rounded-2xl border border-border p-8 shadow-[var(--shadow-card)] card-accent-top"
    >
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">{title}</h2>
      {children}
    </m.div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border overflow-hidden hover:border-primary/40 transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
        aria-controls="faq-answer"
      >
        <span className="font-semibold text-foreground text-[15px] leading-snug">{q}</span>
        <div className="h-7 w-7 rounded-full bg-primary/10 grid place-items-center shrink-0">
          {open ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed">{a}</div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OtherServices({ currentSlug }: { currentSlug: string }) {
  const others = SERVICES.filter((s) => s.slug !== currentSlug).slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-[var(--shadow-card)]">
      <h3 className="font-display text-base font-bold text-foreground mb-4">Другие услуги</h3>
      <div className="space-y-2">
        {others.map((s: any) => (
          <Link
            key={s.slug}
            to="/services/$slug"
            params={{ slug: s.slug }}
            className="flex items-center justify-between gap-2 rounded-xl border border-border px-4 py-3 text-sm hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all group"
          >
            <span className="font-medium">{s.title}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </Link>
        ))}
        <Link
          to="/services"
          className="flex items-center justify-center gap-2 rounded-xl bg-surface border border-border px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-primary hover:border-primary/50 transition-all mt-1"
        >
          Все услуги <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

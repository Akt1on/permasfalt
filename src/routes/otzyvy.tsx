import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Star, Quote, Phone } from "lucide-react";
import { fetchReviews, fetchSettings } from "@/lib/site-data";
import { REVIEWS as STATIC_REVIEWS } from "@/data/reviews";
import { CallbackForm } from "@/components/site/CallbackForm";
import { SITE } from "@/data/site";

const BASE = SITE.url;

export const Route = createFileRoute("/otzyvy")({
  head: () => ({
    meta: [
      { title: "Отзывы клиентов об асфальтировании в Перми | Пермь Асфальт 59" },
      { name: "description", content: "Реальные отзывы заказчиков о работе компании «Пермь Асфальт 59». Асфальтирование, тротуарная плитка, земляные работы. Рейтинг 4.9/5 по 127 отзывам." },
      { name: "keywords", content: "отзывы асфальтирование Пермь, Пермь Асфальт 59 отзывы, отзывы укладка асфальта Пермь, отзывы тротуарная плитка Пермь" },
      { property: "og:title", content: "Отзывы — Пермь Асфальт 59" },
      { property: "og:url", content: BASE + "/otzyvy" },
      { property: "og:image", content: BASE + "/og-image.png" },
    ],
    links: [{ rel: "canonical", href: BASE + "/otzyvy" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: BASE + "/" },
          { "@type": "ListItem", position: 2, name: "Отзывы", item: BASE + "/otzyvy" },
        ],
      }),
    }],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { data: dbReviews = [] } = useQuery({ queryKey: ["reviews"], queryFn: fetchReviews, staleTime: 5 * 60 * 1000 });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 5 * 60 * 1000 });
  const phone = settings?.contacts?.phone ?? SITE.phone;
  const phoneRaw = phone.replace(/[^\d+]/g, "");

  // Merge DB reviews with static fallback
  const reviews = dbReviews.length > 0
    ? dbReviews
    : STATIC_REVIEWS.map((r, i) => ({ id: String(i), author_name: r.name, author_role: r.company, content: r.text, rating: r.rating, photo_url: null, is_active: true, sort_order: i }));

  const avg = reviews.length > 0
    ? (reviews.reduce((a, r) => a + (r.rating ?? 5), 0) / reviews.length).toFixed(1)
    : "4.9";

  return (
    <LazyMotion features={domAnimation} strict>
      <>
        {/* BREADCRUMBS */}
        <nav className="container-x pt-28 pb-0">
          <ol className="flex items-center gap-2 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-primary transition">Главная</Link></li>
            <span>/</span>
            <li className="text-foreground font-medium">Отзывы</li>
          </ol>
        </nav>

        {/* HERO */}
        <section className="bg-[oklch(0.20_0.008_60)] pt-10 pb-16">
          <div className="container-x">
            <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="chip chip-white mb-4">Отзывы клиентов</div>
              <h1 className="font-display text-white leading-none mb-4" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
                ЧТО ГОВОРЯТ <span className="text-gradient-gold">О НАС</span>
              </h1>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="h-5 w-5 fill-primary text-primary" />)}
                </div>
                <span className="font-display text-2xl font-bold text-white">{avg}</span>
                <span className="text-white/50 text-sm">/ 5 · {reviews.length}+ отзывов</span>
              </div>
            </m.div>
          </div>
        </section>

        {/* REVIEWS GRID */}
        <section className="py-16">
          <div className="container-x">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((r: any, i: number) => (
                <m.div key={r.id ?? i}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.3) }}
                  className="relative bg-white rounded-2xl border border-border p-7 hover:border-primary/30 hover:shadow-[var(--shadow-elevated)] transition-all card-accent-top"
                >
                  <Quote className="h-7 w-7 text-primary/20 absolute top-5 right-5" />
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: r.rating ?? 5 }).map((_,j) => (
                      <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/85 mb-5">«{r.content ?? r.text}»</p>
                  <div className="pt-4 border-t border-border">
                    <div className="font-bold text-foreground">{r.author_name ?? r.name}</div>
                    {(r.author_role ?? r.company) && (
                      <div className="text-xs text-muted-foreground mt-0.5">{r.author_role ?? r.company}</div>
                    )}
                    {r.date && <div className="text-xs text-muted-foreground mt-0.5">{r.date}</div>}
                  </div>
                </m.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[oklch(0.20_0.008_60)]">
          <div className="container-x">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="chip chip-white mb-4">Ваш отзыв важен</div>
                <h2 className="font-display text-3xl font-bold text-white">ОСТАВЬТЕ ЗАЯВКУ — УБЕДИТЕСЬ САМИ</h2>
                <p className="mt-4 text-white/60">Выедем на замер бесплатно. Смета без обязательств.</p>
              </div>
              <div className="bg-white rounded-2xl p-7 shadow-[var(--shadow-elevated)]">
                <CallbackForm source="otzyvy" />
                <a href={`tel:${phoneRaw}`} className="mt-4 flex items-center justify-center gap-2 text-sm text-primary font-semibold hover:underline">
                  <Phone className="h-4 w-4" /> {phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      </>
    </LazyMotion>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { CTASection } from "@/components/sections/CTASection";
import { FadeInUp } from "@/components/ui-blocks";
import { REVIEWS } from "@/data/reviews";
import { Star } from "lucide-react";

export const Route = createFileRoute("/otzyvy")({
  head: () => ({
    meta: [
      { title: "Отзывы клиентов | Пермь Асфальт 59" },
      {
        name: "description",
        content:
          "Реальные отзывы клиентов о работе компании «Пермь Асфальт 59». Средняя оценка 5.0 из 5.",
      },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const avg = (
    REVIEWS.reduce((a, r) => a + r.rating, 0) / REVIEWS.length
  ).toFixed(1);

  return (
    <SiteLayout>
      <PageHeader
        breadcrumbs={[{ label: "Отзывы" }]}
        eyebrow={`Средняя оценка ${avg} ★`}
        title="Отзывы клиентов"
        description="Честные отзывы заказчиков — частных лиц, бизнеса и организаций."
      />

      <section className="pb-16">
        <div className="container-x grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REVIEWS.map((r, i) => (
            <FadeInUp key={r.name + i} delay={(i % 3) * 0.08}>
              <div className="h-full rounded-2xl border border-border bg-surface-1 p-6 hover:border-[var(--gold)]/50 transition-colors">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: r.rating }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">"{r.text}"</p>
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="font-heading font-bold text-sm">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.company}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{r.date}</div>
                </div>
              </div>
            </FadeInUp>
          ))}
        </div>
      </section>

      <CTASection />
    </SiteLayout>
  );
}

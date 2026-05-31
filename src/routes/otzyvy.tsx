import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { CTASection } from "@/components/sections/CTASection";
import { FadeInUp } from "@/components/ui-blocks";
import { fetchReviews } from "@/lib/site-data";
import { REVIEWS as FALLBACK_REVIEWS } from "@/data/reviews";
import { Seo } from "@/components/Seo";
import { Star } from "lucide-react";

export const Route = createFileRoute("/otzyvy")({
  component: ReviewsPage,
});

function ReviewsPage() {
  const { data: dbReviews } = useQuery({
    queryKey: ["reviews"],
    queryFn: fetchReviews,
    staleTime: 60_000,
  });

  // Use DB reviews if available, else fall back to static
  const reviews = dbReviews && dbReviews.length > 0
    ? dbReviews.map((r) => ({
        name: r.author_name,
        company: r.author_role ?? "",
        rating: r.rating,
        text: r.content,
        date: "",
      }))
    : FALLBACK_REVIEWS;

  const avg = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <SiteLayout>
      <Seo
        title="Отзывы клиентов | Пермь Асфальт 59"
        description="Реальные отзывы клиентов. Средняя оценка 5.0 из 5."
      />
      <PageHeader
        breadcrumbs={[{ label: "Отзывы" }]}
        eyebrow={`Средняя оценка ${avg} ★`}
        title="Отзывы клиентов"
        description="Честные отзывы заказчиков — частных лиц, бизнеса и организаций."
      />

      <section className="pb-16">
        <div className="container-x grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r, i) => (
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
                    {r.company && (
                      <div className="text-xs text-muted-foreground">{r.company}</div>
                    )}
                  </div>
                  {r.date && (
                    <div className="text-xs text-muted-foreground">{r.date}</div>
                  )}
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

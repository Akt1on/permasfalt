import { SectionTitle } from "@/components/ui-blocks";
import { Link } from "@tanstack/react-router";
import { useServices, getServiceIcon } from "@/lib/content";

export function ServicesGrid({ limit }: { limit?: number }) {
  const { data: services = [] } = useServices();
  const items = limit ? services.slice(0, limit) : services;

  return (
    <section className="section-y">
      <div className="container-x">
        <SectionTitle
          eyebrow="Услуги"
          title="Полный комплекс работ"
          description="От ямочного ремонта до строительства дорог. Своя техника и команда профессионалов."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((s, i) => {
            const Icon = getServiceIcon(s.icon);
            return (
              <Link
                key={s.slug}
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-surface-1 p-6 transition-all duration-300 hover:border-[var(--gold)]/50 hover:shadow-[0_4px_24px_rgba(212,160,23,0.10)]"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-heading font-bold text-base leading-snug mb-1 group-hover:text-primary transition-colors">
                    {s.title}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">{s.short}</p>
                </div>
                {s.priceFrom && (
                  <div className="text-xs font-bold text-primary/80">{s.priceFrom}</div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

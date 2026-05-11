import { SectionTitle } from "@/components/ui-blocks";
import { ServiceCard } from "@/components/ServiceCard";
import { SERVICES } from "@/data/services";

export function ServicesGrid({ limit }: { limit?: number }) {
  const items = limit ? SERVICES.slice(0, limit) : SERVICES;
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionTitle
          eyebrow="Услуги"
          title="Полный комплекс работ"
          description="От ямочного ремонта до строительства дорог. Своя техника и команда профессионалов."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((s, i) => (
            <ServiceCard key={s.slug} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

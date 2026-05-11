import { SectionTitle } from "@/components/ui-blocks";
import { SITE } from "@/data/site";

export function MapSection() {
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionTitle eyebrow="Где мы" title="Наш офис в Перми" description={SITE.address} />
        <div className="mt-10 rounded-2xl overflow-hidden gold-border h-[420px]">
          <iframe
            title="Карта"
            src={SITE.yandexMapEmbed}
            className="h-full w-full grayscale-[30%] contrast-110"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

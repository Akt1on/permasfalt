import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { CTASection } from "@/components/sections/CTASection";
import { PageHeader } from "@/components/PageHeader";
import { Seo } from "@/components/Seo";

export const Route = createFileRoute("/uslugi/")({
  component: ServicesIndex,
});

function ServicesIndex() {
  return (
    <SiteLayout>
      <Seo title="Услуги — асфальтирование и благоустройство в Перми | Пермь Асфальт 59" description="Полный комплекс: асфальтирование, ямочный ремонт, плитка, демонтаж, доставка материалов." />
      <PageHeader
        breadcrumbs={[{ label: "Услуги" }]}
        eyebrow="Каталог"
        title="Все услуги"
        description="10 направлений работ по асфальтированию и благоустройству. Все цены — открыто."
      />
      <ServicesGrid />
      <CTASection />
    </SiteLayout>
  );
}

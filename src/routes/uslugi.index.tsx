import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { CTASection } from "@/components/sections/CTASection";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/uslugi/")({
  head: () => ({
    meta: [
      { title: "Услуги — асфальтирование и благоустройство в Перми | Пермь Асфальт 59" },
      {
        name: "description",
        content:
          "Полный комплекс услуг: асфальтирование, ямочный ремонт, тротуарная плитка, земляные работы, демонтаж, доставка материалов в Перми и крае.",
      },
    ],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  return (
    <SiteLayout>
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

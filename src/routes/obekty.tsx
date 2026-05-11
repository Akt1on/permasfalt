import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { GallerySection } from "@/components/sections/GallerySection";
import { CTASection } from "@/components/sections/CTASection";

export const Route = createFileRoute("/obekty")({
  head: () => ({
    meta: [
      { title: "Выполненные объекты — портфолио работ в Перми | Пермь Асфальт 59" },
      {
        name: "description",
        content:
          "Более 500 сданных объектов: асфальтирование, тротуарная плитка, демонтаж, земляные работы. Реальные фото с площадок.",
      },
    ],
  }),
  component: ObektyPage,
});

function ObektyPage() {
  return (
    <SiteLayout>
      <PageHeader
        breadcrumbs={[{ label: "Объекты" }]}
        eyebrow="Портфолио"
        title="Выполненные объекты"
        description="Более 500 сданных объектов в Перми и Пермском крае. Каждое фото — наш реальный объект."
      />
      <GallerySection withFilters />
      <CTASection />
    </SiteLayout>
  );
}

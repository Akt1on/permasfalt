import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { GallerySection } from "@/components/sections/GallerySection";
import { CTASection } from "@/components/sections/CTASection";
import { Seo } from "@/components/Seo";

export const Route = createFileRoute("/obekty")({
  component: ObektyPage,
});

function ObektyPage() {
  return (
    <SiteLayout>
      <Seo title="Выполненные объекты — портфолио работ в Перми | Пермь Асфальт 59" description="Более 500 сданных объектов: асфальтирование, плитка, демонтаж, земляные работы." />
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

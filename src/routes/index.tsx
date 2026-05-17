import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { WhyUs } from "@/components/sections/WhyUs";
import { StepsSection } from "@/components/sections/StepsSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { CTASection } from "@/components/sections/CTASection";
import { MapSection } from "@/components/sections/MapSection";
import { SchemaJsonLd, localBusinessSchema } from "@/components/SchemaJsonLd";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <Seo
        title={`Асфальтирование в Перми — укладка асфальта от 300 ₽/м² | Пермь Асфальт 59`}
        description={`Профессиональное асфальтирование в Перми и Пермском крае. Гарантия 3 года. Выезд и замер бесплатно. Работаем с 2010 года. Звоните: ${SITE.phone}`}
      />
      <SchemaJsonLd data={localBusinessSchema} />
      <Hero />
      <TrustStrip />
      <CalculatorSection />
      <ServicesGrid />
      <WhyUs />
      <StepsSection />
      <GallerySection />
      <ReviewsSection />
      <CTASection />
      <MapSection />
    </SiteLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { CTASection } from "@/components/sections/CTASection";
import { PageHeader } from "@/components/PageHeader";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";
import { SERVICES } from "@/data/services";
import { SITE } from "@/data/site";

const BASE = SITE.url;

export const Route = createFileRoute("/uslugi/")({
  head: () => ({
    meta: [
      { title: "Услуги по асфальтированию и благоустройству в Перми — Пермь Асфальт 59" },
      {
        name: "description",
        content:
          "10 направлений: асфальтирование, ямочный ремонт, тротуарная плитка, земляные работы, снос зданий, уборка снега, аренда спецтехники. Цены открыто. Бесплатный выезд замерщика.",
      },
      {
        name: "keywords",
        content:
          "услуги асфальтирования Пермь, благоустройство территорий Пермь, укладка асфальта Пермь, тротуарная плитка Пермь, земляные работы Пермь, аренда спецтехники Пермь",
      },
      { property: "og:title", content: "Услуги по асфальтированию и благоустройству в Перми | Пермь Асфальт 59" },
      {
        property: "og:description",
        content: "Полный комплекс дорожных и благоустроительных работ в Перми с 2010 года. Гарантия 3 года.",
      },
      { property: "og:url", content: `${BASE}/uslugi` },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${BASE}/og-image.png` },
      { property: "og:locale", content: "ru_RU" },
    ],
    links: [{ rel: "canonical", href: `${BASE}/uslugi` }],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  return (
    <SiteLayout>
      <SchemaJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: BASE },
            { "@type": "ListItem", position: 2, name: "Услуги", item: `${BASE}/uslugi` },
          ],
        }}
      />
      <SchemaJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Услуги Пермь Асфальт 59",
          itemListElement: SERVICES.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${BASE}/uslugi/${s.slug}`,
            name: s.title,
          })),
        }}
      />

      <PageHeader
        breadcrumbs={[{ label: "Услуги" }]}
        eyebrow="Каталог услуг"
        title="Асфальтирование и благоустройство в Перми"
        description="10 направлений работ: от укладки асфальта до кронирования деревьев. Все цены открыто — без звонка."
      />

      <ServicesGrid />

      {/* SEO text block */}
      <section className="section-y bg-surface-1/50">
        <div className="container-x max-w-3xl">
          <h2 className="font-display text-3xl tracking-wide mb-6">
            Комплексное благоустройство территорий в Перми
          </h2>
          <div className="prose prose-sm text-muted-foreground space-y-4">
            <p>
              Компания <strong>Пермь Асфальт 59</strong> с 2010 года выполняет полный спектр работ
              по асфальтированию, благоустройству и озеленению территорий в Перми и Пермском крае.
              За 15 лет мы сдали более 500 объектов — от придомовых дорожек до крупных промышленных
              площадок.
            </p>
            <p>
              Вся техника собственная: асфальтоукладчики Vögele, катки 12–14 тонн, экскаваторы JCB,
              самосвалы 10–25 тонн. Это позволяет соблюдать сроки без зависимости от сторонних
              подрядчиков. Асфальтобетонная смесь — с собственного завода, с паспортом качества.
            </p>
            <p>
              На все работы под ключ — <strong>гарантия 3 года в договоре</strong>. Выезд
              замерщика и подготовка сметы — бесплатно. Работаем с физлицами, ИП и юрлицами.
              Полный пакет документов, безналичный расчёт с НДС и без.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/kontakty"
              className="inline-flex rounded-full bg-gradient-gold px-6 py-3 text-sm font-bold text-background"
            >
              Бесплатный выезд замерщика
            </Link>
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="inline-flex rounded-full border border-border px-6 py-3 text-sm font-bold hover:border-[var(--gold)] transition-colors"
            >
              {SITE.phone}
            </a>
          </div>
        </div>
      </section>

      <CTASection />
    </SiteLayout>
  );
}

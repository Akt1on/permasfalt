import { createFileRoute, Link } from "@tanstack/react-router";
import { GallerySection } from "@/components/site/GallerySection";

const BASE = "https://permasfalt59.ru";
const TITLE = "Портфолио объектов — фото асфальтирования в Перми | Пермь Асфальт 59";
const DESC  = "Фотогалерея выполненных объектов: асфальтирование, тротуарная плитка, демонтаж, земляные работы. Более 500 объектов в Перми и Пермском крае.";

export const Route = createFileRoute("/obekty")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "портфолио асфальтирование Пермь, фото объектов асфальт, выполненные работы Пермь" },
      { property: "og:title",       content: TITLE },
      { property: "og:description", content: DESC  },
      { property: "og:url",         content: BASE + "/obekty" },
      { property: "og:image",       content: BASE + "/og-image.png" },
    ],
    links: [{ rel: "canonical", href: BASE + "/obekty" }],
  }),
  component: ObektyPage,
});

function ObektyPage() {
  return (
    <div className="pt-24">
      {/* Page header */}
      <div className="bg-[oklch(0.18_0.008_60)] pt-12 pb-10 border-b border-white/10">
        <div className="container-x">
          <div className="chip chip-primary mb-4">Портфолио</div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight">
            ВЫПОЛНЕННЫЕ <span className="text-gradient-gold">ОБЪЕКТЫ</span>
          </h1>
          <p className="mt-4 text-base text-white/60 max-w-xl">
            Более 500 сданных объектов в Перми и Пермском крае. Каждое фото — наш реальный объект.
          </p>
          <nav aria-label="Breadcrumb" className="mt-6 flex items-center gap-2 text-xs text-white/40">
            <Link to="/" className="hover:text-white/70 transition">Главная</Link>
            <span>/</span>
            <span className="text-white/70">Объекты</span>
          </nav>
        </div>
      </div>

      <GallerySection withFilters />

      {/* CTA */}
      <section className="py-16 bg-surface border-t border-border">
        <div className="container-x text-center">
          <h2 className="font-display text-3xl font-bold mb-3">Хотите так же?</h2>
          <p className="text-muted-foreground mb-6">
            Оставьте заявку — бесплатно выедем на объект и подготовим смету
          </p>
          <Link to="/" className="btn-gold rounded-xl px-8 py-3.5 font-bold inline-block">
            Получить расчёт
          </Link>
        </div>
      </section>
    </div>
  );
}

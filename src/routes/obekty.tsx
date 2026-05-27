import { createFileRoute } from "@tanstack/react-router";
import { GallerySection } from "@/components/sections/GallerySection";

const BASE = "https://permasfalt59.ru";

export const Route = createFileRoute("/obekty")({
  head: () => ({
    meta: [
      { title: "Портфолио — фото объектов асфальтирования в Перми | Пермь Асфальт 59" },
      { name: "description", content: "Фотогалерея выполненных объектов: асфальтирование, тротуарная плитка, земляные работы, демонтаж. Более 500 объектов в Перми и Пермском крае." },
      { property: "og:url", content: BASE + "/obekty" },
      { property: "og:image", content: BASE + "/og-image.png" },
    ],
    links: [{ rel: "canonical", href: BASE + "/obekty" }],
  }),
  component: ObektyPage,
});

function ObektyPage() {
  return (
    <div className="pt-24">
      <GallerySection withFilters />
    </div>
  );
}

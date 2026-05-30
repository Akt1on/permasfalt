import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingContacts } from "@/components/site/FloatingContacts";
import { CookieBanner } from "@/components/site/CookieBanner";
import { PageTransition } from "@/components/site/PageTransition";
import { ExitIntentPopup } from "@/components/site/ExitIntentPopup";
import { CustomCursor } from "@/components/CustomCursor";
import { fetchSettings, fetchServices } from "@/lib/site-data";
import appCss from "../styles.css?url";

// ─── Constants ─────────────────────────────────────────────────────────────────
// Single source of truth — no duplication with other routes
export const SITE_URL = "https://permasfalt59.ru";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://lncidgylyannquxpjnha.supabase.co";
const SUPABASE_HOST = new URL(SUPABASE_URL).host;

const SITE_TITLE = "Пермь Асфальт 59 — асфальтирование и благоустройство в Перми";
const SITE_DESCRIPTION =
  "Асфальтирование, укладка плитки, демонтаж, спецтехника и благоустройство в Перми и Пермском крае. Гарантия 3 года. Бесплатный выезд.";
const OG_IMAGE = SITE_URL + "/og-image.png";
const LOGO_URL = SITE_URL + "/logo.png";

const TOP_SERVICES = [
  { slug: "asfaltirovanie", label: "Асфальтирование" },
  { slug: "trotuarnaya-plitka", label: "Тротуарная плитка" },
  { slug: "yamochnyy-remont", label: "Ямочный ремонт" },
  { slug: "zemlyanye-raboty", label: "Земляные работы" },
  { slug: "demontazh", label: "Демонтаж" },
  { slug: "arenda-spetstekhniki", label: "Аренда спецтехники" },
];

// ─── 404 ───────────────────────────────────────────────────────────────────────
function NotFoundComponent() {
  return (
    <div className="min-h-screen flex items-center bg-background px-4 py-20">
      <div className="container-x max-w-2xl mx-auto text-center">
        <div
          className="text-[8rem] font-display font-bold leading-none text-gradient-gold"
          aria-hidden="true"
        >
          404
        </div>
        <h1 className="text-2xl font-bold mt-2 mb-2">Страница не найдена</h1>
        <p className="text-muted-foreground mb-8">
          Возможно, адрес изменился или страница была удалена.
        </p>
        <nav aria-label="Быстрые ссылки" className="flex flex-wrap gap-3 justify-center mb-8">
          {TOP_SERVICES.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="rounded-full border border-border/60 px-4 py-2 text-sm hover:border-primary/50 hover:text-primary transition"
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="btn-gold rounded-lg px-6 py-3 font-semibold inline-block"
          >
            На главную
          </Link>
          <Link
            to="/contacts"
            className="rounded-lg border border-border px-6 py-3 font-semibold hover:border-primary/50 transition"
          >
            Контакты
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Error boundary ────────────────────────────────────────────────────────────
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div
      className="min-h-screen grid place-items-center bg-background px-4 text-center"
      role="alert"
    >
      <div>
        <h1 className="text-2xl font-bold">Что-то пошло не так</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 btn-gold rounded-lg px-6 py-3 font-semibold"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}

// ─── Route ─────────────────────────────────────────────────────────────────────
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    loader: async ({ context: { queryClient } }) => {
      // Prefetch critical data for instant first render
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ["settings"],
          queryFn: fetchSettings,
          staleTime: 5 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: ["services"],
          queryFn: fetchServices,
          staleTime: 5 * 60 * 1000,
        }),
      ]);
    },
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        // TODO: Replace with real verification codes from Yandex Webmaster & Google Search Console
        { name: "yandex-verification", content: "REPLACE_WITH_YANDEX_CODE" },
        { name: "google-site-verification", content: "REPLACE_WITH_GOOGLE_CODE" },
        { title: SITE_TITLE },
        { name: "description", content: SITE_DESCRIPTION },
        {
          name: "robots",
          content:
            "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
        },
        // theme-color: primary yellow for browser chrome on mobile
        { name: "theme-color", content: "#d4a017" },
        // Open Graph
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Пермь Асфальт 59" },
        { property: "og:title", content: SITE_TITLE },
        { property: "og:description", content: SITE_DESCRIPTION },
        { property: "og:url", content: SITE_URL },
        { property: "og:image", content: OG_IMAGE },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:locale", content: "ru_RU" },
        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: SITE_TITLE },
        { name: "twitter:description", content: SITE_DESCRIPTION },
        { name: "twitter:image", content: OG_IMAGE },
        // Disable auto telephone detection (handled manually)
        { name: "format-detection", content: "telephone=no" },
      ],
      links: [
        // Canonical — each page overrides this with its own canonical
        { rel: "canonical", href: SITE_URL + "/" },
        // Preconnect — using the actual Supabase project URL, not a hardcoded old one
        { rel: "preconnect", href: `https://${SUPABASE_HOST}` },
        { rel: "dns-prefetch", href: `https://${SUPABASE_HOST}` },
        // Google Fonts — preconnect before stylesheet to avoid render-blocking
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400&display=swap",
        },
        { rel: "stylesheet", href: appCss },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": SITE_URL + "/#website",
            url: SITE_URL,
            name: "Пермь Асфальт 59",
            description: SITE_DESCRIPTION,
            inLanguage: "ru-RU",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: SITE_URL + "/services?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
            publisher: { "@id": SITE_URL + "/#business" },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": SITE_URL + "/#business",
            name: "Пермь Асфальт 59",
            description:
              "Асфальтирование и благоустройство территорий в Перми и Пермском крае",
            url: SITE_URL,
            telephone: "+73422777710",
            email: "info@permasfalt59.ru",
            image: OG_IMAGE,
            logo: { "@type": "ImageObject", url: LOGO_URL },
            address: {
              "@type": "PostalAddress",
              streetAddress: "ш. Космонавтов, 328Л",
              addressLocality: "Пермь",
              addressRegion: "Пермский край",
              postalCode: "614000",
              addressCountry: "RU",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 57.9901,
              longitude: 56.2502,
            },
            areaServed: {
              "@type": "AdministrativeArea",
              name: "Пермский край",
            },
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                ],
                opens: "08:00",
                closes: "20:00",
              },
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Saturday"],
                opens: "09:00",
                closes: "18:00",
              },
            ],
            priceRange: "₽₽",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "127",
              bestRating: "5",
              worstRating: "1",
            },
            sameAs: [],
          }),
        },
      ],
    }),
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
    component: RootComponent,
  },
);

// ─── Root component ─────────────────────────────────────────────────────────────
function RootComponent() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = path.startsWith("/admin") || path === "/auth";

  if (isAdmin) {
    return (
      <>
        <HeadContent />
        <Outlet />
        <Toaster richColors closeButton />
        <Scripts />
      </>
    );
  }

  return (
    <>
      <HeadContent />
      <div className="flex min-h-screen flex-col">
        {/* Промо-полоса — скрыта на мобилке, чтобы не занимать экранное пространство */}
        <div
          className="promo-bar text-center py-2 px-4 text-xs font-bold uppercase tracking-[0.2em] hidden md:block"
          role="banner"
          aria-label="Специальное предложение"
        >
          ⚡ Бесплатный выезд замерщика · Гарантия 3 года в договоре · Работаем с 2010 года ⚡
        </div>
        <Header />
        <main className="flex-1">
          <PageTransition path={path}>
            <Outlet />
          </PageTransition>
        </main>
        <Footer />
      </div>
      <FloatingContacts />
      <CookieBanner />
      <ExitIntentPopup />
      <CustomCursor />
      <Toaster richColors closeButton />
      <Scripts />
    </>
  );
}

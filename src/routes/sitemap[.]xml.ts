import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://permasfalt59.ru";

const CITY_SLUGS = [
  "perm", "krasnokamsk", "berezniki", "solikamsk", "chaykovskiy",
  "kungur", "lysva", "chusovoy", "dobryanka", "osa", "nytva",
  "vereshchagino", "perm-rayon",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date().toISOString();

        const [{ data: services }, { data: projects }, { data: posts }] = await Promise.all([
          supabase.from("services").select("slug,updated_at").eq("is_active", true),
          supabase.from("projects").select("slug,updated_at").eq("is_active", true),
          supabase.from("posts").select("slug,updated_at").eq("is_published", true),
        ]);

        const staticEntries = [
          { path: "/",            priority: "1.0", changefreq: "weekly",  lastmod: now },
          { path: "/services",    priority: "0.9", changefreq: "weekly",  lastmod: now },
          { path: "/uslugi",      priority: "0.9", changefreq: "weekly",  lastmod: now },
          { path: "/goroda",      priority: "0.9", changefreq: "monthly", lastmod: now },
          { path: "/tseny",       priority: "0.9", changefreq: "monthly", lastmod: now },
          { path: "/ceny",        priority: "0.9", changefreq: "monthly", lastmod: now },
          { path: "/portfolio",   priority: "0.8", changefreq: "weekly",  lastmod: now },
          { path: "/blog",        priority: "0.8", changefreq: "weekly",  lastmod: now },
          { path: "/about",       priority: "0.6", changefreq: "monthly", lastmod: now },
          { path: "/o-nas",       priority: "0.6", changefreq: "monthly", lastmod: now },
          { path: "/contacts",    priority: "0.7", changefreq: "monthly", lastmod: now },
          { path: "/kontakty",    priority: "0.7", changefreq: "monthly", lastmod: now },
          { path: "/otzyvy",      priority: "0.7", changefreq: "weekly",  lastmod: now },
          { path: "/rayony",      priority: "0.8", changefreq: "monthly", lastmod: now },
          ...CITY_SLUGS.map((slug) => ({
            path: `/goroda/${slug}`,
            priority: "0.85",
            changefreq: "monthly",
            lastmod: now,
          })),
        ];

        const serviceEntries = (services ?? []).map((s) => ({
          path: `/services/${s.slug}`,
          priority: "0.85",
          changefreq: "monthly",
          lastmod: s.updated_at ?? now,
        }));

        const uslugiEntries = (services ?? []).map((s) => ({
          path: `/uslugi/${s.slug}`,
          priority: "0.85",
          changefreq: "monthly",
          lastmod: s.updated_at ?? now,
        }));

        const projectEntries = (projects ?? []).map((p) => ({
          path: `/portfolio/${p.slug}`,
          priority: "0.75",
          changefreq: "monthly",
          lastmod: p.updated_at ?? now,
        }));

        const postEntries = (posts ?? []).map((p) => ({
          path: `/blog/${p.slug}`,
          priority: "0.7",
          changefreq: "monthly",
          lastmod: p.updated_at ?? now,
        }));

        const allEntries = [
          ...staticEntries,
          ...serviceEntries,
          ...uslugiEntries,
          ...projectEntries,
          ...postEntries,
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    (e) => `  <url>
    <loc>${BASE_URL}${e.path}</loc>
    <lastmod>${e.lastmod.slice(0, 10)}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://permasfalt59.ru";

const CITY_SLUGS = [
  "perm","krasnokamsk","berezniki","solikamsk","chaykovskiy",
  "kungur","lysva","chusovoy","dobryanka","osa","nytva",
  "vereshchagino","perm-rayon",
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
          { path: "/",        priority: "1.0", changefreq: "weekly",  lastmod: now },
          { path: "/services", priority: "0.9", changefreq: "weekly",  lastmod: now },
          { path: "/goroda",   priority: "0.9", changefreq: "monthly", lastmod: now },
          { path: "/tseny",    priority: "0.9", changefreq: "monthly", lastmod: now },
          { path: "/portfolio",priority: "0.8", changefreq: "weekly",  lastmod: now },
          { path: "/blog",     priority: "0.8", changefreq: "weekly",  lastmod: now },
          { path: "/about",    priority: "0.6", changefreq: "monthly", lastmod: now },
          { path: "/contacts", priority: "0.7", changefreq: "monthly", lastmod: now },
          ...CITY_SLUGS.map((slug) => ({
            path: `/goroda/${slug}`,
            priority: "0.85",
            changefreq: "monthly",
            lastmod: now,
          })),
        ];

        const dynamicEntries = [
          ...(services ?? []).map((s: any) => ({
            path: `/services/${s.slug}`,
            lastmod: s.updated_at ? new Date(s.updated_at).toISOString() : now,
            priority: "0.85",
            changefreq: "monthly",
          })),
          ...(projects ?? []).map((p: any) => ({
            path: `/portfolio/${p.slug}`,
            lastmod: p.updated_at ? new Date(p.updated_at).toISOString() : now,
            priority: "0.7",
            changefreq: "monthly",
          })),
          ...(posts ?? []).map((p: any) => ({
            path: `/blog/${p.slug}`,
            lastmod: p.updated_at ? new Date(p.updated_at).toISOString() : now,
            priority: "0.75",
            changefreq: "monthly",
          })),
        ];

        const urls = [...staticEntries, ...dynamicEntries].map((e: any) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n")
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});

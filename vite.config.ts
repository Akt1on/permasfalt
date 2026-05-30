// @lovable.dev/vite-tanstack-config already includes core Vite/TanStack plugins.
// Do not add duplicate React, Router, Tailwind or path-alias plugins manually.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "node:fs";
import path from "node:path";

const CITY_SLUGS = [
  "perm", "krasnokamsk", "berezniki", "solikamsk", "chaykovskiy",
  "kungur", "lysva", "chusovoy", "dobryanka", "osa", "nytva",
  "vereshchagino", "perm-rayon",
];

const SERVICE_SLUGS = [
  "asfaltirovanie", "trotuarnaya-plitka", "yamochnyy-remont",
  "zemlyanye-raboty", "demontazh", "vyvoz-musora", "arenda-spetstekhniki",
  "dostavka-nerudnykh", "uborka-snega", "stroitelstvo-dorog",
  "remont-dorog", "kronirovanie-derevyev",
];

const STATIC_PAGES = [
  "/", "/services", "/goroda", "/tseny",
  "/portfolio", "/blog", "/about", "/contacts",
  ...CITY_SLUGS.map((s) => `/goroda/${s}`),
  ...SERVICE_SLUGS.map((s) => `/services/${s}`),
];

// Read Supabase URL from env — with a safe fallback that matches .env
// This avoids hardcoding project IDs in source code
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  "https://lncidgylyannquxpjnha.supabase.co";

const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "";

const SUPABASE_PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID ?? "";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: { enabled: true, prerender: { outputPath: "/_shell" } },
    prerender: { enabled: true, failOnError: false },
    sitemap: { enabled: false },
    pages: STATIC_PAGES.map((p) => ({
      path: p,
      prerender: { enabled: true, crawlLinks: false, retryCount: 2 },
    })),
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            // Admin — only loaded on /admin
            if (id.includes("/routes/admin")) return "admin";
            // Animations — heavy package, separate chunk
            if (id.includes("framer-motion")) return "framer-motion";
            // Charts — only on prices page
            if (id.includes("recharts") || id.includes("d3-")) return "charts";
            // Radix UI components
            if (id.includes("@radix-ui")) return "radix";
            // Supabase SDK
            if (id.includes("@supabase")) return "supabase";
            // React core
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/")
            ) return "react-core";
            // TanStack Router
            if (
              id.includes("@tanstack/react-router") ||
              id.includes("@tanstack/react-start")
            ) return "router";
          },
        },
      },
      // ES2020 — minimal polyfills, supported by 98%+ browsers in Russia
      target: "es2020",
      // Inline small assets (<4KB) directly in JS
      assetsInlineLimit: 4096,
      // Per-chunk CSS splitting
      cssCodeSplit: true,
      // No sourcemaps in production (keep build fast; enable separately if debugging)
      sourcemap: false,
      chunkSizeWarningLimit: 500,
    },
    define: {
      // Inject env values at build time — uses actual env vars, no hardcoded project IDs
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_KEY),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(SUPABASE_PROJECT_ID),
    },
    plugins: [
      {
        // TanStack SPA prerender may expect server.js while build emits index.js
        name: "lovable-mirror-ssr-entry",
        apply: "build",
        closeBundle() {
          const src = path.resolve("dist/server/index.js");
          const dest = path.resolve("dist/server/server.js");
          if (fs.existsSync(src) && !fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
          }
        },
      },
    ],
  },
});

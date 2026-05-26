/**
 * Seo — обёртка для <head()> через TanStack Start.
 * В роутах, которые не могут использовать head() напрямую (например, динамические),
 * можно обновить мета-теги через этот компонент.
 *
 * NOTE: Для SSR-совместимости всегда предпочитайте head() в Route.
 * Этот компонент использует document.querySelector как клиентский fallback.
 */

import { useEffect } from "react";

type SeoProps = {
  title?: string;
  description?: string;
  noindex?: boolean;
  ogImage?: string;
  canonical?: string;
};

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  if (typeof document === "undefined") return;
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

export function Seo({ title, description, noindex, ogImage, canonical }: SeoProps) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, "property");
    }
    if (title) setMeta("og:title", title, "property");
    if (ogImage) {
      setMeta("og:image", ogImage, "property");
      setMeta("twitter:image", ogImage);
    }
    if (noindex) setMeta("robots", "noindex,nofollow");
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  }, [title, description, noindex, ogImage, canonical]);

  return null;
}

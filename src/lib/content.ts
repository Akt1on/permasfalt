import { useQuery } from "@tanstack/react-query";
import type { ComponentType } from "react";
import {
  Construction,
  Wrench,
  LayoutGrid,
  Shovel,
  Trash2,
  Truck,
  Hammer,
  Snowflake,
  PackageOpen,
  Trees,
} from "lucide-react";
import { SERVICES as FALLBACK_SERVICES } from "@/data/services";
import { PRICE_CATEGORIES as FALLBACK_PRICE_CATEGORIES } from "@/data/prices";
import { GALLERY as FALLBACK_GALLERY, GALLERY_FILTERS as FALLBACK_GALLERY_FILTERS } from "@/data/gallery";
import { SITE as FALLBACK_SITE } from "@/data/site";

export const SERVICE_ICON_MAP = {
  construction: Construction,
  wrench: Wrench,
  "layout-grid": LayoutGrid,
  shovel: Shovel,
  trash: Trash2,
  truck: Truck,
  hammer: Hammer,
  snowflake: Snowflake,
  "package-open": PackageOpen,
  trees: Trees,
} as const;

export type ServiceIconKey = keyof typeof SERVICE_ICON_MAP;

export type Service = {
  id: string;
  slug: string;
  title: string;
  short: string;
  priceFrom: string;
  icon: ServiceIconKey | ComponentType<React.SVGProps<SVGSVGElement>>;
  hero: string;
  description: string;
  includes: string[];
  faq: { q: string; a: string }[];
  imageUrl?: string | null;
  order: number;
};

export type PriceItem = {
  id: string;
  category_id: string;
  category_title: string;
  name: string;
  price: string;
  order: number;
};

export type GalleryItem = {
  id: string;
  src: string;
  title: string;
  category: string;
  category_label: string;
  year: number;
  order: number;
};

export type SiteSettings = {
  name: string;
  domain: string;
  url: string;
  phone: string;
  phoneRaw: string;
  address: string;
  hours: string;
  whatsapp: string;
  telegram: string;
  vk: string;
  max: string;
  email: string;
  yearFounded: number;
  geo: { lat: number; lng: number };
  legal: { name: string; ogrn: string; inn: string };
  yandexMapEmbed: string;
};

export const getServiceIcon = (
  icon: Service["icon"],
): ComponentType<React.SVGProps<SVGSVGElement>> =>
  typeof icon === "string" ? SERVICE_ICON_MAP[icon] ?? Construction : icon;

async function fetchJson<T>(path: string) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    throw new Error(`Ошибка загрузки данных: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function fetchServices() {
  const { services } = await fetchJson<{ services: Service[] }>("/api/content/services");
  return services;
}

export async function fetchPriceItems() {
  const { items } = await fetchJson<{ items: PriceItem[] }>("/api/content/prices");
  return items;
}

export async function fetchGalleryItems() {
  const { items } = await fetchJson<{ items: GalleryItem[] }>("/api/content/gallery");
  return items;
}

export async function fetchSiteSettings() {
  const { settings } = await fetchJson<{ settings: SiteSettings }>("/api/content/site");
  return settings;
}

export function useServices() {
  return useQuery({
    queryKey: ["content", "services"],
    queryFn: fetchServices,
    placeholderData: FALLBACK_SERVICES as Service[],
    staleTime: 60_000,
  });
}

export function usePriceItems() {
  return useQuery({
    queryKey: ["content", "prices"],
    queryFn: fetchPriceItems,
    placeholderData: FALLBACK_PRICE_CATEGORIES.flatMap((c) =>
      c.rows.map((r, index) => ({
        id: `${c.id}-${index}`,
        category_id: c.id,
        category_title: c.title,
        name: r.name,
        price: r.price,
        order: index,
      })),
    ),
    staleTime: 60_000,
  });
}

export function useGalleryItems() {
  return useQuery({
    queryKey: ["content", "gallery"],
    queryFn: fetchGalleryItems,
    placeholderData: FALLBACK_GALLERY.map((g, index) => ({
      id: `fallback-${index}`,
      src: g.src,
      title: g.title,
      category: g.category,
      category_label: g.categoryLabel,
      year: g.year,
      order: index,
    })) as GalleryItem[],
    staleTime: 60_000,
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["content", "site"],
    queryFn: fetchSiteSettings,
    placeholderData: FALLBACK_SITE as SiteSettings,
    staleTime: 60_000,
  });
}

export type PriceCategory = {
  category_id: string;
  category_title: string;
  rows: { id: string; name: string; price: string; order: number }[];
};

export function groupPriceItems(items: PriceItem[]) {
  const groups = new Map<string, PriceCategory>();
  items.forEach((item) => {
    const existing = groups.get(item.category_id);
    if (!existing) {
      groups.set(item.category_id, {
        category_id: item.category_id,
        category_title: item.category_title,
        rows: [item],
      });
    } else {
      existing.rows.push(item);
    }
  });
  return Array.from(groups.values()).map((group) => ({
    ...group,
    rows: group.rows.sort((a, b) => a.order - b.order),
  })).sort((a, b) => a.category_title.localeCompare(b.category_title, "ru"));
}

export function groupGalleryCategories(items: GalleryItem[]) {
  const categories = new Map<string, { id: string; label: string }>();
  items.forEach((item) => {
    if (!categories.has(item.category)) {
      categories.set(item.category, { id: item.category, label: item.category_label });
    }
  });
  return Array.from(categories.values());
}

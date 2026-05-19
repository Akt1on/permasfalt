import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";
import {
  Loader2,
  LogOut,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  Archive,
  ShieldAlert,
  RefreshCw,
  Inbox,
  Send,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import {
  groupPriceItems,
  SERVICE_ICON_MAP,
  Service,
  ServiceIconKey,
  PriceItem,
  GalleryItem,
  SiteSettings,
} from "@/lib/content";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
});

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Готово",
  archived: "Архив",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  in_progress: "bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30",
  done: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  archived: "bg-muted/40 text-muted-foreground border-border",
};
const TAB_ITEMS = [
  { value: "leads", label: "Заявки" },
  { value: "services", label: "Услуги" },
  { value: "prices", label: "Цены" },
  { value: "gallery", label: "Галерея" },
  { value: "site", label: "Настройки" },
] as const;

type AdminTab = (typeof TAB_ITEMS)[number]["value"];

type AdminService = Omit<Service, "icon"> & { icon: ServiceIconKey };

type StatusData = {
  isAdmin: boolean;
  bootstrapped: boolean;
};

type Lead = {
  id: string;
  name: string;
  phone: string;
  service: string | null;
  message: string | null;
  source: string | null;
  status: string;
  telegram_sent: boolean | null;
  created_at: string;
};

async function authedFetch(path: string, init?: RequestInit) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [authReady, setAuthReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [tab, setTab] = useState<AdminTab>("leads");
  const [servicesDraft, setServicesDraft] = useState<AdminService[]>([]);
  const [pricesDraft, setPricesDraft] = useState<PriceItem[]>([]);
  const [galleryDraft, setGalleryDraft] = useState<GalleryItem[]>([]);
  const [siteDraft, setSiteDraft] = useState<SiteSettings | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      setHasSession(true);
      setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/admin/login" });
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [navigate]);

  const status = useQuery<StatusData>({
    queryKey: ["admin", "status"],
    queryFn: () => authedFetch("/api/admin/me"),
    enabled: authReady && hasSession,
  });

  const leads = useQuery<{ leads: Lead[] }>({
    queryKey: ["admin", "leads"],
    queryFn: () => authedFetch("/api/admin/leads"),
    enabled: !!status.data?.isAdmin,
    refetchInterval: 15_000,
  });

  const servicesQuery = useQuery<AdminService[]>({
    queryKey: ["admin", "services"],
    queryFn: async () => {
      const { services } = await authedFetch("/api/admin/services");
      return (services as Service[]).map((service) => ({
        ...service,
        icon: typeof service.icon === "string" ? (service.icon as ServiceIconKey) : "construction",
      }));
    },
    enabled: !!status.data?.isAdmin,
    staleTime: 60_000,
  });

  const pricesQuery = useQuery<PriceItem[]>({
    queryKey: ["admin", "prices"],
    queryFn: async () => {
      const { items } = await authedFetch("/api/admin/prices");
      return items as PriceItem[];
    },
    enabled: !!status.data?.isAdmin,
    staleTime: 60_000,
  });

  const galleryQuery = useQuery<GalleryItem[]>({
    queryKey: ["admin", "gallery"],
    queryFn: async () => {
      const { items } = await authedFetch("/api/admin/gallery");
      return items as GalleryItem[];
    },
    enabled: !!status.data?.isAdmin,
    staleTime: 60_000,
  });

  const siteQuery = useQuery<SiteSettings>({
    queryKey: ["admin", "site"],
    queryFn: async () => {
      const { settings } = await authedFetch("/api/admin/site");
      return settings as SiteSettings;
    },
    enabled: !!status.data?.isAdmin,
    staleTime: 60_000,
  });
  useEffect(() => {
    if (servicesQuery.data) setServicesDraft(servicesQuery.data);
  }, [servicesQuery.data]);

  useEffect(() => {
    if (pricesQuery.data) setPricesDraft(pricesQuery.data);
  }, [pricesQuery.data]);

  useEffect(() => {
    if (galleryQuery.data) setGalleryDraft(galleryQuery.data);
  }, [galleryQuery.data]);

  useEffect(() => {
    if (siteQuery.data) setSiteDraft(siteQuery.data);
  }, [siteQuery.data]);

  const saveServicesMut = useMutation({
    mutationFn: (services: AdminService[]) =>
      authedFetch("/api/admin/services", {
        method: "PATCH",
        body: JSON.stringify({ services }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "services"] }),
  });

  const savePricesMut = useMutation({
    mutationFn: (items: PriceItem[]) =>
      authedFetch("/api/admin/prices", {
        method: "PATCH",
        body: JSON.stringify({ items }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "prices"] }),
  });

  const saveGalleryMut = useMutation({
    mutationFn: (items: GalleryItem[]) =>
      authedFetch("/api/admin/gallery", {
        method: "PATCH",
        body: JSON.stringify({ items }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] }),
  });

  const saveSiteMut = useMutation({
    mutationFn: (settings: SiteSettings) =>
      authedFetch("/api/admin/site", {
        method: "PATCH",
        body: JSON.stringify({ settings }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "site"] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      authedFetch("/api/admin/leads", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "leads"] }),
  });

  const iconKeys = Object.keys(SERVICE_ICON_MAP) as ServiceIconKey[];
  const priceGroups = useMemo(() => groupPriceItems(pricesDraft), [pricesDraft]);

  if (!authReady || status.isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Seo title="Админка" noindex />
        <Loader2 className="h-6 w-6 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  if (status.data && !status.data.isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <Seo title="Доступ запрещён" noindex />
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="font-display text-2xl tracking-wide">Доступ запрещён</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Вашему аккаунту не назначена роль администратора.
          </p>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); }}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-surface-2"
          >
            <LogOut className="h-4 w-4" /> Выйти
          </button>
        </div>
      </div>
    );
  }

  const leadItems = leads.data?.leads ?? [];
  const counts = leadItems.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  const currentMutation =
    tab === "services"
      ? saveServicesMut
      : tab === "prices"
      ? savePricesMut
      : tab === "gallery"
      ? saveGalleryMut
      : tab === "site"
      ? saveSiteMut
      : null;

  const isSaving = currentMutation?.isPending ?? false;
  const saveError = currentMutation?.error instanceof Error ? currentMutation.error.message : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="Админ-панель" noindex />
      <header className="border-b border-border bg-surface-1 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">Админ-панель</div>
            <h1 className="font-display text-xl tracking-wide">Управление сайтом</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                leads.refetch();
                servicesQuery.refetch();
                pricesQuery.refetch();
                galleryQuery.refetch();
                siteQuery.refetch();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${leads.isFetching || servicesQuery.isFetching ? "animate-spin" : ""}`} /> Обновить
            </button>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline">На сайт</Link>
            <button
              onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-2"
            >
              <LogOut className="h-3.5 w-3.5" /> Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {TAB_ITEMS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === item.value ? "bg-[var(--gold)] text-background" : "border border-border text-muted-foreground hover:bg-surface-2"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "leads" ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {(["new", "in_progress", "done", "archived"] as const).map((statusKey) => (
                <div key={statusKey} className={`rounded-xl border p-4 ${STATUS_COLORS[statusKey]}`}>
                  <div className="text-[10px] uppercase tracking-widest opacity-80">{STATUS_LABELS[statusKey]}</div>
                  <div className="font-numeric text-3xl mt-1 leading-none">{counts[statusKey] ?? 0}</div>
                </div>
              ))}
            </div>

            {leads.isLoading ? (
              <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--gold)]" /></div>
            ) : leadItems.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface-1 p-12 text-center">
                <Inbox className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Пока нет заявок. Они появятся здесь автоматически.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {leadItems.map((lead) => (
                  <li key={lead.id} className="rounded-2xl border border-border bg-surface-1 p-4 sm:p-5 hover:border-[var(--gold)]/40 transition">
                    <div className="flex flex-wrap items-start gap-3 justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-heading font-bold text-base">{lead.name}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_COLORS[lead.status] ?? STATUS_COLORS.new}`}>
                            {STATUS_LABELS[lead.status] ?? lead.status}
                          </span>
                          {lead.telegram_sent && (
                            <span title="Отправлено в Telegram" className="inline-flex items-center gap-1 text-[10px] text-sky-400">
                              <Send className="h-3 w-3" /> TG
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 text-[var(--gold)] hover:underline">
                            <Phone className="h-3.5 w-3.5" /> {lead.phone}
                          </a>
                          {lead.service && <span className="text-muted-foreground">🛠 {lead.service}</span>}
                        </div>
                        {lead.message && (
                          <div className="mt-2 flex items-start gap-2 text-sm text-foreground/80">
                            <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                            <span>{lead.message}</span>
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(lead.created_at).toLocaleString("ru-RU")}</span>
                          {lead.source && <span>📍 {lead.source}</span>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(["new", "in_progress", "done", "archived"] as const)
                          .filter((statusKey) => statusKey !== lead.status)
                          .map((statusKey) => (
                            <button
                              key={statusKey}
                              onClick={() => updateMut.mutate({ id: lead.id, status: statusKey })}
                              disabled={updateMut.isPending}
                              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider hover:bg-surface-2 disabled:opacity-50"
                            >
                              {statusKey === "done" ? <CheckCircle2 className="h-3 w-3" /> : statusKey === "archived" ? <Archive className="h-3 w-3" /> : null}
                              {STATUS_LABELS[statusKey]}
                            </button>
                          ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : tab === "services" ? (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Услуги</h2>
                <p className="text-sm text-muted-foreground">Редактируйте описание, цену и порядок показа услуг.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setServicesDraft((current) => [
                      ...current,
                      {
                        id: `new-${Date.now()}`,
                        slug: "",
                        title: "",
                        short: "",
                        priceFrom: "",
                        icon: "construction",
                        hero: "",
                        description: "",
                        includes: [],
                        faq: [],
                        imageUrl: null,
                        order: current.length ? Math.max(...current.map((item) => item.order)) + 1 : 0,
                      },
                    ]);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm hover:bg-surface-2"
                >
                  <Plus className="h-3.5 w-3.5" /> Добавить услугу
                </button>
                <button
                  type="button"
                  onClick={() => saveServicesMut.mutate(servicesDraft)}
                  disabled={saveServicesMut.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2 text-sm text-background hover:brightness-95 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" /> Сохранить раздел
                </button>
              </div>
            </div>

            {saveError ? <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">Ошибка: {saveError}</div> : null}

            {servicesQuery.isLoading ? (
              <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--gold)]" /></div>
            ) : (
              <div className="space-y-5">
                {servicesDraft.map((service, index) => (
                  <div key={service.id} className="rounded-3xl border border-border bg-surface-1 p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">Услуга #{index + 1}</p>
                        <p className="text-xs text-muted-foreground">ID: {service.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setServicesDraft((current) => current.filter((item) => item.id !== service.id))}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-destructive hover:bg-destructive/5"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Удалить
                      </button>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <label className="block text-sm">
                        <span className="text-sm text-muted-foreground">Заголовок</span>
                        <input
                          value={service.title}
                          onChange={(event) => {
                            const title = event.target.value;
                            setServicesDraft((current) => current.map((item) => item.id === service.id ? { ...item, title } : item));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="text-sm text-muted-foreground">Ссылка (slug)</span>
                        <input
                          value={service.slug}
                          onChange={(event) => {
                            const slug = event.target.value;
                            setServicesDraft((current) => current.map((item) => item.id === service.id ? { ...item, slug } : item));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="text-sm text-muted-foreground">Цена от</span>
                        <input
                          value={service.priceFrom}
                          onChange={(event) => {
                            const priceFrom = event.target.value;
                            setServicesDraft((current) => current.map((item) => item.id === service.id ? { ...item, priceFrom } : item));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="text-sm text-muted-foreground">Краткое описание</span>
                        <input
                          value={service.short}
                          onChange={(event) => {
                            const short = event.target.value;
                            setServicesDraft((current) => current.map((item) => item.id === service.id ? { ...item, short } : item));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="text-sm text-muted-foreground">Иконка</span>
                        <select
                          value={service.icon}
                          onChange={(event) => {
                            const icon = event.target.value as ServiceIconKey;
                            setServicesDraft((current) => current.map((item) => item.id === service.id ? { ...item, icon } : item));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        >
                          {iconKeys.map((iconKey) => (
                            <option key={iconKey} value={iconKey}>{iconKey}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm">
                        <span className="text-sm text-muted-foreground">Порядок</span>
                        <input
                          type="number"
                          value={service.order}
                          onChange={(event) => {
                            const order = Number(event.target.value);
                            setServicesDraft((current) => current.map((item) => item.id === service.id ? { ...item, order } : item));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm lg:col-span-2">
                        <span className="text-sm text-muted-foreground">Описание</span>
                        <textarea
                          value={service.description}
                          onChange={(event) => {
                            const description = event.target.value;
                            setServicesDraft((current) => current.map((item) => item.id === service.id ? { ...item, description } : item));
                          }}
                          className="mt-2 h-28 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm lg:col-span-2">
                        <span className="text-sm text-muted-foreground">URL картинки</span>
                        <input
                          value={service.imageUrl ?? ""}
                          onChange={(event) => {
                            const imageUrl = event.target.value || null;
                            setServicesDraft((current) => current.map((item) => item.id === service.id ? { ...item, imageUrl } : item));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : tab === "prices" ? (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Цены</h2>
                <p className="text-sm text-muted-foreground">Правьте категории и позиции прайса в одном месте.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextOrder = pricesDraft.length ? Math.max(...pricesDraft.map((item) => item.order)) + 1 : 0;
                    setPricesDraft((current) => [
                      ...current,
                      {
                        id: `new-${Date.now()}`,
                        category_id: "general",
                        category_title: "Основное",
                        name: "",
                        price: "",
                        order: nextOrder,
                      },
                    ]);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm hover:bg-surface-2"
                >
                  <Plus className="h-3.5 w-3.5" /> Добавить строку
                </button>
                <button
                  type="button"
                  onClick={() => savePricesMut.mutate(pricesDraft)}
                  disabled={savePricesMut.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2 text-sm text-background hover:brightness-95 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" /> Сохранить раздел
                </button>
              </div>
            </div>

            {saveError ? <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">Ошибка: {saveError}</div> : null}

            {pricesQuery.isLoading ? (
              <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--gold)]" /></div>
            ) : priceGroups.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface-1 p-12 text-center">
                <Inbox className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Прайс-лист пуст. Добавьте первую позицию.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {priceGroups.map((group) => (
                  <div key={group.category_id} className="rounded-3xl border border-border bg-surface-1 p-5">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <label className="flex-1 min-w-0 text-sm">
                        <span className="block text-sm text-muted-foreground">Категория</span>
                        <input
                          value={group.category_title}
                          onChange={(event) => {
                            const category_title = event.target.value;
                            setPricesDraft((current) => current.map((item) => item.category_id === group.category_id ? { ...item, category_title } : item));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const order = group.rows.length ? Math.max(...group.rows.map((item) => item.order)) + 1 : 0;
                          setPricesDraft((current) => [
                            ...current,
                            {
                              id: `new-${Date.now()}`,
                              category_id: group.category_id,
                              category_title: group.category_title,
                              name: "",
                              price: "",
                              order,
                            },
                          ]);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm hover:bg-surface-2"
                      >
                        <Plus className="h-3.5 w-3.5" /> Добавить позицию
                      </button>
                    </div>
                    <div className="space-y-4">
                      {group.rows.map((item) => (
                        <div key={item.id} className="grid gap-4 md:grid-cols-4">
                          <label className="block text-sm">
                            <span className="text-sm text-muted-foreground">Название</span>
                            <input
                              value={item.name}
                              onChange={(event) => {
                                const name = event.target.value;
                                setPricesDraft((current) => current.map((row) => row.id === item.id ? { ...row, name } : row));
                              }}
                              className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="block text-sm">
                            <span className="text-sm text-muted-foreground">Цена</span>
                            <input
                              value={item.price}
                              onChange={(event) => {
                                const price = event.target.value;
                                setPricesDraft((current) => current.map((row) => row.id === item.id ? { ...row, price } : row));
                              }}
                              className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="block text-sm">
                            <span className="text-sm text-muted-foreground">Порядок</span>
                            <input
                              type="number"
                              value={item.order}
                              onChange={(event) => {
                                const order = Number(event.target.value);
                                setPricesDraft((current) => current.map((row) => row.id === item.id ? { ...row, order } : row));
                              }}
                              className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </label>
                          <div className="mt-6 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPricesDraft((current) => current.filter((row) => row.id !== item.id))}
                              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-destructive hover:bg-destructive/5"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : tab === "gallery" ? (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Галерея</h2>
                <p className="text-sm text-muted-foreground">Добавляйте и упорядочивайте элементы галереи.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextOrder = galleryDraft.length ? Math.max(...galleryDraft.map((item) => item.order)) + 1 : 0;
                    setGalleryDraft((current) => [
                      ...current,
                      {
                        id: `new-${Date.now()}`,
                        src: "",
                        title: "",
                        category: "general",
                        category_label: "Основная",
                        year: new Date().getFullYear(),
                        order: nextOrder,
                      },
                    ]);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm hover:bg-surface-2"
                >
                  <Plus className="h-3.5 w-3.5" /> Добавить элемент
                </button>
                <button
                  type="button"
                  onClick={() => saveGalleryMut.mutate(galleryDraft)}
                  disabled={saveGalleryMut.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2 text-sm text-background hover:brightness-95 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" /> Сохранить раздел
                </button>
              </div>
            </div>

            {saveError ? <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">Ошибка: {saveError}</div> : null}

            {galleryQuery.isLoading ? (
              <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--gold)]" /></div>
            ) : galleryDraft.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface-1 p-12 text-center">
                <Inbox className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Пока нет элементов галереи.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {galleryDraft.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-border bg-surface-1 p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Элемент</p>
                        <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGalleryDraft((current) => current.filter((row) => row.id !== item.id))}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-destructive hover:bg-destructive/5"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Удалить
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <label className="block text-sm">
                        <span className="text-sm text-muted-foreground">URL изображения</span>
                        <input
                          value={item.src}
                          onChange={(event) => {
                            const src = event.target.value;
                            setGalleryDraft((current) => current.map((row) => row.id === item.id ? { ...row, src } : row));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="text-sm text-muted-foreground">Название</span>
                        <input
                          value={item.title}
                          onChange={(event) => {
                            const title = event.target.value;
                            setGalleryDraft((current) => current.map((row) => row.id === item.id ? { ...row, title } : row));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="text-sm text-muted-foreground">Категория</span>
                        <input
                          value={item.category}
                          onChange={(event) => {
                            const category = event.target.value;
                            setGalleryDraft((current) => current.map((row) => row.id === item.id ? { ...row, category } : row));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="text-sm text-muted-foreground">Метка категории</span>
                        <input
                          value={item.category_label}
                          onChange={(event) => {
                            const category_label = event.target.value;
                            setGalleryDraft((current) => current.map((row) => row.id === item.id ? { ...row, category_label } : row));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="text-sm text-muted-foreground">Год</span>
                        <input
                          type="number"
                          value={item.year}
                          onChange={(event) => {
                            const year = Number(event.target.value);
                            setGalleryDraft((current) => current.map((row) => row.id === item.id ? { ...row, year } : row));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="text-sm text-muted-foreground">Порядок</span>
                        <input
                          type="number"
                          value={item.order}
                          onChange={(event) => {
                            const order = Number(event.target.value);
                            setGalleryDraft((current) => current.map((row) => row.id === item.id ? { ...row, order } : row));
                          }}
                          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Настройки сайта</h2>
                <p className="text-sm text-muted-foreground">Изменяйте контактные данные, юридические реквизиты и карту.</p>
              </div>
              <button
                type="button"
                onClick={() => siteDraft && saveSiteMut.mutate(siteDraft)}
                disabled={saveSiteMut.isPending || !siteDraft}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2 text-sm text-background hover:brightness-95 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" /> Сохранить раздел
              </button>
            </div>

            {saveError ? <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">Ошибка: {saveError}</div> : null}

            {siteQuery.isLoading || !siteDraft ? (
              <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--gold)]" /></div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {([
                    { label: "Название", key: "name" },
                    { label: "Домен", key: "domain" },
                    { label: "URL", key: "url" },
                    { label: "Телефон", key: "phone" },
                    { label: "Телефон Raw", key: "phoneRaw" },
                    { label: "Email", key: "email" },
                    { label: "WhatsApp", key: "whatsapp" },
                    { label: "Telegram", key: "telegram" },
                    { label: "VK", key: "vk" },
                    { label: "Адрес", key: "address" },
                    { label: "Часы работы", key: "hours" },
                    { label: "Максимум заказа", key: "max" },
                  ] as const).map((field) => (
                    <label key={field.key} className="block text-sm">
                      <span className="text-sm text-muted-foreground">{field.label}</span>
                      <input
                        value={siteDraft[field.key] ?? ""}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setSiteDraft((current) => current ? { ...current, [field.key]: nextValue } : current);
                        }}
                        className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                      />
                    </label>
                  ))}
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block text-sm">
                    <span className="text-sm text-muted-foreground">Год основания</span>
                    <input
                      type="number"
                      value={siteDraft.yearFounded}
                      onChange={(event) => {
                        const yearFounded = Number(event.target.value);
                        setSiteDraft((current) => current ? { ...current, yearFounded } : current);
                      }}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-sm text-muted-foreground">Широта</span>
                    <input
                      type="number"
                      value={siteDraft.geo.lat}
                      onChange={(event) => {
                        const lat = Number(event.target.value);
                        setSiteDraft((current) => current ? { ...current, geo: { ...current.geo, lat } } : current);
                      }}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-sm text-muted-foreground">Долгота</span>
                    <input
                      type="number"
                      value={siteDraft.geo.lng}
                      onChange={(event) => {
                        const lng = Number(event.target.value);
                        setSiteDraft((current) => current ? { ...current, geo: { ...current.geo, lng } } : current);
                      }}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block text-sm">
                    <span className="text-sm text-muted-foreground">Юридическое имя</span>
                    <input
                      value={siteDraft.legal.name}
                      onChange={(event) => {
                        const name = event.target.value;
                        setSiteDraft((current) => current ? { ...current, legal: { ...current.legal, name } } : current);
                      }}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-sm text-muted-foreground">ОГРН</span>
                    <input
                      value={siteDraft.legal.ogrn}
                      onChange={(event) => {
                        const ogrn = event.target.value;
                        setSiteDraft((current) => current ? { ...current, legal: { ...current.legal, ogrn } } : current);
                      }}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-sm text-muted-foreground">ИНН</span>
                    <input
                      value={siteDraft.legal.inn}
                      onChange={(event) => {
                        const inn = event.target.value;
                        setSiteDraft((current) => current ? { ...current, legal: { ...current.legal, inn } } : current);
                      }}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <label className="block text-sm">
                  <span className="text-sm text-muted-foreground">Код вставки Яндекс.Карты</span>
                  <textarea
                    value={siteDraft.yandexMapEmbed}
                    onChange={(event) => {
                      const yandexMapEmbed = event.target.value;
                      setSiteDraft((current) => current ? { ...current, yandexMapEmbed } : current);
                    }}
                    className="mt-2 h-32 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              </div>
            )}
          </section>
        )}

        {isSaving ? (
          <div className="mt-6 rounded-2xl border border-[var(--gold)] bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--gold)]">Сохранение...</div>
        ) : null}
      </main>
    </div>
  );
}

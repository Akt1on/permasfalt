import { SITE } from "@/data/site";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { LazyMotion, domAnimation, m as motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, ChevronDown, HardHat } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchServices, fetchSettings } from "@/lib/site-data";

const nav = [
  { to: "/", label: "Главная", exact: true },
  { to: "/services", label: "Услуги", hasDropdown: true },
  { to: "/goroda", label: "Города" },
  { to: "/tseny", label: "Цены" },
  { to: "/portfolio", label: "Портфолио" },
  { to: "/blog", label: "Блог" },
  { to: "/about", label: "О нас" },
  { to: "/contacts", label: "Контакты" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
  });
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000,
  });

  const phone = settings?.contacts?.phone ?? SITE.phone;
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
  }, [path]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close dropdown on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setServicesOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_-4px_oklch(0_0_0/0.12)]"
            : "bg-transparent"
        }`}
      >
        {/* Brand accent stripe */}
        <div
          className="h-1 w-full"
          style={{ background: "var(--gradient-primary)" }}
          aria-hidden="true"
        />

        <div className="container-x">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group shrink-0"
              aria-label="Пермь Асфальт 59 — на главную"
            >
              <div
                className="h-10 w-10 rounded-lg grid place-items-center text-black font-bold text-sm btn-gold shrink-0"
                aria-hidden="true"
              >
                <HardHat className="h-5 w-5" />
              </div>
              <div className="leading-none">
                <div
                  className={`font-display text-xl font-bold tracking-wide transition-colors ${
                    scrolled ? "text-foreground" : "text-white"
                  }`}
                >
                  ПЕРМЬ АСФАЛЬТ{" "}
                  <span className="text-gradient-gold">59</span>
                </div>
                <div
                  className={`text-[10px] tracking-[0.25em] uppercase font-semibold transition-colors ${
                    scrolled ? "text-muted-foreground" : "text-white/60"
                  }`}
                >
                  Асфальтирование и благоустройство
                </div>
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Основная навигация">
              {nav.map((n) => {
                const active =
                  n.exact
                    ? path === n.to
                    : path === n.to || path.startsWith(n.to + "/");

                if (n.hasDropdown) {
                  return (
                    <div
                      key={n.to}
                      className="relative"
                      onMouseEnter={() => setServicesOpen(true)}
                      onMouseLeave={() => setServicesOpen(false)}
                    >
                      <Link
                        to={n.to}
                        aria-current={active ? "page" : undefined}
                        aria-haspopup="true"
                        aria-expanded={servicesOpen}
                        onFocus={() => setServicesOpen(true)}
                        onBlur={(e) => {
                          // Close only if focus leaves the whole dropdown
                          if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                            setServicesOpen(false);
                          }
                        }}
                        className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                          active
                            ? "text-primary"
                            : scrolled
                            ? "text-foreground/80 hover:text-foreground hover:bg-surface"
                            : "text-white/85 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {n.label}
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${
                            servicesOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </Link>

                      <AnimatePresence>
                        {servicesOpen && services.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.16 }}
                            role="menu"
                            aria-label="Услуги компании"
                            className="absolute left-0 top-full mt-2 w-[30rem] rounded-2xl bg-white shadow-[0_16px_48px_-8px_oklch(0_0_0/0.18)] border border-border p-5"
                          >
                            <div className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3 font-bold">
                              Услуги компании
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {services.slice(0, 8).map((service) => (
                                <Link
                                  key={service.id}
                                  to="/services/$slug"
                                  params={{ slug: service.slug }}
                                  role="menuitem"
                                  className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                >
                                  <span
                                    className="h-2 w-2 rounded-full bg-primary shrink-0"
                                    aria-hidden="true"
                                  />
                                  {service.title}
                                </Link>
                              ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-border">
                              <Link
                                to="/services"
                                className="text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                              >
                                Все услуги →
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    aria-current={active ? "page" : undefined}
                    className={`relative px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      active
                        ? "text-primary"
                        : scrolled
                        ? "text-foreground/80 hover:text-foreground hover:bg-surface"
                        : "text-white/85 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {n.label}
                    {active && (
                      <span
                        className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Phone + CTA */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href={phoneHref}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  scrolled ? "text-foreground hover:text-primary" : "text-white hover:text-primary"
                }`}
                aria-label={`Позвонить: ${phone}`}
              >
                <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                {phone}
              </a>
              <a
                href="#callback"
                className="btn-gold rounded-lg px-4 py-2.5 text-sm uppercase tracking-wide"
                aria-label="Оставить заявку на обратный звонок"
              >
                Заявка
              </a>
            </div>

            {/* Mobile burger */}
            <button
              onClick={() => setOpen((v) => !v)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                scrolled
                  ? "hover:bg-surface text-foreground"
                  : "text-white hover:bg-white/10"
              }`}
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {open ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="lg:hidden overflow-hidden bg-white border-t border-border shadow-xl"
            >
              <nav
                className="flex flex-col py-3"
                aria-label="Мобильная навигация"
              >
                {nav.map((n) => {
                  const active =
                    n.exact
                      ? path === n.to
                      : path === n.to || path.startsWith(n.to + "/");
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      aria-current={active ? "page" : undefined}
                      className={`px-6 py-3.5 text-base font-semibold transition-colors border-b border-border/40 last:border-0 ${
                        active
                          ? "text-primary bg-primary/5"
                          : "text-foreground hover:bg-surface hover:text-primary"
                      }`}
                    >
                      {n.label}
                    </Link>
                  );
                })}
                <div className="px-5 py-4 bg-surface">
                  <a
                    href={phoneHref}
                    className="btn-gold flex items-center justify-center gap-2 rounded-lg py-3.5 text-base w-full"
                    aria-label={`Позвонить: ${phone}`}
                  >
                    <Phone className="h-5 w-5" aria-hidden="true" /> {phone}
                  </a>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </LazyMotion>
  );
}

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";

const NAV = [
  { to: "/", label: "Главная" },
  { to: "/uslugi", label: "Услуги", hasDropdown: true },
  { to: "/ceny", label: "Цены" },
  { to: "/obekty", label: "Объекты" },
  { to: "/o-nas", label: "О нас" },
  { to: "/otzyvy", label: "Отзывы" },
  { to: "/kontakty", label: "Контакты" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/60"
          : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
          <div className="relative h-10 w-10 rounded-md bg-gradient-gold grid place-items-center shadow-gold">
            <span className="font-display text-xl text-background leading-none">59</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl tracking-wider text-foreground group-hover:text-[var(--gold)] transition-colors">
              ПЕРМЬ АСФАЛЬТ
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              с {SITE.yearFounded} года
            </div>
          </div>
        </Link>

        <nav className="hidden xl:flex items-center gap-1">
          {NAV.map((item) =>
            item.hasDropdown ? (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => setDropdown(true)}
                onMouseLeave={() => setDropdown(false)}
              >
                <Link
                  to={item.to}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-[var(--gold)] transition-colors"
                  activeProps={{ className: "text-[var(--gold)]" }}
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                <AnimatePresence>
                  {dropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-full pt-3 w-[420px]"
                    >
                      <div className="glass rounded-xl p-2 shadow-card grid grid-cols-2 gap-1">
                        {SERVICES.map((s) => (
                          <Link
                            key={s.slug}
                            to="/uslugi/$slug"
                            params={{ slug: s.slug }}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-2 hover:text-[var(--gold)] transition-colors"
                          >
                            <s.icon className="h-4 w-4 text-[var(--gold)]" />
                            <span className="truncate">{s.title}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-[var(--gold)] transition-colors"
                activeProps={{ className: "text-[var(--gold)]" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <a
          href={`tel:${SITE.phoneRaw}`}
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-bold text-background shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 transition-all"
        >
          <Phone className="h-4 w-4" />
          {SITE.phone}
        </a>

        <button
          aria-label="Меню"
          className="xl:hidden rounded-md p-2 text-foreground hover:bg-surface-2"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="xl:hidden absolute inset-x-0 top-full bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="container-x py-6 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-base font-medium text-foreground hover:text-[var(--gold)] hover:bg-surface-1 rounded-md transition-colors"
                  activeProps={{ className: "text-[var(--gold)]" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`tel:${SITE.phoneRaw}`}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-5 py-3 text-sm font-bold text-background"
              >
                <Phone className="h-4 w-4" />
                {SITE.phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

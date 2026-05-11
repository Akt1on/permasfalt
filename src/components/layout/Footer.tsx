import { Link } from "@tanstack/react-router";
import { Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface-1 mt-20">
      <div className="container-x py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-md bg-gradient-gold grid place-items-center">
              <span className="font-display text-xl text-background leading-none">59</span>
            </div>
            <div className="font-display text-xl tracking-wider">ПЕРМЬ АСФАЛЬТ</div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Профессиональное асфальтирование и благоустройство в Перми и Пермском крае
            с {SITE.yearFounded} года. Гарантия 3 года, выезд бесплатно.
          </p>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-widest text-[var(--gold)] mb-4">Услуги</h4>
          <ul className="space-y-2 text-sm">
            {SERVICES.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link
                  to="/uslugi/$slug"
                  params={{ slug: s.slug }}
                  className="text-muted-foreground hover:text-[var(--gold)] transition-colors"
                >
                  {s.title}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/uslugi" className="text-[var(--gold)] hover:underline">
                Все услуги →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-widest text-[var(--gold)] mb-4">Контакты</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 text-[var(--gold)] shrink-0" />
              <a href={`tel:${SITE.phoneRaw}`} className="hover:text-[var(--gold)]">
                {SITE.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-[var(--gold)] shrink-0" />
              <span className="text-muted-foreground">{SITE.address}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-[var(--gold)] shrink-0" />
              <span className="text-muted-foreground">{SITE.hours}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-widest text-[var(--gold)] mb-4">Мессенджеры</h4>
          <div className="flex gap-3">
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="h-10 w-10 grid place-items-center rounded-full bg-surface-2 hover:bg-[var(--gold)] hover:text-background transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              className="h-10 w-10 grid place-items-center rounded-full bg-surface-2 hover:bg-[var(--gold)] hover:text-background transition-colors"
            >
              <Send className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-6 text-xs text-muted-foreground space-y-1">
            <div>{SITE.legal.name}</div>
            <div>{SITE.legal.ogrn}</div>
            <div>{SITE.legal.inn}</div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-x py-6 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} «{SITE.name}». Все права защищены.</div>
          <div className="flex gap-4">
            <Link to="/politika-konfidencialnosti" className="hover:text-[var(--gold)]">
              Политика конфиденциальности
            </Link>
            <span>Цены не являются публичной офертой</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
